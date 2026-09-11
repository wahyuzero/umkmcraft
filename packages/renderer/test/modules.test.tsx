/**
 * Test kontrak renderer: SETIAP tipe section di MODULE_REGISTRY harus bisa
 * di-render server-side tanpa crash dan menghasilkan markup non-kosong.
 * Wangsit Zero-Runtime-Error (ARCHITECTURE §1): render adalah fungsi murni —
 * kegagalan Zod/type harus tertangkap di sini, bukan di layar pengguna.
 */
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { ReactNode } from "react";
import type { Section, SectionType, UmkmMeta } from "@umkmcraft/schema";
import * as defaults from "../src/index";
import { MODULE_REGISTRY, renderSections } from "../src/registry";

const META: UmkmMeta = {
  site_id: "uji-render",
  business_name: "Usaha Uji",
  business_category: "kuliner",
  tagline: "tagline uji",
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
  seo: { title: "Usaha Uji", description: "desc", keywords: [] },
};

const DEFAULTS_KEY = {
  hero_storefront: "heroDefaults",
  product_catalog_wa: "catalogDefaults",
  promo_banner: "promoDefaults",
  operating_hours_map: "hoursDefaults",
  social_proof_reviews: "reviewsDefaults",
  channel_marketplace: "channelsDefaults",
  faq_accordion: "faqDefaults",
  contact_direct: "contactDefaults",
  rich_text_block: "richTextDefaults",
  gallery_grid: "galleryDefaults",
  service_pricing_table: "pricingDefaults",
  trust_badges_strip: "trustDefaults",
  step_how_to_order: "stepsDefaults",
  stats_counter_strip: "statsDefaults",
  value_props_grid: "valuePropsDefaults",
  menu_price_list: "menuDefaults",
  product_spotlight: "spotlightDefaults",
  cta_banner_full: "ctaBannerDefaults",
  team_members_grid: "teamDefaults",
  timeline_story: "timelineDefaults",
  booking_whatsapp_form: "bookingDefaults",
  event_schedule_list: "eventsDefaults",
  branch_locations_list: "branchesDefaults",
  instagram_showcase_grid: "instagramDefaults",
  updates_blog_list: "updatesDefaults",
  download_catalog_cta: "downloadCtaDefaults",
  qr_code_whatsapp: "qrCodeDefaults",
} as const;

const ALL_TYPES = Object.keys(DEFAULTS_KEY) as SectionType[];

/** trust_badges_strip sengaja render null saat semua list kosong — isi supaya terlihat. */
const PROPS_OVERRIDE: Partial<Record<SectionType, Record<string, unknown>>> = {
  trust_badges_strip: { payment_methods: ["qris", "cod"], shipping_couriers: ["jne"], certifications: ["halal_mui"] },
};

function sectionOf(type: SectionType): Section {
  const key = DEFAULTS_KEY[type];
  const base = (defaults as Record<string, unknown>)[key];
  expect(base, `defaults untuk ${type} (${key}) tidak ditemukan di index renderer`).toBeTruthy();
  const props = { ...JSON.parse(JSON.stringify(base)), ...PROPS_OVERRIDE[type] };
  return { id: `sec-${type}-1`, type, props } as unknown as Section;
}

function renderHtml(sections: Section[]): string {
  return renderToStaticMarkup(renderSections(META, sections) as ReactNode);
}

describe("MODULE_REGISTRY", () => {
  it("mendaftarkan komponen untuk semua tipe yang punya defaults", () => {
    for (const type of ALL_TYPES) {
      expect(MODULE_REGISTRY[type], `registry kehilangan ${type}`).toBeTruthy();
    }
  });
});

describe("render default tiap section — tidak pernah crash", () => {
  for (const type of ALL_TYPES) {
    it(`${type} render markup non-kosong`, () => {
      const html = renderHtml([sectionOf(type)]);
      expect(html.length, `${type} harus menghasilkan markup`).toBeGreaterThan(0);
    });
  }
});

describe("render gabungan fixture barbershop-lengkap", () => {
  it("semua section baru muncul di markup akhir", () => {
    const fixturesDir = fileURLToPath(new URL("../../../tooling/fixtures", import.meta.url));
    const raw = JSON.parse(readFileSync(`${fixturesDir}/barbershop-lengkap.json`, "utf8")) as {
      meta: UmkmMeta;
      sections: Section[];
    };
    const html = renderHtml(raw.sections);
    for (const marker of [
      "Booking Kursi Kamu",
      "Kapster Kami",
      "Perjalanan Kami",
      "Kenapa Pilih Kami?",
      "12.000+",
      "Cabang Kami",
      "Kursi kosong hari ini terbatas!",
    ]) {
      expect(html).toContain(marker);
    }
  });
});

describe("renderSections — hero selalu pertama", () => {
  const HERO_TITLE = "Hero Uji Marker";
  const PROMO_MSG = "Promo Uji Marker";
  const FAQ_TITLE = "Faq Uji Marker";

  function customSection(type: SectionType, props: Record<string, unknown>): Section {
    return { id: `sec-${type}-custom`, type, props } as unknown as Section;
  }

  const heroOf = (title: string) =>
    customSection("hero_storefront", { ...defaults.heroDefaults, title });
  const promoOf = (message: string) =>
    customSection("promo_banner", { ...defaults.promoDefaults, message });
  const faqOf = (section_title: string) =>
    customSection("faq_accordion", { ...defaults.faqDefaults, section_title, items: [] });

  function indexOfAll(html: string, needles: string[]): number[] {
    return needles.map((n) => {
      const at = html.indexOf(n);
      expect(at, `marker "${n}" harus ada di markup`).toBeGreaterThan(-1);
      return at;
    });
  }

  it("hero di tengah config tetap dirender paling awal", () => {
    const sections = [promoOf(PROMO_MSG), heroOf(HERO_TITLE), faqOf(FAQ_TITLE)];
    const [heroAt, promoAt, faqAt] = indexOfAll(renderHtml(sections), [HERO_TITLE, PROMO_MSG, FAQ_TITLE]);
    expect(heroAt).toBeLessThan(promoAt);
    expect(promoAt).toBeLessThan(faqAt);
  });

  it("urutan relatif section non-hero dipertahankan", () => {
    const sections = [faqOf(FAQ_TITLE), heroOf(HERO_TITLE), promoOf(PROMO_MSG)];
    const [heroAt, faqAt, promoAt] = indexOfAll(renderHtml(sections), [HERO_TITLE, FAQ_TITLE, PROMO_MSG]);
    expect(heroAt).toBeLessThan(faqAt);
    expect(faqAt).toBeLessThan(promoAt);
  });

  it("dua hero (config aneh) pun tetap stabil: keduanya di depan, urutan asli", () => {
    const sections = [
      promoOf(PROMO_MSG),
      heroOf(`${HERO_TITLE} A`),
      faqOf(FAQ_TITLE),
      heroOf(`${HERO_TITLE} B`),
    ];
    const [promoAt, heroA, faqAt, heroB] = indexOfAll(renderHtml(sections), [
      PROMO_MSG,
      `${HERO_TITLE} A`,
      FAQ_TITLE,
      `${HERO_TITLE} B`,
    ]);
    expect(heroA).toBeLessThan(heroB);
    expect(heroB).toBeLessThan(promoAt);
    expect(promoAt).toBeLessThan(faqAt);
  });
});
