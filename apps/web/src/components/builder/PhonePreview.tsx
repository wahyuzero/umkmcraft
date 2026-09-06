"use client";

/**
 * PhonePreview — kemasan HP dengan penguasa kalibrasi (raise: oscilloscope).
 * Merender config via registry ASLI — apa yang dilihat = yang di-publish.
 */
import { useMemo } from "react";
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

      <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
        <div className="relative overflow-hidden rounded-[2.1rem] bg-white">
          {/* Notch */}
          <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink/90" aria-hidden />
          <div className="h-[640px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {nodes ? (
              <div style={themeStyle(config.meta)} className="uc-site">
                {nodes}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-gray-400">
                Pratinjau tidak dapat dirender — periksa data section.
              </div>
            )}
          </div>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-soft">
        {selectedId ? "Section terpilih disorot di daftar kiri — edit isinya di panel kanan." : "Pilih section di kiri untuk mulai mengedit."}
      </p>
    </div>
  );
}
