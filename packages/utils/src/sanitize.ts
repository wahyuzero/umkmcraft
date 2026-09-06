/**
 * Sanitizer deterministik pasca-AI (SYSTEM_DESIGN §7.3) — SELALU jalan,
 * bukan opsional. Murni TypeScript, tanpa side-effect.
 */
import type { UmkmWebsiteConfig, Section } from "@umkmcraft/schema";

const LIMITS = {
  title: 80,
  subtitle: 220,
  description: 300,
  faq: 800,
  markdown: 4000,
  badge: 40,
  message: 160,
} as const;

export function clampString(str: string, max: number): string {
  return str.length > max ? `${str.slice(0, max - 1).trimEnd()}…` : str;
}

/** Allowlist https/http absolut; blokir javascript:, data:, vbscript:, dsb. */
export function sanitizeUrl(u: string): string {
  if (!u) return "";
  try {
    const parsed = new URL(u);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
    // blokir kredensial inline
    if (parsed.username || parsed.password) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

export function sanitizeColor(c: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(c) ? c.toLowerCase() : "";
}

export function coerceNumber(n: unknown, fallback = 0): number {
  const v = typeof n === "string" ? Number(n.replace(/[^0-9.-]/g, "")) : n;
  return typeof v === "number" && Number.isFinite(v) ? v : fallback;
}

/** Regenerasi id duplikat/invalid dengan suffix deterministik. */
export function dedupeSectionIds(sections: Array<{ id: string }>): void {
  const seen = new Map<string, number>();
  for (const s of sections) {
    const valid = /^[a-z0-9-]{1,40}$/.test(s.id);
    const base = valid ? s.id : "sec";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    if (!valid) {
      s.id = count > 0 ? `${base}-${count + 1}`.slice(0, 40) : base;
    } else if (count > 0) {
      s.id = `${base}-${count + 1}`.slice(0, 40);
    }
  }
}

/**
 * Terapkan semua aturan sanitasi pada config yang SUDAH lolos Zod parse.
 * Mengembalikan config baru — tidak pernah memutasi input.
 */
export function sanitizeConfig(config: UmkmWebsiteConfig): UmkmWebsiteConfig {
  const sections: Section[] = config.sections.map((section) => {
    const props = { ...section.props } as Record<string, unknown>;
    for (const [key, value] of Object.entries(props)) {
      if (typeof value === "string") {
        if (/url$/.test(key)) props[key] = sanitizeUrl(value);
      }
    }
    // koreksi price original < price → hapus original_price via re-validate nanti
    return { ...section, props } as Section;
  });

  dedupeSectionIds(sections);

  return {
    meta: {
      ...config.meta,
      business_name: clampString(config.meta.business_name, LIMITS.title),
      tagline: clampString(config.meta.tagline, 140),
      theme: { ...config.meta.theme },
      seo: {
        title: clampString(config.meta.seo.title, LIMITS.title),
        description: clampString(config.meta.seo.description, 200),
        keywords: config.meta.seo.keywords.map((k) => clampString(k, 40)),
      },
    },
    sections,
  };
}
