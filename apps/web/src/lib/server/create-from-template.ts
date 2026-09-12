/**
 * createSiteFromTemplate — inti endpoint POST /api/sites/from-template.
 * Logika dipisah dari route agar testable tanpa alias @/ (vitest root tanpa
 * config — import di file ini RELATIF, bukan "@/lib/server/store").
 *
 * Alur (pola api/ai/generate/route.ts):
 *  1. instantiateTemplate — template nggak ada → unknown-template; body
 *     patologis (mis. nama >80 char) membuat parse internal-nya melempar →
 *     ditangkap try/catch → invalid-config (bukan unhandled 500);
 *  2. override meta.site_id dengan slug aman (safeSlugFromName) SEBELUM parse —
 *     detail di komentar dalam;
 *  3. parseUmkmConfig (lapis 1) — gagal → invalid-config;
 *  4. UmkmWebsiteConfigSchema.parse (lapis 2, defense-in-depth — sampai sini
 *     berarti bug internal, bukan input pengguna);
 *  5. store.createSite (slug dari meta.site_id, bentrok ditangani store)
 *     + store.bindOwner agar sesi anonim langsung punya situs.
 *
 * Tanpa LLM sama sekali — config datang dari katalog statis @umkmcraft/templates.
 */
import { instantiateTemplate, type InstantiateResult } from "@umkmcraft/templates";
import {
  parseUmkmConfig,
  UmkmWebsiteConfigSchema,
  type UmkmWebsiteConfig,
} from "@umkmcraft/schema";
import { safeSlugFromName, slugify } from "@umkmcraft/utils";
import { store } from "./store";

export interface CreateFromTemplateInput {
  templateId: string;
  businessName?: string;
  whatsappNumber?: string;
  city?: string;
}

export type CreateFromTemplateResult =
  | { ok: true; siteId: string; slug: string }
  | { ok: false; reason: "unknown-template" | "invalid-config" };

export async function createSiteFromTemplate(
  input: CreateFromTemplateInput,
  ownerId: string,
): Promise<CreateFromTemplateResult> {
  // instantiateTemplate menurunkan meta.site_id = slugify(nama) || "usaha-baru"
  // (packages/templates/src/instantiate.ts:106) TANPA cek reserved ataupun
  // panjang minimal, dan parseUmkmConfig internal-nya MELEMPAR bila site_id
  // gagal regex MetaSchema (min 3 char):
  //  - nama reserved ("Tokopedia", "BCA") → slug tenant reserved → draf tak
  //    bisa terbit (checkSlug di api/sites/[siteId]/publish/route.ts → 422);
  //  - nama ber-slugify <3 char ("ab") → parse internal melempar → 500.
  // TemplateInput tak punya field slug dan instantiate.ts di luar kepemilikan
  // modul ini, jadi dua langkah:
  //  (1) bila slug mentah dari nama terlalu pendek, kirim nama + " usaha" agar
  //      slug internal valid (nama tampil ikut — konsisten untuk kasus
  //      patologis ini; tanpa itu config mustahil valid);
  //  (2) setelah config jadi, site_id SELALU dioverride dengan safeSlugFromName
  //      (@umkmcraft/utils — checkSlug yang sama dengan publish) SEBELUM parse
  //      lapis 1 & 2 di bawah. Slug tak aman di-REGENERATE dengan suffix —
  //      permintaan tidak pernah ditolak hanya karena nama tabrakan reserved.
  const rawName = input.businessName?.trim() ?? "";
  const rawSlug = slugify(rawName);
  const businessName =
    rawName && rawSlug.length > 0 && rawSlug.length < 3
      ? `${rawName} usaha`
      : rawName || undefined;

  let instantiated: InstantiateResult;
  try {
    instantiated = instantiateTemplate(input.templateId.trim(), {
      businessName,
      whatsappNumber: input.whatsappNumber,
      city: input.city,
    });
  } catch {
    // Body patologis (nama >80 char, businessName bukan string, dst.) membuat
    // parseUmkmConfig internal instantiateTemplate melempar — petakan ke
    // invalid-config, jangan biarkan jadi unhandled 500.
    return { ok: false, reason: "invalid-config" };
  }
  if (!instantiated.ok) {
    return { ok: false, reason: "unknown-template" };
  }

  // Override slug (langkah 2 di atas) — SEBELUM parse lapis 1 & 2 supaya nama
  // seperti "Tokopedia" tetap sukses create dengan slug "tokopedia-usaha",
  // bukan draf yang 422 saat publish. Untuk nama/demo yang sudah aman,
  // safeSlugFromName idempoten (hasilnya = slugify biasa).
  const safe = safeSlugFromName(instantiated.config.meta.business_name);
  if (safe.ok) {
    instantiated.config.meta.site_id = safe.slug;
  }

  // Lapis 1: parse + migrasi satu pintu (@umkmcraft/schema).
  const validated = parseUmkmConfig(instantiated.config);
  if (!validated.ok) {
    return { ok: false, reason: "invalid-config" };
  }

  // Lapis 2: validasi ganda — mirror generate route:44-51. Kalau lapis 1
  // lolos tapi lapis 2 gagal, itu bug internal (route memetakan ke 500).
  let finalConfig: UmkmWebsiteConfig;
  try {
    finalConfig = UmkmWebsiteConfigSchema.parse(validated.config);
  } catch {
    return { ok: false, reason: "invalid-config" };
  }

  const { site } = await store.createSite({
    ownerId,
    slug: finalConfig.meta.site_id,
    businessCategory: finalConfig.meta.business_category,
    config: finalConfig,
    changeSource: "MANUAL",
  });
  await store.bindOwner(ownerId, site.id);

  // site.slug = slug final pasca-dedup store (bisa berbeda dari meta.site_id).
  return { ok: true, siteId: site.id, slug: site.slug };
}
