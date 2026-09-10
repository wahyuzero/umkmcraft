/**
 * Modul menu_price_list — daftar menu gaya restoran (TEMPLATE_RESEARCH §4).
 * Referensi pola: Restaurantly/Maxim menu (leader titik-titik), Wix QR menu.
 * Item dikelompokkan per kategori oleh renderer; rekomendasi ditandai chip
 * bintang + nama lebih tebal. Baris punya leader titik-titik dan sapuan warna
 * hover di perangkat pointer (desktop). RSC murni — ringan untuk menu banyak.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { formatRupiah } from "@umkmcraft/utils";
import { SectionHeader, SectionShell } from "../primitives";

export type MenuListProps = SectionProps<"menu_price_list">;

export const menuDefaults: MenuListProps = {
  section_title: "Menu Kami",
  section_subtitle: "Harga bisa berubah — tanyakan stok terbaru via WhatsApp.",
  items: [
    { name: "Menu Andalan", description: "Paling dicari pelanggan setia.", price: 25000, category: "Favorit", is_recommended: true },
    { name: "Menu Hemat", description: "Porsi pas, harga bersahabat.", price: 15000, category: "Favorit", is_recommended: false },
    { name: "Minuman Segar", description: "Dingin, menyegarkan.", price: 8000, category: "Minuman", is_recommended: false },
  ],
};

function RecommendedMark() {
  /* Bintang dalam chip kecil — tanda rekomendasi (SVG, bukan emoji) */
  return (
    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_14%,transparent)]">
      <svg viewBox="0 0 24 24" className="h-3 w-3 text-[var(--uc-primary)]" fill="currentColor" aria-hidden>
        <path d="m12 2.6 2.9 5.9 6.5.95-4.7 4.6 1.1 6.45L12 17.45 6.2 20.5l1.1-6.45L2.6 9.45l6.5-.95L12 2.6z" />
      </svg>
      <span className="sr-only">Rekomendasi</span>
    </span>
  );
}

function MenuRow({ item }: { item: MenuListProps["items"][number] }) {
  return (
    <li className="-mx-2.5 rounded-xl px-2.5 py-1.5 transition-colors duration-200 [@media(hover:hover)]:hover:bg-[color-mix(in_oklab,var(--uc-primary)_6%,transparent)]">
      <div className="flex items-baseline gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {item.is_recommended ? <RecommendedMark /> : null}
          <h4
            className={`truncate font-[family-name:var(--uc-font-heading)] text-[0.98rem] text-[var(--uc-ink)] ${
              item.is_recommended ? "font-extrabold" : "font-bold"
            }`}
          >
            {item.name}
          </h4>
        </div>
        {/* Leader titik-titik ala menu restoran — menyambung nama → harga */}
        <span aria-hidden className="mx-1 min-w-4 flex-1 border-b-2 border-dotted border-[color-mix(in_oklab,var(--uc-ink)_22%,transparent)]" />
        <span className="shrink-0 text-[0.98rem] font-extrabold tabular-nums text-[var(--uc-primary)]">
          {formatRupiah(item.price)}
        </span>
      </div>
      {item.description ? (
        <p className="mt-0.5 text-[0.85rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_62%,transparent)]">
          {item.description}
        </p>
      ) : null}
    </li>
  );
}

export function MenuPriceList({ id, props }: { id: string; props: MenuListProps }) {
  // Pertahankan urutan kemunculan kategori (stable grouping)
  const categories: string[] = [];
  const byCategory = new Map<string, MenuListProps["items"]>();
  for (const item of props.items) {
    const cat = item.category || "Menu";
    if (!byCategory.has(cat)) {
      byCategory.set(cat, []);
      categories.push(cat);
    }
    byCategory.get(cat)!.push(item);
  }

  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <div className="flex flex-col gap-7 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[color-mix(in_oklab,var(--uc-surface)_55%,var(--uc-bg))] p-5 sm:p-7">
        {categories.map((cat) => (
          <div key={cat}>
            {categories.length > 1 ? (
              <h3 className="mb-3 inline-block rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_12%,transparent)] px-3.5 py-1 text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--uc-primary)]">
                {cat}
              </h3>
            ) : null}
            <ul className="flex flex-col gap-1">
              {byCategory.get(cat)!.map((item, i) => (
                <MenuRow key={i} item={item} />
              ))}
            </ul>
          </div>
        ))}
        <p className="text-center text-[0.75rem] text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
          Mau pesan? Chat admin — link WhatsApp ada di tombol hijau di halaman ini.
        </p>
      </div>
    </SectionShell>
  );
}
