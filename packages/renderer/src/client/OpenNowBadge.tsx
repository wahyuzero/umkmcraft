"use client";

/**
 * OpenNowBadge — island status Buka/Tutup + sorot baris jadwal hari ini.
 * Dulu keduanya dihitung saat render RSC (new Date() di server): Next menandai
 * "unstable value new Date()" di prerender DAN hasilnya terbake ke snapshot —
 * situs yang terbit jam 10:00 tetap memajang "Buka Sekarang" jam 21:00.
 * Kini dihitung di klien SETELAH mount: SSR merender placeholder netral
 * berukuran sama (tanpa CLS, tanpa info menyesatkan), lalu status badge
 * dihitung ulang tiap 60 detik (setInterval) agar lintas batas buka/tutup
 * tetap akur tanpa reload. Titik berdenyut (.uc-pulse-dot) sudah motion-safe
 * via theme.css (prefers-reduced-motion → animasi none).
 * SSR-safe: semua akses jam di dalam useEffect, render awal = netral.
 */
import { useEffect, useState } from "react";
import type { SectionProps } from "@umkmcraft/schema";

type OpenHours = SectionProps<"operating_hours_map">["open_hours"];
type Schedule = SectionProps<"operating_hours_map">["schedule"];

const NAMA_HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function toMinutes(t: string): number {
  const [h, m] = t.split(":").map((v) => Number.parseInt(v, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

function formatClock(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}.${String(Math.floor(m % 60)).padStart(2, "0")}`;
}

/**
 * Status buka/tutup murni dari open_hours (day_of_week 0 = Minggu, sesuai Date.getDay()).
 * Mendukung rentang lintas tengah malam (close <= open berarti melewati tenggat hari).
 * nextChange: teks Indonesia untuk pembukaan berikutnya saat tutup, null saat buka.
 * (Logika dipindahkan utuh dari modules/OperatingHoursMap.tsx — di sana tidak
 * boleh jalan lagi karena butuh new Date() yang tak stabil di RSC. Diekspor
 * untuk pengujian; JANGAN dipanggil dari modul server — butuh jam klien.)
 */
export function computeOpenStatus(openHours: OpenHours, now: Date): { isOpen: boolean; nextChange: string | null } {
  if (openHours.length === 0) return { isOpen: false, nextChange: null };

  const nowMin = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const today = now.getDay();

  // Sedang buka? Cek rentang hari ini dan rentang semalam (yang membawa sampai sekarang).
  for (const r of openHours) {
    const start = toMinutes(r.open);
    const end = toMinutes(r.close);
    const span = end > start ? end - start : 1440 - start + end;
    for (const back of [0, 1]) {
      if ((today - back + 7) % 7 !== r.day_of_week) continue;
      const startAbs = start - back * 1440;
      if (nowMin >= startAbs && nowMin < startAbs + span) {
        return { isOpen: true, nextChange: null };
      }
    }
  }

  // Pembukaan berikutnya: kandidat terdekat dalam ±pekitan ini.
  let best: number | null = null;
  for (const r of openHours) {
    for (let off = 0; off < 7; off++) {
      if ((today + off) % 7 !== r.day_of_week) continue;
      for (const o of [off, off + 7]) {
        const t = toMinutes(r.open) + o * 1440;
        if (t > nowMin && (best === null || t < best)) best = t;
      }
      break;
    }
  }
  if (best === null) return { isOpen: false, nextChange: null };

  const dayOffset = Math.floor(best / 1440);
  const clock = formatClock(best);
  const nextChange =
    dayOffset === 0
      ? `Buka hari ini jam ${clock}`
      : dayOffset === 1
        ? `Buka besok jam ${clock}`
        : `Buka ${NAMA_HARI[(today + dayOffset) % 7]} jam ${clock}`;
  return { isOpen: false, nextChange };
}

/** Baris jadwal yang mencakup hari ini — logika hari sama dengan computeOpenStatus (Date.getDay()). */
export function isTodayScheduleRow(dayLabel: string, todayDow: number): boolean {
  const label = dayLabel.toLowerCase();
  const todayName = (NAMA_HARI[todayDow] ?? "").toLowerCase();
  return (todayName !== "" && label.includes(todayName)) || label.includes("setiap");
}

/* Pill netral pra-mount: kelas identik dengan pill Tutup + lebar teks
 * "Jam buka hari ini" ≈ "Buka Sekarang" — slot badge stabil tanpa CLS dan
 * tidak pernah memajang status yang belum diukur. */
const PILL_BASE =
  "inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold";
const PILL_NEUTRAL = `${PILL_BASE} bg-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`;
const PILL_OPEN = `${PILL_BASE} bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_35%,transparent)]`;

function NeutralSlot() {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className={PILL_NEUTRAL}>
        <span
          aria-hidden
          className="h-2 w-2 shrink-0 rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_40%,transparent)]"
        />
        Jam buka hari ini
      </span>
    </p>
  );
}

function StatusBadge({ isOpen, nextChange }: { isOpen: boolean; nextChange: string | null }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span className={isOpen ? PILL_OPEN : PILL_NEUTRAL}>
        {isOpen ? (
          <span aria-hidden className="uc-pulse-dot h-2 w-2 shrink-0 rounded-full bg-[var(--uc-on-primary)]" />
        ) : (
          <span
            aria-hidden
            className="h-2 w-2 shrink-0 rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_40%,transparent)]"
          />
        )}
        {isOpen ? "Buka Sekarang" : "Tutup"}
      </span>
      {!isOpen && nextChange ? (
        <span className="text-xs font-medium text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
          {nextChange}
        </span>
      ) : null}
    </p>
  );
}

export function OpenNowBadge({
  variant = "badge",
  openHours = [],
  schedule = [],
}: {
  /** "badge" = pill status buka/tutup; "schedule" = daftar jadwal + sorot baris hari ini. */
  variant?: "badge" | "schedule";
  openHours?: OpenHours;
  schedule?: Schedule;
}) {
  // null = belum mount → SSR merender slot netral berukuran sama (tanpa CLS).
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    // Hanya badge yang berubah menit-ke-menit (lintas batas buka/tutup);
    // sorot baris jadwal cukup sekali saat mount (hari tidak berganti dalam sesi).
    if (variant !== "badge") return;
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, [variant]);

  if (variant === "schedule") {
    const todayDow = now?.getDay() ?? null;
    return (
      <ul className="divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)]">
        {schedule.map((row) => {
          const isToday = todayDow !== null && isTodayScheduleRow(row.day, todayDow);
          // Rombongan "Setiap Hari" yang nilainya mengulang label (teks intake
          // mentah ditempel template-engine apa adanya, mis. "Setiap hari 10
          // pagi …") → pangkas prefiksnya agar tidak dobel; hasil pangkas
          // kosong → pakai teks asli.
          const trimmed = row.day.toLowerCase().includes("setiap")
            ? row.hours.replace(/^setiap\s+hari\s*[,.:]?\s*/i, "")
            : row.hours;
          const hoursText = trimmed.trim() ? trimmed : row.hours;
          return (
            <li
              key={row.day}
              aria-current={isToday ? "date" : undefined}
              className={`flex min-h-[44px] items-center justify-between gap-4 px-3 py-2.5 text-sm ${
                isToday
                  ? "-mx-3 rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_9%,transparent)]"
                  : ""
              }`}
            >
              <span
                className={`flex items-center gap-2 text-[var(--uc-ink)] ${
                  isToday ? "font-bold" : "font-semibold"
                }`}
              >
                {isToday ? (
                  <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--uc-primary)]" />
                ) : null}
                {row.day}
              </span>
              <span
                className={`tabular-nums ${
                  isToday
                    ? "font-bold text-[var(--uc-primary)]"
                    : "text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]"
                }`}
              >
                {hoursText}
              </span>
            </li>
          );
        })}
      </ul>
    );
  }

  /* Tanpa open_hours tidak ada yang diukur — merender slot netral hanya
   * akan menghilang pasca-mount (CLS). Modul pemanggil sudah menahan island
   * ini saat open_hours kosong; ini pengaman lapis dua. */
  if (openHours.length === 0) return null;
  if (!now) return <NeutralSlot />;
  const status = computeOpenStatus(openHours, now);
  return <StatusBadge isOpen={status.isOpen} nextChange={status.nextChange} />;
}
