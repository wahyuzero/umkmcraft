"use client";

/**
 * StickyOrderBar — island CTA pesan menempel (P1 audit UI/UX).
 * Muncul (slide-up, ease-out-expo, motion-safe) HANYA setelah hero keluar dari
 * viewport — sebelum itu CTA hero sudah di layar, bar hanya menutupi.
 * Deteksi: IntersectionObserver pada elemen <header> hero (fix hero-first di
 * registry menjamin hero adalah header pertama .uc-site); tanpa hero → bar
 * langsung tampil. Spacer setinggi bar dicadangkan di alur dokumen supaya
 * footer tidak tertutup permanen. Kontras: latar --uc-primary, teks
 * --uc-on-primary-text (turunan AA dari theme.ts). z-40: di bawah popover
 * ReportButton (z-50); lightbox memakai <dialog> top-layer (selalu teratas).
 * SSR-safe: semua akses DOM di dalam useEffect, render awal = tersembunyi.
 */
import { useEffect, useState } from "react";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { TrackedLink } from "./TrackedLink";

const DEFAULT_PREFILL = "Halo! Saya lihat website kakak, mau tanya-tanya produk.";

export function StickyOrderBar({
  whatsapp,
  label = "Pesan via WhatsApp",
}: {
  /** Nomor WhatsApp tenant (sudah divalidasi di lapis schema). */
  whatsapp: string;
  label?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.querySelector<HTMLElement>(".uc-site > header");
    if (!hero || typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver((entries) => {
      setVisible(!(entries[0]?.isIntersecting ?? true));
    });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const href = createWhatsAppChatLink(whatsapp, DEFAULT_PREFILL);

  return (
    <>
      {/* Spacer: cadangan ruang setinggi bar agar konten/footer tidak tertutup */}
      <div aria-hidden className="h-16" />
      <div
        className={`fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-[var(--uc-primary)] shadow-[0_-10px_40px_-18px_color-mix(in_oklab,var(--uc-ink)_45%,transparent)] motion-safe:transition-[transform,opacity] motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.16,1,0.3,1)] ${
          visible
            ? "translate-y-0 opacity-100"
            : "invisible pointer-events-none translate-y-full opacity-0"
        }`}
      >
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
          <TrackedLink
            href={href}
            event="wa_click"
            className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-6 text-base font-semibold whitespace-nowrap text-[var(--uc-on-primary-text)] transition-colors duration-200 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-on-primary-text)]"
          >
            {/* Glyph WhatsApp — SVG inline (lucide dilarang di renderer) */}
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 shrink-0" aria-hidden>
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
            </svg>
            <span>{label}</span>
          </TrackedLink>
        </div>
      </div>
    </>
  );
}
