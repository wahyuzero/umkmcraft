import { readFile } from "node:fs/promises";
import path from "node:path";
import type { CSSProperties } from "react";
import { ImageResponse } from "next/og";
import { getPreset } from "@umkmcraft/schema";
import { aaTextColor } from "@umkmcraft/renderer";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image dinamis per tenant (SYSTEM_DESIGN §11) — link UMKM dibagikan lewat
 * WhatsApp Group, preview kartu menarik = saluran akuisisi organik gratis.
 * Warna dihitung dari preset schema (ImageResponse tidak bisa baca CSS var
 * theme.css) — logika fallback sama persis dengan themeVars() di renderer.
 * Font: Bricolage Grotesque di-vendor lokal (assets/fonts) — kartu share
 * selaras brand tanpa fetch eksternal saat render.
 * Dua varian: bila hero tenant punya foto (hero_storefront.image_url), foto
 * jadi SETENGAH KIRI kartu (full-bleed, object-cover) dan blok teks pindah ke
 * kanan di atas surface; tanpa foto → layout teks penuh seperti semula.
 */

/* Bricolage 700 lokal — dibaca sekali per proses, dipakai semua teks kartu. */
const bricolageData = readFile(
  path.join(process.cwd(), "src/assets/fonts/bricolage-grotesque-latin-700-normal.woff"),
).catch(() => undefined);

/* Pola titik halus — flex-wrap div mutlak (satori aman), warna primary tenant */
function DotPattern({ color, style }: { color: string; style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        display: "flex",
        flexWrap: "wrap",
        gap: 34,
        width: 400,
        padding: 0,
        opacity: 0.32,
        ...style,
      }}
    >
      {Array.from({ length: 36 }).map((_, i) => (
        <div
          key={i}
          style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: color, flexShrink: 0 }}
        />
      ))}
    </div>
  );
}

/* Baris atas: monogram + chip kategori — dipakai kedua varian */
function TopRow({
  initial,
  category,
  chipColor,
  primary,
  surface,
}: {
  initial: string;
  category: string;
  chipColor: string;
  primary: string;
  surface: string;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <div
        style={{
          width: 88,
          height: 88,
          borderRadius: 24,
          background: primary,
          color: surface,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 44,
          fontWeight: 800,
        }}
      >
        {initial}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 26px",
          borderRadius: 999,
          background: surface,
          border: "1.5px solid rgba(0,0,0,0.12)",
          color: chipColor,
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {category}
      </div>
    </div>
  );
}

/* Nama usaha + tagline — ukuran mengikuti lebar kolom varian */
function NameBlock({
  name,
  tagline,
  nameSize,
  nameMaxWidth,
  taglineSize,
}: {
  name: string;
  tagline: string;
  nameSize: number;
  nameMaxWidth: number;
  taglineSize: number;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div
        style={{
          fontSize: nameSize,
          fontWeight: 800,
          lineHeight: 1.05,
          letterSpacing: -2.5,
          maxWidth: nameMaxWidth,
        }}
      >
        {name}
      </div>
      <div style={{ fontSize: taglineSize, opacity: 0.75, marginTop: 22, maxWidth: nameMaxWidth - 80 }}>
        {tagline}
      </div>
    </div>
  );
}

/* Footer: wordmark kiri, host kanan. Varian foto (compact) hanya muat
   monogram + host — kolom 600px membuat label panjang melipat dan menabrak
   wordmark. */
function FooterRow({ hostLabel, compact = false }: { hostLabel: string; compact?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: INK_BUILDER,
            color: PAPER,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            fontWeight: 800,
          }}
        >
          U
        </div>
        {!compact && (
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, opacity: 0.9 }}>
            umkmcraft
          </div>
        )}
      </div>
      <div style={{ fontSize: compact ? 22 : 24, opacity: 0.55, textAlign: "right" }}>{hostLabel}</div>
    </div>
  );
}

/* Palet builder — fallback saat snapshot tenant tidak ada */
const PAPER = "#f6f1e7";
const INK_BUILDER = "#231c10";
const SIGNAL = "#9a3412";
const CARD = "#fffdf8";

export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? undefined;
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host, slug);

  // Default: dunia builder; jika tenant ada, warna & copy diisi dari preset tema
  let bg = PAPER;
  let ink = INK_BUILDER;
  let primary = SIGNAL;
  let secondary = INK_BUILDER;
  let surface = CARD;
  let name = "UMKM Craft";
  let tagline = "Website usaha untuk UMKM Indonesia — dari chat santai jadi situs siap jualan.";
  let category = "gratis • tanpa coding";
  let hostLabel = "umkmcraft.id";
  let initial = "U";

  if (snap?.config) {
    const { config } = snap;
    const preset = getPreset(config.meta.theme.preset);
    bg = config.meta.theme.background_color || preset.background;
    primary = config.meta.theme.primary_color || preset.primary;
    secondary = config.meta.theme.secondary_color || preset.secondary;
    ink = preset.ink;
    surface = preset.surface;
    name = config.meta.business_name;
    tagline = config.meta.tagline || "Katalog, jam buka, dan pesan WhatsApp — semua di sini.";
    category = config.meta.business_category;
    // Tampilkan alamat publik situs, bukan host hasil fetch (bisa localhost/
    // origin internal) — kartu pratinjau WhatsApp adalah sigma kepercayaan.
    const tenantDomain = process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "umkmcraft.id";
    hostLabel = `${snap.site.slug}.${tenantDomain.replace(/^https?:\/\//, "")}`;
    initial = name.charAt(0).toUpperCase();
  }

  // Foto hero tenant (section pertama hero_storefront): satori menuntut URL
  // absolut — image_url bisa relatif (/uploads/...) maka resolve thd request.
  const heroSection = snap?.config?.sections.find((s) => s.type === "hero_storefront");
  const heroImage =
    typeof heroSection?.props.image_url === "string" ? heroSection.props.image_url : "";
  const heroSrc = heroImage ? new URL(heroImage, req.url).toString() : undefined;

  // Nama panjang otomatis mengecil — satori tidak punya clamp. Varian foto
  // hanya punya separuh kartu (kolom kanan 600px) → skala lebih kecil.
  const nameSize = heroSrc
    ? name.length > 24
      ? 42
      : 54
    : name.length > 40
      ? 58
      : name.length > 24
        ? 70
        : 88;
  const nameMaxWidth = heroSrc ? 480 : 1040;
  const taglineSize = heroSrc ? 26 : 36;

  // Chip kategori: teks di atas surface — secondary mentah bisa gagal kontras
  // (mis. #0ea5e9 di putih = 2.65:1). Turunkan dengan helper AA yang sama
  // dengan themeVars() renderer (bg + surface sebagai latar acuan).
  const chipColor = aaTextColor(secondary, ink, [bg, surface]);

  // Font brand — bila file tak terbaca (build eksotis), next/og pakai default.
  const fontData = await bricolageData;

  return new ImageResponse(
    heroSrc ? (
      /* Varian foto: separuh kiri full-bleed object-cover, teks di kanan surface */
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: bg,
          color: ink,
          fontFamily: "Bricolage Grotesque",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- satori butuh <img> mentah */}
        <img src={heroSrc} alt={name} width={600} height={630} style={{ objectFit: "cover" }} />
        <div
          style={{
            width: 600,
            height: 630,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: 56,
            background: surface,
            color: ink,
            position: "relative",
          }}
        >
          <DotPattern color={primary} style={{ width: 260 }} />
          <TopRow
            initial={initial}
            category={category}
            chipColor={chipColor}
            primary={primary}
            surface={surface}
          />
          <NameBlock
            name={name}
            tagline={tagline}
            nameSize={nameSize}
            nameMaxWidth={nameMaxWidth}
            taglineSize={taglineSize}
          />
          <FooterRow hostLabel={hostLabel} compact />
        </div>
      </div>
    ) : (
      /* Varian teks penuh — layout semula */
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: bg,
          color: ink,
          position: "relative",
          fontFamily: "Bricolage Grotesque",
        }}
      >
        <DotPattern color={primary} />

        <TopRow
          initial={initial}
          category={category}
          chipColor={chipColor}
          primary={primary}
          surface={surface}
        />

        <NameBlock
          name={name}
          tagline={tagline}
          nameSize={nameSize}
          nameMaxWidth={nameMaxWidth}
          taglineSize={taglineSize}
        />

        <FooterRow hostLabel={hostLabel} />
      </div>
    ),
    {
      ...size,
      fonts: fontData
        ? [{ name: "Bricolage Grotesque", data: fontData, weight: 700, style: "normal" }]
        : undefined,
    },
  );
}
