import { describe, expect, it } from "vitest";
import fc from "fast-check";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseUmkmConfig } from "@umkmcraft/schema";
import { generateTemplateConfig } from "@umkmcraft/ai";
import { renderSections, themeStyle } from "../src/index";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const fixturesDir = fileURLToPath(new URL("../../../tooling/fixtures", import.meta.url));

describe("golden fixtures — 4 kategori bisnis", () => {
  const fixtures = ["kuliner-sambal", "barbershop", "laundry", "bengkel-jasa"];

  for (const name of fixtures) {
    it(`${name}: parse valid + render semua section tanpa throw`, () => {
      const raw = JSON.parse(readFileSync(`${fixturesDir}/${name}.json`, "utf8")) as unknown;
      const parsed = parseUmkmConfig(raw);
      expect(parsed.ok).toBe(true);
      if (!parsed.ok) return;
      const config = parsed.config;
      expect(config.sections.length).toBeGreaterThan(3);
      // Render RSC → string. Zero-Runtime-Error = tidak pernah throw.
      const html = renderToStaticMarkup(createElement("div", null, ...renderSections(config.meta, config.sections)));
      expect(html).toContain(config.meta.business_name);
      expect(html).not.toContain("<script>alert");
    });
  }

  it("HTML golden snapshot kuliner stabil (anchor minim)", () => {
    const raw = JSON.parse(readFileSync(`${fixturesDir}/kuliner-sambal.json`, "utf8")) as unknown;
    const parsed = parseUmConfigOrThrow(raw);
    const html = renderToStaticMarkup(createElement("div", null, ...renderSections(parsed.meta, parsed.sections)));
    // Anchor struktural, bukan snapshot penuh (anti-flake)
    expect(html).toContain("Sambal Cumi Asap Juara");
    expect(html).toContain("wa.me/6281234567890");
    expect(html).toContain("Pilihan Menu Favorit");
    expect(html).toContain("Best Seller");
    // status buka/tutup tergantung jam server — salah satu harus muncul
    expect(html.includes("Buka Sekarang") || html.includes("Tutup")).toBe(true);
  });

  it("migrate + parse round-trip identik", () => {
    const raw = JSON.parse(readFileSync(`${fixturesDir}/laundry.json`, "utf8")) as unknown;
    const once = parseUmConfigOrThrow(raw);
    const twice = parseUmConfigOrThrow(once);
    expect(twice).toEqual(once);
  });
});

function parseUmConfigOrThrow(raw: unknown) {
  const r = parseUmkmConfig(raw);
  if (!r.ok) throw new Error(r.issues.map((i) => `${i.path}: ${i.message}`).join("; "));
  return r.config;
}

describe("property-based (fast-check): config acak-malicious TIDAK PERNAH throw", () => {
  // Generator string hostile: XSS payload, unicode, kontrol chars
  const hostileString = fc.oneof(
    fc.constant('<script>alert("x")</script>'),
    fc.constant('"><img src=x onerror=alert(1)>'),
    fc.constant("javascript:alert(1)"),
    fc.string({ maxLength: 40 }),
    fc.constant("🔥🚀🇮🇩"),
  );

  const hostileConfig = fc.record(
    {
      businessName: hostileString,
      categoryName: fc.constant("kuliner"),
      productName: hostileString,
      description: hostileString,
      price: fc.integer({ min: 0, max: 100000 }),
      wa: fc.constant("6281234567890"),
      imageUrl: fc.oneof(fc.constant(""), fc.constant("javascript:alert(1)"), fc.constant("https://kak.com/x.jpg")),
    },
    { noNullPrototype: true },
  );

  it("template engine + render → tidak throw, tanpa <script> di output", () => {
    fc.assert(
      fc.property(hostileConfig, (c) => {
        const config = generateTemplateConfig({
          businessName: c.businessName,
          category: c.categoryName,
          whatsappNumber: c.wa,
          products: [{ name: c.productName, price: c.price, description: c.description }],
        });
        const html = renderToStaticMarkup(
          createElement("div", null, ...renderSections(config.meta, config.sections)),
        );
        // React meng-escape <script> — pastikan benar-benar tidak ada tag script hidup
        expect(html).not.toContain("<script");
        expect(typeof html).toBe("string");
        expect(html.length).toBeGreaterThan(100);
      }),
      { numRuns: 60 },
    );
  });

  it("themeStyle selalu menghasilkan CSS vars hex valid", () => {
    fc.assert(
      fc.property(hostileConfig, (c) => {
        const config = generateTemplateConfig({
          businessName: c.businessName || "Usaha",
          category: c.categoryName,
          whatsappNumber: c.wa,
        });
        const style = themeStyle(config.meta) as Record<string, string>;
        expect(style["--uc-primary"]).toMatch(/^#[0-9a-f]{6}$/);
        expect(style["--uc-font-heading"]).toContain("var(--font-jakarta)");
      }),
      { numRuns: 20 },
    );
  });
});
