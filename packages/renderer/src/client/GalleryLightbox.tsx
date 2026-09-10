"use client";

/**
 * GalleryLightbox — island galeri: grid thumbnail + lightbox fullscreen.
 * Native <dialog>: Escape (cancel bawaan), fokus terkelola (fokus dialog saat
 * buka, restore ke elemen pemicu saat tutup), klik backdrop menutup.
 * Transisi zoom-in mikro hanya untuk motion-safe (prefers-reduced-motion aman).
 * SSR-safe: render awal = dialog tertutup, tanpa akses window saat render.
 */
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { PlaceholderImage, SafeImage } from "../primitives";

export type GalleryLightboxItem = {
  title: string;
  image_url: string;
  caption: string;
};

export function GalleryLightbox({
  items,
  gridClassName = "grid-cols-2 sm:grid-cols-3",
  ariaLabel = "Galeri foto",
}: {
  items: GalleryLightboxItem[];
  /** Kelas kolom grid thumbnail (dikontrol modul GalleryGrid). */
  gridClassName?: string;
  ariaLabel?: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<number | null>(null);
  const [shown, setShown] = useState(false);

  const isOpen = active !== null;

  /* Buka/tutup native dialog + kunci scroll body selama lightbox terbuka */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      restoreFocusRef.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null;
      dialog.showModal();
      dialog.focus();
      setShown(false);
      const raf = requestAnimationFrame(() => setShown(true));
      document.body.style.overflow = "hidden";
      return () => {
        cancelAnimationFrame(raf);
        document.body.style.overflow = "";
      };
    }
    if (!isOpen && dialog.open) {
      dialog.close(); /* memicu onClose → restore fokus */
    }
  }, [isOpen]);

  const go = (delta: number) =>
    setActive((cur) => (cur === null ? cur : (cur + delta + items.length) % items.length));

  const handleKeyDown = (e: KeyboardEvent<HTMLDialogElement>) => {
    if (items.length < 2) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(-1);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      go(1);
    }
  };

  const handleClose = () => {
    setActive(null);
    restoreFocusRef.current?.focus();
    restoreFocusRef.current = null;
  };

  const handleBackdropClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) dialogRef.current?.close();
  };

  if (items.length === 0) return null;
  const current = active !== null ? items[active] : undefined;

  return (
    <div>
      <ul className={`grid gap-2.5 sm:gap-3 ${gridClassName}`} aria-label={ariaLabel}>
        {items.map((item, i) => (
          <li key={`${item.title}-${i}`}>
            <button
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Perbesar foto: ${item.title || `Foto ${i + 1}`}`}
              className="group block w-full cursor-zoom-in overflow-hidden rounded-2xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
            >
              <SafeImage
                src={item.image_url}
                alt={item.title || `Foto ${i + 1}`}
                label={item.title || `Foto ${i + 1}`}
                aspect="aspect-square"
                seed={i}
                className="transition-transform duration-300 ease-out group-hover:scale-105"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={handleClose}
        onClick={handleBackdropClick}
        onKeyDown={handleKeyDown}
        aria-label="Pratinjau foto galeri"
        className="m-auto w-[min(92vw,54rem)] rounded-2xl bg-[var(--uc-surface)] p-4 shadow-2xl backdrop:bg-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)] sm:p-6"
      >
        {current ? (
          <div
            className={`relative motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out ${
              shown ? "motion-safe:scale-100 motion-safe:opacity-100" : "motion-safe:scale-95 motion-safe:opacity-0"
            }`}
          >
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Tutup galeri"
              className="absolute -top-2 right-0 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_78%,transparent)] text-[var(--uc-bg)] transition-colors duration-200 hover:bg-[var(--uc-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] sm:-top-3 sm:-right-3"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" aria-hidden>
                <path d="M6 6l12 12M18 6 6 18" />
              </svg>
            </button>

            <figure className="flex flex-col items-center gap-3">
              <div className="relative flex w-full items-center justify-center">
                {current.image_url ? (
                  <img
                    src={current.image_url}
                    alt={current.title || `Foto ${(active ?? 0) + 1}`}
                    className="mx-auto max-h-[62vh] w-auto max-w-full rounded-2xl object-contain"
                    decoding="async"
                  />
                ) : (
                  <PlaceholderImage
                    label={current.title || `Foto ${(active ?? 0) + 1}`}
                    aspect="aspect-[4/3] sm:aspect-[16/9]"
                    seed={active ?? 0}
                    className="max-h-[62vh]"
                  />
                )}
                {items.length > 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => go(-1)}
                      aria-label="Foto sebelumnya"
                      className="absolute left-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_78%,transparent)] text-[var(--uc-bg)] transition-colors duration-200 hover:bg-[var(--uc-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M14.5 5.5 8 12l6.5 6.5" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => go(1)}
                      aria-label="Foto berikutnya"
                      className="absolute right-2 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_78%,transparent)] text-[var(--uc-bg)] transition-colors duration-200 hover:bg-[var(--uc-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
                      </svg>
                    </button>
                  </>
                ) : null}
              </div>
              <figcaption className="w-full text-center">
                {current.title ? (
                  <p className="font-[family-name:var(--uc-font-heading)] text-base font-bold text-[var(--uc-ink)]">
                    {current.title}
                  </p>
                ) : null}
                {current.caption ? (
                  <p className="mt-1 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
                    {current.caption}
                  </p>
                ) : null}
                {items.length > 1 ? (
                  <p className="mt-2 text-xs font-semibold tabular-nums text-[color-mix(in_oklab,var(--uc-ink)_50%,transparent)]">
                    {(active ?? 0) + 1} / {items.length}
                  </p>
                ) : null}
              </figcaption>
            </figure>
          </div>
        ) : null}
      </dialog>
    </div>
  );
}
