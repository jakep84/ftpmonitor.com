#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { parseArgs } from "./args";
import { copyToClipboard, openUrl } from "./system";
import {
  toPretty,
  toSlack,
  toJira,
  toMarkdown,
  type Result,
} from "./formatters";
import { resolveHelpLink } from "./docs/resolveHelpLink";
import { runFtpHealthCheck } from "./health/ftp";
import { runSftpHealthCheck } from "./health/sftp";
import { explainStep } from "./explainers";

function defaultPort(p: "ftp" | "ftps" | "sftp") {
  return p === "sftp" ? 22 : 21;
}

function usage() {
  return (
    `Usage:\n` +
    `  ftpmonitor check --protocol sftp --host example.com --username user --password pass [--path /incoming]\n\n` +
    `Options:\n` +
    `  --protocol ftp|ftps|sftp   (default: sftp)\n` +
    `  --host <host>\n` +
    `  --port <port>\n` +
    `  --username <user>\n` +
    `  --password <pass>\n` +
    `  --privateKey <path-to-key>\n` +
    `  --passphrase <passphrase>\n` +
    `  --path <remote-path>\n` +
    `  --format pretty|json|slack|jira|markdown   (default: pretty)\n` +
    `  --copy     Copy formatted output to clipboard\n` +
    `  --open     Open troubleshooting link in browser (if available)\n` +
    `  --api <url> Use remote API instead of local checks (optional)\n` +
    `  --explain  Show likely causes and suggested fixes when a step fails\n`
  );
}

async function runLocal(args: ReturnType<typeof parseArgs>): Promise<Result> {
  const port = args.port ?? defaultPort(args.protocol);

  if (args.protocol === "sftp") {
    const privateKey = args.privateKeyPath
      ? readFileSync(args.privateKeyPath, "utf8")
      : undefined;

    const start = Date.now();
    const r = await runSftpHealthCheck({
      host: args.host,
      port,
      username: args.username ?? "",
      password: privateKey ? undefined : args.password,
      privateKey,
      passphrase: args.passphrase,
      path: args.path,
    });
    r.totalMs = Date.now() - start;
    return r as Result;
  }

  const start = Date.now();
  const r = await runFtpHealthCheck({
    protocol: args.protocol,
    host: args.host,
    port,
    username: args.username ?? "",
    password: args.password ?? "",
    path: args.path,
  });
  r.totalMs = Date.now() - start;
  return r as Result;
}

async function runRemote(args: ReturnType<typeof parseArgs>): Promise<Result> {
  const port = args.port ?? defaultPort(args.protocol);

  const body: any = {
    protocol: args.protocol,
    host: args.host,
    port,
    username: args.username ?? "",
    path: args.path ?? undefined,
  };

  if (args.protocol === "sftp") {
    if (args.privateKeyPath)
      body.privateKey = readFileSync(args.privateKeyPath, "utf8");
    else body.password = args.password ?? "";
    if (args.passphrase) body.passphrase = args.passphrase;
  } else {
    body.password = args.password ?? "";
  }

  const r = await fetch(args.api!, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

  const json = (await r.json()) as Result;
  return json;
}

(async () => {
  try {
    const raw = process.argv.slice(2);

    // Help / no-args UX
    if (
      raw.length === 0 ||
      raw.includes("--help") ||
      raw.includes("-h") ||
      raw[0] === "help"
    ) {
      console.log(usage());
      process.exit(0);
    }

    const args = parseArgs(process.argv);

    const result = args.api ? await runRemote(args) : await runLocal(args);

    const failed = result.steps?.find((s) => !s.ok);
    const helpPath = failed
      ? resolveHelpLink({
          protocol: result.protocol,
          step: failed.key,
          message: failed.message,
        })
      : null;

    const helpUrl = helpPath ? `https://ftpmonitor.com${helpPath}` : undefined;

    let output = "";
    if (args.format === "json") output = JSON.stringify(result, null, 2);
    else if (args.format === "slack") output = toSlack(result, helpUrl);
    else if (args.format === "jira") output = toJira(result, helpUrl);
    else if (args.format === "markdown") output = toMarkdown(result, helpUrl);
    else output = toPretty(result, helpUrl);

    console.log(output);

    if (args.explain && failed) {
      const explanation = explainStep(failed);

      if (explanation.length) {
        console.log("");
        console.log("Explanation:");
        console.log(explanation.join("\n"));
      }
    }

    if (args.copy) {
      copyToClipboard(output);
      console.error("(copied to clipboard)");
    }

    if (args.open && helpUrl) openUrl(helpUrl);

    process.exit(result.ok ? 0 : 2);
  } catch (e: any) {
    console.error(`Error: ${e?.message ?? String(e)}`);
    console.error("");
    console.error(usage());
    process.exit(3);
  }
})();
