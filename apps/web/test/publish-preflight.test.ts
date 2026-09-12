import { describe, expect, it } from "vitest";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { UmkmWebsiteConfigSchema } from "@umkmcraft/schema";
import { scanUnfinished } from "../src/components/builder/PublishPreflight";

/**
 * Uji scanUnfinished — deteksi nomor WhatsApp contoh bawaan template
 * (SAMPLE_WA = "6280000000000") + anchor regresi deteksi lama (foto kosong,
 * angka stats contoh). Config dibangun lewat UmkmWebsiteConfigSchema agar
 * bentuk data realistis (default skema ikut terisi).
 */

const ISSUE_DEMO_WA =
  "Nomor WhatsApp masih contoh (6280000000000) — ganti dengan nomor asli kakak sebelum terbit";

const REAL_WA = "628123456789";
const DEMO_WA = "6280000000000";

function cfg(whatsapp: string, sections: unknown[]): UmkmWebsiteConfig {
  return UmkmWebsiteConfigSchema.parse({
    meta: {
      site_id: "preflight-test",
      business_name: "Usaha Uji Preflight",
      business_category: "kuliner",
      tagline: "Rasa rumahan buat dagang online",
      schema_version: 1,
      theme: {
        preset: "spicy_amber",
        primary_color: "#d97706",
        secondary_color: "#991b1b",
        background_color: "#fffbeb",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: whatsapp,
      seo: { title: "", description: "", keywords: [] },
    },
    sections,
  });
}

const contactDemo = { id: "contact", type: "contact_direct", props: { whatsapp_number: DEMO_WA } };
const contactReal = { id: "contact", type: "contact_direct", props: { whatsapp_number: REAL_WA } };

// cta_primary wajib ada (default hanya di field dalamnya) — cukup objek kosong.
const hero = {
  id: "hero",
  type: "hero_storefront",
  props: { title: "Sate Klak", cta_primary: {} },
};

describe("scanUnfinished — nomor WhatsApp contoh", () => {
  it("menagih WA demo, dari meta maupun contact_direct (cukup salah satu)", () => {
    // Kedua sumber masih demo.
    const both = cfg(DEMO_WA, [contactDemo]);
    expect(scanUnfinished(both)).toContain(ISSUE_DEMO_WA);

    // Hanya contact_direct yang demo (meta sudah asli).
    const onlyContact = cfg(REAL_WA, [contactDemo]);
    expect(scanUnfinished(onlyContact)).toContain(ISSUE_DEMO_WA);

    // Hanya meta yang demo (tanpa section contact_direct).
    const onlyMeta = cfg(DEMO_WA, [{ ...hero, props: { ...hero.props, image_url: "/x.png" } }]);
    expect(scanUnfinished(onlyMeta)).toContain(ISSUE_DEMO_WA);
  });

  it("tidak menagih nomor WhatsApp asli", () => {
    const config = cfg(REAL_WA, [contactReal]);
    const issues = scanUnfinished(config);
    expect(issues).not.toContain(ISSUE_DEMO_WA);
    expect(issues.every((i) => !i.includes("6280000000000"))).toBe(true);
  });

  it("deteksi lama tetap jalan (foto kosong, stats contoh) — anchor regresi", () => {
    const config = cfg(REAL_WA, [
      // image_url "" (default) → ditag sebagai foto kosong.
      hero,
      // Persis default StatsCounterStrip.tsx → ditag "masih contoh".
      {
        id: "stats",
        type: "stats_counter_strip",
        props: {
          stats: [
            { value: "500+", label: "Pelanggan Puas" },
            { value: "3 Thn", label: "Melayani" },
            { value: "4.9★", label: "Rating Pelanggan" },
          ],
        },
      },
    ]);
    const issues = scanUnfinished(config);

    expect(issues.some((i) => i.includes("foto masih kosong"))).toBe(true);
    expect(issues).toContain("Angka statistik masih contoh — bisa dianggap palsu oleh pembeli");
    // WA asli tidak ikut ternoda deteksi lain.
    expect(issues).not.toContain(ISSUE_DEMO_WA);
  });
});
