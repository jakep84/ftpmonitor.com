import * as dns from "node:dns/promises";
import net from "node:net";
import SftpClient from "ssh2-sftp-client";

type StepKey = "dns" | "tcp" | "auth" | "list";

type Step = {
  key: StepKey;
  ok: boolean;
  ms?: number;
  message: string;
  details?: Record<string, any>;
};

type Result = {
  ok: boolean;
  protocol: "sftp";
  host: string;
  port: number;
  testedPath?: string;
  totalMs: number;
  steps: Step[];
  tips: string[];
};

function msSince(t: number) {
  return Date.now() - t;
}

async function tcpProbe(host: string, port: number, timeoutMs = 10_000) {
  return new Promise<void>((resolve, reject) => {
    const sock = new net.Socket();
    const onErr = (e: any) => {
      sock.destroy();
      reject(e);
    };
    sock.setTimeout(timeoutMs, () => onErr(new Error("TCP connect timeout")));
    sock.once("error", onErr);
    sock.connect(port, host, () => {
      sock.end();
      resolve();
    });
  });
}

export async function runSftpHealthCheck(params: {
  host: string;
  port: number;
  username: string;
  password?: string;
  privateKey?: string;
  passphrase?: string;
  path?: string;
}): Promise<Result> {
  const steps: Step[] = [];
  const tips: string[] = [];
  const testedPath = params.path?.trim() || ".";

  // DNS
  const t0 = Date.now();
  try {
    const res = await dns.lookup(params.host);
    steps.push({
      key: "dns",
      ok: true,
      ms: msSince(t0),
      message: `DNS resolved to ${res.address}`,
      details: { address: res.address, family: res.family },
    });
  } catch (e: any) {
    steps.push({
      key: "dns",
      ok: false,
      ms: msSince(t0),
      message: `DNS resolution failed: ${e?.message ?? "unknown error"}`,
    });
    return {
      ok: false,
      protocol: "sftp",
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips: [
        "Double-check the hostname.",
        "Try resolving the host from your network (nslookup/dig).",
      ],
    };
  }

  // TCP
  const t1 = Date.now();
  try {
    await tcpProbe(params.host, params.port);
    steps.push({
      key: "tcp",
      ok: true,
      ms: msSince(t1),
      message: `TCP connection succeeded on ${params.host}:${params.port}`,
    });
  } catch (e: any) {
    const msg = e?.message ?? "TCP connection failed";
    steps.push({ key: "tcp", ok: false, ms: msSince(t1), message: msg });
    return {
      ok: false,
      protocol: "sftp",
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips: [
        "Confirm the port (SFTP is usually 22).",
        "Check firewall / allowlist rules.",
        "If the server is internal-only, run monitoring from inside the network/VPN.",
      ],
    };
  }

  // AUTH + LIST
  const sftp = new SftpClient();
  try {
    const t2 = Date.now();

    const connectConfig: any = {
      host: params.host,
      port: params.port,
      username: params.username,
      readyTimeout: 10_000,
    };

    if (params.privateKey) {
      connectConfig.privateKey = params.privateKey;
      if (params.passphrase) connectConfig.passphrase = params.passphrase;
    } else {
      connectConfig.password = params.password ?? "";
    }

    await sftp.connect(connectConfig);

    steps.push({
      key: "auth",
      ok: true,
      ms: msSince(t2),
      message: "Authenticated successfully",
    });

    const t3 = Date.now();
    const list = await sftp.list(testedPath);
    steps.push({
      key: "list",
      ok: true,
      ms: msSince(t3),
      message: `Directory listing succeeded (${list.length} items)`,
      details: { count: list.length },
    });

    return {
      ok: true,
      protocol: "sftp",
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips: [],
    };
  } catch (e: any) {
    const msg = e?.message ?? "SFTP operation failed";
    const isAuth = /auth|handshake|permission|denied/i.test(msg);

    steps.push({
      key: isAuth ? "auth" : "list",
      ok: false,
      message: msg,
    });

    tips.push("Confirm username/password or private key + passphrase.");
    tips.push(
      "If listing fails, the path may not exist or permissions may be restricted.",
    );
    tips.push(
      "If using key auth, ensure the server has your public key installed.",
    );

    return {
      ok: false,
      protocol: "sftp",
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips,
    };
  } finally {
    try {
      await sftp.end();
    } catch {}
  }
}
