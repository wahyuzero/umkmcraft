import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseUmkmConfig } from "@umkmcraft/schema";
import { generateTemplateConfig, categoryHint, extractWaNumber, extractCategory, mergeSlots, emptySlots, buildSlicedSystemPrompt } from "../src/index";

const fixturesDir = fileURLToPath(new URL("../../../tooling/fixtures", import.meta.url));

describe("template engine — output SELALU lolos Zod", () => {
  const samples: Array<[string, string]> = [
    ["Warung Kopi Senja", "coffee"],
    ["Laundry Wangi", "laundry"],
    ["Sambal Ndeso", "kuliner"],
    ["Usaha Aneh 123", "kategori fiktif"],
  ];
  for (const [name, category] of samples) {
    it(`${name} (${category})`, () => {
      const config = generateTemplateConfig({
        businessName: name,
        category,
        whatsappNumber: "6281234567890",
        products: [{ name: "Produk A", price: 15000 }],
      });
      const parsed = parseUmkmConfig(config);
      expect(parsed.ok).toBe(true);
    });
  }
});

describe("prompt slicing (hemat token + anti-halusinasi)", () => {
  it("kuliner menyuntikkan trust_badges_strip, tidak service_pricing_table", () => {
    const p = buildSlicedSystemPrompt("kuliner");
    expect(p).toContain("trust_badges_strip");
    expect(p).not.toContain("service_pricing_table\"");
  });
  it("prompt mengandung larangan review palsu", () => {
    expect(buildSlicedSystemPrompt("barbershop")).toContain("DILARANG KERAS membuat ulasan");
  });
  it("categoryHint fallback default", () => {
    expect(categoryHint("kategori tak dikenal")).toEqual(categoryHint("default"));
  });
});

describe("slot extraction deterministik (ADR-3)", () => {
  it("ekstrak nomor WA berbagai format", () => {
    expect(extractWaNumber("nomor wa aku 0812-3456-7890 ya")).toBe("6281234567890");
    expect(extractWaNumber("+62 813 9999 8888")).toBe("6281399998888");
  });
  it("ekstrak kategori dari cerita santai", () => {
    expect(extractCategory("aku jualan bakso dan mie ayam")).toBe("kuliner");
    expect(extractCategory("barbershop buka jam 9")).toBe("barbershop");
    expect(extractCategory("toko baju hijab")).toBe("fashion");
  });
  it("mergeSlots tidak menimpa slot lama", () => {
    const prev = { ...emptySlots(), businessName: "Toko Lama", category: "kuliner" };
    const next = mergeSlots(prev, "nama usahaku Toko Baru, jualan sambal");
    expect(next.businessName).toBe("Toko Lama");
    expect(next.category).toBe("kuliner");
  });
});

describe("fixture config = kontrak nyata", () => {
  it("semua fixture lolos parse", () => {
    for (const f of ["kuliner-sambal", "barbershop", "laundry", "bengkel-jasa"]) {
      const raw = JSON.parse(readFileSync(`${fixturesDir}/${f}.json`, "utf8")) as unknown;
      expect(parseUmkmConfig(raw).ok).toBe(true);
    }
  });
});
