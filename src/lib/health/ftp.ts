import * as dns from "node:dns/promises";
import net from "node:net";
import { Client } from "basic-ftp";

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
  protocol: "ftp" | "ftps";
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

function tipsForFtpFailure(message: string) {
  const tips: string[] = [];
  if (/timeout/i.test(message))
    tips.push(
      "Check firewall rules and whether the port is reachable from the internet.",
    );
  tips.push("Verify host and port (FTP usually 21; SFTP is 22).");
  tips.push(
    "If behind a VPN or allowlist, ensure this server can reach the FTP host.",
  );
  tips.push(
    "For FTP data connections, passive mode may require additional ports opened on the server.",
  );
  return tips;
}

export async function runFtpHealthCheck(params: {
  protocol: "ftp" | "ftps";
  host: string;
  port: number;
  username: string;
  password: string;
  path?: string;
}): Promise<Result> {
  const steps: Step[] = [];
  const tips: string[] = [];
  const testedPath = params.path?.trim() || undefined;

  // 1) DNS
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
      protocol: params.protocol,
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

  // 2) TCP
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
      protocol: params.protocol,
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips: tipsForFtpFailure(msg),
    };
  }

  // 3) Auth + 4) List
  const client = new Client(10_000);
  client.ftp.verbose = false;

  try {
    const t2 = Date.now();
    await client.access({
      host: params.host,
      port: params.port,
      user: params.username,
      password: params.password,
      secure: params.protocol === "ftps", // basic-ftp handles explicit FTPS with secure:true
    });

    steps.push({
      key: "auth",
      ok: true,
      ms: msSince(t2),
      message: "Authenticated successfully",
    });

    const t3 = Date.now();
    if (testedPath) {
      await client.cd(testedPath);
    }
    const list = await client.list();
    steps.push({
      key: "list",
      ok: true,
      ms: msSince(t3),
      message: `Directory listing succeeded (${list.length} items)`,
      details: { count: list.length },
    });

    return {
      ok: true,
      protocol: params.protocol,
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips: [],
    };
  } catch (e: any) {
    const msg = e?.message ?? "FTP operation failed";
    const isAuth = /auth|login|530|password|user/i.test(msg);

    steps.push({
      key: isAuth ? "auth" : "list",
      ok: false,
      message: msg,
    });

    tips.push("Confirm username/password and account permissions.");
    tips.push(
      "If using FTPS, confirm the server supports explicit FTPS on this port.",
    );
    tips.push(
      "If listing fails, the path may not exist or the user may not have LIST permissions.",
    );

    return {
      ok: false,
      protocol: params.protocol,
      host: params.host,
      port: params.port,
      testedPath,
      totalMs: 0,
      steps,
      tips,
    };
  } finally {
    try {
      client.close();
    } catch {}
  }
}
