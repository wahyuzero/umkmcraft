"use client";

/**
 * ThemeSwitcher — ganti preset warna kategori dalam 1 klik (ROADMAP Fase 2).
 * Swatch = pot label cat; aktif = lift + cincin amber.
 */
import { THEME_PRESETS } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";

export function ThemeSwitcher() {
  const theme = useEditor((s) => s.config.meta.theme);
  const applyPreset = useEditor((s) => s.applyPreset);

  return (
    <div role="radiogroup" aria-label="Tema warna" className="flex items-center gap-1.5 rounded-2xl border border-cutline bg-card px-2.5 py-2">
      {THEME_PRESETS.map((p) => {
        const active = theme.preset === p.id;
        return (
          <button
            key={p.id}
            role="radio"
            aria-checked={active}
            title={p.label}
            onClick={() => applyPreset(p.id)}
            className={`relative h-7 w-9 rounded-md transition-transform duration-150 ease-out hover:scale-110 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal ${active ? "scale-110 ring-2 ring-signal ring-offset-2 ring-offset-card" : ""}`}
            style={{ background: `linear-gradient(135deg, ${p.primary} 55%, ${p.secondary} 55%)` }}
          >
            {/* chip label tape: garis putus die-cut di tepian (world: label press) */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0.5 rounded-[4px] border border-dashed border-white/55"
            />
            <span className="sr-only">{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}
