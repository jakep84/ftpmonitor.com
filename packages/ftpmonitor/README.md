# ftpmonitor

Diagnose **FTP / FTPS / SFTP** endpoints instantly from your terminal.

Runs layered network diagnostics:

DNS → TCP → Authentication → Directory Listing

---

## 🚀 Run Instantly

```bash
npx ftpmonitor check --protocol sftp --host example.com
```

No install required. Works with Node 18+.

---

## 🛠 Example Output

    FTPMonitor Check
    Host: example.com
    Protocol: SFTP  Port: 22  Path: .

    DNS   ✅ 9ms      DNS resolved to 104.18.27.120
    TCP   ❌ 10011ms  TCP connect timeout

    Tips:
    • Confirm the port (SFTP is usually 22)
    • Check firewall / allowlist rules
    • If the server is internal-only, run monitoring from inside the network/VPN.

    Troubleshooting:
    https://ftpmonitor.com/guides/tcp-connection-timeout-firewall

    Diagnose your FTP/FTPS/SFTP endpoints instantly:
    https://ftpmonitor.com

---

## Why ftpmonitor Exists

FTP-based integrations still power critical infrastructure in:

• Healthcare data exchange\
• Financial batch transfers\
• Government integrations\
• Vendor file drops\
• Legacy B2B systems

When these systems fail, diagnosing the problem often involves:

- configuring local FTP clients
- running multiple CLI tools
- testing firewall connectivity
- guessing which layer failed

**ftpmonitor provides structured diagnostics in seconds.**

---

## What It Tests

ftpmonitor performs layered checks:

1.  **DNS resolution** -- confirms the hostname resolves
2.  **TCP connectivity** -- verifies the port is reachable
3.  **Authentication** -- validates credentials
4.  **Directory listing** -- confirms access to the target path

Each step includes:

• timing\
• success/failure indicators\
• human‑readable diagnostics

---

## Install

```bash
npm install -g ftpmonitor
```

Then run:

```bash
ftpmonitor check --protocol sftp --host example.com
```

---

## Output Formats

ftpmonitor supports multiple output formats for different workflows.

Format Use Case

---

pretty human readable terminal output
slack paste directly into Slack
jira incident or support tickets
markdown documentation
json CI pipelines or automation

Example:

```bash
ftpmonitor check --protocol sftp --host example.com --format slack
```

---

## Common Use Cases

• Troubleshooting vendor SFTP integrations\
• Diagnosing firewall connectivity issues\
• Debugging authentication failures\
• Verifying deployment environments\
• Testing data pipelines

---

## SFTP with Private Key

```bash
ftpmonitor check   --protocol sftp   --host example.com   --username user   --privateKey ~/.ssh/id_rsa   --passphrase yourpassphrase
```

---

## Run Checks from the Cloud

You can optionally run checks using the hosted API:

```bash
ftpmonitor check   --api https://ftpmonitor.com/api/health-check   --protocol sftp   --host example.com
```

Useful when:

• the FTP server is internal\
• you need diagnostics from another network\
• CI pipelines require external connectivity checks

---

## Exit Codes

Code Meaning

---

0 success
2 one or more checks failed
3 CLI usage error

---

## Automatic Troubleshooting Links

If a check fails, ftpmonitor automatically links to the relevant
troubleshooting guide on:

https://ftpmonitor.com

This helps teams diagnose issues faster and reduces back‑and‑forth
debugging.

---

## Security

• Credentials are **never stored**\
• All checks run **locally by default**\
• Remote execution only occurs when `--api` is specified

---

## License

MIT
