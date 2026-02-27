// src/lib/sheets.ts
import { google } from "googleapis";

type SheetsClient = {
  sheets: ReturnType<typeof google.sheets>;
  spreadsheetId: string;
  sheetName: string;
};

function normalizePrivateKey(raw: string) {
  let k = (raw ?? "").trim();

  // If someone pasted the value with surrounding quotes, remove them.
  if (
    (k.startsWith('"') && k.endsWith('"')) ||
    (k.startsWith("'") && k.endsWith("'"))
  ) {
    k = k.slice(1, -1);
  }

  // Convert literal \n into real newlines
  k = k.replace(/\\n/g, "\n");

  // Normalize Windows newlines
  k = k.replace(/\r\n/g, "\n");

  return k;
}

function tryParseServiceAccountJson(raw?: string) {
  if (!raw) return null;

  const s = raw.trim();
  if (!s.startsWith("{")) return null;

  try {
    const obj = JSON.parse(s);
    if (obj?.client_email && obj?.private_key) return obj;
    return null;
  } catch {
    return null;
  }
}

export function getSheetsClient(): SheetsClient {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";

  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");

  // Preferred: store the whole JSON as one env var
  const saJson = tryParseServiceAccountJson(
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON,
  );

  const clientEmail =
    saJson?.client_email ?? process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;

  const privateKeyRaw =
    saJson?.private_key ?? process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!clientEmail)
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_EMAIL (or GOOGLE_SERVICE_ACCOUNT_JSON)",
    );
  if (!privateKeyRaw)
    throw new Error(
      "Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_JSON)",
    );

  const privateKey = normalizePrivateKey(privateKeyRaw);

  // Sanity check: must look like a PEM
  if (!privateKey.includes("BEGIN PRIVATE KEY")) {
    throw new Error(
      "Service account private key is not a PEM. Make sure GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY contains the PEM block (or use GOOGLE_SERVICE_ACCOUNT_JSON).",
    );
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  return { sheets, spreadsheetId, sheetName };
}
