/**
 * Test hoursToOpenHours — seam intake chat → badge Buka/Tutup.
 * Sebelumnya template-engine selalu menulis open_hours: [] sehingga island
 * OpenNowBadge tidak pernah tampil di situs mana pun. Parser harus best-effort
 * tapi TIDAK PERNAH mengarang: teks tak terurai → [] (badge memang tak tampil).
 */
import { describe, expect, it } from "vitest";
import { parseUmkmConfig } from "@umkmcraft/schema";
import { generateTemplateConfig, hoursToOpenHours } from "../src/index";

describe("hoursToOpenHours — uraian jam alami (audit critique #3)", () => {
  it("flagship: 'buka tiap hari 7 pagi sampai 3 sore' → 7 hari 07:00-15:00", () => {
    expect(hoursToOpenHours("buka tiap hari 7 pagi sampai 3 sore")).toEqual(
      Array.from({ length: 7 }, (_, d) => ({ day_of_week: d, open: "07:00", close: "15:00" })),
    );
  });

  it("'senin sampai jumat 08.00-17.00' → hari kerja saja (Senin=1 .. Jumat=5)", () => {
    expect(hoursToOpenHours("senin sampai jumat 08.00-17.00")).toEqual(
      [1, 2, 3, 4, 5].map((d) => ({ day_of_week: d, open: "08:00", close: "17:00" })),
    );
  });

  it("'sabtu minggu 10 pagi sampai 9 malam' → Sabtu+Minggu 10:00-21:00 (diurutkan)", () => {
    expect(hoursToOpenHours("sabtu minggu 10 pagi sampai 9 malam")).toEqual([
      { day_of_week: 0, open: "10:00", close: "21:00" },
      { day_of_week: 6, open: "10:00", close: "21:00" },
    ]);
  });

  it("jam tunggal → close default buka + 8 jam (skema mewajibkan close)", () => {
    expect(hoursToOpenHours("buka jam 9")).toEqual(
      Array.from({ length: 7 }, (_, d) => ({ day_of_week: d, open: "09:00", close: "17:00" })),
    );
  });

  it("rentang lintas tengah malam dipertahankan apa adanya (renderer tahu aturannya)", () => {
    expect(hoursToOpenHours("tiap hari 9 malam sampai 2 pagi")[0]).toEqual({
      day_of_week: 0,
      open: "21:00",
      close: "02:00",
    });
  });

  it("'tiap hari kecuali minggu 8 pagi sampai 4 sore' → 6 hari tanpa Minggu", () => {
    const out = hoursToOpenHours("tiap hari kecuali minggu 8 pagi sampai 4 sore");
    expect(out.map((r) => r.day_of_week)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(out[0]).toEqual({ day_of_week: 1, open: "08:00", close: "16:00" });
  });

  it("keyword waktu khusus: tengah malam/tengah hari", () => {
    expect(hoursToOpenHours("tiap hari tengah malam sampai tengah hari")).toEqual(
      Array.from({ length: 7 }, (_, d) => ({ day_of_week: d, open: "00:00", close: "12:00" })),
    );
  });

  it("tanpa petunjuk hari → diasumsikan tiap hari (pola umum UMKM)", () => {
    const out = hoursToOpenHours("07.00 - 15.00 WIB");
    expect(out).toHaveLength(7);
    expect(out[0]).toEqual({ day_of_week: 0, open: "07:00", close: "15:00" });
  });

  it("sampah → [] (tidak mengarang)", () => {
    expect(hoursToOpenHours("buka ya")).toEqual([]);
    expect(hoursToOpenHours("warung buka tiap hari saja")).toEqual([]);
    expect(hoursToOpenHours("buka 24 jam")).toEqual([]);
    expect(hoursToOpenHours("")).toEqual([]);
    expect(hoursToOpenHours(undefined)).toEqual([]);
  });
});

describe("template engine — open_hours tersambung ke section jam", () => {
  it("slots.hours terurai jadi open_hours; config tetap lolos Zod", () => {
    const config = generateTemplateConfig({
      businessName: "Warung Uji",
      category: "kuliner",
      whatsappNumber: "6281234567890",
      hours: "tiap hari 7 pagi sampai 3 sore",
      products: [{ name: "Soto Uji", price: 12000 }],
    });
    const hoursSection = config.sections.find((s) => s.id === "sec-hours-1");
    expect(hoursSection).toBeDefined();
    expect(hoursSection!.props.open_hours).toHaveLength(7);
    expect(hoursSection!.props.open_hours[0]).toEqual({
      day_of_week: 0,
      open: "07:00",
      close: "15:00",
    });
    // Teks display schedule tetap utuh untuk pengunjung.
    expect(hoursSection!.props.schedule).toEqual([
      { day: "Setiap Hari", hours: "tiap hari 7 pagi sampai 3 sore" },
    ]);
    expect(parseUmkmConfig(config).ok).toBe(true);
  });

  it("tanpa slots.hours → open_hours kosong (tidak mengarang badge), schedule teks default", () => {
    const config = generateTemplateConfig({
      businessName: "Warung Uji",
      category: "kuliner",
      whatsappNumber: "6281234567890",
      products: [{ name: "Soto Uji", price: 12000 }],
    });
    const hoursSection = config.sections.find((s) => s.id === "sec-hours-1");
    expect(hoursSection!.props.open_hours).toEqual([]);
    expect(hoursSection!.props.schedule).toEqual([{ day: "Setiap Hari", hours: "09:00 - 17:00 WIB" }]);
    expect(parseUmkmConfig(config).ok).toBe(true);
  });
});
