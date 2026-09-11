import type { Metadata } from "next";
import { getPreset, parseUmkmConfig } from "@umkmcraft/schema";
import { renderSections, themeStyle, StickyOrderBar, TenantFooter } from "@umkmcraft/renderer";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";
import { SuspendedView } from "@/components/SuspendedView";
import { TenantNotFound } from "@/components/TenantNotFound";

// Tenant: dynamic render + data cache per host (ADR-2) — blocking di origin
export const instant = false;


interface TenantPageProps {
  params: Promise<{ path?: string[] }>;
}

async function resolve(params: TenantPageProps["params"]) {
  const { path } = await params;
  const parts = path ?? ["index"];
  const slug = parts[0] === "index" ? undefined : parts[0];
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host, slug);
  return { snap, slug, host };
}

export async function generateMetadata({ params }: TenantPageProps): Promise<Metadata> {
  const { snap, slug } = await resolve(params);
  if (!snap || !snap.config) return { title: "Situs tidak ditemukan" };
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

export default async function TenantSitePage({ params }: TenantPageProps) {
  const { snap, slug } = await resolve(params);
  // 404 dirender INLINE, bukan notFound() — notFound() + route loading
  // skeleton tidak komposibel di Next 16 (kerangka loading bisa menutupi
  // payload 404 selamanya). Papan pengumuman = konten stream biasa.
  // Beranda tenant: path-based → /sites/<slug>; host-based → "/" (proxy
  // me-rewrite "/" ke /sites/index pada host tenant — root MEMANG beranda).
  if (!snap) return <TenantNotFound homeHref={slug ? `/sites/${slug}` : "/"} />;
  // Situs ditangguhkan ATAU snapshot belum ada → render papan pengumuman inline
  // (redirect() di konteks PPR tidak reliable — Next 16).
  if (snap.site.status === "SUSPENDED" || !snap.config) return <SuspendedView />;

  // Validasi ganda di renderer (defense-in-depth — lapis 1 Zod sudah di API)
  const parsed = parseUmkmConfig(snap.config);
  if (!parsed.ok) return <TenantNotFound homeHref={slug ? `/sites/${slug}` : "/"} />;
  const config = parsed.config;

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
      {renderSections(config.meta, config.sections)}
      {/* Bar pesan sticky hanya untuk situs terpublikasi (config hanya ada
          saat PUBLISHED — lihat getTenantSnapshot) dengan nomor WA terdaftar. */}
      {config.meta.whatsapp_number ? <StickyOrderBar whatsapp={config.meta.whatsapp_number} /> : null}
      <TenantFooter siteId={snap.site.id} businessName={config.meta.business_name} />
    </div>
  );
}
