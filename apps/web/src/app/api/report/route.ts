import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


/** Tombol "Laporkan situs" di footer tenant (SYSTEM_DESIGN §9.2). */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`report:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Terlalu banyak laporan" }, { status: 429 });

  let body: { siteId?: string; reason?: string; detail?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const reasons = ["PHISHING", "IMPERSONATION", "SCAM", "ILLEGAL", "OTHER"] as const;
  const reason = reasons.find((r) => r === body.reason);
  const siteId = body.siteId;
  if (!siteId || !reason) {
    return NextResponse.json({ error: "siteId dan reason wajib" }, { status: 400 });
  }

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Situs tidak ditemukan" }, { status: 404 });

  await store.addAbuseReport({
    id: crypto.randomUUID(),
    siteId,
    reason,
    detail: body.detail?.slice(0, 1000),
    status: "OPEN",
    createdAt: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true, message: "Laporan diterima. Tim kami review < 24 jam." });
}
