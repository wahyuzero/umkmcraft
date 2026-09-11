"use client";

/**
 * Slot progress /start — jangkar "sejauh mana aku": 3 langkah berlabel
 * dengan konektor putus-putus die-cut. Saat slot tertangkap, dot terisi
 * signal + centang (uc-stick-in) dan konektornya ikut menyala.
 */
import { Fragment } from "react";
import { Check } from "lucide-react";

const STEPS = ["Nama usaha", "Jenis usaha", "Nomor WhatsApp"] as const;

export function SlotSteps({ progress }: { progress: boolean[] }) {
  return (
    <ol aria-label="Kelengkapan data usaha" className="flex items-start gap-2">
      {STEPS.map((label, i) => {
        const done = Boolean(progress[i]);
        return (
          <Fragment key={label}>
            {i > 0 ? (
              <li
                aria-hidden
                className={`mx-1 mt-[9px] h-0 flex-1 border-t-2 border-dashed transition-colors duration-200 ${
                  progress[i - 1] ? "border-signal/50" : "border-cutline"
                }`}
              />
            ) : null}
            <li className="flex flex-col items-center gap-1.5">
              <span
                aria-hidden
                className={`grid h-5 w-5 place-items-center rounded-full transition-colors duration-200 ${
                  done ? "bg-signal text-card shadow-plate" : "border-[1.5px] border-dashed border-cutline bg-card"
                }`}
              >
                {done ? (
                  <Check className="uc-stick-in h-3.5 w-3.5" strokeWidth={3} />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-cutline" />
                )}
              </span>
              <span
                className={`text-[11px] font-semibold tracking-wide transition-colors duration-200 ${
                  done ? "text-ink" : "text-ink-soft"
                }`}
              >
                {label}
                {/* "diisi", bukan "terkumpul": langkah bisa menyala dari deteksi
                    optimistik lokal — belum tentu dikonfirmasi server. */}
                <span className="sr-only">{done ? " (diisi)" : " (belum)"}</span>
              </span>
            </li>
          </Fragment>
        );
      })}
    </ol>
  );
}
