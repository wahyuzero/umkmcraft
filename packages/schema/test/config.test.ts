import { describe, expect, it } from "vitest";
import { UmkmWebsiteConfigSchema, parseUmkmConfig, guessPresetForCategory, THEME_PRESETS, migrate, readConfigVersion, LATEST_CONFIG_VERSION } from "../src/index";

const validConfig = {
  meta: {
    site_id: "sambal-cumi-juara",
    business_name: "Sambal Cumi Asap Juara",
    business_category: "kuliner",
    tagline: "Pedas Gurih Bikin Nagih",
    schema_version: 1,
    theme: {
      preset: "spicy_amber",
      primary_color: "#d97706",
      secondary_color: "#991b1b",
      background_color: "#fffbeb",
      font_heading: "Plus Jakarta Sans",
      font_body: "Plus Jakarta Sans",
    },
    whatsapp_number: "6281234567890",
    seo: { title: "Sambal Cumi", description: "Enak", keywords: ["sambal"] },
  },
  sections: [
    {
      id: "sec-hero-1",
      type: "hero_storefront",
      props: {
        title: "Sambal Cumi Juara",
        cta_primary: { label: "Pesan", action: "whatsapp_direct", prefill_message: "", url: "" },
      },
    },
    {
      id: "sec-catalog-1",
      type: "product_catalog_wa",
      props: {
        products: [
          { id: "prod-1", name: "Sambal Original", price: 35000, image_url: "" },
        ],
      },
    },
  ],
};

describe("UmkmWebsiteConfigSchema", () => {
  it("menerima config valid", () => {
    const r = UmkmWebsiteConfigSchema.safeParse(validConfig);
    expect(r.success).toBe(true);
  });

  it("menolak nomor WA non-62", () => {
    const bad = structuredClone(validConfig);
    (bad.meta as { whatsapp_number: string }).whatsapp_number = "081234567890";
    expect(UmkmWebsiteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak tipe section di luar enum (anti-halusinasi)", () => {
    const bad = structuredClone(validConfig) as { sections: Array<{ id: string; type: string; props: object }> };
    bad.sections[1] = { id: "sec-x", type: "super_gaming_section", props: {} };
    expect(UmkmWebsiteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it("discriminated union menolak props salah tipe (field halusinasi AI)", () => {
    const bad = structuredClone(validConfig);
    const hero = (bad.sections as Array<{ props: Record<string, unknown> }>)[0]!;
    hero.props.hack_me = '<script>alert(1)</script>'; // field di luar skema → stripped / error
    const r = UmkmWebsiteConfigSchema.safeParse(bad);
    // Zod strip unknown keys → tetap lolos TANPA field jahat
    if (r.success) {
      expect("hack_me" in (r.data.sections[0]!.props as object)).toBe(false);
    } else {
      expect(r.success).toBe(false);
    }
  });

  it("menolak harga negatif", () => {
    const bad = structuredClone(validConfig);
    type CatalogSection = { props: { products: Array<{ price: number }> } };
    (bad.sections[1] as unknown as CatalogSection).props.products[0]!.price = -100;
    expect(UmkmWebsiteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it("menolak warna non-hex", () => {
    const bad = structuredClone(validConfig);
    (bad.meta.theme as { primary_color: string }).primary_color = "red";
    expect(UmkmWebsiteConfigSchema.safeParse(bad).success).toBe(false);
  });

  it("default props terisi otomatis (fail-safe layer 3)", () => {
    const r = UmkmWebsiteConfigSchema.parse(validConfig);
    const hero = r.sections[0]!;
    if (hero.type === "hero_storefront") {
      expect(hero.props.image_position).toBe("right");
      expect(hero.props.badges).toEqual([]);
    } else throw new Error("section salah");
  });
});

describe("parseUmkmConfig", () => {
  it("ok → config", () => {
    expect(parseUmkmConfig(validConfig).ok).toBe(true);
  });
  it("gagal → issues terstruktur (path + message)", () => {
    const bad = structuredClone(validConfig);
    (bad.meta as { site_id: string }).site_id = "Invalid Slug!!";
    const r = parseUmkmConfig(bad);
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.issues[0]!.path).toContain("meta.site_id");
      expect(r.issues[0]!.message.length).toBeGreaterThan(0);
    }
  });
});

describe("presets", () => {
  it("6 preset dari COMPONENTS.md", () => {
    expect(THEME_PRESETS).toHaveLength(6);
  });
  it("guess kategori → preset benar", () => {
    expect(guessPresetForCategory("warung sambal kuliner").id).toBe("spicy_amber");
    expect(guessPresetForCategory("barbershop").id).toBe("charcoal_slate");
    expect(guessPresetForCategory("laundry kiloan").id).toBe("fresh_emerald");
    expect(guessPresetForCategory("kedai kopi").id).toBe("roasted_mocha");
    expect(guessPresetForCategory("usaha aneh").id).toBe("spicy_amber"); // fallback default
  });
});

describe("migrate", () => {
  it("v1 → v1 identitas", () => {
    expect(migrate(validConfig, 1)).toEqual(validConfig);
  });
  it("readConfigVersion default 1", () => {
    expect(readConfigVersion({})).toBe(1);
    expect(readConfigVersion(validConfig)).toBe(1);
  });
  it("menolak versi masa depan", () => {
    expect(() => migrate(validConfig, LATEST_CONFIG_VERSION + 1)).toThrow();
  });
});
