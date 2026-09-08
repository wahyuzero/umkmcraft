/**
 * Modul cta_banner_full — band CTA penutup full-width (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Creative/Alpha CTA band, Leadfeeder final CTA.
 * Gradasi primary → secondary dari token tema; tombol WA glow. RSC murni.
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
  const waHref = createWhatsAppChatLink(whatsappNumber, props.prefill_message || `Halo ${businessName}! 👋 Saya mau order kak.`);

  return (
    <section id={id} className="px-5 py-14 sm:px-8 sm:py-16">
      <div className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[2rem] bg-[var(--uc-primary)] px-6 py-12 text-center sm:px-10">
        {/* Dekorasi lingkaran halus (geometri, bukan ornamen) */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-16 h-52 w-52 rounded-full bg-white opacity-[0.08]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 -right-14 h-64 w-64 rounded-full opacity-[0.12]"
          style={{ background: "radial-gradient(circle, var(--uc-secondary), transparent 70%)" }}
        />
        <div className="relative flex flex-col items-center gap-5">
          <h2 className="font-[family-name:var(--uc-font-heading)] text-[1.9rem] font-extrabold leading-[1.12] tracking-[-0.02em] text-[var(--uc-on-primary)] sm:text-4xl">
            {props.title}
          </h2>
          {props.subtitle ? (
            <p className="max-w-md text-[1rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-on-primary)_82%,transparent)]">
              {props.subtitle}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <a
              href={waHref}
              data-wa-click="cta_banner"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-semibold text-[var(--uc-primary)] shadow-[0_4px_16px_rgb(0_0_0/0.18)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(0_0_0/0.25)] active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <WaIcon className="h-[1.15em] w-[1.15em] shrink-0" />
              {props.button_label}
            </a>
            {props.secondary_label && props.secondary_url ? (
              <a
                href={props.secondary_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-on-primary)_45%,transparent)] px-6 py-3.5 text-sm font-bold text-[var(--uc-on-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-on-primary)_12%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {props.secondary_label}
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
