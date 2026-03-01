# FTPMonitor

Server-side health checks for **FTP / FTPS / SFTP** endpoints.

**What it does:** runs a real protocol check from the server (Node runtime) and returns structured step output:

**DNS → TCP → Auth → List** (directory listing)

- FTP / FTPS via `basic-ftp`
- SFTP via `ssh2-sftp-client`
- No credential persistence (inputs are used for the request only)

---

## Tech Stack

- Next.js App Router (Node runtime for API routes)
- TypeScript
- Zod (request validation)
- Optional Google Sheets logging (waitlist + metrics)
- Simple in-memory per-IP rate limiting

---

## Quick Start

```bash
npm install
cp .env.local.example .env.local   # create this file manually (see below)
npm run dev
```

Open: `http://localhost:3000`

---

## Environment Variables

Create `.env.local`.

### Required (Google Sheets integrations)

Used by **/api/waitlist** and (optionally) metrics logging.

```bash
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SHEETS_SHEET_NAME=Sheet1
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=
```

**Notes**

- `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` must be the full PEM block.
- Literal `\n` are normalized to real newlines in `src/lib/sheets.ts`.

### Optional

```bash
GOOGLE_SHEETS_METRICS_SHEET_NAME=Events
RATE_LIMIT_PER_MINUTE=20
GOOGLE_SERVICE_ACCOUNT_JSON=   # optional alternative: store full service account JSON here
```

If you use `GOOGLE_SERVICE_ACCOUNT_JSON`, you can omit `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

---

## API

### `POST /api/health-check`

Runs DNS/TCP/auth/list checks server-side.

**Request**

```json
{
  "protocol": "ftp | ftps | sftp",
  "host": "example.com",
  "port": 21,
  "username": "user",
  "password": "pass",
  "path": "/incoming"
}
```

**SFTP key auth**

```json
{
  "protocol": "sftp",
  "host": "example.com",
  "port": 22,
  "username": "user",
  "privateKey": "-----BEGIN OPENSSH PRIVATE KEY-----\n...",
  "passphrase": "optional"
}
```

**Response**

```json
{
  "ok": true,
  "protocol": "sftp",
  "host": "example.com",
  "port": 22,
  "testedPath": ".",
  "totalMs": 1234,
  "steps": [
    { "key": "dns", "ok": true, "ms": 10, "message": "DNS resolved to ..." },
    {
      "key": "tcp",
      "ok": true,
      "ms": 25,
      "message": "TCP connection succeeded ..."
    },
    {
      "key": "auth",
      "ok": true,
      "ms": 80,
      "message": "Authenticated successfully"
    },
    {
      "key": "list",
      "ok": true,
      "ms": 60,
      "message": "Directory listing succeeded (N items)"
    }
  ],
  "tips": []
}
```

**Implementation**

- Route: `src/app/api/health-check/route.ts` (**runtime:** `nodejs`)
- FTP/FTPS: `src/lib/health/ftp.ts`
- SFTP: `src/lib/health/sftp.ts`
- Error mapping: `src/lib/health/errors.ts`
- Help-link mapping: `src/lib/docs/resolveHelpLink.ts`

---

### `POST /api/waitlist`

Saves an email to Google Sheets (dedupes by scanning column B).

**Request**

```json
{
  "email": "you@company.com",
  "source": "homepage_waitlist",
  "protocol": "sftp",
  "host": "example.com"
}
```

**Implementation**

- Route: `src/app/api/waitlist/route.ts`
- Sheets client: `src/lib/sheets.ts`

---

## Docs System (Guides + Errors)

Docs are simple TypeScript content objects in:

- `src/content/docs.ts` (exports `DOCS`, plus `GUIDES` and `ERRORS`)

Routes:

- `/guides` and `/guides/[slug]`
- `/errors` and `/errors/[slug]`

Static generation:

- `generateStaticParams()` in the `[slug]` pages uses `getAllSlugs()` from `src/lib/docs/resolveDoc.ts`

Context-aware troubleshooting links:

- `resolveHelpLink({ protocol, step, message })` in `src/lib/docs/resolveHelpLink.ts`
- The home page uses this to show “Read the troubleshooting guide →” when a step fails.

---

## Local Testing

### Run the included FTP test server

```bash
node Scripts/ftp-test-server.mjs
```

Connect with:

- Protocol: FTP
- Host: `127.0.0.1`
- Port: `2121`
- Username: `test`
- Password: `test`

Then run the health check from the UI.

---

## Deployment Notes

- Health checks require **Node runtime** (not Edge).
  - API routes export: `export const runtime = "nodejs";`
- `next.config.ts` marks `ssh2` and `ssh2-sftp-client` as server externals:
  - `serverExternalPackages: ["ssh2", "ssh2-sftp-client"]`

---

## Rate Limiting

`src/lib/ratelimit.ts` implements a basic in-memory bucket per IP (minute window).

- Configurable via `RATE_LIMIT_PER_MINUTE`
- Note: serverless instances may not share memory across regions/instances.

---

## Metrics Logging (Optional)

`src/lib/metrics.ts` can log health-check events to a Sheets tab (default: `Events`):

- timestamp, protocol, sanitized host, ok, event type, IP (best effort)

This is **non-blocking** (failures are swallowed).

---

## Project Map (Key Paths)

- UI: `src/app/page.tsx`
- Health route: `src/app/api/health-check/route.ts`
- Waitlist route: `src/app/api/waitlist/route.ts`
- Health implementations:
  - `src/lib/health/ftp.ts`
  - `src/lib/health/sftp.ts`
- Docs:
  - `src/content/docs.ts`
  - `src/lib/docs/resolveDoc.ts`
  - `src/lib/docs/resolveHelpLink.ts`

---

## License

TBD
