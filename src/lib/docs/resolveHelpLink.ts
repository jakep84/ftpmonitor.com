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
    // Connection refused
    if (msg.includes("econnrefused") || msg.includes("connection refused")) {
      return protocol === "sftp"
        ? "/errors/econnrefused-port-22"
        : "/errors/econnrefused-port-21";
    }

    // Timeouts / drops
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return "/guides/tcp-connection-timeout-firewall";
    }

    // Default TCP catch-all
    return "/guides/tcp-connection-failed";
  }

  // AUTH
  if (params.step === "auth") {
    // FTP 530
    if (msg.includes("530")) return "/errors/530-login-incorrect";

    // SSH/SFTP typical auth phrasing
    if (msg.includes("authentication failed"))
      return "/guides/authentication-failed";

    // "Permission denied" can happen during SSH auth too — route to existing doc
    if (
      msg.includes("permission denied") ||
      msg.includes("permission") ||
      msg.includes("denied")
    ) {
      return "/guides/authentication-failed";
    }

    return "/guides/authentication-failed";
  }

  // LIST
  if (params.step === "list") {
    if (protocol === "sftp") return "/guides/sftp-directory-listing-failed";
    return "/guides/ftp-passive-mode-firewall-issues";
  }

  return null;
}
