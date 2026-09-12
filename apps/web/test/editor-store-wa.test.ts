import { describe, expect, it } from "vitest";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { UmkmWebsiteConfigSchema } from "@umkmcraft/schema";
import { useEditor } from "../src/lib/editor-store";

/**
 * Uji sinkron WA di updateSectionProps (editor-store) — fokus pada bentuk
 * nilai yang diterima props VS meta. Kontrak:
 * - contact_direct + whatsapp_number yang SAH setelah normalisasi → props
 *   DAN meta sama-sama menerima bentuk kanonik 62… (bukan raw "08…"),
 *   supaya PATCH autosave tidak gagal WaNumberSchema di salah satu sisi;
 * - invalid → perilaku lama: props menerima nilai asli (user tetap bisa
 *   mengetik), meta tak tersentuh;
 * - sinkron HANYA untuk section contact_direct.
 * Config dibangun lewat UmkmWebsiteConfigSchema agar bentuk data realistis
 * (pola activation-checklist.test.ts).
 */

const DEMO_WA = "6280000000000";
const REAL_WA = "628123456789";

function cfg(whatsapp: string, sections: unknown[]): UmkmWebsiteConfig {
  return UmkmWebsiteConfigSchema.parse({
    meta: {
      site_id: "editor-wa-test",
      business_name: "Usaha Uji Sinkron WA",
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

const contactDemo = { id: "kontak", type: "contact_direct", props: { whatsapp_number: DEMO_WA } };
const hero = { id: "hero", type: "hero_storefront", props: { title: "Sate Klak", cta_primary: {} } };

describe("editor-store — bentuk ternormalisasi di props & meta (updateSectionProps)", () => {
  it("input '0812…' valid setelah normalisasi → props DAN meta = '6281…' (bukan raw)", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "08123456789");
    const config = useEditor.getState().config;
    expect(config.sections[0]!.props.whatsapp_number).toBe(REAL_WA);
    expect(config.meta.whatsapp_number).toBe(REAL_WA);
  });

  it("input '+62 812-3456-789' (spasi/plus/strip) → props & meta sama-sama kanonik", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "+62 812-3456-789");
    const config = useEditor.getState().config;
    expect(config.sections[0]!.props.whatsapp_number).toBe(REAL_WA);
    expect(config.meta.whatsapp_number).toBe(REAL_WA);
  });

  it("input sudah kanonik '6281234567890' → idempoten, tanpa dobel-prefiks", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "6281234567890");
    const config = useEditor.getState().config;
    expect(config.sections[0]!.props.whatsapp_number).toBe("6281234567890");
    expect(config.meta.whatsapp_number).toBe("6281234567890");
  });

  it("input invalid ('abc') → perilaku lama: props raw, meta TIDAK disentuh", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "abc");
    const config = useEditor.getState().config;
    expect(config.sections[0]!.props.whatsapp_number).toBe("abc");
    expect(config.meta.whatsapp_number).toBe(DEMO_WA);
  });

  it("section NON-contact dengan key whatsapp_number → meta tak tersentuh", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [hero, contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("hero", "whatsapp_number", "08123456789");
    const config = useEditor.getState().config;
    // Sinkron hanya untuk contact_direct: props hero menerima raw apa adanya.
    expect(config.sections[0]!.props.whatsapp_number).toBe("08123456789");
    expect(config.meta.whatsapp_number).toBe(DEMO_WA);
  });
});
