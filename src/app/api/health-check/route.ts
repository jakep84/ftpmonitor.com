// src/app/api/health-check/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { runFtpHealthCheck } from "@/lib/health/ftp";
import { runSftpHealthCheck } from "@/lib/health/sftp";
import { mapErrorToStep } from "@/lib/health/errors";
import { rateLimitOrThrow } from "@/lib/ratelimit";
import { logHealthCheckEvent } from "@/lib/metrics";

export const runtime = "nodejs"; // required for FTP/SFTP libs
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  protocol: z.enum(["ftp", "ftps", "sftp"]),
  host: z.string().min(1),
  port: z.number().int().min(1).max(65535).optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  path: z.string().optional(),
  // FTPS only:
  secure: z.boolean().optional(),
  // SFTP only:
  privateKey: z.string().optional(),
  passphrase: z.string().optional(),
});

type Step = {
  key: "dns" | "tcp" | "auth" | "list";
  ok: boolean;
  ms?: number;
  message: string;
  details?: Record<string, any>;
};

type Result = {
  ok: boolean;
  protocol: "ftp" | "ftps" | "sftp";
  host: string;
  port: number;
  testedPath?: string;
  totalMs: number;
  steps: Step[];
  tips: string[];
};

function defaultPort(protocol: "ftp" | "ftps" | "sftp") {
  if (protocol === "ftp") return 21;
  if (protocol === "ftps") return 21;
  return 22;
}

export async function POST(req: NextRequest) {
  let parsedProtocol: "ftp" | "ftps" | "sftp" | null = null;
  let parsedHost: string | null = null;

  try {
    await rateLimitOrThrow(req);

    const json = await req.json();
    const body = BodySchema.parse(json);

    parsedProtocol = body.protocol;
    parsedHost = body.host;

    const protocol = body.protocol;
    const port = body.port ?? defaultPort(protocol);

    const start = Date.now();

    let result: Result;

    if (protocol === "sftp") {
      result = await runSftpHealthCheck({
        host: body.host,
        port,
        username: body.username ?? "",
        password: body.password,
        privateKey: body.privateKey,
        passphrase: body.passphrase,
        path: body.path,
      });
    } else {
      result = await runFtpHealthCheck({
        protocol,
        host: body.host,
        port,
        username: body.username ?? "",
        password: body.password ?? "",
        path: body.path,
      });
    }

    result.totalMs = Date.now() - start;

    // ✅ Simple metric log (no credentials)
    console.log("HC_METRIC", {
      protocol,
      host: body.host,
      ok: result.ok,
      ts: new Date().toISOString(),
    });

    // Metrics sink (non-blocking)
    void logHealthCheckEvent({
      req,
      protocol,
      host: body.host,
      ok: result.ok,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    const mapped = mapErrorToStep(err);

    // ✅ Metrics/log even on failures (best effort)
    if (parsedProtocol && parsedHost) {
      console.log("HC_METRIC", {
        protocol: parsedProtocol,
        host: parsedHost,
        ok: false,
        ts: new Date().toISOString(),
      });

      void logHealthCheckEvent({
        req,
        protocol: parsedProtocol,
        host: parsedHost,
        ok: false,
      });
    } else {
      // If we can't parse protocol/host (rate limit, bad JSON, etc.), still emit a breadcrumb
      console.log("HC_METRIC", {
        protocol: "unknown",
        host: "unknown",
        ok: false,
        ts: new Date().toISOString(),
        note: "Failed before body parse (rate limit / invalid JSON / validation error).",
      });
    }

    const payload: Result = {
      ok: false,
      protocol: "ftp",
      host: "",
      port: 0,
      totalMs: 0,
      steps: [
        {
          key: mapped.step,
          ok: false,
          message: mapped.message,
          details: mapped.details,
        },
      ],
      tips: mapped.tips,
    };

    return NextResponse.json(payload, { status: mapped.status });
  }
}
