import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseUmkmConfig } from "@umkmcraft/schema";
import {
  generateTemplateConfig,
  categoryHint,
  extractWaNumber,
  extractCategory,
  extractPrices,
  extractBusinessName,
  extractLocation,
  extractProducts,
  extractHours,
  mergeSlots,
  emptySlots,
  buildSlicedSystemPrompt,
} from "../src/index";

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

describe("slot extraction — akurasi cerita asli (audit /start)", () => {
  it("nama usaha: 'namanya X' menang atas pola generik; frasa pronomina ditolak", () => {
    expect(
      extractBusinessName("Saya punya warung soto ayam di Bandung namanya Soto Pak Slamet, buka tiap hari"),
    ).toBe("Soto Pak Slamet");
    // pulihan kapital bila "namanya" ditulis huruf kecil semua
    expect(extractBusinessName("namanya soto pak slamet")).toBe("Soto Pak Slamet");
  });

  it("nama usaha: kandidat tidak boleh mulai dengan pronomina/kata kerja/pengisi", () => {
    // "saya punya" dibuang sebagai lead-in, klausa lokasi ikut dipotong —
    // sisanya nama generik lowercase (bukan "Saya punya warung soto ayam").
    expect(extractBusinessName("Saya punya warung soto ayam di Bandung, buka tiap hari")).toBe("warung soto ayam");
    expect(extractBusinessName("jual nasi goreng enak sekali di Solo")).toBeUndefined();
  });

  it("nama usaha: pola generik 'X di Y' dibatasi ≤6 kata; pola eksplisit tetap jalan", () => {
    expect(extractBusinessName("Warung Makan Barokah di Klaten")).toBe("Warung Makan Barokah");
    expect(extractBusinessName("Toko roti brownies kukus lumer cokelat lembut di Malang")).toBeUndefined();
    expect(extractBusinessName("nama usahanya Berkah Jaya")).toBe("Berkah Jaya");
  });

  it("lokasi: berhenti di token kota, tidak menelan klausa berikutnya", () => {
    expect(extractLocation("Saya punya warung soto ayam di Bandung namanya Soto Pak Slamet")).toBe("Bandung");
    expect(extractLocation("warung di Jalan Merdeka 10 Bandung")).toBe("Jalan Merdeka 10 Bandung");
    expect(extractLocation("ada di Bogor.")).toBe("Bogor");
    // singkatan "No." bukan akhir klausa — nomor rumah ikut tertangkap
    expect(extractLocation("warung di Jalan Melati No. 12")).toBe("Jalan Melati No. 12");
  });

  it("nama usaha: batas lead-in mencakup sapaan ber-tanda seru/tanya", () => {
    // "Saya" telanjang sebelum nama proper ikut dibuang sebagai lead-in
    expect(extractBusinessName("Selamat pagi! Saya Punakawan Soto Pak Karto di Yogyakarta")).toBe(
      "Punakawan Soto Pak Karto",
    );
    expect(extractLocation("toko di Bandung, buka tiap hari")).toBe("Bandung");
  });

  it("produk: daftar 'menu: a 15000, b 18000' dan 'jual X 20rb, Y 25k' jadi item berharga", () => {
    expect(extractProducts("Menu: soto ayam 15000, soto campur 18000, es teh 5000.")).toEqual([
      { name: "soto ayam", price: 15000 },
      { name: "soto campur", price: 18000 },
      { name: "es teh", price: 5000 },
    ]);
    expect(extractProducts("jual sambal bawang 20rb, sambal matah 25k")).toEqual([
      { name: "sambal bawang", price: 20000 },
      { name: "sambal matah", price: 25000 },
    ]);
    // "jual …" tanpa satu pun harga = cerita biasa, bukan daftar menu
    expect(extractProducts("jualan sambal kemasan di Bandung")).toEqual([]);
  });

  it("extractPrices: angka polos ≥4 digit utuh (dulu '15000' terbaca '500')", () => {
    expect(extractPrices("soto ayam 15000 dan es teh 5000")).toEqual([{ price: 15000 }, { price: 5000 }]);
    expect(extractPrices("15.000 dan 25rb serta 15k")).toEqual([{ price: 15000 }, { price: 25000 }, { price: 15000 }]);
  });

  it("jam buka: ditangkap apa adanya tanpa kata 'buka'", () => {
    expect(extractHours("buka tiap hari 7 pagi sampai 3 sore")).toBe("tiap hari 7 pagi sampai 3 sore");
    expect(extractHours("buka jam 9 pagi, tutup jam 9 malam")).toBe("jam 9 pagi");
    expect(extractHours("warung buka tiap hari saja")).toBeUndefined();
  });

  it("cerita soto utuh: nama, lokasi, produk, jam — semuanya benar", () => {
    const story =
      "Saya punya warung soto ayam di Bandung namanya Soto Pak Slamet, buka tiap hari 7 pagi sampai 3 sore. " +
      "Menu: soto ayam 15000, soto campur 18000, es teh 5000.";
    const slots = mergeSlots(emptySlots(), story);
    // Nama diambil dari "namanya Soto Pak Slamet" — nama proper asli, TANPA
    // prefiks "warung" (kata umum sebelum "namanya" bukan bagian nama).
    expect(slots.businessName).toBe("Soto Pak Slamet");
    expect(slots.location).toBe("Bandung");
    expect(slots.hours).toBe("tiap hari 7 pagi sampai 3 sore");
    expect(slots.category).toBe("kuliner");
    expect(slots.products).toEqual([
      { name: "soto ayam", price: 15000 },
      { name: "soto campur", price: 18000 },
      { name: "es teh", price: 5000 },
    ]);
    expect(slots.whatsappNumber).toBeUndefined();
  });

  it("produk tidak diduplikasi saat user mengulang daftar", () => {
    const first = mergeSlots(emptySlots(), "menu: es teh 5000, soto ayam 15000");
    const again = mergeSlots(first, "menu: es teh 5000, kerupuk 1000");
    expect(again.products).toEqual([
      { name: "es teh", price: 5000 },
      { name: "soto ayam", price: 15000 },
      { name: "kerupuk", price: 1000 },
    ]);
  });
});

describe("fixture config = kontrak nyata", () => {
  it("semua fixture lolos parse", () => {
    for (const f of ["kuliner-sambal", "barbershop", "barbershop-lengkap", "laundry", "bengkel-jasa"]) {
      const raw = JSON.parse(readFileSync(`${fixturesDir}/${f}.json`, "utf8")) as unknown;
      expect(parseUmkmConfig(raw).ok).toBe(true);
    }
  });
});
