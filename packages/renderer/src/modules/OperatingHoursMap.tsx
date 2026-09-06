/**
 * Modul operating_hours_map — COMPONENTS.md §2.
 * Status Buka/Tutup dihitung murni di server (computeOpenStatus, tanpa JS client),
 * kartu dua kolom: alamat + tabel jadwal + catatan antar | placeholder peta + tombol rute.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

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
/* Badge status Buka/Tutup — titik SVG berdenyut (hormati reduced motion) */
/* ---------------------------------------------------------------- */

function StatusBadge({ isOpen, nextChange }: { isOpen: boolean; nextChange: string | null }) {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1">
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${
          isOpen
            ? "bg-[color-mix(in_oklab,#16a34a_14%,transparent)] text-[#15803d]"
            : "bg-[color-mix(in_oklab,#dc2626_10%,transparent)] text-[#b91c1c]"
        }`}
      >
        {isOpen ? (
          <span aria-hidden className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[#16a34a] opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#16a34a]" />
          </span>
        ) : (
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-[#dc2626]" />
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
  category = "",
}: {
  id: string;
  props: OperatingHoursMapProps;
  category?: string;
}) {
  const showStatus = props.open_hours.length > 0;
  const status = showStatus ? computeOpenStatus(props.open_hours) : null;

  const outlineBtn =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]";

  const hasLeftContent = Boolean(props.address || props.schedule.length > 0 || props.delivery_note);
  const hasRoutes = Boolean(props.gmaps_url || props.waze_url);

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      {status ? (
        <div className="mb-7 -mt-2">
          <StatusBadge isOpen={status.isOpen} nextChange={status.nextChange} />
        </div>
      ) : null}

      <div className="grid gap-6 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-5 shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] sm:p-7 md:grid-cols-2">
        {/* Kiri: alamat + jadwal + catatan antar */}
        <div className="flex flex-col">
          {hasLeftContent ? (
            <>
              {props.address ? (
                <p className="flex items-start gap-2.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_75%,transparent)]">
                  <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-primary)]" />
                  <span className="font-medium">{props.address}</span>
                </p>
              ) : null}
              {props.schedule.length > 0 ? (
                <ul className="mt-4 divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)]">
                  {props.schedule.map((row) => (
                    <li key={row.day} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                      <span className="font-semibold text-[var(--uc-ink)]">{row.day}</span>
                      <span className="tabular-nums text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
                        {row.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              {props.delivery_note ? (
                <p className="mt-4 flex items-start gap-2.5 rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_7%,transparent)] px-3.5 py-3 text-xs font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)]">
                  <TruckIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-primary)]" />
                  {props.delivery_note}
                </p>
              ) : null}
            </>
          ) : (
            <p className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] p-6 text-center text-sm text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
              Alamat dan jam operasional belum lengkap.
            </p>
          )}
        </div>

        {/* Kanan: peta + tombol rute */}
        <div className="flex flex-col gap-4">
          <SafeImage
            alt="Peta lokasi usaha"
            label="Peta Lokasi"
            category={category}
            aspect="aspect-[4/3]"
            seed={0}
          />
          {hasRoutes ? (
            <div className={`${hasLeftContent ? "mt-auto" : ""} flex flex-col gap-2.5 sm:flex-row`}>
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
    </SectionShell>
  );
}
