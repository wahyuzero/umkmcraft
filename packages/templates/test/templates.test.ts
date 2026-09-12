/**
 * Test fondasi @umkmcraft/templates:
 * - katalog: 8 template, semua config sah + patuh aturan kepatuhan konten
 * - resolver: listTemplates / getTemplateById
 * - instantiate: token, normalisasi WA, sweep anti-bocor, immutabilitas
 */
import { describe, expect, it } from "vitest";
import { THEME_PRESETS, parseUmkmConfig, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { getTemplateById, instantiateTemplate, listTemplates } from "../src/index";
import type { InstantiateResult } from "../src/types";

const WA_DEMO = "6280000000000";
const WA_RE = /^62\d{8,13}$/;

const TEMPLATES = listTemplates();
const IDS = TEMPLATES.map((t) => t.id);

function expectOk(result: InstantiateResult): UmkmWebsiteConfig {
  if (!result.ok) throw new Error(`harusnya ok, dapat: ${JSON.stringify(result)}`);
  return result.config;
}

/** Kumpulkan semua nilai field gambar (image_url / avatar_url / qr_image_url). */
function collectImageFieldValues(value: unknown, out: string[] = []): string[] {
  if (Array.isArray(value)) {
    for (const v of value) collectImageFieldValues(v, out);
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const [k, v] of Object.entries(value)) {
      if (/(image|avatar)_url$/.test(k) && typeof v === "string") out.push(v);
      else if (v !== null && typeof v === "object") collectImageFieldValues(v, out);
    }
  }
  return out;
}

/** Kumpulkan semua string yang tampak seperti nomor telepon (digit murni panjang). */
function collectDigitStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    if (/^\d{10,16}$/.test(value)) out.push(value);
    return out;
  }
  if (Array.isArray(value)) {
    for (const v of value) collectDigitStrings(v, out);
    return out;
  }
  if (value !== null && typeof value === "object") {
    for (const v of Object.values(value)) collectDigitStrings(v, out);
  }
  return out;
}

describe("katalog 8 template", () => {
  it("listTemplates berisi 8 template urut galeri", () => {
    expect(IDS).toEqual([
      "warung-makan-v1",
      "kedai-kopi-v1",
      "barbershop-v1",
      "laundry-v1",
      "toko-kue-v1",
      "bengkel-v1",
      "fashion-v1",
      "jasa-v1",
    ]);
  });

  it("id unik, label + demo terisi, deskripsi ≤ 140 karakter", () => {
    expect(new Set(IDS).size).toBe(IDS.length);
    for (const t of TEMPLATES) {
      expect(t.label.trim().length).toBeGreaterThan(0);
      expect(t.demo.businessName.trim().length).toBeGreaterThan(0);
      expect(t.demo.city.trim().length).toBeGreaterThan(0);
      expect(t.description.length).toBeLessThanOrEqual(140);
    }
  });

  for (const t of TEMPLATES) {
    it(`${t.id}: config sah — parse ok, hero di indeks 0, section ≤ 16`, () => {
      // Definisi mentah juga wajib lolos skema (bukan cuma hasil instantiate).
      expect(parseUmkmConfig(t.config).ok).toBe(true);
      const config = expectOk(instantiateTemplate(t.id));
      expect(config.sections.length).toBeLessThanOrEqual(16);
      expect(config.sections[0]?.type).toBe("hero_storefront");
      expect(config.meta.business_name).toBe(t.demo.businessName);
      expect(config.meta.business_category).toBe(t.category);
    });
  }

  it("semua review is_sample === true (larangan review palsu)", () => {
    for (const t of TEMPLATES) {
      for (const section of t.config.sections) {
        if (section.type === "social_proof_reviews") {
          expect(section.props.is_sample).toBe(true);
          expect(section.props.reviews.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("semua nomor WhatsApp valid /^62\\d{8,13}$/", () => {
    for (const t of TEMPLATES) {
      const config = expectOk(instantiateTemplate(t.id));
      for (const digits of collectDigitStrings(config)) {
        expect(digits).toMatch(WA_RE);
      }
    }
  });

  it("JSON.stringify tidak mengandung '/uploads/' dan tidak mengandung '{{'", () => {
    for (const t of TEMPLATES) {
      const config = expectOk(instantiateTemplate(t.id));
      const json = JSON.stringify(config);
      expect(json).not.toContain("/uploads/");
      expect(json).not.toContain("{{");
    }
  });

  it("semua field gambar (image_url/avatar_url/qr_image_url) kosong", () => {
    for (const t of TEMPLATES) {
      const config = expectOk(instantiateTemplate(t.id));
      const values = collectImageFieldValues(config);
      expect(values.length).toBeGreaterThan(0); // tiap template punya field gambar
      for (const v of values) expect(v).toBe("");
    }
  });

  it("meta.theme.preset terdaftar di THEME_PRESETS", () => {
    const presetIds = new Set(THEME_PRESETS.map((p) => p.id));
    for (const t of TEMPLATES) {
      expect(presetIds.has(t.config.meta.theme.preset)).toBe(true);
    }
  });
});

describe("resolver", () => {
  it("getTemplateById mengembalikan template yang cocok", () => {
    const t = getTemplateById("warung-makan-v1");
    expect(t).not.toBeNull();
    expect(t?.demo.businessName).toBe("Warung Bu Sari");
    expect(t?.config.sections.length).toBe(12);
  });

  it("getTemplateById('ngasal') → null", () => {
    expect(getTemplateById("ngasal")).toBeNull();
    expect(getTemplateById("")).toBeNull();
  });
});

describe("instantiateTemplate", () => {
  it("input kosong → nilai demo penuh + tanpa token tersisa", () => {
    const config = expectOk(instantiateTemplate("warung-makan-v1"));
    expect(config.meta.business_name).toBe("Warung Bu Sari");
    expect(config.meta.site_id).toBe("warung-bu-sari");
    expect(config.meta.whatsapp_number).toBe(WA_DEMO);
    expect(config.meta.seo.description).toContain("Bandung"); // token {{kota}} terganti
    expect(JSON.stringify(config)).not.toContain("{{");
  });

  it("input custom mengganti meta, hero, contact, dan site_id", () => {
    const config = expectOk(
      instantiateTemplate("kedai-kopi-v1", {
        businessName: "Kedai Kopi Ku",
        whatsappNumber: "0812-3456-7890",
        city: "Solo",
      }),
    );
    expect(config.meta.business_name).toBe("Kedai Kopi Ku");
    expect(config.meta.site_id).toBe("kedai-kopi-ku");
    expect(config.meta.whatsapp_number).toBe("6281234567890");
    expect(config.meta.business_category).toBe("kafe");
    // token di konten ikut terganti
    const hero = config.sections[0];
    expect(hero?.type).toBe("hero_storefront");
    if (hero?.type === "hero_storefront") {
      expect(hero.props.subtitle).toContain("Solo");
    }
    const contact = config.sections.find((s) => s.type === "contact_direct");
    expect(contact?.type).toBe("contact_direct");
    if (contact?.type === "contact_direct") {
      expect(contact.props.address).toBe("Solo");
      expect(contact.props.whatsapp_number).toBe("6281234567890");
    }
    expect(config.meta.tagline).toContain("Kedai Kopi Ku");
  });

  it("WA '0812-3456-7890' dinormalisasi menjadi 6281234567890", () => {
    const config = expectOk(instantiateTemplate("warung-makan-v1", { whatsappNumber: "0812-3456-7890" }));
    expect(config.meta.whatsapp_number).toBe("6281234567890");
  });

  it("WA tidak valid ('abc') → fallback nomor demo", () => {
    const config = expectOk(instantiateTemplate("warung-makan-v1", { whatsappNumber: "abc" }));
    expect(config.meta.whatsapp_number).toBe(WA_DEMO);
  });

  it("template tak dikenal → { ok:false, reason:'unknown-template' }", () => {
    const result = instantiateTemplate("ngasal");
    expect(result).toEqual({ ok: false, reason: "unknown-template" });
  });

  it("meta.theme tidak pernah tersentuh instantiate", () => {
    const template = getTemplateById("warung-makan-v1")!;
    const before = JSON.stringify(template.config.meta.theme);
    const config = expectOk(
      instantiateTemplate("warung-makan-v1", { businessName: "Warung Lain", city: "Solo" }),
    );
    expect(JSON.stringify(config.meta.theme)).toBe(before);
    expect(config.meta.theme.preset).toBe("spicy_amber");
  });

  it("immutabilitas: mutasi hasil pertama tidak mempengaruhi instantiate kedua", () => {
    const first = expectOk(instantiateTemplate("warung-makan-v1"));
    first.meta.business_name = "Diubah";
    first.sections.pop();

    const second = expectOk(instantiateTemplate("warung-makan-v1"));
    expect(second.meta.business_name).toBe("Warung Bu Sari");
    expect(second.sections.length).toBe(12);
    // definisi tetap utuh (masih berisi token demo)
    const template = getTemplateById("warung-makan-v1")!;
    expect(JSON.stringify(template.config)).toContain("{{nama_usaha}}");
  });
});
