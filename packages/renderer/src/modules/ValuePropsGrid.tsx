/**
 * Modul value_props_grid — grid keunggulan "Kenapa Pilih Kami" (TEMPLATE_RESEARCH §4).
 * Referensi pola: Arsha services, Heroic Features, Leadfeeder why-us section.
 * Layout tanpa kartu: ikon stroke 24px dalam lingkaran tint primary, judul tebal,
 * deskripsi ink-70. Ikon = geometris sederhana (stroke 1.8, ujung membulat),
 * BUKAN emoji/logo merek. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type ValuePropsGridProps = SectionProps<"value_props_grid">;

export const valuePropsDefaults: ValuePropsGridProps = {
  section_title: "Kenapa Pilih Kami?",
  section_subtitle: "",
  items: [
    { icon: "star", title: "Kualitas Terbaik", description: "Bahan pilihan dan dikerjakan dengan teliti setiap hari." },
    { icon: "chat", title: "Respon Cepat", description: "Chat WhatsApp dibalas secepatnya di jam operasional." },
    { icon: "wallet", title: "Harga Bersahabat", description: "Harga jujur tanpa biaya tersembunyi." },
  ],
};

type IconName = ValuePropsGridProps["items"][number]["icon"];

/* Ikon stroke seragam: viewBox 24, strokeWidth 1.8, round caps. */
const ICON_CLS = "h-6 w-6";
const ICON_PROPS = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

function IconMark({ name }: { name: IconName }) {
  switch (name) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="m12 3.4 2.6 5.4 5.9.9-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9-4.3-4.1 5.9-.9L12 3.4z" />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M3 7.5h11V16H3z" />
          <path d="M14 10h3.6l2.4 3v3h-6" />
          <circle cx="7.2" cy="17.8" r="1.9" />
          <circle cx="17" cy="17.8" r="1.9" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M12 3 19 5.6v5.2c0 4.6-3 8.4-7 9.7-4-1.3-7-5.1-7-9.7V5.6L12 3z" />
          <path d="m8.9 11.8 2.2 2.2 4-4.4" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <circle cx="12" cy="12" r="8.8" />
          <path d="M12 7.5V12l3.2 1.9" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M12 3.8c-5 0-9 3.3-9 7.4 0 2.2 1.2 4.2 3.1 5.5-.1 1-.5 2-1.2 2.9 1.6-.2 3-.8 4-1.4 1 .3 2 .4 3.1.4 5 0 9-3.3 9-7.4s-4-7.4-9-7.4z" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <rect x="3" y="6.5" width="18" height="13" rx="2.2" />
          <path d="M3 10.5h18" />
          <path d="M16.4 15h1.6" strokeWidth={2.2} />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M20 4c.3 9.5-3.2 15-9.3 15-1.5 0-2.9-.4-4-1.1C6 12 10 6.5 20 4z" />
          <path d="M4.5 19.5C8 13.5 12.5 9.5 17.5 7" />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M12 3.5c.5 2.1.1 3.6-1 4.9-1.2 1.4-3.5 2.7-3.5 5.5a6.5 6.5 0 0 0 13 0c0-4-3.4-7.5-8.5-10.4z" />
          <path d="M12 20.4a3.4 3.4 0 0 1-3.4-3.4c0-1.6 1.2-2.7 3.4-4.2 2.2 1.5 3.4 2.6 3.4 4.2a3.4 3.4 0 0 1-3.4 3.4z" />
        </svg>
      );
    case "tool":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={ICON_CLS} {...ICON_PROPS}>
          <path d="M12 20.3C6.7 16.6 3.5 13.3 3.5 9.8 3.5 7.2 5.5 5.2 8 5.2c1.5 0 3 .8 4 2.1 1-1.3 2.5-2.1 4-2.1 2.5 0 4.5 2 4.5 4.6 0 3.5-3.2 6.8-8.5 10.5z" />
        </svg>
      );
  }
}

export function ValuePropsGrid({ id, props }: { id: string; props: ValuePropsGridProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {props.items.map((item, i) => (
          <li key={i} className="flex flex-col gap-3.5">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_11%,var(--uc-surface))] text-[var(--uc-primary)]">
              <IconMark name={item.icon} />
            </span>
            <div>
              <h3 className="font-[family-name:var(--uc-font-heading)] text-base font-extrabold text-[var(--uc-ink)]">
                {item.title}
              </h3>
              {item.description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
                  {item.description}
                </p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
