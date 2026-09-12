"use client";

/**
 * TemplateGallery — satu-satunya komponen stateful di alur galeri template.
 * Filter chip "Semua" + kategori unik (dari cards, bukan daftar manual —
 * katalog baru otomatis ikut muncul), grid kartu TANPA thumbnail gambar:
 * identitas tema digambar sebagai swatch warna + "Aa" (keputusan planner
 * riset 04 — anti gallery-paralysis, kartu ringan).
 *
 * Kartu meminjam pola kartu modul landing (border dashed cutline, shadow
 * plate, hover -translate-y-1 ≤200ms ease-out). Dua aksi per kartu:
 * "Pratinjau" (link ke /template/[id], sekunder dashed) dan
 * "Pakai Template Ini" (UseTemplateButton, CTA utama bg-signal).
 */
import { useMemo, useState } from "react";
import Link from "next/link";
import UseTemplateButton from "./UseTemplateButton";

/** Kartu serializable yang diproyeksikan server dari TemplateDefinition. */
export interface TemplateCard {
  id: string;
  category: string;
  label: string;
  description: string;
  /** Nama usaha demo (config.meta.business_name) — judul kartu. */
  name: string;
  primary: string;
  background: string;
}

/** "kuliner" → "Kuliner" — kategori datang lowercase dari katalog. */
function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const CHIP_BASE =
  "flex min-h-[44px] items-center rounded-full border px-4 py-2 text-[13px] font-medium transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal";
const CHIP_INACTIVE = `${CHIP_BASE} border-ink/15 bg-card text-ink hover:-translate-y-0.5 hover:border-signal/60 hover:shadow-plate active:translate-y-0`;
const CHIP_ACTIVE = `${CHIP_BASE} border-ink bg-ink text-paper`;

export default function TemplateGallery({ cards }: { cards: TemplateCard[] }) {
  const [active, setActive] = useState("semua");

  // Kategori unik mengikuti urutan katalog — "Semua" selalu pertama.
  const categories = useMemo(() => [...new Set(cards.map((c) => c.category))], [cards]);
  const shown = active === "semua" ? cards : cards.filter((c) => c.category === active);

  return (
    <div>
      {/* Filter kategori — pola chip saran /start: pill 44px, ring signal */}
      <div role="group" aria-label="Filter kategori template" className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setActive("semua")} aria-pressed={active === "semua"} className={active === "semua" ? CHIP_ACTIVE : CHIP_INACTIVE}>
          Semua
        </button>
        {categories.map((c) => (
          <button key={c} type="button" onClick={() => setActive(c)} aria-pressed={active === c} className={active === c ? CHIP_ACTIVE : CHIP_INACTIVE}>
            {capitalize(c)}
          </button>
        ))}
      </div>

      <h2 className="sr-only">Daftar template</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map((card) => (
          <article
            key={card.id}
            className="flex flex-col rounded-2xl border-[1.5px] border-dashed border-cutline bg-card p-5 shadow-plate transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-signal/50 hover:shadow-[0_16px_36px_-14px_rgb(35_28_16/0.28)]"
          >
            {/* Swatch tema — pengganti thumbnail: latar tema kartu + "Aa"
                warna primary + pill primary. Murni dekoratif (aria-hidden). */}
            <div
              aria-hidden
              className="flex h-20 items-center justify-between rounded-xl border-[1.5px] border-dashed border-cutline px-4"
              style={{ backgroundColor: card.background }}
            >
              <span className="font-display text-[2.5rem] font-extrabold leading-none tracking-tight" style={{ color: card.primary }}>
                Aa
              </span>
              <span className="h-5 w-12 rounded-full" style={{ backgroundColor: card.primary }} />
            </div>

            <div className="mt-4 flex items-start justify-between gap-3">
              <h3 className="text-balance font-display text-lg font-bold leading-snug text-ink">{card.name}</h3>
              <span className="shrink-0 rounded-full bg-paper-deep px-2.5 py-1 text-[0.65rem] font-bold text-ink-soft">
                {capitalize(card.category)}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink-soft">{card.description}</p>

            <div className="mt-auto flex flex-col gap-2.5 pt-4 sm:flex-row">
              <Link
                href={`/template/${card.id}`}
                aria-label={`Pratinjau ${card.label} — contoh ${card.name}`}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-xl border-[1.5px] border-dashed border-cutline bg-card px-4 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/50 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Pratinjau
              </Link>
              <UseTemplateButton templateId={card.id} className="flex-1" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
