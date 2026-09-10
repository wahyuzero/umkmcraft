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
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ol className="relative ml-2 flex flex-col gap-9 border-l-2 border-[color-mix(in_oklab,var(--uc-primary)_20%,transparent)] pl-7">
        {props.milestones.map((m, i) => (
          <li key={i} className="relative">
            {/* Titik timeline — primary penuh dengan ring warna latar agar lepas dari garis */}
            <span
              aria-hidden
              className="absolute -left-[calc(1.75rem_+_1px_+_0.4375rem)] top-1 h-3.5 w-3.5 rounded-full bg-[var(--uc-primary)] ring-4 ring-[var(--uc-bg)]"
            />
            <p className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em] tabular-nums text-[var(--uc-primary)]">
              {m.year}
            </p>
            <h3 className="mt-1.5 font-[family-name:var(--uc-font-heading)] text-[1.1rem] font-extrabold text-[var(--uc-ink)]">
              {m.title}
            </h3>
            {m.description ? (
              <p className="mt-1 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
                {m.description}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </SectionShell>
  );
}
