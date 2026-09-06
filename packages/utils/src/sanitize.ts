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

/** Allowlist https (http hanya di dev); blokir javascript:, data:, kredensial inline. */
export function sanitizeUrl(u: string): string {
  if (!u) return "";
  try {
    const parsed = new URL(u);
    const httpsOnly = process.env.NODE_ENV === "production"; // Oracle #10: kontrak §7.3
    if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && !httpsOnly)) return "";
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
 * Menelusuri BERTINGKAT — image_url di dalam products/items/reviews/tiers ikut
 * dibersihkan (Oracle #7). Mengembalikan config baru — tidak memutasi input.
 */
function sanitizeDeep(value: unknown): unknown {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => sanitizeDeep(v));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      if (typeof v === "string" && /url$/i.test(k)) {
        out[k] = sanitizeUrl(v);
      } else {
        out[k] = sanitizeDeep(v);
      }
    }
    return out;
  }
  return value;
}

export function sanitizeConfig(config: UmkmWebsiteConfig): UmkmWebsiteConfig {
  const sections: Section[] = config.sections.map((section) => {
    const props = sanitizeDeep(section.props) as Record<string, unknown>;
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
