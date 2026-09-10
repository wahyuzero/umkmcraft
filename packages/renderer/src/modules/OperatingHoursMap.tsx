/**
 * Modul operating_hours_map — COMPONENTS.md §2.
 * Status Buka/Tutup dihitung murni di server (computeOpenStatus, tanpa JS client),
 * chip status primary + titik berdenyut (.uc-pulse-dot) di atas kartu,
 * baris jadwal hari ini disorot, peta = panel craft berpola titik + pin SVG.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type OperatingHoursMapProps = SectionProps<"operating_hours_map">;

export const hoursDefaults: OperatingHoursMapProps = {
  section_title: "Lokasi & Jam Buka",
  address: "",
  gmaps_url: "",
  waze_url: "",
  schedule: [],
  open_hours: [],
  delivery_note: "",
};

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
 */
export function computeOpenStatus(
  openHours: OperatingHoursMapProps["open_hours"],
  now: Date = new Date(),
): { isOpen: boolean; nextChange: string | null } {
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
function isTodayScheduleRow(dayLabel: string, todayDow: number): boolean {
  const label = dayLabel.toLowerCase();
  const todayName = (NAMA_HARI[todayDow] ?? "").toLowerCase();
  return (todayName !== "" && label.includes(todayName)) || label.includes("setiap");
}

/* ---------------------------------------------------------------- */
/* Ikon                                                              */
/* ---------------------------------------------------------------- */

function PinIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 21.5S5.5 16 5.5 10.4a6.5 6.5 0 1 1 13 0C18.5 16 12 21.5 12 21.5Z" />
      <circle cx="12" cy="10.3" r="2.4" />
    </svg>
  );
}

function NavIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M21.5 2.5 11 13" />
      <path d="M21.5 2.5 14.8 21.7l-3.8-8.7-8.7-3.8L21.5 2.5Z" />
    </svg>
  );
}

function TruckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M1.5 5.5H15v11H1.5z" />
      <path d="M15 9.5h3.6l2.9 3.5v3.5H15" />
      <circle cx="6" cy="17.5" r="2.2" />
      <circle cx="17.5" cy="17.5" r="2.2" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Badge status Buka/Tutup — primary + titik berdenyut (.uc-pulse-dot,*/
/* hormat reduced-motion via theme.css); tutup = ink netral           */
/* ---------------------------------------------------------------- */

function StatusBadge({ isOpen, nextChange }: { isOpen: boolean; nextChange: string | null }) {
  return (
    <p className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-bold ${
          isOpen
            ? "bg-[var(--uc-primary)] text-[var(--uc-on-primary)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_35%,transparent)]"
            : "bg-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]"
        }`}
      >
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

/* ---------------------------------------------------------------- */
/* Modul                                                             */
/* ---------------------------------------------------------------- */

export function OperatingHoursMap({
  id,
  props,
}: {
  id: string;
  props: OperatingHoursMapProps;
  category?: string;
}) {
  const showStatus = props.open_hours.length > 0;
  const status = showStatus ? computeOpenStatus(props.open_hours) : null;
  const todayDow = new Date().getDay();

  const outlineBtn =
    "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]";

  const hasLeftContent = props.schedule.length > 0 || Boolean(props.delivery_note);
  const hasRoutes = Boolean(props.gmaps_url || props.waze_url);
  const hasAnyContent = hasLeftContent || Boolean(props.address) || hasRoutes;

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />

      <div className="uc-card p-5 sm:p-7">
        {status ? (
          <div className="mb-5 border-b border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] pb-5">
            <StatusBadge isOpen={status.isOpen} nextChange={status.nextChange} />
          </div>
        ) : null}

        {hasAnyContent ? (
          <div className={hasLeftContent ? "grid gap-6 md:grid-cols-2" : ""}>
            {/* Kiri: tabel jadwal + catatan antar */}
            {hasLeftContent ? (
              <div className="flex flex-col">
                {props.schedule.length > 0 ? (
                  <ul className="divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)]">
                    {props.schedule.map((row) => {
                      const isToday = isTodayScheduleRow(row.day, todayDow);
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
                              <span
                                aria-hidden
                                className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--uc-primary)]"
                              />
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
                            {row.hours}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
                {props.delivery_note ? (
                  <p
                    className={`flex items-start gap-2.5 rounded-xl bg-[color-mix(in_oklab,var(--uc-secondary)_8%,transparent)] px-3.5 py-3 text-xs font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)] ${
                      props.schedule.length > 0 ? "mt-5" : ""
                    }`}
                  >
                    <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-secondary)]" />
                    {props.delivery_note}
                  </p>
                ) : null}
              </div>
            ) : null}

            {/* Kanan: panel peta craft + tombol rute */}
            <div className="flex flex-col gap-4">
              <div
                className={`uc-pattern-dots flex min-h-[200px] flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--uc-primary)_14%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_6%,var(--uc-surface))] px-6 py-8 text-center`}
              >
                <span
                  aria-hidden
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--uc-primary)] text-[var(--uc-on-primary)] shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--uc-primary)_60%,transparent)]"
                >
                  <PinIcon className="h-7 w-7" />
                </span>
                {props.address ? (
                  <p className="max-w-xs text-sm font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_75%,transparent)]">
                    {props.address}
                  </p>
                ) : (
                  <p className="max-w-xs text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
                    Titik lokasi kami — buka tombol rute di bawah untuk navigasi.
                  </p>
                )}
              </div>
              {hasRoutes ? (
                <div className="flex flex-col gap-2.5 sm:flex-row">
                  {props.gmaps_url ? (
                    <a href={props.gmaps_url} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
                      <PinIcon className="h-4 w-4" />
                      Google Maps
                    </a>
                  ) : null}
                  {props.waze_url ? (
                    <a href={props.waze_url} target="_blank" rel="noopener noreferrer" className={outlineBtn}>
                      <NavIcon className="h-4 w-4" />
                      Waze
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] p-6 text-center text-sm text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
            Alamat dan jam operasional belum lengkap.
          </p>
        )}
      </div>
    </SectionShell>
  );
}
