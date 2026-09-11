import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";

async function authorize(req: NextRequest, siteId: string): Promise<boolean> {
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken) return false;
  return store.ownsSite(sessionToken, siteId);
}

/** Satu versi riwayat (metadata + configJson lengkap) untuk pratinjau pulihkan. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string; versionId: string }> }) {
  const { siteId, versionId } = await ctx.params;
  if (!(await authorize(req, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const version = await store.getVersion(versionId);
  if (!version || version.siteId !== siteId) {
    return NextResponse.json({ error: "Versi tidak ditemukan" }, { status: 404 });
  }
  return NextResponse.json({
    version: {
      id: version.id,
      versionNumber: version.versionNumber,
      status: version.status,
      changeSource: version.changeSource,
      createdAt: version.createdAt,
    },
    config: version.configJson,
  });
}

/**
 * Pulihkan versi lama: config versi itu disimpan sebagai DRAFT BARU —
 * non-destruktif, draf sekarang tetap tercatat di riwayat. Config sudah
 * tervalidasi Zod saat disimpan pertama kali, jadi tidak divalidasi ulang.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string; versionId: string }> }) {
  const { siteId, versionId } = await ctx.params;
  if (!(await authorize(req, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const version = await store.getVersion(versionId);
  if (!version || version.siteId !== siteId) {
    return NextResponse.json({ error: "Versi tidak ditemukan" }, { status: 404 });
  }
  const v = await store.saveDraft(siteId, version.configJson, "MANUAL");
  return NextResponse.json({ ok: true, versionNumber: v.versionNumber, config: v.configJson });
}
