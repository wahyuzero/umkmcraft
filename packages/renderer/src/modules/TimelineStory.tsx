/**
 * Modul timeline_story — jejak perjalanan brand (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Agency about-timeline, Resume/CV experience,
 * BootstrapMade OnePage roadmap.
 * Garis vertikal + titik primary; tahun sebagai chip. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type TimelineProps = SectionProps<"timeline_story">;

export const timelineDefaults: TimelineProps = {
  section_title: "Cerita Kami",
  section_subtitle: "Perjalanan kecil yang terus tumbuh berkat dukungan pelanggan.",
  milestones: [
    { year: "Awal", title: "Mulai dari rumah", description: "Berjualan sederhana dengan alat seadanya dan semangat besar." },
    { year: "2024", title: "Pelanggan makin banyak", description: "Mulai dikenal lewat rekomendasi dari mulut ke mulut." },
    { year: "Kini", title: "Melayani lebih banyak orang", description: "Kapasitas makin besar, kualitas tetap terjaga." },
  ],
};

export function TimelineStory({ id, props }: { id: string; props: TimelineProps }) {
  const last = props.milestones.length - 1;
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ol className="relative ml-2 flex flex-col gap-8 border-l-2 border-[color-mix(in_oklab,var(--uc-primary)_25%,transparent)] pl-6">
        {props.milestones.map((m, i) => (
          <li key={i} className="relative">
            {/* Titik timeline */}
            <span
              aria-hidden
              className={`absolute -left-[1.97rem] top-1 h-3.5 w-3.5 rounded-full border-2 border-[var(--uc-primary)] ${
                i === last ? "bg-[var(--uc-primary)]" : "bg-[var(--uc-bg)]"
              }`}
            />
            <span className="inline-block rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_12%,transparent)] px-3 py-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-[var(--uc-primary)]">
              {m.year}
            </span>
            <h3 className="mt-2 font-[family-name:var(--uc-font-heading)] text-[1.1rem] font-extrabold text-[var(--uc-ink)]">
              {m.title}
            </h3>
            {m.description ? (
              <p className="mt-1 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
                {m.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
