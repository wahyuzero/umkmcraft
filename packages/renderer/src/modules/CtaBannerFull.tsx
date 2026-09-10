/**
 * Modul cta_banner_full — band CTA penutup full-bleed (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Creative/Alpha CTA band, Leadfeeder final CTA.
 * Band penuh primary + tekstur garis diagonal tint secondary (CSS murni, opasitas
 * rendah); CTA utama = on-primary (kontras AA), sekunder = outline on-primary.
 * RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { WaIcon } from "../primitives";

export type CtaBannerProps = SectionProps<"cta_banner_full">;

export const ctaBannerDefaults: CtaBannerProps = {
  title: "Siap pesan sekarang?",
  subtitle: "Chat admin langsung — fast respon di jam operasional. Konsultasi gratis, no ribet!",
  button_label: "Chat WhatsApp Sekarang",
  prefill_message: "",
  secondary_label: "",
  secondary_url: "",
};

export function CtaBannerFull({
  id,
  props,
  businessName,
  whatsappNumber,
}: {
  id: string;
  props: CtaBannerProps;
  businessName: string;
  whatsappNumber: string;
}) {
  const waHref = createWhatsAppChatLink(whatsappNumber, props.prefill_message || `Halo ${businessName}! Saya mau order kak.`);

  return (
    <section id={id} className="uc-reveal relative scroll-mt-4 overflow-hidden bg-[var(--uc-primary)] px-5 py-14 sm:px-8 sm:py-16">
      {/* Tekstur garis diagonal tint secondary — variasi band gelap, opasitas rendah */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--uc-secondary) 16%, transparent) 0 1px, transparent 1px 16px)",
        }}
      />
      <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-5 text-center">
        <h2 className="font-[family-name:var(--uc-font-heading)] text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[var(--uc-on-primary)] sm:text-4xl">
          {props.title}
        </h2>
        {props.subtitle ? (
          <p className="max-w-md text-[1rem] font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-on-primary)_92%,transparent)]">
            {props.subtitle}
          </p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <a
            href={waHref}
            data-wa-click="cta_banner"
            className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-[var(--uc-on-primary)] px-7 py-3.5 text-base font-semibold text-[var(--uc-primary)] shadow-[0_8px_24px_-8px_color-mix(in_oklab,var(--uc-ink)_45%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_color-mix(in_oklab,var(--uc-ink)_50%,transparent)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-on-primary)]"
          >
            <WaIcon className="h-[1.15em] w-[1.15em] shrink-0 transition-transform duration-200 ease-out group-hover:scale-110" />
            {props.button_label}
          </a>
          {props.secondary_label && props.secondary_url ? (
            <a
              href={props.secondary_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-on-primary)_45%,transparent)] px-6 py-3 text-sm font-bold text-[var(--uc-on-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-on-primary)_12%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-on-primary)]"
            >
              {props.secondary_label}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
