/**
 * Rate limit sederhana in-memory (sliding window) — kontrak sama dengan
 * implementasi Upstash di produksi (SYSTEM_DESIGN §7.6). MVP: satu proses.
 */
const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 10_000; // Oracle #12a: cegah pertumbuhan map tak terbatas

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetMs: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, arr] of buckets) {
      if (arr.length === 0 || now - arr[arr.length - 1]! > windowMs) buckets.delete(k);
      if (buckets.size <= MAX_BUCKETS * 0.8) break;
    }
  }
  const arr = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (arr.length >= limit) {
    buckets.set(key, arr);
    return { ok: false, remaining: 0, resetMs: arr[0]! + windowMs - now };
  }
  arr.push(now);
  buckets.set(key, arr);
  return { ok: true, remaining: limit - arr.length, resetMs: windowMs };
}

export function clientIp(req: Request): string {
  // Rantai XFF: entry TERAKIR ditambahkan proxy terpercaya; entry awal mudah
  // dipalsukan klien (Oracle #6). x-real-ip hanya dipercaya dari proxy.
  const xff = req.headers.get("x-forwarded-for");
  if (xff) {
    const parts = xff.split(",").map((s) => s.trim());
    return parts.length > 1 ? parts[parts.length - 1]! : parts[0]!;
  }
  return req.headers.get("x-real-ip") || "local";
}
