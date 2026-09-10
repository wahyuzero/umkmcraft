/**
 * Modul qr_code_whatsapp — QR "scan untuk chat" (TEMPLATE_RESEARCH §4).
 * Referensi pola: Wix QR menu, Etsy restaurant QR (mitra walau bentuk beda:
 * arah sebaliknya — pelanggan di tempat scan QR → buka chat WhatsApp usaha).
 * Frame QR ala viewfinder (mark sudut primary), caption, + WaButton cadangan
 * bila kamera gagal scan. Gambar QR diupload pemilik usaha. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { SafeImage, SectionHeader, SectionShell, WaButton } from "../primitives";

export type QrCodeProps = SectionProps<"qr_code_whatsapp">;

export const qrCodeDefaults: QrCodeProps = {
  section_title: "Scan untuk Chat",
  section_subtitle: "Arahkan kamera HP ke kode ini — langsung terhubung ke WhatsApp kami.",
  qr_image_url: "",
  caption: "",
};

/* Mark sudut viewfinder — L kecil di tiap pojok frame QR */
const CORNER_MARKS = [
  "left-0 top-0 rounded-tl-lg border-l-[3px] border-t-[3px]",
  "right-0 top-0 rounded-tr-lg border-r-[3px] border-t-[3px]",
  "bottom-0 left-0 rounded-bl-lg border-b-[3px] border-l-[3px]",
  "bottom-0 right-0 rounded-br-lg border-b-[3px] border-r-[3px]",
] as const;

export function QrCodeWhatsApp({
  id,
  props,
  businessName,
  whatsappNumber = "",
  category = "",
}: {
  id: string;
  props: QrCodeProps;
  businessName: string;
  /** Di-forward registry; dipakai untuk tombol cadangan "buka chat". */
  whatsappNumber?: string;
  category?: string;
}) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <div className="mx-auto flex max-w-sm flex-col items-center gap-5 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-6 sm:p-8">
        <div className="relative rounded-xl bg-[var(--uc-on-primary)] p-3.5 shadow-[0_10px_28px_-12px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]">
          {CORNER_MARKS.map((pos) => (
            <span key={pos} aria-hidden className={`absolute h-4 w-4 border-[var(--uc-primary)] ${pos}`} />
          ))}
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
          <p className="text-center text-sm font-semibold leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
            {props.caption}
          </p>
        ) : null}
        {whatsappNumber ? (
          <WaButton
            href={createWhatsAppChatLink(whatsappNumber, `Halo ${businessName}! QR-nya gagal discan, jadi saya chat langsung kak.`)}
          >
            Buka Chat WhatsApp
          </WaButton>
        ) : null}
      </div>
    </SectionShell>
  );
}
