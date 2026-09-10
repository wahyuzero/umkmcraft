/**
 * Modul download_catalog_cta — unduh katalog/brosur PDF (TEMPLATE_RESEARCH §4).
 * Referensi pola: Etsy QR-menu PDF, MetropolitanHost fashion katalog digital.
 * Kartu "tiket" border dashed: ikon unduh dalam lingkaran primary, judul tebal,
 * tombol unduh + cadangan "minta via WhatsApp". RSC murni.
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

function DownloadMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
  const waHref = createWhatsAppChatLink(whatsappNumber, `Halo ${businessName}! Boleh minta katalog lengkapnya kak?`);

  return (
    <SectionShell id={id}>
      <div className="mx-auto max-w-xl rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_6%,var(--uc-bg))] p-7 text-center sm:p-9">
        <span
          aria-hidden
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--uc-primary)] text-[var(--uc-on-primary)] shadow-[0_8px_22px_-8px_color-mix(in_oklab,var(--uc-primary)_55%,transparent)]"
        >
          <DownloadMark />
        </span>
        <SectionHeader title={props.section_title} subtitle={props.description} />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {props.file_url ? (
            <a
              href={props.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl bg-[var(--uc-primary)] px-5 py-2.5 text-sm font-semibold text-[var(--uc-on-primary)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
            >
              <DownloadMark className="h-4 w-4" />
              {props.file_label}
            </a>
          ) : null}
          <a
            href={waHref}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[var(--uc-surface)] px-5 py-2.5 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,var(--uc-surface))] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
          >
            <WaIcon className="h-4 w-4" />
            Minta via WhatsApp
          </a>
        </div>
      </div>
    </SectionShell>
  );
}
