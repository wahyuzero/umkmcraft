import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";


/**
 * Agregasi analitik tenant (SYSTEM_DESIGN §8): pageview harian, WA click,
 * produk paling populer. Query JSONL langsung — cukup sampai ±1jt event/bulan.
 */
export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken || !(await store.ownsSite(sessionToken, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const events = await store.readEvents(siteId, 20000);
  const byDay = new Map<string, number>();
  const waByProduct = new Map<string, number>();
  let pageviews = 0;
  let waClicks = 0;

  for (const e of events) {
    const day = e.ts.slice(0, 10);
    if (e.type === "PAGEVIEW") {
      pageviews += 1;
      byDay.set(day, (byDay.get(day) ?? 0) + 1);
    } else if (e.type === "WA_CLICK" || e.type === "WA_PRODUCT_CLICK") {
      waClicks += 1;
      if (e.productId) waByProduct.set(e.productId, (waByProduct.get(e.productId) ?? 0) + 1);
    }
  }

  const daily = [...byDay.entries()].sort(([a], [b]) => a.localeCompare(b)).slice(-30);
  const topProducts = [...waByProduct.entries()]
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([productId, clicks]) => ({ productId, clicks }));

  return NextResponse.json({ pageviews, waClicks, daily, topProducts });
}
