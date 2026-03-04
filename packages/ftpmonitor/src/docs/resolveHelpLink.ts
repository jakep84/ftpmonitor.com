type Protocol = "ftp" | "ftps" | "sftp";
type StepKey = "dns" | "tcp" | "auth" | "list";

export function resolveHelpLink(params: {
  protocol: Protocol;
  step: StepKey;
  message: string;
}) {
  const msg = (params.message || "").toLowerCase();
  const protocol = params.protocol;

  if (params.step === "dns") return "/guides/dns-resolution-failed";

  if (params.step === "tcp") {
    if (msg.includes("econnrefused") || msg.includes("connection refused")) {
      return protocol === "sftp"
        ? "/errors/econnrefused-port-22"
        : "/errors/econnrefused-port-21";
    }
    if (msg.includes("timeout") || msg.includes("timed out")) {
      return "/guides/tcp-connection-timeout-firewall";
    }
    return "/guides/tcp-connection-failed";
  }

  if (params.step === "auth") {
    if (msg.includes("530")) return "/errors/530-login-incorrect";
    if (msg.includes("authentication failed"))
      return "/guides/authentication-failed";
    if (
      msg.includes("permission denied") ||
      msg.includes("permission") ||
      msg.includes("denied")
    ) {
      return "/guides/authentication-failed";
    }
    return "/guides/authentication-failed";
  }

  if (params.step === "list") {
    if (protocol === "sftp") return "/guides/sftp-directory-listing-failed";
    return "/guides/ftp-passive-mode-firewall-issues";
  }

  return null;
}
