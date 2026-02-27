// src/lib/metrics.ts
import type { NextRequest } from "next/server";
import { getSheetsClient } from "@/lib/sheets";

function sanitizeHost(input: string) {
  // Goal: log ONLY a domain/host, never credentials/path/query
  // Examples:
  //  - "sftp://user@host.com:22/incoming" -> "host.com"
  //  - "host.com:21" -> "host.com"
  //  - "user@10.0.0.5" -> "10.0.0.5"
  const raw = (input || "").trim();

  // strip scheme
  const noScheme = raw.replace(/^[a-z]+:\/\//i, "");
  // drop path/query/hash
  const firstPart = noScheme.split(/[/?#]/)[0] ?? "";
  // drop credentials (user@)
  const noCreds = firstPart.includes("@")
    ? firstPart.split("@").pop()!
    : firstPart;
  // drop port
  const noPort = noCreds.split(":")[0] ?? noCreds;

  return noPort.trim().toLowerCase();
}

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function logHealthCheckEvent(params: {
  req: NextRequest;
  protocol: "ftp" | "ftps" | "sftp";
  host: string;
  ok: boolean;
}) {
  // Make metrics safe + non-blocking for the user experience
  try {
    const { sheets, spreadsheetId } = getSheetsClient();
    const metricsSheet =
      process.env.GOOGLE_SHEETS_METRICS_SHEET_NAME || "Events";

    const timestamp = new Date().toISOString();
    const safeHost = sanitizeHost(params.host);
    const ip = getIp(params.req); // optional, but useful (still not PII-heavy)

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${metricsSheet}!A:F`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            timestamp,
            params.protocol,
            safeHost,
            params.ok ? "true" : "false",
            "health_check",
            ip,
          ],
        ],
      },
    });
  } catch {
    // swallow: metrics should never break the check
  }
}
