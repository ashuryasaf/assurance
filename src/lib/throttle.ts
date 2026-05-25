import "server-only";

// Tiny in-memory token bucket keyed by an arbitrary string (typically client
// IP). Good enough to absorb form-spam against a single Node instance; for
// horizontally-scaled or load-balanced deployments swap this out for a Redis
// or KV-backed implementation.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

export function checkRate(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= max) return false;
  existing.count += 1;
  return true;
}

export function clientIp(req: Request): string {
  const headers = req.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  const real = headers.get("x-real-ip");
  if (real) return real;
  // Last resort: unique string per process, so we still throttle in dev.
  return "anonymous";
}
