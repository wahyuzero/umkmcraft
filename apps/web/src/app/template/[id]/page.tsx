import type { Metadata } from "next";
import Link from "next/link";
import { getPreset, parseUmkmConfig, type SectionType } from "@umkmcraft/schema";
import { orderedSections, renderSections, SectionNav, themeStyle } from "@umkmcraft/renderer";
import { getTemplateById, instantiateTemplate } from "@umkmcraft/templates";
import TemplatePreviewBanner from "@/components/template/TemplatePreviewBanner";

// cacheComponents (Next 16): route dinamis deklarasikan strateginya secara
// eksplisit — pola yang sama dengan /sites/[...path] dan /editor/[siteId].
export const instant = false;

/**
 * Label pendek chip navigasi (SectionNav) — mirror sites page — jangan
 * bedakan. Salinan NAV_LABEL dari apps/web/src/app/sites/[...path]/page.tsx:
 * pratinjau template HARUS terasa identik dengan situs tenant sungguhan,
 * jadi chip nav memakai peta label yang sama persis.
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

interface TemplatePreviewPageProps {
  params: Promise<{ id: string }>;
}

/**
 * instantiateTemplate yang aman-500: asersi skema fail-loud di ujung engine
 * melempar Error bila config template rusak — halaman pratinjau tidak boleh
 * 500 karenanya, cukup papan inline (pola TemplateIssueView).
 */
function safeInstantiate(id: string): ReturnType<typeof instantiateTemplate> | null {
  try {
    return instantiateTemplate(id);
  } catch {
    return null;
  }
}

/**
 * Pratinjau = render HASIL instantiateTemplate (token {{...}} sudah diganti
 * nilai demo) lewat engine renderer yang sama dengan halaman tenant.
 * Robots noindex,nofollow — data demo tidak boleh masuk indeks mesin pencari.
 * Route ini TIDAK membaca cookie/store sama sekali: semuanya statis dari
 * @umkmcraft/templates.
 */
export async function generateMetadata({ params }: TemplatePreviewPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = getTemplateById(id);
  if (!t) return { title: { absolute: "Template tidak ditemukan — UMKM Craft" }, robots: { index: false, follow: false } };
  // Nama untuk <title> diambil dari hasil instantiate (nilai demo, token sudah
  // terganti) — nama mentah pada definisi bisa memuat {{nama_usaha}} yang tidak
  // boleh bocor ke metadata. Gagal instantiate → jatuh ke nama mentah.
  const inst = safeInstantiate(id);
  const name = inst?.ok ? inst.config.meta.business_name : t.config.meta.business_name;
  return {
    // absolute: layout root menambah "| UMKM Craft" — judul final harus tepat
    // "Contoh <nama> — UMKM Craft" tanpa dobel.
    title: { absolute: `Contoh ${name} — UMKM Craft` },
    description: t.description,
    robots: { index: false, follow: false },
  };
}

/**
 * Papan pesan inline untuk template tak ditemukan / config rusak — pola
 * TenantNotFound tenant (BUKAN notFound(): notFound() + route loading
 * skeleton tidak komposibel di Next 16). Dirender DI LUAR wrapper tema
 * (config bisa saja tidak ada), jadi self-sufficient palet builder.
 */
function TemplateIssueView({ title, message }: { title: string; message: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="uc-cutline w-full max-w-md rounded-3xl bg-card px-8 py-10 text-center shadow-plate">
        <p className="uc-ruler mx-auto mb-6 h-[5px] w-16" aria-hidden />
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">{title}</h1>
        <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">{message}</p>
        <Link
          href="/template"
          className="mt-7 inline-flex min-h-[44px] items-center rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Kembali ke galeri template
        </Link>
      </div>
    </main>
  );
}

export default async function TemplatePreviewPage({ params }: TemplatePreviewPageProps) {
  const { id } = await params;
  const t = getTemplateById(id);
  if (!t) {
    return (
      <TemplateIssueView
        title="Template nggak ditemukan"
        message="Template yang kakak cari tidak ada atau tautannya salah. Pilih dari galeri ya, kak."
      />
    );
  }

  // P0 audit: JANGAN render t.config mentah — definisi template memuat token
  // {{nama_usaha}}/{{kota}} yang memang disiapkan untuk diisi saat "Pakai
  // Template". instantiateTemplate TANPA input mengganti seluruh token dengan
  // nilai demo (output dijamin bebas "{{") — pratinjau merender HASILNYA,
  // bukan definisinya. meta.site_id ikut slugify nama demo: tak masalah,
  // pratinjau tidak pernah disimpan.
  const inst = safeInstantiate(id);
  if (!inst) {
    return (
      <TemplateIssueView
        title="Template lagi bermasalah"
        message="Data template ini gagal divalidasi. Coba template lain dulu ya, kak — tim kami akan memperbaikinya."
      />
    );
  }
  if (!inst.ok) {
    return (
      <TemplateIssueView
        title="Template nggak ditemukan"
        message="Template yang kakak cari tidak ada atau tautannya salah. Pilih dari galeri ya, kak."
      />
    );
  }

  // Defensive: paritas dengan halaman tenant — hasil instantiate sudah lolos
  // skema (asersi fail-loud di engine), parse ulang supaya jalur render di
  // bawah tidak pernah menyentuh config di luar kontrak.
  const parsed = parseUmkmConfig(inst.config);
  if (!parsed.ok) {
    return (
      <TemplateIssueView
        title="Template lagi bermasalah"
        message="Data template ini gagal divalidasi. Coba template lain dulu ya, kak — tim kami akan memperbaikinya."
      />
    );
  }
  const config = parsed.config;

  // Alur render mirror halaman tenant (sites/[...path]/page.tsx): hero
  // dipisah agar SectionNav bisa disisipkan TEPAT di bawah hero (sticky
  // top-0 perlu posisi DOM sesudah hero); SectionNav hanya bila section > 6.
  const ordered = orderedSections(config.sections);
  const heroSection = ordered.find((s) => s.type === "hero_storefront");
  const bodySections = ordered.filter((s) => s.type !== "hero_storefront");
  const navItems = bodySections.map((s) => ({ id: s.id, label: NAV_LABEL[s.type] }));

  // Anti-bleed latar (audit P1 tenant): html/body ikut warna tema template
  // supaya overscroll tidak melukis kertas builder di tepi layar.
  const previewBg = config.meta.theme.background_color || getPreset(config.meta.theme.preset).background;

  return (
    // pb-32/sm:pb-24: ruang napas agar section terakhir tidak tertutup
    // banner pratinjau fixed-bottom.
    <div style={themeStyle(config.meta)} className="uc-site min-h-dvh pb-32 sm:pb-24">
      <style dangerouslySetInnerHTML={{ __html: `html{background:${previewBg}}body{background:${previewBg}}` }} />
      {heroSection ? renderSections(config.meta, [heroSection]) : null}
      {ordered.length > 6 ? <SectionNav items={navItems} /> : null}
      {renderSections(config.meta, bodySections)}
      {/* Satu-satunya lapisan builder: TANPA TenantFooter / StickyOrderBar /
          PageviewBeacon / ReportButton — pratinjau demo, bukan situs terbit. */}
      <TemplatePreviewBanner templateId={t.id} />
    </div>
  );
}
