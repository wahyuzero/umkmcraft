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
      <div role="tablist" aria-label="Filter kategori produk" className="mb-6 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((c) => {
          const selected = c === active;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(c)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${
                selected
                  ? "bg-[var(--uc-primary)] text-[var(--uc-on-primary)]"
                  : "border border-[color-mix(in_oklab,var(--uc-primary)_28%,transparent)] text-[var(--uc-ink)] hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)]"
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
