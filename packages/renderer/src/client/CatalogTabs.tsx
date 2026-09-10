"use client";

/**
 * CatalogTabs — island filter kategori katalog.
 * Client-side penuh: data produk sudah dirender server sebagai children per tab;
 * komponen ini hanya menyaring tampilan via state — tanpa fetch.
 */
import { useMemo, useState, type ReactNode } from "react";

export function CatalogTabs({
  categories,
  children,
}: {
  categories: string[];
  /** Map kategori → daftar (productId, node). Kategori "Semua" otomatis. */
  children: (filter: string) => ReactNode;
}) {
  const tabs = useMemo(() => ["Semua", ...categories.filter((c) => c && c !== "Semua")], [categories]);
  const [active, setActive] = useState("Semua");

  return (
    <div>
      {/* Pil tab: scroll horizontal di mobile dengan tepi memudar (mask), tanpa scrollbar */}
      <div
        role="tablist"
        aria-label="Filter kategori produk"
        className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [mask-image:linear-gradient(to_right,transparent,black_14px,black_calc(100%-14px),transparent)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:[mask-image:none]"
      >
        {tabs.map((c) => {
          const selected = c === active;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(c)}
              className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-4 py-2 text-sm font-semibold transition-[background-color,border-color,color,box-shadow] duration-200 ease-out focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${
                selected
                  ? "border-transparent bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)]"
                  : "border-[color-mix(in_oklab,var(--uc-primary)_28%,transparent)] bg-[var(--uc-surface)] text-[var(--uc-ink)] hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,var(--uc-surface))]"
              }`}
            >
              {c}
            </button>
          );
        })}
      </div>
      <div role="tabpanel">{children(active)}</div>
    </div>
  );
}
