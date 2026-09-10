/**
 * Modul booking_whatsapp_form — form booking → WhatsApp (TEMPLATE_RESEARCH §4).
 * Referensi pola: Restaurantly Book-a-Table, Webflow salon booking, Lovable TrimSync.
 * Wrapper RSC; form interaktif = island client/BookingForm (satu-satunya JS baru).
 * Cocok untuk barbershop, laundry antar-jemput, katering, bengkel, dll.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";
import { BookingForm } from "../client/BookingForm";

export type BookingProps = SectionProps<"booking_whatsapp_form">;

export const bookingDefaults: BookingProps = {
  section_title: "Booking Jadwal",
  section_subtitle: "Isi form singkat ini — admin konfirmasi lewat WhatsApp.",
  service_options: ["Layanan Reguler", "Layanan Premium"],
  time_slots: ["09:00", "11:00", "13:00", "15:00", "17:00"],
  button_label: "Pesan Jadwal via WhatsApp",
  prefill_note: "",
};

export function BookingWhatsAppForm({
  id,
  props,
  businessName,
  whatsappNumber,
}: {
  id: string;
  props: BookingProps;
  businessName: string;
  whatsappNumber: string;
}) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <BookingForm
        whatsappNumber={whatsappNumber}
        businessName={businessName}
        serviceOptions={props.service_options}
        timeSlots={props.time_slots}
        buttonLabel={props.button_label}
        prefillNote={props.prefill_note}
      />
    </SectionShell>
  );
}
