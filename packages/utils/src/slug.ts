/**
 * Slug generator untuk subdomain tenant (ADR-4).
 * Melawan impersonation phishing: reserved-words list + normalisasi ketat.
 */
const RESERVED_SLUGS = new Set([
  // infra platform
  "www", "app", "api", "admin", "dashboard", "mail", "ftp", "cdn", "static",
  "help", "support", "blog", "docs", "status", "about", "karir", "promo-umkmcraft",
  // merek bank / finansial (anti-phishing — SYSTEM_DESIGN §9.2)
  "bca", "bri", "mandiri", "bni", "jenius", "dana", "ovo", "gopay", "qris",
  "bank", "kemenkeu", "pertamina", "pln", "bpjs", "bjb", "cimb", "danamon",
  // merek marketplace / on-demand
  "tokopedia", "shopee", "gojek", "grab", "gofood", "grabfood", "tiktok",
  "lazada", "bukalapak", "blibli", "zalora",
  // pemerintah & utilitas
  "pemda", "pemkot", "kpu", "kominfo", "login", "verify", "verifikasi",
  "daftar", "pendaftaran", "hadiah", "bonus", "deposit", "penarikan",
]);

const SUSPICIOUS_PATTERN =
  /(login|log-?in|verify|verif|daftar|bonus|hadiah| menang|jackpot|sald[оo]|kyc|kode.*otp|otp.*kode|bebas.*ongkir.*klaim)/i;

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 62)
    .replace(/^-+|-+$/g, "");
}

export type SlugCheck =
  | { ok: true; slug: string }
  | { ok: false; slug: string; reason: "reserved" | "suspicious" | "too_short" | "invalid_format" };

export function checkSlug(slug: string): SlugCheck {
  if (slug.length < 3) return { ok: false, slug, reason: "too_short" };
  if (RESERVED_SLUGS.has(slug)) return { ok: false, slug, reason: "reserved" };
  if (SUSPICIOUS_PATTERN.test(slug)) return { ok: false, slug, reason: "suspicious" };
  if (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(slug)) {
    return { ok: false, slug, reason: "invalid_format" };
  }
  return { ok: true, slug };
}

/** slugify + check; bila bentrok reserved/suspicious → tambahkan suffix bisnis. */
export function safeSlugFromName(businessName: string, fallbackSuffix = "usaha"): SlugCheck {
  const base = slugify(businessName) || fallbackSuffix;
  const check = checkSlug(base);
  if (check.ok) return check;
  const withSuffix = checkSlug(`${base}-${fallbackSuffix}`);
  if (withSuffix.ok) return withSuffix;
  return checkSlug(`${fallbackSuffix}-${Date.now().toString(36)}`) as SlugCheck;
}
