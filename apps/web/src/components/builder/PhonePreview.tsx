"use client";

/**
 * PhonePreview — kemasan HP dengan penguasa kalibrasi (raise: oscilloscope).
 * Merender config via registry ASLI — apa yang dilihat = yang di-publish.
 * Chassis: frame tinta, notch, hint tombol samping, bayangan berdiri di kertas.
 */
import { useEffect, useMemo, useState } from "react";
import { renderSections, themeStyle } from "@umkmcraft/renderer";
import { useEditor } from "@/lib/editor-store";

export function PhonePreview() {
  const config = useEditor((s) => s.config);
  const selectedId = useEditor((s) => s.selectedId);

  const nodes = useMemo(() => {
    try {
      return renderSections(config.meta, config.sections);
    } catch {
      return null;
    }
  }, [config]);

  // Satu frame untuk skeleton "kemasan disusun" — pulse motion-safe.
  const [assembled, setAssembled] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setAssembled(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full max-w-[400px]">
      {/* Penguasa kalibrasi */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className="uc-ruler h-[5px] flex-1" aria-hidden />
        <span className="font-display text-[0.65rem] font-bold tabular-nums uppercase tracking-wider text-ink-soft">
          Pratinjau 390px
        </span>
        <div className="uc-ruler h-[5px] flex-1" aria-hidden />
      </div>

      <div className="relative">
        {/* Hint tombol samping kemasan */}
        <div className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l-full bg-ink/60" aria-hidden />
        <div className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l-full bg-ink/60" aria-hidden />
        <div className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r-full bg-ink/60" aria-hidden />

        <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
          <div className="relative overflow-hidden rounded-[2.1rem] bg-card">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink/90" aria-hidden />
            <div className="h-[min(640px,72dvh)] overflow-y-auto [scrollbar-width:none] lg:h-[640px] [&::-webkit-scrollbar]:hidden">
              {!assembled ? (
                /* Skeleton kemasan — blok pulse motion-safe */
                <div className="motion-safe:animate-pulse space-y-4 p-5 pt-12" aria-hidden>
                  <div className="h-24 rounded-2xl bg-paper-deep" />
                  <div className="h-4 w-2/3 rounded-full bg-paper-deep" />
                  <div className="h-4 w-1/2 rounded-full bg-paper-deep" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                  </div>
                  <div className="h-11 rounded-full bg-paper-deep" />
                </div>
              ) : nodes ? (
                <div style={themeStyle(config.meta)} className="uc-site">
                  {nodes}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm text-ink-soft">
                  Pratinjau tidak dapat dirender — periksa data section.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kemasan berdiri di kertas — bayangan elips (paper-deep backdrop stand) */}
        <div
          className="mx-auto mt-1 h-4 w-[82%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgb(35_28_16/0.28),transparent_68%)]"
          aria-hidden
        />
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
        <span className="hidden lg:inline">
          {selectedId
            ? "Section terpilih disorot di daftar kiri — edit isinya di panel kanan."
            : "Pilih section di kiri untuk mulai mengedit."}
        </span>
        <span className="lg:hidden">
          {selectedId
            ? "Buka tab Atur untuk mengisi section yang dipilih."
            : "Buka tab Susun untuk memilih section, kak."}
        </span>
      </p>
    </div>
  );
}
