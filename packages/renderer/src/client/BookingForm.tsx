"use client";

/**
 * BookingForm — island untuk booking_whatsapp_form (TEMPLATE_RESEARCH §4).
 * Referensi pola: Restaurantly Book-a-Table, Webflow/Framer barbershop booking.
 * Form ringkas (nama, tanggal, layanan, jam, catatan) → susun pesan → buka wa.me.
 * Tanpa submit ke server: pesan disusun di klien, user dikirim ke WhatsApp.
 * SSR-safe: tombol render <a> statis; state hanya menyusun href saat interaksi.
 */
import { useState } from "react";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { WaIcon } from "../primitives";

export function BookingForm({
  whatsappNumber,
  businessName,
  serviceOptions,
  timeSlots,
  buttonLabel,
  prefillNote,
}: {
  whatsappNumber: string;
  businessName: string;
  serviceOptions: string[];
  timeSlots: string[];
  buttonLabel: string;
  prefillNote: string;
}) {
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [service, setService] = useState(serviceOptions[0] ?? "");
  const [time, setTime] = useState(timeSlots[0] ?? "");
  const [note, setNote] = useState("");

  const message = [
    prefillNote || `Halo ${businessName}! 👋 Saya mau booking.`,
    "",
    `• Nama: ${name || "-"}`,
    `• Tanggal: ${date || "-"}`,
    service ? `• Layanan: ${service}` : "",
    time ? `• Jam: ${time}` : "",
    note ? `• Catatan: ${note}` : "",
  ]
    .filter((line) => line !== "")
    .join("\n");

  const href = createWhatsAppChatLink(whatsappNumber, message);
  const inputCls =
    "w-full rounded-xl border border-[color-mix(in_oklab,var(--uc-ink)_14%,transparent)] bg-[var(--uc-bg)] px-3.5 py-2.5 text-sm text-[var(--uc-ink)] focus:border-[var(--uc-primary)] focus:outline-none";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      className="flex flex-col gap-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-[color-mix(in_oklab,var(--uc-ink)_58%,transparent)]">
            Nama
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama Anda"
            required
            maxLength={60}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-[color-mix(in_oklab,var(--uc-ink)_58%,transparent)]">
            Tanggal
          </span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
            className={inputCls}
          />
        </label>
        {serviceOptions.length > 0 ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[color-mix(in_oklab,var(--uc-ink)_58%,transparent)]">
              Layanan
            </span>
            <select value={service} onChange={(e) => setService(e.target.value)} className={inputCls}>
              {serviceOptions.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {timeSlots.length > 0 ? (
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.06em] text-[color-mix(in_oklab,var(--uc-ink)_58%,transparent)]">
              Jam
            </span>
            <select value={time} onChange={(e) => setTime(e.target.value)} className={inputCls}>
              {timeSlots.map((opt, i) => (
                <option key={i} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-bold uppercase tracking-[0.06em] text-[color-mix(in_oklab,var(--uc-ink)_58%,transparent)]">
          Catatan (opsional)
        </span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Contoh: request gaya, alamat rumah, dll."
          rows={2}
          maxLength={200}
          className={`${inputCls} resize-y`}
        />
      </label>
      <button
        type="submit"
        className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--uc-primary)] px-6 py-3.5 text-sm font-semibold text-[var(--uc-on-primary)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
      >
        <WaIcon className="h-[1.15em] w-[1.15em] shrink-0" />
        {buttonLabel}
      </button>
      <p className="text-center text-[0.72rem] text-[color-mix(in_oklab,var(--uc-ink)_50%,transparent)]">
        Booking dikonfirmasi lewat chat WhatsApp oleh admin.
      </p>
    </form>
  );
}
