import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Eye, LogOut, PenLine } from "lucide-react";
import { getPreset, parseUmkmConfig, type SectionType } from "@umkmcraft/schema";
import { orderedSections, renderSections, SectionNav, StickyOrderBar, TenantFooter, themeStyle } from "@umkmcraft/renderer";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";
import { store } from "@/lib/server/store";
import { SuspendedView } from "@/components/SuspendedView";
import { TenantNotFound } from "@/components/TenantNotFound";

// Tenant: dynamic render + data cache per host (ADR-2) — blocking di origin
export const instant = false;


interface TenantPageProps {
  params: Promise<{ path?: string[] }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Label pendek chip navigasi tenant (SectionNav) — peta kompak terpisah dari
 * TYPE_LABEL builder: label builder ("Jam Buka & Peta", "Badge Kepercayaan")
 * terlalu panjang untuk chip horizontal di layar 390px.
 */
const NAV_LABEL: Record<SectionType, string> = {
  hero_storefront: "Utama",
  product_catalog_wa: "Katalog",
  promo_banner: "Promo",
  operating_hours_map: "Jam Buka",
  social_proof_reviews: "Ulasan",
  channel_marketplace: "Marketplace",
  faq_accordion: "FAQ",
  contact_direct: "Kontak",
  rich_text_block: "Info",
  gallery_grid: "Galeri",
  service_pricing_table: "Harga",
  trust_badges_strip: "Kepercayaan",
  step_how_to_order: "Cara Pesan",
  stats_counter_strip: "Statistik",
  value_props_grid: "Keunggulan",
  menu_price_list: "Menu",
  product_spotlight: "Unggulan",
  cta_banner_full: "Aksi",
  team_members_grid: "Tim",
  timeline_story: "Cerita",
  booking_whatsapp_form: "Booking",
  event_schedule_list: "Jadwal",
  branch_locations_list: "Cabang",
  instagram_showcase_grid: "Instagram",
  updates_blog_list: "Kabar",
  download_catalog_cta: "Katalog PDF",
  qr_code_whatsapp: "QR WA",
};

interface TenantResolution {
  snap: Awaited<ReturnType<typeof getTenantSnapshot>>;
  slug: string | undefined;
  /** true = merender versi DRAFT terbaru untuk OWNER (bukan render publik). */
  draftPreview: boolean;
}

async function resolve(
  params: TenantPageProps["params"],
  searchParams?: TenantPageProps["searchParams"],
): Promise<TenantResolution> {
  const { path } = await params;
  const parts = path ?? ["index"];
  const slug = parts[0] === "index" ? undefined : parts[0];
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host, slug);

  // Pratinjau draf khusus owner: snapshot publik TIDAK PERNAH merender draft
  // (lihat getTenantSnapshot) — jalur owner membaca cookie uc_session di
  // server, memverifikasi kepemilikan lewat store (pola yang sama dengan
  // /situs-saya), lalu merender versi DRAFT TERBARU. Tanpa cookie / bukan
  // pemilik / situs ditangguhkan → snap apa adanya: perilaku publik hari ini
  // utuh, draft tak pernah bocor ke orang luar.
  const sessionToken = (await cookies()).get("uc_session")?.value;
  if (sessionToken) {
    const site = slug ? await store.getSiteBySlug(slug) : await store.getSiteByHost(host);
    if (site && site.status !== "SUSPENDED" && (await store.ownsSite(sessionToken, site.id))) {
      const latest = (await store.getVersions(site.id)).at(-1);
      // ?v=published (tombol "Lihat" /situs-saya): pemilik minta versi TERBIT
      // meski draf lebih baru — snap publik yang dirender, tanpa banner
      // pratinjau. Tanpa param → pratinjau draf seperti biasa. Orang luar tak
      // pernah mencapai cabang ini (cek ownsSite), param diabaikan untuk mereka.
      const wantsPublished = (await searchParams)?.v === "published";
      // Pratinjau hanya bila versi TERBARU masih DRAFT (ada perubahan yang
      // belum tampil publik). Versi terakhir sudah PUBLISHED → render publik
      // seperti biasa; draft lama yang sudah tersalip tidak dihidupkan lagi.
      if (latest && latest.status === "DRAFT" && !wantsPublished) {
        return { snap: { site, config: latest.configJson }, slug, draftPreview: true };
      }
    }
  }
  return { snap, slug, draftPreview: false };
}

export async function generateMetadata({ params, searchParams }: TenantPageProps): Promise<Metadata> {
  const { snap, slug, draftPreview } = await resolve(params, searchParams);
  if (!snap || !snap.config) return { title: "Situs tidak ditemukan" };
  // Pratinjau draf milik owner: melarang indeks — isinya masih bisa berubah
  // dan URL yang sama kelak menampung konten versi terbit.
  if (draftPreview) {
    return { title: snap.config.meta.seo.title, robots: { index: false, follow: false } };
  }
  const { config } = snap;
  const base = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "lvh.me:3000";
  return {
    title: config.meta.seo.title,
    description: config.meta.seo.description,
    keywords: config.meta.seo.keywords,
    alternates: { canonical: `https://${slug ?? snap.site.slug}.${base}` },
    openGraph: {
      title: config.meta.seo.title,
      description: config.meta.seo.description,
      images: [`/sites/og?slug=${snap.site.slug}`],
      type: "website",
      locale: "id_ID",
    },
  };
}

export default async function TenantSitePage({ params, searchParams }: TenantPageProps) {
  const { snap, slug, draftPreview } = await resolve(params, searchParams);
  // 404 dirender INLINE, bukan notFound() — notFound() + route loading
  // skeleton tidak komposibel di Next 16 (kerangka loading bisa menutupi
  // payload 404 selamanya). Papan pengumuman = konten stream biasa.
  // Beranda tenant: path-based → /sites/<slug> HANYA bila slug-nya benar-benar
  // ada situsnya — kalau tidak, tautan itu cuma me-reload 404 yang sama
  // (dead-loop) → fallback ke beranda platform "/". Host-based → "/" (proxy
  // me-rewrite "/" ke /sites/index pada host tenant — root MEMANG beranda).
  if (!snap) {
    const slugSite = slug ? await store.getSiteBySlug(slug) : null;
    return <TenantNotFound homeHref={slug && slugSite ? `/sites/${slug}` : "/"} />;
  }
  // Situs ditangguhkan ATAU snapshot belum ada → render papan pengumuman inline
  // (redirect() di konteks PPR tidak reliable — Next 16).
  if (snap.site.status === "SUSPENDED" || !snap.config) return <SuspendedView />;

  // Validasi ganda di renderer (defense-in-depth — lapis 1 Zod sudah di API)
  const parsed = parseUmkmConfig(snap.config);
  if (!parsed.ok) return <TenantNotFound homeHref={slug ? `/sites/${slug}` : "/"} />;
  const config = parsed.config;

  // Navigasi chip halaman panjang (>6 section): hero dirender terpisah agar
  // SectionNav bisa disisipkan TEPAT di bawah hero (sticky top-0 perlu posisi
  // DOM sesudah hero). renderSections(meta, [hero]) memakai jalur registry
  // yang sama; section lain dipertahankan urutannya (partition identitas
  // tanpa hero). Label chip = peta type di atas, dibangun di server.
  const ordered = orderedSections(config.sections);
  const heroSection = ordered.find((s) => s.type === "hero_storefront");
  const bodySections = ordered.filter((s) => s.type !== "hero_storefront");
  const navItems = bodySections.map((s) => ({ id: s.id, label: NAV_LABEL[s.type] }));

  // JSON-LD LocalBusiness + Product (SYSTEM_DESIGN §11)
  const hoursSection = config.sections.find((s) => s.type === "operating_hours_map");
  const catalogSection = config.sections.find((s) => s.type === "product_catalog_wa");
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: config.meta.business_name,
    description: config.meta.seo.description,
    telephone: `+${config.meta.whatsapp_number}`,
    ...(hoursSection && hoursSection.props.address ? { address: hoursSection.props.address } : {}),
    ...(hoursSection && hoursSection.props.open_hours.length
      ? {
          openingHoursSpecification: hoursSection.props.open_hours.map((r) => ({
            "@type": "OpeningHoursSpecification",
            dayOfWeek: `https://schema.org/${["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][r.day_of_week] ?? "Monday"}`,
            opens: r.open,
            closes: r.close,
          })),
        }
      : {}),
  };
  const graphNodes: Array<Record<string, unknown>> = [jsonLd];
  if (catalogSection && catalogSection.props.products.length) {
    graphNodes.push({
      "@type": "ItemList",
      itemListElement: catalogSection.props.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: p.name,
          description: p.description,
          offers: { "@type": "Offer", price: p.price, priceCurrency: "IDR", availability: "https://schema.org/InStock" },
        },
      })),
    });
  }
  const graph = { "@context": "https://schema.org", "@graph": graphNodes };

  // Latar html/body mengikuti tema tenant (fallback logika sama dengan
  // themeVars() renderer) — tanpa ini body melukis kertas builder di tepi
  // kanan/overscroll rute /sites (audit P1: bleed latar).
  const tenantBg = config.meta.theme.background_color || getPreset(config.meta.theme.preset).background;

  return (
    <div style={themeStyle(config.meta)} className="uc-site min-h-dvh">
      {/* Escape `<` mencegah breakout dari konteks <script> (Oracle #1) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
      />
      <style dangerouslySetInnerHTML={{ __html: `html{background:${tenantBg}}body{background:${tenantBg}}` }} />
      {heroSection ? renderSections(config.meta, [heroSection]) : null}
      {ordered.length > 6 ? <SectionNav items={navItems} /> : null}
      {renderSections(config.meta, bodySections)}
      {/* Bar pesan sticky hanya untuk render PUBLIK (config hanya ada saat
          PUBLISHED — lihat getTenantSnapshot) dengan nomor WA terdaftar.
          Saat pratinjau draf, bar ditahan: CTA pesan belum pantas tampil
          sebelum konten benar-benar terbit, sekaligus menghindari tumpukan
          dengan banner pratinjau di posisi yang sama. */}
      {!draftPreview && config.meta.whatsapp_number ? <StickyOrderBar whatsapp={config.meta.whatsapp_number} /> : null}
      {draftPreview ? <DraftPreviewBanner siteId={snap.site.id} /> : null}
      <TenantFooter siteId={snap.site.id} businessName={config.meta.business_name} />
    </div>
  );
}

/**
 * Banner pratinjau draf — pita tipis fixed-bottom yang hanya dirender saat
 * OWNER melihat versi DRAFT (hlm. memakai robots noindex,nofollow). z-30:
 * di bawah StickyOrderBar (z-40) yang memang sengaja tak dirender di mode
 * ini. Ink di atas tema tenant agar selalu terbaca di tema apa pun.
 * Pintu keluar (kritik ronde 3: pratinjau tanpa jalan keluar): "Sunting"
 * balik ke editor, "Keluar pratinjau" ke /situs-saya — baris flex yang
 * wrap di layar sempit, sentuh ≥44px.
 */
function DraftPreviewBanner({ siteId }: { siteId: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-ink px-4 py-2.5 text-card">
      <div className="mx-auto flex min-h-[44px] max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <Eye aria-hidden className="h-4 w-4 shrink-0 text-signal-soft" />
          <p className="text-xs font-bold sm:text-sm">Mode pratinjau draf — hanya kakak yang bisa lihat</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/editor/${siteId}`}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-card px-3.5 py-2 text-xs font-bold text-ink transition-colors duration-200 hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
          >
            <PenLine className="h-3.5 w-3.5" aria-hidden />
            Sunting
          </Link>
          <Link
            href="/situs-saya"
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-card/40 px-3.5 py-2 text-xs font-bold text-card transition-colors duration-200 hover:bg-card/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
          >
            <LogOut className="h-3.5 w-3.5" aria-hidden />
            Keluar pratinjau
          </Link>
        </div>
      </div>
    </div>
  );
}
