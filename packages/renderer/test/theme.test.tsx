/**
 * Test kontrak tema: identitas visual per-kategori (pola preset) + lebar
 * container SectionShell. Wangsit wave2 (polish/ui-ux-overnight):
 * - setiap preset wajib punya `pattern` valid (dots | lines | none)
 * - themeVars memetakan pattern → --uc-pattern-image/size; patternClass → kelas
 * - SectionShell: wide = max-w-5xl di lg+ (default tetap max-w-3xl);
 *   tekstur hanya di tone="bg", kartu surface tetap polos
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { THEME_PRESETS, type UmkmMeta } from "@umkmcraft/schema";
import { patternClass, themeStyle } from "../src/theme/theme";
import { SectionHeader, SectionShell } from "../src/primitives";

const VALID_PATTERNS = ["dots", "lines", "none"] as const;

function metaWithPreset(preset: string): UmkmMeta {
  return {
    site_id: "uji-tema",
    business_name: "Usaha Uji",
    business_category: "uji",
    tagline: "tagline uji",
    schema_version: 1,
    theme: { preset, font_heading: "Plus Jakarta Sans", font_body: "Plus Jakarta Sans" },
    whatsapp_number: "6281234567890",
    seo: { title: "Usaha Uji", description: "desc", keywords: [] },
  } as UmkmMeta;
}

describe("preset pattern — identitas kategori", () => {
  it("keenam preset punya field pattern dengan nilai valid", () => {
    expect(THEME_PRESETS).toHaveLength(6);
    for (const preset of THEME_PRESETS) {
      expect(
        VALID_PATTERNS.includes(preset.pattern as (typeof VALID_PATTERNS)[number]),
        `pattern preset ${preset.id} tidak valid: ${preset.pattern}`,
      ).toBe(true);
    }
  });

  it("pola mengikuti keluarga motif kategori (barber/bengkel garis, lainnya titik)", () => {
    const byId = Object.fromEntries(THEME_PRESETS.map((p) => [p.id, p.pattern]));
    expect(byId["spicy_amber"]).toBe("dots"); // kuliner — bubuh/stiker craft
    expect(byId["roasted_mocha"]).toBe("dots"); // coffee — crema
    expect(byId["charcoal_slate"]).toBe("lines"); // barbershop — pole diagonal
    expect(byId["blush_rose"]).toBe("dots"); // fashion — polka tekstil
    expect(byId["electric_blue"]).toBe("lines"); // bengkel — arsiran mesin
    expect(byId["fresh_emerald"]).toBe("dots"); // laundry — gelembung sabun
  });
});

describe("mapping pattern → CSS vars / kelas", () => {
  it("themeStyle memetakan pattern preset ke --uc-pattern-image/size", () => {
    const dots = themeStyle(metaWithPreset("spicy_amber")) as Record<string, string>;
    expect(dots["--uc-pattern-image"]).toContain("radial-gradient");
    expect(dots["--uc-pattern-size"]).toBe("20px 20px");

    const lines = themeStyle(metaWithPreset("charcoal_slate")) as Record<string, string>;
    expect(lines["--uc-pattern-image"]).toContain("repeating-linear-gradient");
    expect(lines["--uc-pattern-size"]).toBe("auto");

    // Sanitas: var warna tetap utuh di samping var pola baru.
    expect(dots["--uc-primary"]).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("patternClass memetakan dots/lines/none ke kelas uc-pattern-*", () => {
    expect(patternClass("dots")).toBe("uc-pattern-dots");
    expect(patternClass("lines")).toBe("uc-pattern-lines");
    expect(patternClass("none")).toBe("");
  });
});

describe("SectionShell wide + tekstur", () => {
  function shellHtml(props: { wide?: boolean; tone?: "bg" | "surface" | "wash" }): string {
    return renderToStaticMarkup(
      createElement(SectionShell, { id: "uji-shell", ...props }, createElement("p", null, "isi")),
    );
  }

  it("default tetap max-w-3xl — tanpa lg:max-w-5xl", () => {
    const html = shellHtml({});
    expect(html).toContain("max-w-3xl");
    expect(html).not.toContain("lg:max-w-5xl");
  });

  it("wide mengembang di lg+ hingga maksimum max-w-5xl", () => {
    const html = shellHtml({ wide: true });
    expect(html).toContain("max-w-3xl");
    expect(html).toContain("lg:max-w-5xl");
  });

  it("tekstur hanya di tone bg — surface polos", () => {
    expect(shellHtml({})).toContain("uc-section-texture");
    expect(shellHtml({ tone: "surface" })).not.toContain("uc-section-texture");
    expect(shellHtml({ tone: "wash" })).not.toContain("uc-section-texture");
  });
});

describe("SectionHeader", () => {
  it("judul H2 memakai text-balance", () => {
    const html = renderToStaticMarkup(createElement(SectionHeader, { title: "Judul Uji" }));
    expect(html).toContain("text-balance");
    expect(html).toContain("Judul Uji");
  });
});
