# FTPMonitor

Instant server-side health checks for **FTP / FTPS / SFTP** endpoints.

Validate connectivity, authentication, and directory access in seconds — with structured diagnostics and contextual troubleshooting links.

---

## Why This Exists

FTP-based systems are still heavily used in:

- Healthcare data exchange
- Financial batch processing
- Government integrations
- Vendor file drops
- Legacy B2B pipelines

When they fail, teams often rely on:

- Manual CLI testing
- Local FTP client setup
- Firewall guesswork
- Vendor back-and-forth

FTPMonitor gives immediate, structured answers without requiring local configuration.

---

## What It Does

For any FTP / FTPS / SFTP endpoint, FTPMonitor performs:

1. **DNS Resolution**  
   Confirms the hostname resolves.

2. **TCP Connectivity**  
   Verifies the port is reachable.

3. **Authentication Attempt**  
   Validates credentials (not stored).

4. **Directory Listing**  
   Confirms access to a specified path.

Each step returns:

- Pass / fail status
- Execution time (ms)
- Clear diagnostic message
- Context-aware troubleshooting link

---

## Built-In Troubleshooting Library

Every failure step links to a structured guide or error page.

Examples:

- /guides/dns-resolution-failed
- /guides/tcp-connection-timeout-firewall
- /guides/authentication-failed
- /errors/530-login-incorrect
- /errors/econnrefused-port-22

Guides are powered by structured content in:

src/content/docs.ts

Dynamic routes:

/guides/[slug]  
/errors/[slug]

Related articles are auto-generated based on protocol + failure step.

---

## Current Status

MVP (Phase 1)

- Instant manual health checks
- Server-side execution (Node runtime)
- Structured output
- Context-aware help links
- Basic rate limiting
- Google Sheets metrics + waitlist capture

Planned:

Phase 2 — Continuous Monitoring  
Phase 3 — Alerts & Integrations

---

## Tech Stack

- Next.js (App Router)
- TypeScript
- Node.js runtime (required for FTP/SFTP libraries)
- basic-ftp
- ssh2-sftp-client
- Google Sheets (metrics + waitlist)
- Zod validation
- Structured JSON-LD for SEO

---

## Local Development

### 1. Install dependencies

npm install

### 2. Create environment file

cp .env.example .env.local

### 3. Add required environment variables

GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

Optional:

GOOGLE_SHEETS_METRICS_SHEET_NAME=Events
RATE_LIMIT_PER_MINUTE=20

⚠ Never commit real credentials.

### 4. Start dev server

npm run dev

Open:

http://localhost:3000

---

## Testing Locally

You can run the included FTP test server:

node Scripts/ftp-test-server.mjs

Credentials:

username: test  
password: test  
port: 2121

---

## Project Structure

src/  
 app/  
 api/  
 health-check/  
 waitlist/  
 guides/  
 errors/  
 (docs)/  
 content/  
 docs.ts  
 lib/  
 health/  
 docs/  
 metrics.ts  
 ratelimit.ts  
 sheets.ts

Health checks are implemented in:

src/lib/health/ftp.ts  
src/lib/health/sftp.ts

Help links are resolved via:

src/lib/docs/resolveHelpLink.ts

---

## Security Model

- Credentials are not persisted
- Keys are not logged
- Private keys are redacted from debug output
- Sensitive fields excluded from metrics
- Basic per-IP rate limiting
- Server-side only execution

---

## Metrics

Every health check logs a safe event to Google Sheets:

- Timestamp
- Protocol
- Host (sanitized)
- Success / failure
- Source IP

Metrics logging is non-blocking and cannot break user requests.

---

## SEO & Structured Data

Each guide and error page includes:

- Canonical URLs
- OpenGraph + Twitter metadata
- Article schema
- Optional FAQ schema

All content is statically generated via generateStaticParams.

---

## Roadmap

### Phase 1 — Diagnostics (Current)

- Manual checks
- Structured guides
- Metrics capture

### Phase 2 — Monitoring

- Saved endpoints
- Scheduled checks
- Uptime tracking

### Phase 3 — Alerts

- Email alerts
- Webhooks
- Team accounts
- Integrations

---

## Contributing

Contributions welcome.

If you've worked with brittle FTP infrastructure before, your feedback is especially valuable.

---

## License

TBD
