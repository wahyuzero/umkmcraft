/**
 * Modul faq_accordion — COMPONENTS.md §2.
 * Keputusan Zero-Runtime-Error: elemen <details>/<summary> NATIF — nol JavaScript.
 * Atribut name per-id memberi perilaku eksklusif-buka (fitur HTML, bukan JS).
 * Satu kartu .uc-card dengan pemisah divide-y (bukan kartu per item).
 * Expand halus ditangani theme.css (.uc-faq + ::details-content, progresif);
 * ikon plus berputar 45° via CSS group-open. Target sentuh summary ≥44px.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type FaqAccordionProps = SectionProps<"faq_accordion">;

export const faqDefaults: FaqAccordionProps = {
  section_title: "Pertanyaan yang Sering Diajukan",
  items: [],
};

export function FaqAccordion({ id, props }: { id: string; props: FaqAccordionProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      <div className="uc-faq uc-card divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] overflow-hidden">
        {props.items.map((item, i) => (
          <details key={`${item.q}-${i}`} name={`faq-${id}`} className="group">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--uc-primary)_5%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] sm:px-6">
              <span className="text-[0.95rem] font-bold leading-snug text-[var(--uc-ink)]">{item.q}</span>
              <span
                aria-hidden
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] text-[var(--uc-primary)] transition-transform duration-200 ease-out group-open:rotate-45"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  className="h-4 w-4"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)] sm:px-6">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
