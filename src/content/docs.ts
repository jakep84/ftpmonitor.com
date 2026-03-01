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

  // (optional extra you already have)
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
];

export const GUIDES = DOCS.filter((d) => d.type === "guide");
export const ERRORS = DOCS.filter((d) => d.type === "error");
