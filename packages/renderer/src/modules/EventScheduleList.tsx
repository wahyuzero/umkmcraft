/**
 * Modul event_schedule_list — jadwal acara/bazar/pop-up (TEMPLATE_RESEARCH §4).
 * Referensi pola: BootstrapMade Restaurantly/Maxim "Events", Mentor events section.
 * Sangat khas UMKM: ikut bazar, bazar ramadhan, pop-up stand, kajian/kelas masak.
 * Baris dibagi border halus; blok tanggal di kiri — bila date_label diawali angka
 * (mis. "21 Agustus") angka ditampilkan besar + sisanya kecil, selain itu glyph
 * kalender + label utuh. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type EventsProps = SectionProps<"event_schedule_list">;

export const eventsDefaults: EventsProps = {
  section_title: "Jadwal Acara & Bazar",
  section_subtitle: "Temukan stand kami di acara berikut ini.",
  events: [
    {
      date_label: "Akhir Pekan Ini",
      title: "Ikut Bazar UMKM",
      location: "Alun-alun kota, depan panggung",
      note: "Buka 08.00–16.00, stok terbatas!",
      maps_url: "",
    },
  ],
};

function CalendarMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
      <path d="M3.5 9.5h17M8 2.8v4M16 2.8v4" />
    </svg>
  );
}

function PinMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-[var(--uc-primary)]" fill="currentColor" aria-hidden>
      <path d="M12 2.5a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  );
}

/** Pecah "21 Agustus" → { day: "21", rest: "Agustus" }; label bebas → null. */
function splitDateLabel(label: string): { day: string; rest: string } | null {
  const m = label.trim().match(/^(\d{1,2})\s+(.+)$/);
  return m ? { day: m[1]!, rest: m[2]! } : null;
}

export function EventScheduleList({ id, props }: { id: string; props: EventsProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)]">
        {props.events.map((ev, i) => {
          const date = splitDateLabel(ev.date_label);
          return (
            <li key={i} className="flex items-start gap-4 py-5 first:pt-0 last:pb-0">
              {/* Blok tanggal: angka besar display + sisa label kecil, atau glyph kalender */}
              <span className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_10%,var(--uc-surface))] text-center text-[var(--uc-primary)]">
                {date ? (
                  <>
                    <span className="font-[family-name:var(--uc-font-heading)] text-[1.35rem] font-extrabold leading-none tabular-nums">
                      {date.day}
                    </span>
                    <span className="mt-0.5 max-w-[3.2rem] truncate text-[0.58rem] font-bold uppercase tracking-[0.06em]">
                      {date.rest}
                    </span>
                  </>
                ) : (
                  <CalendarMark />
                )}
              </span>
              <div className="min-w-0 flex-1">
                {!date && ev.date_label ? (
                  <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-[var(--uc-primary)]">
                    {ev.date_label}
                  </p>
                ) : null}
                <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.02rem] font-extrabold leading-snug text-[var(--uc-ink)]">
                  {ev.title}
                </h3>
                {ev.location ? (
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-[color-mix(in_oklab,var(--uc-ink)_66%,transparent)]">
                    <PinMark />
                    {ev.location}
                  </p>
                ) : null}
                {ev.note ? (
                  <p className="mt-1 text-sm text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">{ev.note}</p>
                ) : null}
              </div>
              {ev.maps_url ? (
                <a
                  href={ev.maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] shrink-0 items-center self-center rounded-xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-4 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                >
                  Rute
                </a>
              ) : null}
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
