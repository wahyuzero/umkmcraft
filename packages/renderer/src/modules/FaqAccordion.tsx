/**
 * Modul faq_accordion — COMPONENTS.md §2.
 * Keputusan Zero-Runtime-Error: elemen <details>/<summary> NATIF — nol JavaScript.
 * Atribut name per-id memberi perilaku eksklusif-buka (fitur HTML, bukan JS).
 * Ikon plus berputar 45° lewat CSS group-open; animasi tinggi memakai
 * interpolate-size + ::details-content (browser lama: degradasi mulus tanpa animasi).
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type FaqAccordionProps = SectionProps<"faq_accordion">;

export const faqDefaults: FaqAccordionProps = {
  section_title: "Pertanyaan yang Sering Diajukan",
  items: [],
};

/** CSS murni untuk buka-tutup halus (progressive enhancement, aman diabaikan browser lama). */
const FAQ_STYLE = `
.uc-faq { interpolate-size: allow-keywords; }
.uc-faq details::details-content {
  block-size: 0;
  overflow-y: clip;
  transition: block-size 300ms ease-out, content-visibility 300ms allow-discrete;
}
.uc-faq details[open]::details-content { block-size: auto; }
@media (prefers-reduced-motion: reduce) {
  .uc-faq details::details-content { transition: none; }
}
`;

export function FaqAccordion({ id, props }: { id: string; props: FaqAccordionProps }) {
  return (
    <SectionShell id={id}>
      <style dangerouslySetInnerHTML={{ __html: FAQ_STYLE }} />
      <SectionHeader title={props.section_title} />
      <div className="uc-faq flex flex-col gap-2">
        {props.items.map((item, i) => (
          <details
            key={`${item.q}-${i}`}
            name={`faq-${id}`}
            className="group rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--uc-primary)_5%,transparent)] [&::-webkit-details-marker]:hidden focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]">
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
            <div className="px-5 pb-5 pt-0 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_75%,transparent)]">
              {item.a}
            </div>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
