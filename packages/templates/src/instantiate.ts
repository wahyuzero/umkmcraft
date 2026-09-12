/**
 * instantiateTemplate — template statis → config siap simpan (Zero-Runtime-Error).
 *
 * Aturan main:
 * - TIDAK PERNAH memutasi TemplateDefinition: semua kerja di atas structuredClone.
 * - Token {{nama_usaha}} / {{kota}} / {{wa}} diganti di SELURUH string config.
 * - Sweep anti-bocor: sisa token salah tulis diganti nilai demo + console.warn —
 *   output final dijamin bebas "{{".
 * - meta.theme TIDAK disentuh (diferensiasi visual tetap dari definisi template).
 * - Akhir: parseUmkmConfig sebagai asersi fail-loud sebelum config dianggap sah.
 */
import { parseUmkmConfig, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { isValidWaNumber, normalizeWaNumber, slugify } from "@umkmcraft/utils";
import { TEMPLATES } from "./registry";
import type { InstantiateResult, TemplateInput } from "./types";

/** Nomor WhatsApp demo — PublishPreflight menagih nomor ini sebelum terbit. */
const DEMO_WA = "6280000000000";

/** Fallback slug bila nama usaha tidak menghasilkan slug sama sekali. */
const FALLBACK_SLUG = "usaha-baru";

const LEFTOVER_TOKEN_RE = /\{\{[^{}]*\}\}/g;

/**
 * Normalisasi WA: strip non-digit, awalan "0" → "62" (util @umkmcraft/utils),
 * lalu validasi kontrak WaNumberSchema /^62\d{8,13}$/ — gagal/kosong → demo.
 */
function resolveWa(raw?: string): string {
  const trimmed = (raw ?? "").trim();
  if (!trimmed) return DEMO_WA;
  const digits = normalizeWaNumber(trimmed);
  return isValidWaNumber(digits) ? digits : DEMO_WA;
}

function replaceTokens(value: string, name: string, city: string, wa: string): string {
  return value
    .replaceAll("{{nama_usaha}}", name)
    .replaceAll("{{kota}}", city)
    .replaceAll("{{wa}}", wa);
}

/** Deep-walk mutasi in-place (objek sudah milik instantiate via clone). */
function deepReplace(node: unknown, replace: (s: string) => string): void {
  if (Array.isArray(node)) {
    for (let i = 0; i < node.length; i++) {
      const v = node[i];
      if (typeof v === "string") node[i] = replace(v);
      else if (v !== null && typeof v === "object") deepReplace(v, replace);
    }
    return;
  }
  if (node !== null && typeof node === "object") {
    for (const [key, v] of Object.entries(node)) {
      if (typeof v === "string") (node as Record<string, unknown>)[key] = replace(v);
      else if (v !== null && typeof v === "object") deepReplace(v, replace);
    }
  }
}

/**
 * Sweep anti-bocor: token yang salah tulis (mis. {{kota_}}) TIDAK BOLEH lolos
 * ke situs. Dikenali via regex pada JSON.stringify, diganti nilai demo terdekat
 * + console.warn supaya kesalahan authoring template terlihat di log.
 */
function sweepLeftoverTokens(
  config: UmkmWebsiteConfig,
  demoName: string,
  demoCity: string,
): UmkmWebsiteConfig {
  const json = JSON.stringify(config);
  if (!json.includes("{{")) return config;
  const leftovers = json.match(LEFTOVER_TOKEN_RE) ?? [];
  console.warn(
    `[templates] Sisa token belum terganti (diganti nilai demo): ${leftovers.join(", ")}`,
  );
  const swept = json.replace(LEFTOVER_TOKEN_RE, (token) => {
    if (/kota/i.test(token)) return demoCity;
    if (/^(wa|nomor)/i.test(token)) return DEMO_WA;
    return demoName; // termasuk varian {{nama_usaha}} yang salah tulis
  });
  return JSON.parse(swept) as UmkmWebsiteConfig;
}

/**
 * Bangun config final dari template.
 * @param id    template id (lihat listTemplates())
 * @param input input opsional pemilik; kosong → nilai demo
 */
export function instantiateTemplate(id: string, input: TemplateInput = {}): InstantiateResult {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) return { ok: false, reason: "unknown-template" };

  const name = input.businessName?.trim() || template.demo.businessName;
  const city = input.city?.trim() || template.demo.city;
  const wa = resolveWa(input.whatsappNumber);

  // JANGAN pernah mutasi definisi — bekerja di atas deep clone.
  const cloned = structuredClone(template.config);
  deepReplace(cloned, (s) => replaceTokens(s, name, city, wa));

  // Set langsung field meta (meta.theme TIDAK disentuh).
  cloned.meta.business_name = name;
  cloned.meta.whatsapp_number = wa;
  cloned.meta.business_category = template.category;
  cloned.meta.site_id = slugify(name) || FALLBACK_SLUG;
  for (const section of cloned.sections) {
    if (section.type === "contact_direct") section.props.whatsapp_number = wa;
  }

  // Sweep terakhir menangkap sisa token dari penulisan template ATAU input.
  const swept = sweepLeftoverTokens(cloned, template.demo.businessName, template.demo.city);

  // Asersi fail-loud: config final WAJIB lolos kontrak skema.
  const parsed = parseUmkmConfig(swept);
  if (!parsed.ok) {
    const issues = parsed.issues.map((i) => `${i.path}: ${i.message}`).join("; ");
    throw new Error(`[templates] Config template "${id}" tidak valid — ${issues}`);
  }
  return { ok: true, config: parsed.config };
}
