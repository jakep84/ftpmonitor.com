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
  relatedSlugs?: string[]; // optional hard links
};

export const DOCS: Doc[] = [
  // --- EXAMPLES (add more below) ---
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
      faqs: [
        {
          q: "Is this a DNS problem?",
          a: "Usually no. If the hostname resolves and you still get refused, it’s a port/service/firewall issue.",
        },
      ],
    },
  },

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
      faqs: [
        {
          q: "What if credentials are correct?",
          a: "Then it’s often an account policy: IP allowlist, FTPS-only, or a locked/expired account.",
        },
      ],
    },
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
      fixes: [
        {
          title: "Fixes",
          steps: [
            "Confirm SSH is listening on port 22 (or the configured port).",
            "Verify inbound firewall rules allow your source IP.",
            "If the server is internal-only, run checks from inside the network/VPN.",
          ],
        },
      ],
    },
  },

  {
    type: "guide",
    slug: "ftp-passive-mode-firewall-issues",
    title: "FTP passive mode firewall issues",
    description:
      "Why FTP PASV fails behind firewalls/NAT and how to configure passive ports correctly.",
    protocol: "ftp",
    step: "list",
    keywords: ["FTP passive mode", "PASV", "NAT", "data connection"],
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
          title: "Fixes",
          steps: [
            "Configure a fixed passive port range on the server.",
            "Open that port range in the firewall/security group.",
            "Ensure the server advertises the correct public IP in PASV responses (NAT).",
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
];

// Convenience indexes
export const GUIDES = DOCS.filter((d) => d.type === "guide");
export const ERRORS = DOCS.filter((d) => d.type === "error");
