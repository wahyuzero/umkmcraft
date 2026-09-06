import { NextRequest, NextResponse } from "next/server";
import { UmkmWebsiteConfigSchema } from "@umkmcraft/schema";
import { sanitizeConfig } from "@umkmcraft/utils";
import { store } from "@/lib/server/store";


async function authorize(req: NextRequest, siteId: string): Promise<boolean> {
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken) return false;
  return store.ownsSite(sessionToken, siteId);
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  if (!(await authorize(req, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Situs tidak ditemukan" }, { status: 404 });
  const versions = await store.getVersions(siteId);
  const latest = versions.at(-1);
  return NextResponse.json({
    site,
    config: latest?.configJson ?? null,
    versions: versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      status: v.status,
      changeSource: v.changeSource,
      createdAt: v.createdAt,
    })),
  });
}

/** Autosave draft (debounce 800ms di klien): simpan versi DRAFT baru. */
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  if (!(await authorize(req, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Situs tidak ditemukan" }, { status: 404 });

  let body: { config?: unknown };
  try {
    body = (await req.json()) as { config?: unknown };
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const parsed = UmkmWebsiteConfigSchema.safeParse(body.config);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Config tidak valid", issues: parsed.error.issues.map((i) => ({ path: i.path.join("."), message: i.message })) },
      { status: 422 },
    );
  }
  const sanitized = sanitizeConfig(parsed.data);
  const version = await store.saveDraft(siteId, sanitized, "MANUAL");
  return NextResponse.json({ ok: true, versionNumber: version.versionNumber });
}
