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
