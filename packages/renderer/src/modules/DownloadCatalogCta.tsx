/**
 * Modul download_catalog_cta — unduh katalog/brosur PDF (TEMPLATE_RESEARCH §4).
 * Referensi pola: Etsy QR-menu PDF, MetropolitanHost fashion katalog digital.
 * Kartu tengah: ikon dokumen + tombol unduh + fallback "minta via WhatsApp".
 * RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { SectionHeader, SectionShell, WaIcon } from "../primitives";

export type DownloadCtaProps = SectionProps<"download_catalog_cta">;

export const downloadCtaDefaults: DownloadCtaProps = {
  section_title: "Katalog Lengkap",
  description: "Lihat seluruh koleksi + daftar harga dalam satu file PDF.",
  file_url: "",
  file_label: "Unduh Katalog (PDF)",
};

function DocumentMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path
        d="M6 2.8h8.2L19 7.6V21H6V2.8z"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <path d="M14.2 2.8 19 7.6h-4.8V2.8z" fill="currentColor" opacity="0.35" />
      <path d="M8.8 11h6.4M8.8 14h6.4M8.8 17h3.6" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

function DownloadMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 19.5h15" />
    </svg>
  );
}

export function DownloadCatalogCta({
  id,
  props,
  businessName,
  whatsappNumber,
}: {
  id: string;
  props: DownloadCtaProps;
  businessName: string;
  whatsappNumber: string;
}) {
  const waHref = createWhatsAppChatLink(whatsappNumber, `Halo ${businessName}! 👋 Boleh minta katalog lengkapnya kak?`);

  return (
    <SectionShell id={id}>
      <div className="mx-auto max-w-xl rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_6%,var(--uc-bg))] p-7 text-center sm:p-9">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_oklab,var(--uc-primary)_12%,var(--uc-surface))] text-[var(--uc-primary)]">
          <DocumentMark />
        </span>
        <SectionHeader title={props.section_title} subtitle={props.description} />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {props.file_url ? (
            <a
              href={props.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--uc-primary)] px-5 py-3 text-sm font-semibold text-[var(--uc-on-primary)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
            >
              <DownloadMark />
              {props.file_label}
            </a>
          ) : null}
          <a
            href={waHref}
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
          >
            <WaIcon className="h-4 w-4" />
            Minta via WhatsApp
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
