/**
 * Modul contact_direct — kartu kontak langsung (alamat, telepon, email):
 * daftar baris bersih dalam satu .uc-card, seluruh baris jadi tautan saat
 * applicable (tel:/mailto:/maps) dengan hover tint, + panel aksi tombol
 * WhatsApp besar dengan pesan prefill dan tombol Google Maps.
 */
import type { ReactNode } from "react";
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { SectionHeader, SectionShell, WaButton } from "../primitives";

export type ContactDirectProps = SectionProps<"contact_direct">;

export const contactDefaults: ContactDirectProps = {
  section_title: "Hubungi Kami",
  address: "",
  phone: "",
  whatsapp_label: "Chat Admin",
  email: "",
  gmaps_url: "",
  prefill_message: "",
};

function PinIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21.5S5 15.8 5 10.3a7 7 0 1 1 14 0c0 5.5-7 11.2-7 11.2Z" />
      <circle cx="12" cy="10.3" r="2.6" />
    </svg>
  );
}

function PhoneIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.85 21 3 13.15 3 3.5c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.75-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function MailIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="5" width="18" height="14" rx="2.2" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Baris kontak — ikon lingkaran + label kecil + nilai semibold;      */
/* seluruh baris adalah tautan saat ada href (target sentuh ≥44px)    */
/* ---------------------------------------------------------------- */

const ROW_CLASS =
  "flex min-h-[44px] items-center gap-3.5 rounded-xl px-3 py-3 text-left transition-colors duration-150";

const ROW_LINK_CLASS = `${ROW_CLASS} w-full hover:bg-[color-mix(in_oklab,var(--uc-primary)_6%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]`;

function ContactRow({
  icon,
  label,
  href,
  children,
}: {
  icon: ReactNode;
  label: string;
  href?: string;
  children: ReactNode;
}) {
  const content = (
    <>
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_12%,transparent)] text-[var(--uc-primary)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-extrabold uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-sm font-semibold leading-snug text-[var(--uc-ink)]">
          {children}
        </span>
      </span>
    </>
  );

  if (href) {
    const external = href.startsWith("http");
    return (
      <li>
        <a
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          className={ROW_LINK_CLASS}
        >
          {content}
        </a>
      </li>
    );
  }
  return <li className={ROW_CLASS}>{content}</li>;
}

export function ContactDirect({
  id,
  props,
  businessName,
}: {
  id: string;
  props: ContactDirectProps;
  businessName: string;
}) {
  const hasInfo = Boolean(props.address || props.phone || props.email);
  const waNumber = props.whatsapp_number ?? "";
  const prefill =
    props.prefill_message || `Halo ${businessName}! Saya mau bertanya soal produk kak.`;

  return (
    <SectionShell id={id} tone="wash">
      <SectionHeader title={props.section_title} />
      <div className={`grid gap-5 ${hasInfo ? "md:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        {hasInfo ? (
          <ul className="uc-card space-y-1 p-2 sm:p-3">
            {props.address ? (
              <ContactRow
                icon={<PinIcon />}
                label="Alamat"
                href={props.gmaps_url || undefined}
              >
                {props.address}
              </ContactRow>
            ) : null}
            {props.phone ? (
              <ContactRow icon={<PhoneIcon />} label="Telepon" href={`tel:${props.phone.replace(/[^+0-9]/g, "")}`}>
                {props.phone}
              </ContactRow>
            ) : null}
            {props.email ? (
              <ContactRow icon={<MailIcon />} label="Email" href={`mailto:${props.email}`}>
                {props.email}
              </ContactRow>
            ) : null}
          </ul>
        ) : null}

        <div className="flex flex-col rounded-2xl bg-[color-mix(in_oklab,var(--uc-primary)_10%,var(--uc-surface))] p-6 sm:p-7">
          <h3 className="font-[family-name:var(--uc-font-heading)] text-lg font-extrabold text-[var(--uc-ink)]">
            Butuh jawaban cepat?
          </h3>
          <p className="mt-1.5 grow text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
            Chat aja langsung admin {businessName} — biasanya dibalas cepat di jam kerja, kak.
          </p>
          <div className="mt-5 flex flex-col gap-3">
            {waNumber ? (
              <WaButton size="lg" full href={createWhatsAppChatLink(waNumber, prefill)}>
                {props.whatsapp_label}
              </WaButton>
            ) : null}
            {props.gmaps_url ? (
              <a
                href={props.gmaps_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[var(--uc-surface)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
              >
                <PinIcon className="h-4 w-4" />
                Buka di Google Maps
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
