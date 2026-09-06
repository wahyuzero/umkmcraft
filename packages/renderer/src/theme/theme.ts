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

/** Konversi hex → CSS var dengan fallback preset. */
function themeVars(theme: UmkmTheme): Record<string, string> {
  const preset = getPreset(theme.preset);
  return {
    "--uc-primary": theme.primary_color || preset.primary,
    "--uc-secondary": theme.secondary_color || preset.secondary,
    "--uc-bg": theme.background_color || preset.background,
    "--uc-ink": preset.ink,
    "--uc-on-primary": preset.on_primary,
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
  primaryText: "text-[var(--uc-primary)]",
  onPrimary: "text-[var(--uc-on-primary)]",
  secondary: "bg-[var(--uc-secondary)]",
  heading: "font-[family-name:var(--uc-font-heading)]",
  body: "font-[family-name:var(--uc-font-body)]",
} as const;
