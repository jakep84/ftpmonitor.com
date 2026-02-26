import { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();

function getIp(req: NextRequest) {
  // Works on many hosts; adjust later for your deployment platform
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function rateLimitOrThrow(req: NextRequest) {
  const perMinute = Number(process.env.RATE_LIMIT_PER_MINUTE ?? "20");
  const ip = getIp(req);
  const now = Date.now();
  const windowMs = 60_000;

  const cur = buckets.get(ip);
  if (!cur || cur.resetAt <= now) {
    buckets.set(ip, { count: 1, resetAt: now + windowMs });
    return;
  }

  cur.count += 1;

  if (cur.count > perMinute) {
    const retryAfter = Math.max(1, Math.ceil((cur.resetAt - now) / 1000));
    const e: any = new Error("Rate limit exceeded");
    e.status = 429;
    e.details = { retryAfter };
    throw e;
  }
}
