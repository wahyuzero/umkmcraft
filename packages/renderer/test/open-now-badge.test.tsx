/**
 * Smoke test OpenNowBadge — island status buka/tutup + sorot baris hari ini.
 * Environment test = node (tanpa jsdom), jadi verifikasi terbagi dua:
 * - SSR di sini: slot netral pra-mount (tanpa "Buka Sekarang"/"Tutup"/
 *   aria-current — jam server TIDAK boleh terbake ke HTML) + logika murni
 *   computeOpenStatus/isTodayScheduleRow dengan jam yang disuntikkan.
 * - Efek hidrasi nyata (aria-current muncul pasca-mount, interval 60 dtk)
 *   diperiksa manual di browser (dev server, lihat laporan perbaikan).
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { OpenNowBadge, computeOpenStatus, isTodayScheduleRow } from "../src/client/OpenNowBadge";
import { hoursDefaults, OperatingHoursMap } from "../src/modules/OperatingHoursMap";

const SENIN_10_00 = new Date(2026, 8, 7, 10, 0, 0); // Senin, 7 Sep 2026 10.00
const SENIN_21_00 = new Date(2026, 8, 7, 21, 0, 0); // Senin, 7 Sep 2026 21.00
const SABTU_23_30 = new Date(2026, 8, 12, 23, 30, 0); // Sabtu, 12 Sep 2026 23.30

describe("OpenNowBadge — output SSR (slot netral, tanpa jam server)", () => {
  const badgeHtml = renderToStaticMarkup(
    createElement(OpenNowBadge, {
      variant: "badge",
      openHours: [{ day_of_week: 1, open: "09:00", close: "17:00" }],
    }),
  );
  const scheduleHtml = renderToStaticMarkup(
    createElement(OpenNowBadge, {
      variant: "schedule",
      schedule: [{ day: "Senin - Jumat", hours: "09.00 - 17.00" }, { day: "Sabtu", hours: "09.00 - 13.00" }],
    }),
  );

  it("badge pra-mount = slot netral 'Jam buka hari ini', BUKAN status terhitung", () => {
    expect(badgeHtml).toContain("Jam buka hari ini");
    expect(badgeHtml).not.toContain("Buka Sekarang");
    expect(badgeHtml).not.toContain("Tutup");
    /* Slot harus berukuran sama dengan pill status: pill rounded-full px-3.5 py-1.5 */
    expect(badgeHtml).toContain("rounded-full");
    expect(badgeHtml).toContain("px-3.5");
  });

  it("schedule pra-mount = baris polos tanpa sorot aria-current (jam klien belum ada)", () => {
    expect(scheduleHtml).toContain("Senin - Jumat");
    expect(scheduleHtml).toContain("09.00 - 17.00");
    expect(scheduleHtml).not.toContain('aria-current="date"');
  });

  it("open_hours kosong → badge merender null (bukan slot kosong palsu)", () => {
    const empty = renderToStaticMarkup(createElement(OpenNowBadge, { variant: "badge", openHours: [] }));
    expect(empty).toBe("");
  });
});

describe("computeOpenStatus — logika murni (jam disuntikkan, bukan new Date())", () => {
  const jamKerja = [{ day_of_week: 1, open: "09:00", close: "17:00" }];

  it("buka di dalam rentang, tutup di luar + saran pembukaan berikutnya", () => {
    expect(computeOpenStatus(jamKerja, SENIN_10_00)).toEqual({ isOpen: true, nextChange: null });
    /* Senin 21.00, hanya buka Senin → pembukaan Senin depan (bukan "besok") */
    const tutup = computeOpenStatus(jamKerja, SENIN_21_00);
    expect(tutup.isOpen).toBe(false);
    expect(tutup.nextChange).toBe("Buka Senin jam 09.00");
    /* Hanya buka Selasa, dilihat Senin malam → "besok" */
    const selasa = computeOpenStatus([{ day_of_week: 2, open: "09:00", close: "17:00" }], SENIN_21_00);
    expect(selasa.nextChange).toBe("Buka besok jam 09.00");
  });

  it("rentang lintas tengah malam (close <= open) membawa sampai keesokan hari", () => {
    const shiftMalam = [{ day_of_week: 6, open: "22:00", close: "02:00" }];
    expect(computeOpenStatus(shiftMalam, SABTU_23_30).isOpen).toBe(true);
    /* Minggu 01.00 masih dalam rentang semalam (day_of_week 6 membawa ke 0) */
    const mingguDiniHari = new Date(2026, 8, 13, 1, 0, 0);
    expect(computeOpenStatus(shiftMalam, mingguDiniHari).isOpen).toBe(true);
    const mingguPagi = new Date(2026, 8, 13, 3, 0, 0);
    expect(computeOpenStatus(shiftMalam, mingguPagi).isOpen).toBe(false);
  });

  it("badge yang sama di snapshot jam 10 tetap benar saat dihitung jam 21 (anti-basi)", () => {
    /* Inti perbaikan: status bukan hasil render server — dua jam berbeda
     * pada data identik HARUS menghasilkan keputusan berbeda. */
    const pagi = computeOpenStatus(jamKerja, SENIN_10_00);
    const malam = computeOpenStatus(jamKerja, SENIN_21_00);
    expect(pagi.isOpen).toBe(true);
    expect(malam.isOpen).toBe(false);
    expect(malam.nextChange).toContain("09.00");
  });
});

describe("isTodayScheduleRow — sorot baris jadwal sesuai indeks getDay()", () => {
  it("hari spesifik cocok persis nama harinya (0=Minggu .. 6=Sabtu)", () => {
    expect(isTodayScheduleRow("Senin - Jumat", 1)).toBe(true);
    expect(isTodayScheduleRow("Senin - Jumat", 6)).toBe(false);
    expect(isTodayScheduleRow("Sabtu", 6)).toBe(true);
    expect(isTodayScheduleRow("Sabtu", 0)).toBe(false);
    expect(isTodayScheduleRow("Minggu", 0)).toBe(true);
  });

  it("'Setiap Hari' selalu today; label tanpa nama hari tidak pernah", () => {
    expect(isTodayScheduleRow("Setiap Hari", 3)).toBe(true);
    expect(isTodayScheduleRow("Setiap Hari", 6)).toBe(true);
    expect(isTodayScheduleRow("By appointment", 1)).toBe(false);
  });
});

/**
 * Evidence ujung-ke-ujung seam open_hours (critique #3): config dengan
 * open_hours terstruktur HARUS menyalakan slot badge di modul sungguhan;
 * open_hours kosong (kondisi 32 versi tersimpan sebelumnya) tetap tanpa badge.
 */
describe("OperatingHoursMap — modul menyalakan slot badge dari open_hours", () => {
  it("open_hours terisi → slot badge netral dirender (status dihitung pasca-mount di klien)", () => {
    const html = renderToStaticMarkup(
      createElement(OperatingHoursMap, {
        id: "sec-hours-1",
        props: {
          ...hoursDefaults,
          schedule: [{ day: "Setiap Hari", hours: "tiap hari 7 pagi sampai 3 sore" }],
          open_hours: [{ day_of_week: 1, open: "07:00", close: "15:00" }],
        },
      }),
    );
    expect(html).toContain("Jam buka hari ini");
    expect(html.includes("Buka Sekarang") || html.includes("Tutup")).toBe(false);
  });

  it("open_hours kosong → tanpa slot badge (tanpa status palsu)", () => {
    const html = renderToStaticMarkup(
      createElement(OperatingHoursMap, {
        id: "sec-hours-1",
        props: {
          ...hoursDefaults,
          schedule: [{ day: "Setiap Hari", hours: "09:00 - 17:00" }],
        },
      }),
    );
    expect(html).not.toContain("Jam buka hari ini");
  });
});
