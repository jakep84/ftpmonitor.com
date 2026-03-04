import { Step } from "./formatters";

export function explainStep(step: Step): string[] {
  const msg = step.message.toLowerCase();

  if (step.key === "dns") {
    return [
      "DNS resolution failed.",
      "",
      "Common causes:",
      "• Incorrect hostname",
      "• DNS record missing",
      "• Local DNS resolver issue",
      "",
      "Suggested fixes:",
      "• Verify the hostname spelling",
      "• Check the domain DNS records",
      "• Try 'nslookup <host>'",
    ];
  }

  if (step.key === "tcp") {
    if (msg.includes("timeout")) {
      return [
        "The server did not respond to the TCP connection attempt.",
        "",
        "Common causes:",
        "• Firewall blocking the port",
        "• Server not reachable from your network",
        "• Incorrect port",
        "",
        "Suggested fixes:",
        "• Confirm the firewall allows inbound connections",
        "• Verify the port number",
        "• Check network routing or VPN access",
      ];
    }

    if (msg.includes("refused")) {
      return [
        "Connection was actively refused by the server.",
        "",
        "Common causes:",
        "• FTP/SFTP service not running",
        "• Service listening on a different port",
        "",
        "Suggested fixes:",
        "• Confirm the FTP/SFTP service is running",
        "• Verify the configured port",
      ];
    }
  }

  if (step.key === "auth") {
    return [
      "Authentication failed.",
      "",
      "Common causes:",
      "• Incorrect username or password",
      "• Account disabled",
      "• Server requires key authentication",
      "",
      "Suggested fixes:",
      "• Verify credentials",
      "• Confirm the account is active",
      "• Check authentication method",
    ];
  }

  if (step.key === "list") {
    return [
      "Directory access failed.",
      "",
      "Common causes:",
      "• Path does not exist",
      "• Insufficient permissions",
      "",
      "Suggested fixes:",
      "• Verify the directory path",
      "• Confirm the user has read/list permissions",
    ];
  }

  return [];
}
