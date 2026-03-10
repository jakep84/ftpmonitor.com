export type Protocol = "ftp" | "ftps" | "sftp";
export type Format = "pretty" | "json" | "slack" | "jira" | "markdown";

export type CliArgs = {
  cmd: "check";
  protocol: Protocol;
  host: string;
  port?: number;
  username?: string;
  password?: string;
  privateKeyPath?: string;
  passphrase?: string;
  path?: string;
  format: Format;
  copy: boolean;
  open: boolean;
  explain: boolean;
  api?: string;
};

function getFlag(argv: string[], name: string) {
  const idx = argv.indexOf(name);
  if (idx === -1) return undefined;
  return argv[idx + 1];
}

function hasFlag(argv: string[], name: string) {
  return argv.includes(name);
}

export function parseArgs(argvRaw: string[]): CliArgs {
  const argv = argvRaw.slice(2);
  const cmd = (argv[0] ?? "") as "check";

  if (cmd !== "check") {
    throw new Error(
      `Unknown command: ${argv[0] ?? "(none)"} (expected: check)`,
    );
  }

  const protocol = (getFlag(argv, "--protocol") ?? "sftp") as Protocol;
  const host = (getFlag(argv, "--host") ?? "").trim();

  const portStr = getFlag(argv, "--port");
  const port = portStr ? Number(portStr) : undefined;

  const username = getFlag(argv, "--username");
  const password = getFlag(argv, "--password");
  const privateKeyPath = getFlag(argv, "--privateKey");
  const passphrase = getFlag(argv, "--passphrase");
  const path = getFlag(argv, "--path");

  const format = (getFlag(argv, "--format") ?? "pretty") as Format;
  const copy = hasFlag(argv, "--copy");
  const open = hasFlag(argv, "--open");
  const explain = hasFlag(argv, "--explain");
  const api = getFlag(argv, "--api");

  if (!host) throw new Error("Missing --host example.com");
  if (!["ftp", "ftps", "sftp"].includes(protocol))
    throw new Error("Invalid --protocol (ftp|ftps|sftp)");
  if (!["pretty", "json", "slack", "jira", "markdown"].includes(format))
    throw new Error("Invalid --format (pretty|json|slack|jira|markdown)");
  if (
    port !== undefined &&
    (!Number.isFinite(port) || port < 1 || port > 65535)
  )
    throw new Error("Invalid --port");

  return {
    cmd,
    protocol,
    host,
    port,
    username,
    password,
    privateKeyPath,
    passphrase,
    path,
    format,
    copy,
    open,
    explain,
    api,
  };
}
