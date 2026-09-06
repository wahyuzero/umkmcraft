import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { store } from "@/lib/server/store";
import { moderateText } from "@/lib/server/moderation";
import { checkSlug } from "@umkmcraft/utils";


/**
 * Publish (ADR-2): moderasi → snapshot versi terbaru jadi PUBLISHED →
 * pointer swap → revalidateTag. Tanpa "setengah ter-publish".
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken || !(await store.ownsSite(sessionToken, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Situs tidak ditemukan" }, { status: 404 });
  if (site.status === "SUSPENDED") {
    return NextResponse.json({ error: "Situs sedang ditangguhkan" }, { status: 423 });
  }

  // Cegah publish situs yang sudah dihapus (Oracle #11)
  if (site.status === "DELETED") {
    return NextResponse.json({ error: "Situs sudah dihapus" }, { status: 410 });
  }

  const slugCheck = checkSlug(site.slug);
  if (!slugCheck.ok) {
    return NextResponse.json(
      { error: `Slug tidak diizinkan (${slugCheck.reason}) — ganti nama usaha atau slug.` },
      { status: 422 },
    );
  }

  const versions = await store.getVersions(siteId);
  const latest = versions.at(-1);
  if (!latest) return NextResponse.json({ error: "Belum ada konfigurasi" }, { status: 400 });

  // Moderasi deterministik atas seluruh teks situs
  const texts: string[] = [
    latest.configJson.meta.business_name,
    latest.configJson.meta.tagline,
    latest.configJson.meta.seo.title,
    latest.configJson.meta.seo.description,
    ...latest.configJson.sections.map((s) => JSON.stringify(s.props)),
  ];
  const moderation = moderateText(...texts);
  if (!moderation.ok) {
    return NextResponse.json(
      { error: "Konten ditolak moderasi otomatis", flags: moderation.flags },
      { status: 422 },
    );
  }

  // Cegah kehilangan perubahan: autosave draft terakhir sudah jadi versi terbaru
  const published = await store.publish(siteId, latest.id);
  if (!published) return NextResponse.json({ error: "Publish gagal" }, { status: 500 });

  // Invalidasi cache snapshot (tag sama dengan yang dipasang getTenantSnapshot)
  revalidateTag(`snapshot-site:${site.slug}`, "max");

  const tenantDomain = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "lvh.me:3000";
  return NextResponse.json({
    ok: true,
    url: `${site.slug}.${tenantDomain}`,
    pathUrl: `/sites/${site.slug}`,
  });
}
