# FTPMonitor

Instant server-side health checks for **FTP / FTPS / SFTP** endpoints.

Validate connectivity, authentication, and directory access in seconds
--- with structured diagnostics and clear failure signals.

---

## Why This Exists

FTP-based transfer systems are still widely used in:

- Healthcare data exchange
- Financial batch processing
- Government integrations
- Vendor file drops
- Legacy B2B workflows

When these systems fail, diagnosing the problem often requires:

- Manual CLI testing
- Local client configuration
- Guesswork around DNS / firewall / credentials
- Back-and-forth between teams

FTPMonitor provides a fast, structured way to validate endpoints without
requiring local client setup.

---

## What It Does

For a given FTP / FTPS / SFTP endpoint, FTPMonitor performs:

1.  **DNS Resolution**\
    Confirms the hostname resolves.

2.  **TCP Connectivity**\
    Verifies the port is reachable.

3.  **Authentication Attempt**\
    Validates credentials (no persistence).

4.  **Directory Validation**\
    Confirms access to a specified remote path.

Each step returns:

- Pass / fail status
- Response timing
- Clear diagnostic messaging

Designed for infrastructure troubleshooting --- not just basic uptime
checks.

---

## Current Status

MVP (Phase 1)

- Instant health checks
- Server-side execution (Node runtime)
- Structured diagnostic output
- Basic rate limiting
- Early-access capture mechanism

The architecture is structured to evolve into scheduled monitoring and
alerting.

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Node.js runtime (required for protocol libraries)
- API-driven architecture

All health-check logic runs server-side.

---

## Local Development

### 1. Install dependencies

```bash
npm install
```

### 2. Create environment file

```bash
cp .env.example .env.local
```

### 3. Start dev server

```bash
npm run dev
```

Visit:

http://localhost:3000

---

## Environment Variables

Create a `.env.local` file.

### Required

```env
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

### Optional

```env
RATE_LIMIT_PER_MINUTE=20
```

⚠️ Do not commit real credentials. Use `.env.example`.

---

## Security Notes

- Credentials used for checks are not stored.
- Sensitive data is excluded from logs.
- All protocol operations run server-side.
- Basic rate limiting is applied.

Future versions will include encrypted credential storage for scheduled
monitoring.

---

## Roadmap

### Phase 1 --- Instant Diagnostics

- FTP / FTPS / SFTP validation
- Structured output
- Manual checks

### Phase 2 --- Continuous Monitoring

- Saved endpoints
- Scheduled checks
- Uptime history

### Phase 3 --- Alerts & Integrations

- Email alerts
- Webhooks
- Team accounts

---

## Contributing

Contributions, suggestions, and issue reports are welcome.

If you've dealt with brittle FTP infrastructure before, feedback is
especially appreciated.

---

## License

TBD
