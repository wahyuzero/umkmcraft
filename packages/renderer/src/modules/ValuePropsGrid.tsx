/**
 * Modul value_props_grid — grid keunggulan "Kenapa Pilih Kami" (TEMPLATE_RESEARCH §4).
 * Referensi pola: Arsha services, Heroic Features, Leadfeeder why-us section.
 * Ikon = mark SVG geometris datar (fill currentColor), BUKAN emoji/logo merek.
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

function IconMark({ name }: { name: IconName }) {
  const cls = "h-6 w-6";
  switch (name) {
    case "star":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45L2.6 9.45l6.5-.95L12 2.6z" />
        </svg>
      );
    case "truck":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M2.5 6.8c0-.72.58-1.3 1.3-1.3h9.4c.72 0 1.3.58 1.3 1.3v8.7H2.5V6.8z" />
          <path d="M15.5 9h2.9c.5 0 .97.24 1.26.65l1.65 2.3c.12.19.19.42.19.65v2.9h-6V9z" />
          <circle cx="6.6" cy="17.1" r="1.9" />
          <circle cx="17" cy="17.1" r="1.9" />
        </svg>
      );
    case "shield":
      return (
        <svg viewBox="0 0 24 24" className={cls} aria-hidden>
          <path d="M12 2.8 19.5 5.6v5.5c0 4.8-3.2 8.7-7.5 10-4.3-1.3-7.5-5.2-7.5-10V5.6L12 2.8z" fill="currentColor" />
          <path d="m8.8 12 2.3 2.3 4.1-4.5" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="8.8" />
          <path d="M12 7.5V12l3.2 1.9" />
        </svg>
      );
    case "chat":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 3C6.9 3 2.8 6.6 2.8 11c0 2.2 1 4.2 2.7 5.6-.1 1-.5 2.2-1.4 3.2 1.7-.2 3.1-.8 4.1-1.5 1.2.4 2.5.7 3.8.7 5.1 0 9.2-3.6 9.2-8S17.1 3 12 3z" />
        </svg>
      );
    case "wallet":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M4 6.5h14.2c.7 0 1.3.6 1.3 1.3v.7H6.2a1 1 0 0 0 0 2h14.3v6.7c0 .72-.58 1.3-1.3 1.3H4c-.72 0-1.3-.58-1.3-1.3V7.8c0-.72.58-1.3 1.3-1.3z" />
          <circle cx="16.4" cy="14" r="1.5" fill="#ffffff" />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M19.5 3.5c-8 .2-13 3.6-13.4 9.6-.1 1.9.3 3.6 1 4.9C9 15.9 12 13.5 16 12c-3.6 2.3-6.3 4.9-7.6 8 .9.3 1.9.5 3 .5 6 0 8.6-5.5 8.1-17z" />
        </svg>
      );
    case "flame":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 2.5s1 2.4 1 4.4c0 1.5-1 2.6-2.2 2.6C9.5 9.5 9 8.5 9 7.2c-2.5 1.9-4 4.5-4 7.1 0 3.9 3.1 7.2 7 7.2s7-3.1 7-7.2c0-4.9-4-8.8-7-11.8z" />
        </svg>
      );
    case "tool":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M21.3 6.4a5.4 5.4 0 0 1-7.3 6.5L7.2 19.7a2 2 0 0 1-2.9-2.9l6.8-6.8a5.4 5.4 0 0 1 6.5-7.3L14.7 5.6l.7 3 3 .7 2.9-2.9z" />
        </svg>
      );
    case "heart":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="currentColor" aria-hidden>
          <path d="M12 20.8C6.6 17 3 13.6 3 9.9 3 7.2 5.1 5 7.8 5c1.6 0 3.1.8 4.2 2.2C13.1 5.8 14.6 5 16.2 5 18.9 5 21 7.2 21 9.9c0 3.7-3.6 7.1-9 10.9z" />
        </svg>
      );
  }
}

export function ValuePropsGrid({ id, props }: { id: string; props: ValuePropsGridProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {props.items.map((item, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-5"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_12%,var(--uc-surface))] text-[var(--uc-primary)]">
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
