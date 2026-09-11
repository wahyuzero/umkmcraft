/**
 * Test kualitas copy (kritik "warung harus terdengar seperti warung"):
 * - lintCopy membersihkan copy brosur & teks terpotong, copy bagus lolos utuh.
 * - Default template per kategori bebas frasa generik, tagline ≤ 8 kata.
 * - System prompt memuat panduan suara kategori + aturan keras + few-shot.
 */
import { describe, expect, it, vi, afterEach } from "vitest";
import { parseUmkmConfig } from "@umkmcraft/schema";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import {
  lintCopy,
  truncateAtWordBoundary,
  dedupeWordsInSentence,
  voiceForCategory,
  generateTemplateConfig,
  buildSlicedSystemPrompt,
  generateConfig,
} from "../src/index";

const BASE_SLOTS = { businessName: "Warung Bu Sri", category: "kuliner", whatsappNumber: "6281234567890" };

function heroSubtitleOf(config: UmkmWebsiteConfig): string {
  const hero = config.sections.find((s) => s.type === "hero_storefront");
  return hero?.type === "hero_storefront" ? hero.props.subtitle : "";
}

function ctaSubtitleOf(config: UmkmWebsiteConfig): string {
  const cta = config.sections.find((s) => s.type === "cta_banner_full");
  return cta?.type === "cta_banner_full" ? cta.props.subtitle : "";
}

function firstProductDescription(config: UmkmWebsiteConfig): string {
  const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
  return catalog?.type === "product_catalog_wa" ? (catalog.props.products[0]?.description ?? "") : "";
}

describe("lintCopy — copy brosur dibersihkan", () => {
  it("tagline 'Kebutuhan kuliner Anda, solusi kami.' diganti default kategori", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    config.meta.tagline = "Kebutuhan kuliner Anda, solusi kami.";
    const cleaned = lintCopy(config);
    expect(cleaned.meta.tagline).toBe(voiceForCategory("kuliner").tagline);
  });

  it("ganti default mengikuti kategori (laundry → tagline laundry)", () => {
    const config = generateTemplateConfig({ ...BASE_SLOTS, category: "laundry kiloan" });
    config.meta.tagline = "Solusi terbaik untuk kebutuhan laundry Anda";
    expect(lintCopy(config).meta.tagline).toBe(voiceForCategory("laundry").tagline);
  });

  it("subtitle hero brosur diganti; subtitle CTA juga", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    const hero = config.sections.find((s) => s.type === "hero_storefront");
    const cta = config.sections.find((s) => s.type === "cta_banner_full");
    if (hero?.type === "hero_storefront") hero.props.subtitle = "Solusi terbaik kuliner untuk kebutuhan Anda.";
    if (cta?.type === "cta_banner_full") cta.props.subtitle = "Memenuhi kebutuhan Anda adalah solusi kami.";
    const cleaned = lintCopy(config);
    expect(heroSubtitleOf(cleaned)).toBe(voiceForCategory("kuliner").subtitle);
    expect(ctaSubtitleOf(cleaned)).toBe(voiceForCategory("kuliner").ctaSubtitle);
  });

  it("deskripsi SEO brosur diganti dengan default kategori (memuat nama usaha)", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    config.meta.seo.description = "Solusi kuliner terbaik untuk kebutuhan Anda sekeluarga.";
    const cleaned = lintCopy(config);
    expect(cleaned.meta.seo.description).toBe(voiceForCategory("kuliner").seoDescription("Warung Bu Sri"));
    expect(cleaned.meta.seo.description).toContain("Warung Bu Sri");
  });

  it("kata berulang dalam satu kalimat di-de-dupe ('kebutuhan ... kebutuhan')", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    // deskripsi produk BUKAN field identitas → hanya dirapikan, bukan diganti utuh
    const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
    if (catalog?.type === "product_catalog_wa" && catalog.props.products[0]) {
      catalog.props.products[0].description =
        "Layanan antar cepat untuk kebutuhan rumah tangga, kebutuhan kantor juga bisa diantar.";
    }
    const cleaned = firstProductDescription(lintCopy(config));
    expect(cleaned.match(/kebutuhan/g) ?? []).toHaveLength(1);
    expect(cleaned).toBe("Layanan antar cepat untuk kebutuhan rumah tangga, kantor juga bisa diantar.");
  });

  it("frasa generik di deskripsi produk di-swap, bukan dibuang", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    const desc = firstProductDescription(config);
    void desc;
    const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
    if (catalog?.type === "product_catalog_wa" && catalog.props.products[0]) {
      catalog.props.products[0].description = "Kami punya solusi untuk kebutuhan Anda sehari-hari.";
    }
    expect(firstProductDescription(lintCopy(config))).toBe("Kami punya pilihan buat kamu sehari-hari.");
  });

  it("deskripsi lebih dari batas dipotong di batas kata — tidak pernah '…' atau kata terbelah", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    const long =
      "Sambal bawang digoreng dadakan ketika pesanan masuk, pedasnya nampol tapi balik lagi besoknya, " +
      "buat stok seminggu di kulkas juga tahan, dikirim pakai botol kaca yang rapat supaya aromanya " +
      "tidak lari ke mana-mana dan tetap segar sampai di tangan kakak sekalian di rumah. Sambalnya " +
      "diulek dadakan tanpa pengawet, level pedas bisa disesuaikan — tinggal tulis saja di chat.";
    expect(long.length).toBeGreaterThan(300);
    const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
    if (catalog?.type === "product_catalog_wa" && catalog.props.products[0]) {
      catalog.props.products[0].description = long;
    }
    const cleaned = firstProductDescription(lintCopy(config));
    expect(cleaned).not.toContain("…");
    expect(cleaned.length).toBeLessThanOrEqual(300);
    // kata terakhir utuh (ada di string asli sebagai kata penuh)
    const lastWord = cleaned.split(/\s+/).at(-1)?.replace(/[^\p{L}\p{N}]/gu, "") ?? "";
    expect(long).toMatch(new RegExp(`\\b${lastWord}\\b`, "u"));
  });

  it("'…' sisa clamp sanitizer ikut dirapikan di batas kata", () => {
    expect(truncateAtWordBoundary("Sambal dadakan yang selalu…", 140)).toBe("Sambal dadakan yang selalu");
  });
});

describe("lintCopy — copy bagus lolos tanpa diubah", () => {
  it("tagline, subtitle, dan deskripsi dengan suara warung tidak tersentuh", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    const goodTagline = "Sambal ulek dadakan, pedasnya juara";
    const goodSubtitle = "Sambalnya digoreng dadakan tiap pesanan. Orang balik lagi buat nambah nasi.";
    const goodDesc = "Ayam kampung digoreng garing, sambalnya diulek saat pesanan masuk. Sekali coba pasti balik lagi.";
    config.meta.tagline = goodTagline;
    const hero = config.sections.find((s) => s.type === "hero_storefront");
    if (hero?.type === "hero_storefront") hero.props.subtitle = goodSubtitle;
    const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
    if (catalog?.type === "product_catalog_wa" && catalog.props.products[0]) {
      catalog.props.products[0].description = goodDesc;
    }
    const cleaned = lintCopy(config);
    expect(cleaned.meta.tagline).toBe(goodTagline);
    expect(heroSubtitleOf(cleaned)).toBe(goodSubtitle);
    expect(firstProductDescription(cleaned)).toBe(goodDesc);
  });

  it("field identitas (nama usaha, judul section) tidak diutak-atik lint", () => {
    const config = generateTemplateConfig({ ...BASE_SLOTS, businessName: "Sambal Solusi Bu Sri" });
    const cleaned = lintCopy(config);
    expect(cleaned.meta.business_name).toBe("Sambal Solusi Bu Sri");
    expect(cleaned.sections.every((s) => s.id.startsWith("sec-"))).toBe(true);
  });
});

describe("truncateAtWordBoundary & dedupeWordsInSentence", () => {
  it("potong di spasi, tidak di tengah kata", () => {
    expect(truncateAtWordBoundary("satu dua tiga", 20)).toBe("satu dua tiga");
    const out = truncateAtWordBoundary("satu dua tiga empat lima enam", 14);
    expect(out).toBe("satu dua tiga");
    expect(out.length).toBeLessThanOrEqual(14);
  });

  it("kata tunggal panjang (tanpa spasi) tetap dipotong ke limit", () => {
    expect(truncateAtWordBoundary("x".repeat(50), 10)).toHaveLength(10);
  });

  it("de-dupe menyimpan kemunculan pertama, hapus sisanya", () => {
    expect(dedupeWordsInSentence("Terbaik untuk kebutuhan Anda dan kebutuhan usaha.")).toBe(
      "Terbaik untuk kebutuhan Anda dan usaha.",
    );
  });

  it("kata berulang antar kalimat tidak dihapus (lint bekerja per kalimat)", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
    if (catalog?.type === "product_catalog_wa" && catalog.props.products[0]) {
      catalog.props.products[0].description = "Sambalnya dadakan. Dadakan rasanya bikin nagih.";
    }
    expect(firstProductDescription(lintCopy(config))).toBe("Sambalnya dadakan. Dadakan rasanya bikin nagih.");
  });
});

describe("template default per kategori — suara pedagang, bukan brosur", () => {
  const cases: Array<[string, string]> = [
    ["warung sambal bu sri", "kuliner"],
    ["Kopi Senja Pagi", "coffee"],
    ["Barbershop Pangkas Juara", "barbershop"],
    ["Laundry Wangi Kilat", "laundry"],
    ["Butik Baju Adem", "fashion"],
    ["Bengkel Motor Jujur", "bengkel"],
    ["Usaha Apa Saja", "default"],
  ];

  for (const [name, expectedFamily] of cases) {
    it(`"${name}" → kategori ${expectedFamily}: parse valid + copy bersih`, () => {
      const voice = voiceForCategory(name);
      expect(voice.key).toBe(expectedFamily);

      const config = generateTemplateConfig({ businessName: name, category: name, whatsappNumber: "6281234567890" });
      expect(parseUmkmConfig(config).ok).toBe(true);

      // tagline ≤ 8 kata
      const words = config.meta.tagline.trim().split(/\s+/);
      expect(words.length).toBeLessThanOrEqual(8);
      expect(words.length).toBeGreaterThan(2);

      // tidak ada bahasa brosur di seluruh copy
      const copy = [
        config.meta.tagline,
        heroSubtitleOf(config),
        ctaSubtitleOf(config),
        config.meta.seo.description,
        ...config.sections.flatMap((s) =>
          s.type === "product_catalog_wa"
            ? s.props.products.map((p) => p.description)
            : s.type === "value_props_grid"
              ? s.props.items.map((i) => i.description)
              : s.type === "faq_accordion"
                ? s.props.items.map((i) => i.a)
                : [],
        ),
      ];
      for (const text of copy) {
        expect(text).not.toMatch(/\bsolusi\b/i);
        expect(text).not.toMatch(/kebutuhan (anda|kamu)/i);
        expect(text).not.toContain("…");
      }
      // deskripsi produk = kalimat utuh
      const catalog = config.sections.find((s) => s.type === "product_catalog_wa");
      if (catalog?.type === "product_catalog_wa") {
        for (const p of catalog.props.products) expect(p.description).toMatch(/[.!?]$/u);
      }
    });
  }

  it("lintCopy idempoten terhadap default template — template sudah bersih sejak lahir", () => {
    const config = generateTemplateConfig(BASE_SLOTS);
    expect(lintCopy(config)).toEqual(config);
  });

  it("cerita user tetap dipakai, tapi versi brosur diganti default kategori", () => {
    const config = generateTemplateConfig({
      ...BASE_SLOTS,
      story: "Solusi kuliner terbaik untuk kebutuhan Anda setiap hari.",
    });
    const cleaned = lintCopy(config);
    expect(heroSubtitleOf(cleaned)).toBe(voiceForCategory("kuliner").subtitle);
    expect(cleaned.meta.tagline).toBe(voiceForCategory("kuliner").tagline);
  });
});

describe("system prompt — panduan suara kategori", () => {
  it("memuat aturan gaya bahasa keras + few-shot bagus vs buruk", () => {
    const p = buildSlicedSystemPrompt("kuliner");
    expect(p).toContain("ATURAN GAYA BAHASA");
    expect(p).toContain("MAKSIMAL 8 kata");
    expect(p).toContain('berakhir dengan "…"');
    expect(p).toContain("CONTOH BAGUS");
    expect(p).toContain("CONTOH BURUK");
    expect(p).toContain('tagline: "Kebutuhan kuliner Anda, solusi kami."');
  });

  it("panduan per kategori berbeda dan sesuai keluarga bisnisnya", () => {
    expect(buildSlicedSystemPrompt("warung makan")).toContain("GAYA KULINER/WARUNG");
    expect(buildSlicedSystemPrompt("barbershop")).toContain("GAYA BARBERSHOP");
    expect(buildSlicedSystemPrompt("coffee shop")).toContain("GAYA COFFEE SHOP");
    expect(buildSlicedSystemPrompt("laundry kiloan")).toContain("GAYA LAUNDRY");
    expect(buildSlicedSystemPrompt("bengkel motor")).toContain("GAYA BENGKEL");
    expect(buildSlicedSystemPrompt("kategori aneh")).toContain("GAYA UMUM");
  });

  it("aturan lama tetap utuh (anti-halusinasi review)", () => {
    expect(buildSlicedSystemPrompt("barbershop")).toContain("DILARANG KERAS membuat ulasan");
  });
});

describe("generateConfig — choke point lint (jalur template, tanpa AI key)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("output route tanpa key AI tetap tersaring lintCopy", async () => {
    vi.stubEnv("GOOGLE_GENERATIVE_AI_API_KEY", "");
    const { config, engine } = await generateConfig({
      slots: { ...BASE_SLOTS, story: "Solusi kuliner terbaik untuk kebutuhan Anda." },
      category: "kuliner",
      conversationSummary: "Nama usaha: Warung Bu Sri",
    });
    expect(engine).toBe("template");
    expect(heroSubtitleOf(config)).toBe(voiceForCategory("kuliner").subtitle);
    expect(parseUmkmConfig(config).ok).toBe(true);
  });
});
