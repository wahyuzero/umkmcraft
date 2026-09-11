"use client";

/**
 * ThemeSwitcher — popover preset warna kategori (ROADMAP Fase 2).
 * Tombol Palette → pot-pot cat: swatch diagonal + nama + kategori.
 * Aktif = cincin signal + ikon Check; tutup via klik luar / Esc.
 */
import { useEffect, useRef, useState } from "react";
import { Check, Palette } from "lucide-react";
import { THEME_PRESETS } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";

export function ThemeSwitcher() {
  const theme = useEditor((s) => s.config.meta.theme);
  const applyPreset = useEditor((s) => s.applyPreset);
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activePreset = THEME_PRESETS.find((p) => p.id === theme.preset);

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="theme-popover"
        aria-label={`Tema warna: ${activePreset?.label ?? "default"}`}
        className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-cutline bg-card text-ink-soft transition-colors duration-150 ease-out hover:border-signal hover:text-signal focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <Palette className="h-5 w-5" strokeWidth={2} aria-hidden />
        {/* Titik warna preset aktif — pot cat sedang dipakai */}
        {activePreset ? (
          <span
            className="absolute bottom-1 right-1 h-2 w-2 rounded-full ring-1 ring-card"
            style={{ background: activePreset.primary }}
            aria-hidden
          />
        ) : null}
      </button>

      {open ? (
        <div
          id="theme-popover"
          role="radiogroup"
          aria-label="Tema warna"
          className="uc-stick-in absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-2xl border border-cutline bg-card p-2 shadow-plate"
        >
          {THEME_PRESETS.map((p) => {
            const active = theme.preset === p.id;
            return (
              <button
                key={p.id}
                role="radio"
                aria-checked={active}
                title={p.label}
                onClick={() => {
                  applyPreset(p.id);
                  setOpen(false);
                }}
                className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-1.5 text-left transition-colors duration-150 ease-out focus-visible:outline-3 focus-visible:-outline-offset-2 focus-visible:outline-signal ${
                  active ? "bg-signal-soft/50 ring-2 ring-signal" : "hover:bg-signal-soft/30"
                }`}
              >
                {/* Pot cat: swatch diagonal 2 warna + tepian die-cut */}
                <span
                  className="relative h-9 w-9 shrink-0 rounded-lg"
                  style={{ background: `linear-gradient(135deg, ${p.primary} 55%, ${p.secondary} 55%)` }}
                  aria-hidden
                >
                  <span className="pointer-events-none absolute inset-1 rounded-[5px] border border-dashed border-card/55" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-ink">
                    {p.label.split(" — ")[0] ?? p.label}
                  </span>
                  <span className="block truncate text-xs text-ink-soft">
                    {p.categories.slice(0, 3).join(" · ")}
                  </span>
                </span>
                {active ? <Check className="h-4 w-4 shrink-0 text-signal" strokeWidth={2.6} aria-hidden /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
