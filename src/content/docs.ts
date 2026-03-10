// src/content/docs.ts
export type DocType = "guide" | "error";
export type Protocol = "ftp" | "ftps" | "sftp" | "any";
export type StepKey = "dns" | "tcp" | "auth" | "list" | "any";

export type Doc = {
  type: DocType;
  slug: string; // no leading slash
  title: string;
  description: string;
  protocol: Protocol;
  step: StepKey;
  keywords?: string[];
  body: {
    intro?: string[];
    causes?: { title: string; bullets: string[] }[];
    fixes?: { title: string; steps: string[] }[];
    commands?: { title: string; lines: string[] }[];
    notes?: string[];
    faqs?: { q: string; a: string }[];
  };
  relatedSlugs?: string[];
};

export const DOCS: Doc[] = [
  // -----------------------------
  // GUIDES (minimum set)
  // -----------------------------
  {
    type: "guide",
    slug: "dns-resolution-failed",
    title: "DNS resolution failed",
    description:
      "Why FTP/SFTP DNS lookups fail and how to fix hostname resolution issues quickly.",
    protocol: "any",
    step: "dns",
    keywords: [
      "dns",
      "ENOTFOUND",
      "EAI_AGAIN",
      "hostname not found",
      "dns lookup failed",
      "nslookup",
      "dig",
    ],
    body: {
      intro: [
        "If DNS resolution fails, the hostname can’t be converted into an IP address.",
        "This is usually a typo, missing DNS record, or a DNS/VPN/network resolver issue.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Misspelled hostname",
            "DNS record does not exist (NXDOMAIN)",
            "Internal hostname used outside the VPN/network",
            "Local DNS resolver misconfiguration",
            "Intermittent DNS failures (timeouts / SERVFAIL)",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify the hostname spelling (copy/paste; watch trailing spaces).",
            "Run `nslookup <host>` or `dig <host>` from your network.",
            "If the hostname is internal-only, connect via VPN or run checks from inside the network.",
            "Try an alternate resolver (1.1.1.1 / 8.8.8.8) if allowed.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: [
            "nslookup <host>",
            "dig +short <host>",
            "ping <host>  # only to test resolution; ICMP may be blocked",
          ],
        },
      ],
      faqs: [
        {
          q: "Is this a credential problem?",
          a: "No. DNS fails before any connection or authentication happens.",
        },
      ],
    },
    relatedSlugs: ["tcp-connection-timeout-firewall", "tcp-connection-failed"],
  },

  {
    type: "guide",
    slug: "tcp-connection-timeout-firewall",
    title: "TCP connection timeout (firewall issue)",
    description:
      "Why FTP/SFTP connections time out and how to diagnose firewall, routing, or allowlist blocking.",
    protocol: "any",
    step: "tcp",
    keywords: ["timeout", "firewall", "security group", "allowlist", "routing"],
    body: {
      intro: [
        "A TCP timeout means your request didn’t get a response at all.",
        "This is usually a firewall/security-group block, routing issue, or the service is only reachable from a private network/VPN.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Inbound firewall/security group blocks the port",
            "Server is private/internal-only (not reachable from the public internet)",
            "IP allowlist missing your source IP",
            "Network routing/VPN required",
            "Upstream device silently drops packets",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm protocol + port with the vendor/admin.",
            "Ask the server owner to verify firewall/security-group rules on the server side.",
            "Check IP allowlist requirements and add your source IP.",
            "If the host is internal, run checks from inside the network/VPN.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> <port>", "telnet <host> <port>"],
        },
      ],
      faqs: [
        {
          q: "How is timeout different from ECONNREFUSED?",
          a: "Timeout = no response (often firewall drop). Refused = the host responded but the port is closed or service isn’t listening.",
        },
      ],
    },
    relatedSlugs: ["tcp-connection-failed", "dns-resolution-failed"],
  },

  {
    type: "guide",
    slug: "tcp-connection-failed",
    title: "TCP connection failed",
    description:
      "General TCP failure causes when connecting to FTP, FTPS, or SFTP services.",
    protocol: "any",
    step: "tcp",
    keywords: ["tcp failed", "ECONNREFUSED", "port closed", "service down"],
    body: {
      intro: [
        "A TCP failure means the connection could not be established.",
        "The most common reasons are: wrong port, service down, port closed, or a firewall block.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Wrong port (e.g., using 22 for FTP or 21 for SFTP)",
            "Service not running/listening on that port",
            "Firewall/security group blocks traffic",
            "Server only accessible from private network/VPN",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm protocol + port with the server owner/vendor.",
            "Verify the service is running and listening on the expected port (server-side).",
            "Check firewall/security group rules and IP allowlist.",
            "Try from inside the VPN/network if applicable.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> <port>", "telnet <host> <port>"],
        },
      ],
    },
    relatedSlugs: ["econnrefused-port-21", "econnrefused-port-22"],
  },

  {
    type: "guide",
    slug: "authentication-failed",
    title: "Authentication failed",
    description:
      "Why FTP/SFTP authentication fails and how to correct credential, key, and account policy issues.",
    protocol: "any",
    step: "auth",
    keywords: ["auth failed", "login failed", "530", "permission denied"],
    body: {
      intro: [
        "Authentication failures mean the server rejected your login attempt.",
        "This can be wrong credentials, wrong protocol, key issues, or account restrictions like IP allowlists.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Wrong username/password (hidden whitespace is common)",
            "Account locked/disabled/expired",
            "Server requires FTPS instead of FTP (or disallows plain FTP)",
            "SFTP key auth required or wrong key/passphrase",
            "IP allowlist / geo restrictions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Copy/paste credentials carefully and retry (watch trailing spaces).",
            "Confirm which protocol is required: FTP vs FTPS vs SFTP.",
            "If SFTP key auth is required, confirm the private key + passphrase and that the public key is installed server-side.",
            "Ask the server owner if there’s an IP allowlist restriction.",
          ],
        },
      ],
    },
    relatedSlugs: ["530-login-incorrect"],
  },

  {
    type: "guide",
    slug: "sftp-directory-listing-failed",
    title: "SFTP directory listing failed",
    description:
      "Why SFTP connects but cannot list directories, and how to fix path, permissions, and chroot issues.",
    protocol: "sftp",
    step: "list",
    keywords: [
      "sftp list failed",
      "permission denied",
      "no such file",
      "chroot",
    ],
    body: {
      intro: [
        "If SFTP authentication succeeds but listing fails, it’s usually a permissions or path issue.",
        "Common errors include “Permission denied” or “No such file”.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Path does not exist (wrong folder)",
            "User does not have LIST/READ permissions",
            "Chroot/jail limits the visible filesystem",
            "Server starts users in a different base directory",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Try listing the default path (`.`) first.",
            "Confirm the expected remote path with the server owner.",
            "Ask the server owner to verify the user has permissions to list/read that folder.",
            "If chroot/jail is enabled, ensure the path is relative to the jailed root.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: [
            "sftp -P <port> <user>@<host>",
            "pwd",
            "ls -la",
            "ls -la <path>",
          ],
        },
      ],
    },
    relatedSlugs: ["authentication-failed"],
  },

  {
    type: "guide",
    slug: "ftp-passive-mode-firewall-issues",
    title: "FTP passive mode firewall issues",
    description:
      "Why FTP PASV fails behind firewalls/NAT and how to configure passive ports correctly.",
    protocol: "ftp",
    step: "list",
    keywords: ["pasv", "passive mode", "data connection", "list hangs", "nat"],
    body: {
      intro: [
        "FTP uses separate control + data channels. Passive mode requires a range of server ports to be open.",
        "Many “can login but cannot list” failures are passive-mode port issues.",
      ],
      causes: [
        {
          title: "Symptoms",
          bullets: [
            "Auth succeeds but LIST hangs or times out",
            "Data connection errors after PASV response",
            "Works on LAN but fails from outside network",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Configure a fixed passive port range on the server.",
            "Open that passive range in the firewall/security group.",
            "Ensure the server advertises the correct public IP in PASV responses (NAT).",
            "If possible, prefer SFTP to avoid FTP data-channel complexity.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick tests",
          lines: [
            "lftp -e 'set ftp:passive-mode true; ls; quit' -u user,pass <host>",
          ],
        },
      ],
    },
  },

  // -----------------------------
  // ERRORS (minimum set)
  // -----------------------------
  {
    type: "error",
    slug: "530-login-incorrect",
    title: "FTP 530 Login incorrect",
    description:
      "How to fix FTP 530 errors: bad credentials, account restrictions, FTPS requirements, and permission issues.",
    protocol: "ftp",
    step: "auth",
    keywords: ["530", "login incorrect", "ftp auth failed"],
    body: {
      intro: [
        "FTP code 530 is an authentication failure. The server rejected the username/password or refused the account.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Wrong username/password",
            "Account disabled or locked",
            "Server requires FTPS (or disallows plain FTP)",
            "IP allowlist / geo restrictions on the account",
          ],
        },
      ],
      fixes: [
        {
          title: "Fixes to try",
          steps: [
            "Confirm credentials with the server owner (copy/paste to avoid whitespace).",
            "Confirm whether the server requires FTPS (explicit) instead of FTP.",
            "Check whether the account is restricted by IP allowlist.",
            "Try a known-good FTP client from the same network to compare behavior.",
          ],
        },
      ],
    },
    relatedSlugs: ["authentication-failed"],
  },

  {
    type: "error",
    slug: "econnrefused-port-21",
    title: "ECONNREFUSED on port 21",
    description:
      "Why FTP port 21 returns connection refused, and how to isolate service-down vs firewall vs wrong host/port.",
    protocol: "ftp",
    step: "tcp",
    keywords: ["ECONNREFUSED 21", "ftp refused", "port 21 refused"],
    body: {
      intro: [
        "ECONNREFUSED means the host responded and actively rejected the TCP connection.",
        "This usually indicates the service isn’t listening on that port, or a device is rejecting connections.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "FTP service is not running/listening on port 21",
            "Wrong host or wrong port (FTP may be on a non-standard port)",
            "Firewall/device sends RST (reject) instead of dropping traffic",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm FTP is enabled and listening on port 21 (server-side).",
            "Confirm the vendor/admin-provided port (FTP is not always 21).",
            "Check firewall/security group rules for explicit rejects.",
            "Try from inside the same network/VPN if the host is internal-only.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> 21", "telnet <host> 21"],
        },
      ],
    },
    relatedSlugs: ["tcp-connection-failed"],
  },

  {
    type: "error",
    slug: "econnrefused-port-22",
    title: "ECONNREFUSED on port 22",
    description:
      "Meaning of ECONNREFUSED for SFTP/SSH on port 22 and the fastest ways to isolate firewall vs service vs wrong port.",
    protocol: "sftp",
    step: "tcp",
    keywords: ["ECONNREFUSED 22", "ssh refused", "sftp refused"],
    body: {
      intro: [
        "ECONNREFUSED means the TCP handshake was rejected. The host is up, but the port is closed or blocked.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "SSH/SFTP service not running",
            "SSH is on a non-standard port (not 22)",
            "Firewall/device rejects connections to port 22",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm SSH is listening on port 22 (or the configured port).",
            "Verify inbound firewall rules allow your source IP.",
            "If the server is internal-only, run checks from inside the network/VPN.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> 22", "ssh -vvv <user>@<host> -p 22"],
        },
      ],
    },
    relatedSlugs: ["tcp-connection-failed"],
  },

  {
    type: "guide",
    slug: "sftp-connection-refused",
    title: "SFTP connection refused",
    description:
      "What “connection refused” means for SFTP and how to fix port/service/firewall issues quickly.",
    protocol: "sftp",
    step: "tcp",
    keywords: ["ECONNREFUSED", "port 22", "ssh", "sftp connection refused"],
    body: {
      intro: [
        "“Connection refused” means the host is reachable, but nothing is accepting connections on the target port.",
        "This is almost always service-down, firewall/allowlist, or the wrong port.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "SSH/SFTP service not running on the server",
            "Wrong port (SFTP is commonly 22, but not always)",
            "Firewall/security group blocking inbound connections",
            "Server allowlist blocks your source IP",
          ],
        },
      ],
      fixes: [
        {
          title: "Fixes to try",
          steps: [
            "Confirm the port with the vendor/admin.",
            "From a machine in the same network, test TCP connectivity to host:port.",
            "Verify sshd is running and listening on the expected port.",
            "Check firewall rules/security group and allowlist the source IP.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: [
            "nc -vz <host> 22",
            "telnet <host> 22",
            "ssh -vvv <user>@<host> -p 22",
          ],
        },
      ],
    },
    relatedSlugs: ["econnrefused-port-22", "tcp-connection-timeout-firewall"],
  },
  {
    type: "guide",
    slug: "ftp-connection-refused",
    title: "FTP connection refused",
    description:
      "Why FTP servers refuse connections and how to diagnose port, service, and firewall issues.",
    protocol: "ftp",
    step: "tcp",
    keywords: [
      "ftp connection refused",
      "ftp refused",
      "ECONNREFUSED ftp",
      "port 21 refused",
    ],
    body: {
      intro: [
        "Connection refused means the host responded but the FTP service is not accepting connections on that port.",
        "This usually indicates the FTP service is down, the port is incorrect, or a firewall is actively rejecting the connection.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "FTP service is not running",
            "Wrong port configured",
            "Firewall rejecting inbound connections",
            "Server moved FTP to a custom port",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm FTP service is running on the server.",
            "Verify the correct FTP port with the server administrator.",
            "Check firewall rules or security groups.",
            "Test connectivity from inside the same network.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> 21", "telnet <host> 21"],
        },
      ],
    },
    relatedSlugs: ["econnrefused-port-21", "tcp-connection-failed"],
  },

  {
    type: "guide",
    slug: "sftp-permission-denied",
    title: "SFTP permission denied",
    description:
      "Why SFTP returns permission denied errors and how to fix file or directory permissions.",
    protocol: "sftp",
    step: "auth",
    keywords: [
      "sftp permission denied",
      "sftp access denied",
      "ssh permission denied",
    ],
    body: {
      intro: [
        "Permission denied errors occur when the SFTP user does not have sufficient rights to access or modify a file or directory.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "User lacks read/write permissions",
            "Incorrect ownership on the directory",
            "Chroot jail restrictions",
            "File system permissions misconfigured",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify user permissions on the target directory.",
            "Check ownership and group settings.",
            "Confirm chroot directory configuration.",
            "Ensure the user is allowed to access the path.",
          ],
        },
      ],
    },
    relatedSlugs: ["authentication-failed"],
  },

  {
    type: "guide",
    slug: "ftp-data-connection-failed",
    title: "FTP data connection failed",
    description:
      "Why FTP data connections fail and how to troubleshoot passive and active data channel issues.",
    protocol: "ftp",
    step: "list",
    keywords: [
      "ftp data connection failed",
      "ftp data channel error",
      "ftp data timeout",
    ],
    body: {
      intro: [
        "FTP uses a separate data connection for directory listings and file transfers.",
        "If the data connection fails, operations like LIST or file transfers may hang or fail.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Firewall blocking passive ports",
            "Incorrect PASV configuration",
            "NAT address mismatch",
            "Server passive port range not open",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Configure a passive port range on the server.",
            "Open that port range in the firewall.",
            "Ensure the server advertises the correct public IP.",
            "Test with passive mode enabled.",
          ],
        },
      ],
    },
    relatedSlugs: ["ftp-passive-mode-firewall-issues"],
  },

  {
    type: "guide",
    slug: "ftp-directory-listing-timeout",
    title: "FTP directory listing timeout",
    description:
      "Why FTP directory listings hang or timeout and how to resolve passive mode firewall problems.",
    protocol: "ftp",
    step: "list",
    keywords: [
      "ftp list timeout",
      "ftp directory listing timeout",
      "ftp ls timeout",
    ],
    body: {
      intro: [
        "Directory listing timeouts occur when the FTP data channel cannot be established.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Passive mode ports blocked",
            "Incorrect firewall configuration",
            "NAT misconfiguration",
            "Server returning private IP in PASV response",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Ensure passive ports are open.",
            "Verify PASV configuration on the server.",
            "Check NAT configuration.",
            "Confirm server advertises correct public IP.",
          ],
        },
      ],
    },
    relatedSlugs: ["ftp-passive-mode-firewall-issues"],
  },

  {
    type: "guide",
    slug: "ftp-passive-mode-not-working",
    title: "FTP passive mode not working",
    description:
      "Why FTP passive mode fails and how to configure passive ports and NAT correctly.",
    protocol: "ftp",
    step: "list",
    keywords: ["ftp passive mode not working", "ftp pasv error"],
    body: {
      intro: [
        "Passive mode allows the FTP server to open a data port for transfers.",
        "If passive mode fails, directory listings or file transfers will not work.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Passive port range not configured",
            "Firewall blocking passive ports",
            "Incorrect external IP advertised",
            "NAT configuration errors",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Configure a fixed passive port range.",
            "Open passive ports in the firewall.",
            "Set correct external IP in server configuration.",
            "Test passive mode from outside the network.",
          ],
        },
      ],
    },
    relatedSlugs: ["ftp-passive-mode-firewall-issues"],
  },

  {
    type: "guide",
    slug: "ftp-epsv-error",
    title: "FTP EPSV error",
    description:
      "Understanding FTP EPSV errors and how to resolve extended passive mode problems.",
    protocol: "ftp",
    step: "list",
    keywords: ["ftp epsv error", "ftp extended passive mode error"],
    body: {
      intro: [
        "EPSV is an extended passive mode used by FTP clients.",
        "Errors often occur when firewalls or servers do not support EPSV properly.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Server does not support EPSV",
            "Firewall blocking EPSV data ports",
            "Client misconfiguration",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Disable EPSV in the client if unsupported.",
            "Verify firewall rules allow data ports.",
            "Ensure server supports EPSV commands.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-tls-handshake-failed",
    title: "FTP TLS handshake failed",
    description:
      "Why FTPS TLS handshakes fail and how to troubleshoot certificate and encryption problems.",
    protocol: "ftps",
    step: "auth",
    keywords: ["ftp tls handshake failed", "ftps handshake error"],
    body: {
      intro: [
        "TLS handshake failures occur before authentication when the secure connection cannot be established.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Invalid certificate",
            "Protocol mismatch",
            "Unsupported TLS version",
            "Firewall interfering with TLS negotiation",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify TLS version compatibility.",
            "Check server certificate validity.",
            "Ensure FTPS explicit or implicit mode is correct.",
            "Review firewall or proxy inspection rules.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftps-certificate-error",
    title: "FTPS certificate error",
    description:
      "Why FTPS certificate validation fails and how to fix expired or mismatched certificates.",
    protocol: "ftps",
    step: "auth",
    keywords: ["ftps certificate error", "ftp certificate validation failed"],
    body: {
      intro: [
        "Certificate errors occur when the FTPS client cannot validate the server certificate.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Expired certificate",
            "Self-signed certificate",
            "Hostname mismatch",
            "Missing CA trust chain",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Renew expired certificates.",
            "Ensure hostname matches certificate CN.",
            "Install proper CA certificates.",
            "Configure client to trust the certificate if appropriate.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-host-key-verification-failed",
    title: "SFTP host key verification failed",
    description:
      "Why SSH host key verification fails and how to resolve known_hosts conflicts.",
    protocol: "sftp",
    step: "auth",
    keywords: ["host key verification failed", "ssh known_hosts error"],
    body: {
      intro: [
        "Host key verification errors occur when the server's SSH key does not match the client's known_hosts entry.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Server host key changed",
            "Man-in-the-middle protection triggered",
            "Old known_hosts entry",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify the new host key with the server administrator.",
            "Remove the old entry from ~/.ssh/known_hosts.",
            "Reconnect to store the updated host key.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-authentication-failed",
    title: "SFTP authentication failed",
    description:
      "Why SFTP authentication fails and how to fix password or SSH key issues.",
    protocol: "sftp",
    step: "auth",
    keywords: ["sftp auth failed", "sftp login failed"],
    body: {
      intro: [
        "Authentication failures occur when the SFTP server rejects the login credentials.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Incorrect password",
            "Missing SSH key",
            "Invalid key permissions",
            "Account restrictions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify username and password.",
            "Confirm SSH key is installed server-side.",
            "Check permissions on ~/.ssh directory.",
            "Confirm IP allowlist restrictions.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-login-failed",
    title: "FTP login failed",
    description:
      "Why FTP login attempts fail and how to resolve credential or account issues.",
    protocol: "ftp",
    step: "auth",
    keywords: ["ftp login failed", "ftp authentication error"],
    body: {
      intro: [
        "FTP login failures occur when the server rejects the provided username and password.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Incorrect credentials",
            "Account disabled",
            "Server requires FTPS",
            "IP restrictions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify credentials.",
            "Confirm FTP vs FTPS protocol.",
            "Check account restrictions.",
            "Contact server administrator if needed.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-subsystem-request-failed",
    title: "SFTP subsystem request failed",
    description:
      "Why SFTP subsystem requests fail and how to configure SSH servers correctly.",
    protocol: "sftp",
    step: "auth",
    keywords: ["sftp subsystem request failed", "ssh subsystem error"],
    body: {
      intro: [
        "This error occurs when the SSH server does not have the SFTP subsystem configured.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "SFTP subsystem not enabled in sshd_config",
            "Incorrect path to sftp-server",
            "SSH server misconfiguration",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify Subsystem sftp entry in sshd_config.",
            "Restart the SSH service.",
            "Ensure sftp-server binary exists.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-ssl-negotiation-failed",
    title: "FTP SSL negotiation failed",
    description:
      "Why FTPS SSL negotiation fails and how to fix TLS configuration issues.",
    protocol: "ftps",
    step: "auth",
    keywords: ["ftp ssl negotiation failed", "ftps ssl error"],
    body: {
      intro: [
        "SSL negotiation failures occur when a secure FTP connection cannot be established.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "TLS protocol mismatch",
            "Unsupported cipher suites",
            "Invalid server certificate",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify TLS version compatibility.",
            "Update client or server TLS settings.",
            "Check certificate configuration.",
          ],
        },
      ],
    },
  },
  {
    type: "guide",
    slug: "ftp-connection-reset-by-peer",
    title: "FTP connection reset by peer",
    description:
      "Why FTP connections reset unexpectedly and how to diagnose firewall or server termination issues.",
    protocol: "ftp",
    step: "tcp",
    keywords: [
      "ftp connection reset",
      "connection reset by peer ftp",
      "ftp reset",
    ],
    body: {
      intro: [
        "Connection reset by peer means the remote server closed the connection unexpectedly.",
        "This usually indicates server-side rejection, firewall interruption, or protocol mismatch.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Server terminated the connection",
            "Firewall or IDS dropped the connection",
            "Protocol mismatch (FTP vs FTPS)",
            "Idle timeout settings",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify the correct protocol (FTP vs FTPS).",
            "Check firewall or security device logs.",
            "Confirm the server supports your client connection method.",
            "Try reconnecting using passive mode.",
          ],
        },
      ],
    },
    relatedSlugs: ["tcp-connection-failed"],
  },

  {
    type: "guide",
    slug: "ftp-server-not-responding",
    title: "FTP server not responding",
    description:
      "Why FTP servers fail to respond and how to diagnose network, service, or routing problems.",
    protocol: "ftp",
    step: "tcp",
    keywords: ["ftp server not responding", "ftp timeout"],
    body: {
      intro: [
        "If an FTP server does not respond, the connection request may be dropped or the service may not be running.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "FTP service stopped",
            "Firewall dropping packets",
            "Network routing issue",
            "Server overload",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify FTP service is running.",
            "Check firewall rules.",
            "Confirm correct hostname and port.",
            "Test from another network.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-port-21-blocked",
    title: "FTP port 21 blocked",
    description: "How to diagnose and fix firewall rules blocking FTP port 21.",
    protocol: "ftp",
    step: "tcp",
    keywords: ["ftp port 21 blocked", "port 21 firewall"],
    body: {
      intro: [
        "Port 21 is the default FTP control port.",
        "If blocked, clients cannot establish an FTP connection.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Firewall rule blocking inbound traffic",
            "ISP blocking FTP ports",
            "Server security group restrictions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Open port 21 in the firewall.",
            "Verify cloud security group rules.",
            "Check server listening ports.",
          ],
        },
      ],
      commands: [
        {
          title: "Quick commands",
          lines: ["nc -vz <host> 21", "nmap -p 21 <host>"],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-timeout-during-transfer",
    title: "FTP timeout during transfer",
    description:
      "Why FTP transfers timeout and how to fix idle timeout or firewall issues.",
    protocol: "ftp",
    step: "list",
    keywords: ["ftp transfer timeout", "ftp data timeout"],
    body: {
      intro: [
        "FTP transfers may timeout if the data channel is interrupted or idle time limits are reached.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Firewall closing idle connections",
            "Slow network connection",
            "Server timeout configuration",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Increase FTP timeout settings.",
            "Verify firewall idle timeout configuration.",
            "Use passive mode if active mode fails.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-connection-timeout",
    title: "SFTP connection timeout",
    description:
      "Why SFTP connections timeout and how to troubleshoot firewall or network issues.",
    protocol: "sftp",
    step: "tcp",
    keywords: ["sftp timeout", "ssh timeout"],
    body: {
      intro: [
        "SFTP timeouts occur when the SSH connection cannot be established or the server does not respond.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Firewall blocking port 22",
            "Server unreachable",
            "Incorrect hostname",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify SSH service is running.",
            "Check firewall rules for port 22.",
            "Confirm DNS resolution.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-connection-reset",
    title: "SFTP connection reset",
    description:
      "Why SSH/SFTP sessions reset unexpectedly and how to diagnose network or server issues.",
    protocol: "sftp",
    step: "tcp",
    keywords: ["sftp reset", "ssh connection reset"],
    body: {
      intro: [
        "Connection reset errors occur when the SSH server terminates the connection unexpectedly.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "SSH service restarted",
            "Firewall interrupting connection",
            "Protocol mismatch",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Check SSH server logs.",
            "Verify firewall rules.",
            "Retry connection using verbose SSH output.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-port-22-blocked",
    title: "SFTP port 22 blocked",
    description:
      "Why port 22 blocks SFTP access and how to fix firewall or security group rules.",
    protocol: "sftp",
    step: "tcp",
    keywords: ["port 22 blocked", "ssh firewall block"],
    body: {
      intro: [
        "Port 22 is the default SSH port used by SFTP.",
        "If blocked, SFTP connections cannot be established.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Firewall rules blocking port 22",
            "Cloud security group restrictions",
            "SSH service running on another port",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Open port 22 in firewall.",
            "Confirm SSH port configuration.",
            "Test connectivity with nc or ssh.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-chroot-permission-issue",
    title: "SFTP chroot permission issue",
    description:
      "Why SFTP chroot jail permissions prevent access and how to configure directories properly.",
    protocol: "sftp",
    step: "list",
    keywords: ["sftp chroot permission", "sftp jail error"],
    body: {
      intro: [
        "SFTP chroot environments restrict users to a specific directory.",
        "Incorrect permissions often prevent login or directory access.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Directory ownership incorrect",
            "Root directory writable by user",
            "Incorrect chroot configuration",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Ensure root directory owned by root.",
            "Set correct permissions for subdirectories.",
            "Restart SSH service after changes.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftps-explicit-vs-implicit",
    title: "FTPS explicit vs implicit configuration",
    description:
      "Understanding explicit vs implicit FTPS and why incorrect configuration causes connection failures.",
    protocol: "ftps",
    step: "auth",
    keywords: ["ftps explicit vs implicit", "ftp tls configuration"],
    body: {
      intro: [
        "FTPS supports explicit and implicit encryption modes.",
        "Clients must use the correct mode to connect successfully.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Client using implicit FTPS against explicit server",
            "Incorrect port (21 vs 990)",
            "TLS negotiation mismatch",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Confirm server encryption mode.",
            "Use correct port (21 for explicit, 990 for implicit).",
            "Update client configuration.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-anonymous-login-disabled",
    title: "FTP anonymous login disabled",
    description:
      "Why FTP anonymous login fails and how to configure server access policies.",
    protocol: "ftp",
    step: "auth",
    keywords: ["ftp anonymous login disabled"],
    body: {
      intro: [
        "Some FTP servers disable anonymous access for security reasons.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Anonymous access disabled",
            "Server requires authenticated user",
            "Account policy restrictions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Create authenticated FTP user.",
            "Enable anonymous access if required.",
            "Verify server policy configuration.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-server-requires-ftps",
    title: "FTP server requires FTPS",
    description:
      "Why plain FTP connections fail when a server requires FTPS encryption.",
    protocol: "ftps",
    step: "auth",
    keywords: ["ftp requires ftps", "ftp encryption required"],
    body: {
      intro: [
        "Some servers reject unencrypted FTP connections and require FTPS.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Server enforces TLS encryption",
            "Client using plain FTP",
            "Security policy requiring FTPS",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Use FTPS explicit mode.",
            "Ensure client supports TLS.",
            "Verify correct port configuration.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "sftp-key-authentication-required",
    title: "SFTP key authentication required",
    description:
      "Why SFTP servers require SSH key authentication and how to configure keys correctly.",
    protocol: "sftp",
    step: "auth",
    keywords: ["sftp key authentication", "ssh key required"],
    body: {
      intro: [
        "Many SFTP servers require SSH key authentication instead of passwords.",
      ],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Password authentication disabled",
            "Missing public key",
            "Incorrect key permissions",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Generate SSH key pair.",
            "Install public key on server.",
            "Ensure correct permissions on ~/.ssh.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-transfer-stalls",
    title: "FTP transfer stalls",
    description:
      "Why FTP transfers stall mid-transfer and how to troubleshoot data channel issues.",
    protocol: "ftp",
    step: "list",
    keywords: ["ftp transfer stalls", "ftp transfer hangs"],
    body: {
      intro: ["FTP transfers may stall when the data channel is interrupted."],
      causes: [
        {
          title: "Common causes",
          bullets: [
            "Passive ports blocked",
            "Network congestion",
            "Firewall inspection interfering",
          ],
        },
      ],
      fixes: [
        {
          title: "Fix checklist",
          steps: [
            "Verify passive port configuration.",
            "Check firewall data channel rules.",
            "Test transfer from another network.",
          ],
        },
      ],
    },
  },
];

export const GUIDES = DOCS.filter((d) => d.type === "guide");
export const ERRORS = DOCS.filter((d) => d.type === "error");
