// src/lib/docs/resolveHelpLink.ts
type Protocol = "ftp" | "ftps" | "sftp";
type StepKey = "dns" | "tcp" | "auth" | "list";

export function resolveHelpLink(params: {
  protocol: Protocol;
  step: StepKey;
  message: string;
}) {
  const msg = (params.message || "").toLowerCase();
  const protocol = params.protocol;

  // DNS
  if (params.step === "dns") return "/guides/dns-resolution-failed";

  // TCP
  if (params.step === "tcp") {
    if (msg.includes("econnrefused") || msg.includes("connection refused")) {
      return protocol === "sftp"
        ? "/errors/econnrefused-port-22"
        : "/errors/econnrefused-port-21";
    }
    if (msg.includes("timeout"))
      return "/guides/tcp-connection-timeout-firewall";
    return "/guides/tcp-connection-failed";
  }

  // AUTH
  if (params.step === "auth") {
    if (msg.includes("530")) return "/errors/530-login-incorrect";
    if (msg.includes("permission") || msg.includes("denied"))
      return "/guides/permission-denied";
    return "/guides/authentication-failed";
  }

  // LIST
  if (params.step === "list") {
    if (protocol === "sftp") return "/guides/sftp-directory-listing-failed";
    return "/guides/ftp-passive-mode-firewall-issues";
  }

  return null;
}
