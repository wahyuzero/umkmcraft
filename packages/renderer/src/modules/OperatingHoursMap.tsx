/**
 * Modul operating_hours_map — COMPONENTS.md §2.
 * Status Buka/Tutup + sorot baris jadwal hari ini dihitung di KLIEN via island
 * OpenNowBadge — new Date() saat render RSC memicu peringatan prerender Next
 * ("unstable value") dan membekukan badge basi ke snapshot publik. Peta =
 * panel craft berpola titik + pin SVG.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";
import { OpenNowBadge } from "../client/OpenNowBadge";

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

  const outlineBtn =
    "inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]";

  const hasLeftContent = props.schedule.length > 0 || Boolean(props.delivery_note);
  const hasRoutes = Boolean(props.gmaps_url || props.waze_url);
  const hasAnyContent = hasLeftContent || Boolean(props.address) || hasRoutes;

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />

      <div className="uc-card p-5 sm:p-7">
        {showStatus ? (
          <div className="mb-5 border-b border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] pb-5">
            <OpenNowBadge variant="badge" openHours={props.open_hours} />
          </div>
        ) : null}

        {hasAnyContent ? (
          <div className={hasLeftContent ? "grid gap-6 md:grid-cols-2" : ""}>
            {/* Kiri: tabel jadwal + catatan antar */}
            {hasLeftContent ? (
              <div className="flex flex-col">
                {props.schedule.length > 0 ? (
                  <OpenNowBadge variant="schedule" schedule={props.schedule} />
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
                  className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)] shadow-[0_8px_20px_-8px_color-mix(in_oklab,var(--uc-primary)_60%,transparent)]"
                >
                  <PinIcon className="h-7 w-7" />
                </span>
                {props.address ? (
                  <p className="max-w-xs text-sm font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_75%,transparent)]">
                    {props.address}
                  </p>
                ) : (
                  <p className="max-w-xs text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
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
          <p className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] p-6 text-center text-sm text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
            Alamat dan jam operasional belum lengkap.
          </p>
        )}
      </div>
    </SectionShell>
  );
}
