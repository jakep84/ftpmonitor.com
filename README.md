# FTPMonitor

Server-side health checks for **FTP / FTPS / SFTP** endpoints.

Performs structured diagnostics across:

DNS → TCP → Auth → Directory List

Returns step-level status, timing, and contextual troubleshooting links.

---

## Overview

FTPMonitor is a Next.js (App Router) application that executes real protocol-level checks using Node runtime libraries:

- basic-ftp (FTP / FTPS)
- ssh2-sftp-client (SFTP)

All checks run server-side. Credentials are never persisted.

---

## Features

- DNS resolution validation
- TCP connectivity probe
- Authentication verification
- Directory listing test
- Step-by-step structured output
- Context-aware troubleshooting links
- Built-in documentation system
- Basic per-IP rate limiting
- Optional Google Sheets metrics logging
- Waitlist capture endpoint

---

## Runtime Requirements

Node runtime required for protocol libraries.

In API routes:

export const runtime = "nodejs";

Edge runtime is not supported for health checks.

---

## Installation

npm install

---

## Environment Configuration

Create `.env.local`.

### Required

GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=

### Optional

GOOGLE_SHEETS_METRICS_SHEET_NAME=Events
RATE_LIMIT_PER_MINUTE=20

Private keys must contain the full PEM block.
\n literals are automatically normalized.

---

## Local Development

npm run dev

Open:

http://localhost:3000

---

## Testing with Local FTP Server

Included test server:

node Scripts/ftp-test-server.mjs

Credentials:

Protocol: FTP
Host: 127.0.0.1
Port: 2121
Username: test
Password: test

---

## API Endpoints

### Health Check

POST /api/health-check

Body:

{
"protocol": "ftp | ftps | sftp",
"host": "example.com",
"port": 21,
"username": "user",
"password": "pass",
"path": "/incoming"
}

For SFTP key authentication:

{
"protocol": "sftp",
"host": "example.com",
"port": 22,
"username": "user",
"privateKey": "-----BEGIN OPENSSH PRIVATE KEY-----"
}

Response shape:

{
ok: boolean,
protocol: string,
host: string,
port: number,
totalMs: number,
steps: [
{
key: "dns" | "tcp" | "auth" | "list",
ok: boolean,
ms?: number,
message: string
}
],
tips: string[]
}

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
ftp.ts
sftp.ts
docs/
resolveDoc.ts
resolveHelpLink.ts
metrics.ts
ratelimit.ts
sheets.ts

---

## Health Check Implementation

### FTP / FTPS

src/lib/health/ftp.ts

Flow:

1. dns.lookup
2. Raw TCP socket probe
3. basic-ftp authentication
4. client.list()

### SFTP

src/lib/health/sftp.ts

Flow:

1. dns.lookup
2. Raw TCP socket probe
3. ssh2-sftp-client.connect
4. sftp.list()

Supports password and private key authentication.

---

## Documentation System

All guides and error pages are driven by:

src/content/docs.ts

Routes:

/guides/[slug]
/errors/[slug]

Static generation via generateStaticParams().

Context-aware linking:

src/lib/docs/resolveHelpLink.ts

---

## Security Model

- Credentials never stored
- Private keys redacted in debug output
- Metrics logging excludes credentials
- Basic per-IP in-memory rate limiting
- Server-side only execution

---

## Metrics Logging

src/lib/metrics.ts

Logs:

- Timestamp
- Protocol
- Sanitized host
- Success / failure
- Source IP

Metrics failures do not block health checks.

---

## Extending the System

### Add a New Guide

1. Add entry to DOCS in src/content/docs.ts
2. Set type, slug, protocol, and step
3. Optionally define relatedSlugs

Route auto-generates.

### Add New Failure Mapping

Modify:

src/lib/docs/resolveHelpLink.ts

Map step + message pattern to slug.

---

## Roadmap

- Persistent monitors
- Scheduled checks
- Alerting (email / webhook)
- Team accounts

---

## License

TBD
