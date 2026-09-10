"use client";

/**
 * BookingForm — island untuk booking_whatsapp_form (TEMPLATE_RESEARCH §4).
 * Referensi pola: Restaurantly Book-a-Table, Webflow/Framer barbershop booking.
 * Form ringkas (nama, tanggal, layanan, jam, catatan) → susun pesan → buka wa.me.
 * Layanan & jam = chip radio (keyboard-accessible, input sr-only + peer).
 * Tanpa submit ke server: pesan disusun di klien, user dikirim ke WhatsApp.
 * SSR-safe: tombol render <a> statis; state hanya menyusun href saat interaksi.
 */
import { useState } from "react";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { WaIcon } from "../primitives";

const LABEL_CLS = "text-sm font-semibold text-[var(--uc-ink)]";

const inputCls =
  "min-h-[44px] w-full rounded-xl border border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] bg-[var(--uc-bg)] px-3.5 py-2.5 text-sm text-[var(--uc-ink)] transition-colors duration-150 placeholder:text-[color-mix(in_oklab,var(--uc-ink)_40%,transparent)] focus:border-[var(--uc-primary)] focus:outline-none focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]";

function OptionChips({
  legend,
  name,
  options,
  value,
  onChange,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (next: string) => void;
}) {
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className={LABEL_CLS}>{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className="cursor-pointer">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              className="peer sr-only"
            />
            <span className="inline-flex min-h-[44px] items-center rounded-xl border border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] bg-[var(--uc-bg)] px-4 text-sm font-semibold text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)] transition-colors duration-150 peer-checked:border-[var(--uc-primary)] peer-checked:bg-[color-mix(in_oklab,var(--uc-primary)_9%,var(--uc-bg))] peer-checked:text-[var(--uc-primary)] peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--uc-primary)]">
              {opt}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

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
    prefillNote || `Halo ${businessName}! Saya mau booking.`,
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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        window.open(href, "_blank", "noopener,noreferrer");
      }}
      className="flex flex-col gap-5"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5">
          <span className={LABEL_CLS}>Nama</span>
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
          <span className={LABEL_CLS}>Tanggal</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            min={minDate}
            required
            className={inputCls}
          />
        </label>
      </div>
      {serviceOptions.length > 0 ? (
        <OptionChips
          legend="Layanan"
          name="layanan-booking"
          options={serviceOptions}
          value={service}
          onChange={setService}
        />
      ) : null}
      {timeSlots.length > 0 ? (
        <OptionChips
          legend="Jam"
          name="jam-booking"
          options={timeSlots}
          value={time}
          onChange={setTime}
        />
      ) : null}
      <label className="flex flex-col gap-1.5">
        <span className={LABEL_CLS}>Catatan (opsional)</span>
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
        className="group inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-[var(--uc-primary)] px-6 py-3.5 text-base font-semibold text-[var(--uc-on-primary)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] active:translate-y-0 active:scale-[0.99] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
      >
        <WaIcon className="h-[1.15em] w-[1.15em] shrink-0 transition-transform duration-200 ease-out group-hover:scale-110" />
        {buttonLabel}
      </button>
      <p className="text-center text-[0.72rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
        Pesan otomatis tersusun di WhatsApp — kak tinggal tekan kirim, admin konfirmasi jadwalnya.
      </p>
    </form>
  );
}
