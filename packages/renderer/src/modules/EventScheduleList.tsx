/**
 * Modul event_schedule_list — jadwal acara/bazar/pop-up (TEMPLATE_RESEARCH §4).
 * Referensi pola: BootstrapMade Restaurantly/Maxim "Events", Mentor events section.
 * Sangat khas UMKM: ikut bazar, bazar ramadhan, pop-up stand, kajian/kelas masak.
 * RSC murni.
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
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden>
      <path d="M12 2.5a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  );
}

export function EventScheduleList({ id, props }: { id: string; props: EventsProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="flex flex-col gap-3.5">
        {props.events.map((ev, i) => (
          <li
            key={i}
            className="flex items-start gap-4 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-4 sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_12%,var(--uc-surface))] text-[var(--uc-primary)]">
              <CalendarMark />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-[var(--uc-primary)]">
                {ev.date_label}
              </p>
              <h3 className="mt-0.5 font-[family-name:var(--uc-font-heading)] text-[1.02rem] font-extrabold text-[var(--uc-ink)]">
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
                className="shrink-0 self-center rounded-xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-3.5 py-2 text-xs font-bold text-[var(--uc-primary)] transition-colors hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
              >
                Rute
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
