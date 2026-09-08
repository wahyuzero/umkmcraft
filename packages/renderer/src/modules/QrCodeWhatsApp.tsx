/**
 * Modul qr_code_whatsapp — QR "scan untuk chat" (TEMPLATE_RESEARCH §4).
 * Referensi pola: Wix QR menu, Etsy restaurant QR (mitra walau bentuk beda:
 * arah sebaliknya — pelanggan di tempat scan QR → buka chat WhatsApp usaha).
 * Gambar QR diupload pemilik usaha (mis. dari fitur QR WA Business). RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell, WaIcon } from "../primitives";

export type QrCodeProps = SectionProps<"qr_code_whatsapp">;

export const qrCodeDefaults: QrCodeProps = {
  section_title: "Scan untuk Chat",
  section_subtitle: "Arahkan kamera HP ke kode ini — langsung terhubung ke WhatsApp kami.",
  qr_image_url: "",
  caption: "",
};

export function QrCodeWhatsApp({
  id,
  props,
  businessName,
  category = "",
}: {
  id: string;
  props: QrCodeProps;
  businessName: string;
  category?: string;
}) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <div className="mx-auto flex max-w-sm flex-col items-center gap-4 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-6 sm:p-7">
        <div className="rounded-2xl bg-white p-3 shadow-[0_10px_28px_-12px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]">
          <SafeImage
            src={props.qr_image_url}
            alt={`QR WhatsApp ${businessName}`}
            label="QR WhatsApp"
            category={category}
            aspect="aspect-square"
            className="w-44 rounded-lg"
          />
        </div>
        {props.caption ? (
          <p className="text-center text-sm font-semibold text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
            {props.caption}
          </p>
        ) : null}
        <p className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_10%,var(--uc-surface))] px-3.5 py-1.5 text-xs font-bold text-[var(--uc-primary)]">
          <WaIcon className="h-3.5 w-3.5" />
          {businessName}
        </p>
      </div>
    </SectionShell>
  );
}
