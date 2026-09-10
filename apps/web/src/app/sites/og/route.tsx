import type { CSSProperties } from "react";
import { ImageResponse } from "next/og";
import { getPreset } from "@umkmcraft/schema";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image dinamis per tenant (SYSTEM_DESIGN §11) — link UMKM dibagikan lewat
 * WhatsApp Group, preview kartu menarik = saluran akuisisi organik gratis.
 * Warna dihitung dari preset schema (ImageResponse tidak bisa baca CSS var
 * theme.css) — logika fallback sama persis dengan themeVars() di renderer.
 * Font: default bawaan next/og (tanpa fetch eksternal agar tetap cepat).
 */

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
    hostLabel = host;
    initial = name.charAt(0).toUpperCase();
  }

  // Nama panjang otomatis mengecil — satori tidak punya clamp
  const nameSize = name.length > 40 ? 58 : name.length > 24 ? 70 : 88;

  return new ImageResponse(
    (
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
        }}
      >
        <DotPattern color={primary} />

        {/* Baris atas: monogram + chip kategori */}
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
              color: secondary,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            {category}
          </div>
        </div>

        {/* Nama usaha + tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontSize: nameSize,
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: -2.5,
              maxWidth: 1040,
            }}
          >
            {name}
          </div>
          <div style={{ fontSize: 36, opacity: 0.75, marginTop: 22, maxWidth: 920 }}>
            {tagline}
          </div>
        </div>

        {/* Footer: wordmark kiri, host kanan */}
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
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5, opacity: 0.9 }}>
              umkmcraft
            </div>
          </div>
          <div style={{ fontSize: 24, opacity: 0.55 }}>{hostLabel}</div>
        </div>
      </div>
    ),
    size,
  );
}
