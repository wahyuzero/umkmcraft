/**
 * Theme system renderer — menerjemahkan meta.theme menjadi CSS variables.
 * Renderer PURE: tanpa window, tanpa state, tanpa import builder.
 */
import type { CSSProperties } from "react";
import type { UmkmMeta, UmkmTheme } from "@umkmcraft/schema";
import { getPreset } from "@umkmcraft/schema";

/**
 * Peta nama font → CSS var yang disediakan app shell (next/font).
 * Jika var tidak ada (font tidak dimuat), fallback sistem tetap aman.
 */
export const FONT_VAR_MAP: Record<string, string> = {
  "Plus Jakarta Sans": "var(--font-jakarta)",
  Poppins: "var(--font-poppins)",
  Inter: "var(--font-inter)",
  "DM Sans": "var(--font-dm-sans)",
  "Bricolage Grotesque": "var(--font-bricolage)",
};

const SYSTEM_STACK = `ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;

function fontStack(name: string): string {
  const v = FONT_VAR_MAP[name];
  return v ? `${v}, ${SYSTEM_STACK}` : `"${name}", ${SYSTEM_STACK}`;
}

/* ---------- Kontras teks WCAG AA ---------- */

type Rgb = { r: number; g: number; b: number };

function hexToRgb(hex: string): Rgb | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const n = parseInt(m[1]!, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: Rgb): string {
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const ch = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = relativeLuminance(a);
  const l2 = relativeLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/** Campur fg ke arah adjust; p = fraksi fg yang tersisa (1 = fg utuh). */
function mixRgb(fg: Rgb, adjust: Rgb, p: number): Rgb {
  return {
    r: Math.round(fg.r * p + adjust.r * (1 - p)),
    g: Math.round(fg.g * p + adjust.g * (1 - p)),
    b: Math.round(fg.b * p + adjust.b * (1 - p)),
  };
}

/**
 * Warna aman kontras (default ≥4.5:1 WCAG AA teks; minRatio 3 untuk elemen
 * non-teks §1.4.11) atas semua latar yang diberikan. Bila fg lolos,
 * dikembalikan utuh (visual identik). Bila tidak, digelapkan bertahap ke arah
 * ink — hanya sejauh yang dibutuhkan. Kegagalan: teks warna primary/secondary
 * yang terlalu terang di latar terang (mis. amber-600 3.19:1, sky-500 2.65:1)
 * — kontrak §aksesibilitas.
 */
export function aaTextColor(fg: string, ink: string, backgrounds: string[], minRatio = 4.5): string {
  const f = hexToRgb(fg);
  const k = hexToRgb(ink);
  if (!f || !k) return fg;
  const bgs = backgrounds
    .map(hexToRgb)
    .filter((b): b is Rgb => b !== null);
  if (bgs.length === 0) return fg;
  const passes = (c: Rgb) => bgs.every((bg) => contrastRatio(c, bg) >= minRatio);
  if (passes(f)) return fg;
  for (let step = 1; step <= 40; step++) {
    const candidate = mixRgb(f, k, 1 - step * 0.025);
    if (passes(candidate)) return rgbToHex(candidate);
  }
  return rgbToHex(k);
}

/** Konversi hex → CSS var dengan fallback preset. */
function themeVars(theme: UmkmTheme): Record<string, string> {
  const preset = getPreset(theme.preset);
  const primary = theme.primary_color || preset.primary;
  const secondary = theme.secondary_color || preset.secondary;
  const background = theme.background_color || preset.background;
  // Var teks turunan: warna brand asli bila sudah AA, digelapkan minim bila tidak.
  // (Tombol tetap memakai --uc-primary sebagai latar; ini khusus teks di latar terang.)
  const primaryText = aaTextColor(primary, preset.ink, [background, preset.surface]);
  const secondaryText = aaTextColor(secondary, preset.ink, [background, preset.surface]);
  // Teks di ATAS latar primary (tombol WA, tab aktif, band CTA): putih default
  // preset tidak selalu lolos AA (amber 3.19:1) — dihitung ulang di sini.
  const onPrimaryText = aaTextColor(preset.on_primary, preset.ink, [primary]);
  // Border elemen non-teks di atas surface (tombol outline §1.4.11 ≥3:1):
  // primary murni sering gagal (amber 35% alpha ≈1.06:1 di putih) — border
  // digelapkan ke arah ink hanya sejauh yang dibutuhkan; primary gelap lolos
  // apa adanya (visual identik).
  const primaryBorder = aaTextColor(primary, preset.ink, [background, preset.surface], 3);
  return {
    "--uc-primary": primary,
    "--uc-secondary": secondary,
    "--uc-primary-text": primaryText,
    "--uc-secondary-text": secondaryText,
    "--uc-primary-border": primaryBorder,
    "--uc-bg": background,
    "--uc-ink": preset.ink,
    "--uc-on-primary": preset.on_primary,
    "--uc-on-primary-text": onPrimaryText,
    "--uc-surface": preset.surface,
    "--uc-font-heading": fontStack(theme.font_heading),
    "--uc-font-body": fontStack(theme.font_body),
  };
}

/** Style wrapper root situs tenant. */
export function themeStyle(meta: UmkmMeta): CSSProperties {
  return themeVars(meta.theme) as CSSProperties;
}

/** Kelas utilitas Tailwind untuk modul (dipakai lewat arbitrary values). */
export const uc = {
  bg: "bg-[var(--uc-bg)]",
  surface: "bg-[var(--uc-surface)]",
  ink: "text-[var(--uc-ink)]",
  primary: "bg-[var(--uc-primary)]",
  /** Teks warna primary yang dijamin AA di latar terang (lihat aaTextColor). */
  primaryText: "text-[var(--uc-primary-text)]",
  /** Teks warna secondary yang dijamin AA di latar terang. */
  secondaryText: "text-[var(--uc-secondary-text)]",
  onPrimary: "text-[var(--uc-on-primary)]",
  /** Teks yang dijamin AA di atas latar primary (tombol, tab aktif, band). */
  onPrimaryText: "text-[var(--uc-on-primary-text)]",
  secondary: "bg-[var(--uc-secondary)]",
  heading: "font-[family-name:var(--uc-font-heading)]",
  body: "font-[family-name:var(--uc-font-body)]",
} as const;
