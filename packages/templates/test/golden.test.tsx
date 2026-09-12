/**
 * Golden render test — pola packages/renderer/test/golden.test.tsx.
 * Setiap template di-instantiate (data demo) lalu dirender penuh via
 * @umkmcraft/renderer: Zero-Runtime-Error = TIDAK PERNAH throw, anchor konten
 * demo muncul, tanpa <script>, dan themeStyle menghasilkan CSS var hex valid.
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { parseUmkmConfig, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { renderSections, themeStyle } from "@umkmcraft/renderer";
import { instantiateTemplate, listTemplates } from "../src/index";

const TEMPLATES = listTemplates();

function instantiateOrThrow(id: string): UmkmWebsiteConfig {
  const result = instantiateTemplate(id);
  if (!result.ok) throw new Error(`template ${id} tidak ditemukan`);
  return result.config;
}

function renderHtml(config: UmkmWebsiteConfig): string {
  return renderToStaticMarkup(
    createElement("div", null, ...renderSections(config.meta, config.sections)),
  );
}

describe("golden render — 8 template", () => {
  for (const t of TEMPLATES) {
    it(`${t.id}: semua section render tanpa throw — nama demo & link WA tampil`, () => {
      const config = instantiateOrThrow(t.id);
      // parse sekali lagi sebagai jaring: instantiate sudah asersi, tapi golden
      // test harus membuktikan config demo benar-benar lolos kontrak penuh.
      expect(parseUmkmConfig(config).ok).toBe(true);
      const html = renderHtml(config);
      // Nama demo tampil (contact_direct merender "admin {businessName}")
      expect(html).toContain(t.demo.businessName);
      // Nomor WA demo terikat ke link chat
      expect(html).toContain("wa.me/6280000000000");
      // React meng-escape tag — pastikan tidak ada script hidup
      expect(html).not.toContain("<script");
      expect(html.length).toBeGreaterThan(100);
    });
  }

  it("instansiasi nama & kota custom — keduanya tampil di output", () => {
    const result = instantiateTemplate("warung-makan-v1", {
      businessName: "Warung Sedap Rasa",
      city: "Solo",
    });
    if (!result.ok) throw new Error("template warung-makan-v1 harus ada");
    const html = renderHtml(result.config);
    expect(html).toContain("Warung Sedap Rasa");
    expect(html).toContain("Solo");
    expect(html).not.toContain("{{");
    // demo tak terganggu oleh instansiasi custom
    expect(instantiateOrThrow("warung-makan-v1").meta.business_name).toBe("Warung Bu Sari");
  });

  it("themeStyle menghasilkan --uc-primary hex valid untuk semua template", () => {
    for (const t of TEMPLATES) {
      const config = instantiateOrThrow(t.id);
      const style = themeStyle(config.meta) as Record<string, string>;
      expect(style["--uc-primary"]).toMatch(/^#[0-9a-f]{6}$/);
      expect(style["--uc-bg"]).toMatch(/^#[0-9a-f]{6}$/);
      expect(style["--uc-font-heading"]).toContain("var(--font-jakarta)");
    }
  });
});
