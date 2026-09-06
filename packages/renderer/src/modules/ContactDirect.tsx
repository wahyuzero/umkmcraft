/**
 * Modul contact_direct — kartu kontak langsung (alamat, telepon, email)
 * + panel aksi: tombol WhatsApp besar dengan pesan prefill dan tombol Google Maps.
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

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--uc-primary)_10%,transparent)] text-[var(--uc-primary)]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--uc-ink)_50%,transparent)]">
          {label}
        </p>
        <div className="mt-0.5 text-sm font-medium leading-relaxed text-[var(--uc-ink)]">{children}</div>
      </div>
    </div>
  );
}

const linkClass =
  "break-words underline decoration-[color-mix(in_oklab,var(--uc-primary)_35%,transparent)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--uc-primary)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]";

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
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      <div className={`grid gap-5 ${hasInfo ? "md:grid-cols-[1.15fr_0.85fr]" : ""}`}>
        {hasInfo ? (
          <div className="rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_10%,transparent)] bg-[var(--uc-surface)] p-6 shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] sm:p-7">
            <div className="space-y-5">
              {props.address ? (
                <InfoRow icon={<PinIcon />} label="Alamat">
                  <p>{props.address}</p>
                </InfoRow>
              ) : null}
              {props.phone ? (
                <InfoRow icon={<PhoneIcon />} label="Telepon">
                  <a href={`tel:${props.phone.replace(/[^+0-9]/g, "")}`} className={linkClass}>
                    {props.phone}
                  </a>
                </InfoRow>
              ) : null}
              {props.email ? (
                <InfoRow icon={<MailIcon />} label="Email">
                  <a href={`mailto:${props.email}`} className={linkClass}>
                    {props.email}
                  </a>
                </InfoRow>
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex flex-col rounded-2xl bg-[color-mix(in_oklab,var(--uc-primary)_10%,var(--uc-surface))] p-6 sm:p-7">
          <h3 className="font-[family-name:var(--uc-font-heading)] text-lg font-extrabold text-[var(--uc-ink)]">
            Butuh jawaban cepat?
          </h3>
          <p className="mt-1.5 grow text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
            Chat langsung tim {businessName} — biasanya dibalas cepat di jam kerja.
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
                className="inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[var(--uc-surface)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
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
