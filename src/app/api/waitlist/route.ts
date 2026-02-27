// src/app/api/waitlist/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { rateLimitOrThrow } from "@/lib/ratelimit";
import { getSheetsClient } from "@/lib/sheets";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
  protocol: z.enum(["ftp", "ftps", "sftp"]).optional(),
  host: z.string().optional(),
});

async function emailAlreadyExists(params: {
  sheets: any;
  spreadsheetId: string;
  sheetName: string;
  email: string;
}) {
  const { sheets, spreadsheetId, sheetName, email } = params;

  // Read column B (email), skip header row
  const r = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!B:B`,
  });

  const rows: string[][] = r.data.values ?? [];
  const needle = email.trim().toLowerCase();

  for (let i = 1; i < rows.length; i++) {
    const cell = (rows[i]?.[0] ?? "").trim().toLowerCase();
    if (cell && cell === needle) return true;
  }
  return false;
}

export async function POST(req: NextRequest) {
  try {
    await rateLimitOrThrow(req);

    const json = await req.json();
    const body = BodySchema.parse(json);

    const { sheets, spreadsheetId, sheetName } = getSheetsClient();

    const exists = await emailAlreadyExists({
      sheets,
      spreadsheetId,
      sheetName,
      email: body.email,
    });

    if (exists) {
      return NextResponse.json({
        ok: true,
        added: false,
        sheetNameUsed: sheetName,
      });
    }

    const timestamp = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${sheetName}!A:E`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [
          [
            timestamp,
            body.email,
            body.source ?? "homepage",
            body.protocol ?? "",
            body.host ?? "",
          ],
        ],
      },
    });

    return NextResponse.json({
      ok: true,
      added: true,
      sheetNameUsed: sheetName,
    });
  } catch (err: any) {
    console.error("WAITLIST_ERROR:", err?.message ?? err);
    return NextResponse.json(
      { ok: false, error: err?.message ?? "Failed to save email" },
      { status: 500 },
    );
  }
}
