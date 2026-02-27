// src/lib/sheets.ts
import { google } from "googleapis";

export function getSheetsClient() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const sheetName = process.env.GOOGLE_SHEETS_SHEET_NAME || "Sheet1";
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!spreadsheetId) throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID");
  if (!clientEmail) throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL");
  if (!privateKeyRaw)
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY");

  // Vercel stores multiline secrets with \n
  const privateKey = privateKeyRaw.includes("\\n")
    ? privateKeyRaw.replace(/\\n/g, "\n")
    : privateKeyRaw;

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });

  return { sheets, spreadsheetId, sheetName };
}
