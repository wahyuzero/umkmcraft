import { NextRequest, NextResponse } from "next/server";
import { NextResponse as Res } from "next/server";
import { store, type AnalyticsEventRecord } from "@/lib/server/store";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


/**
 * Endpoint beacon analitik (SYSTEM_DESIGN §8) — 204 No Content,
 * fire-and-forget, tanpa cookie, tanpa PII. Dedupe sederhana di klien.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`t:${clientIp(req)}`, 120, 60 * 1000);
  if (!rl.ok) return new Res(null, { status: 204 });

  try {
    const body = (await req.json()) as { t?: string; p?: string; r?: string; site?: string };
    const typeMap: Record<string, AnalyticsEventRecord["type"] | undefined> = {
      pageview: "PAGEVIEW",
      wa_click: "WA_CLICK",
      wa_product_click: "WA_PRODUCT_CLICK",
      outbound: "OUTBOUND",
    };
    const type = typeMap[body.t ?? ""];
    const siteId = body.site;
    if (!type || !siteId || siteId.length > 64) return new Res(null, { status: 204 });

    const event: AnalyticsEventRecord = {
      id: crypto.randomUUID(),
      siteId,
      type,
      productId: typeof body.p === "string" ? body.p.slice(0, 64) : undefined,
      ref: typeof body.r === "string" ? body.r.slice(0, 300) : undefined,
      ts: new Date().toISOString(),
    };
    await store.appendEvent(event);
  } catch {
    // analitik tidak pernah error ke klien
  }
  return new Res(null, { status: 204 });
}
