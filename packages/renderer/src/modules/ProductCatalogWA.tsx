"use client";

/**
 * Modul product_catalog_wa — COMPONENTS.md §2.B.
 * Filter tab kategori (island), kartu produk dengan harga coret, badge Best
 * Seller, tombol [Pesan via WA] yang mengenerate link WhatsApp prefilled.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppOrderLink } from "@umkmcraft/utils";
import { PriceTag, SafeImage, SectionHeader, SectionShell, WaButton } from "../primitives";
import { CatalogTabs } from "../client/CatalogTabs";

export type CatalogSectionProps = SectionProps<"product_catalog_wa">;

export const catalogDefaults: CatalogSectionProps = {
  section_title: "Katalog Produk",
  section_subtitle: "Klik produk favoritmu, langsung terhubung ke WhatsApp admin.",
  categories: [],
  products: [],
};

function BestSellerBadge() {
  /* Pita "Best Seller": menempel rata kiri, sedikit miring, bintang SVG — bukan emoji */
  return (
    <span className="absolute left-0 top-3 inline-flex origin-left -rotate-1 items-center gap-1 rounded-r-full bg-[var(--uc-secondary)] py-1.5 pl-3 pr-3.5 text-xs font-extrabold uppercase tracking-wide text-[var(--uc-bg)] shadow-[0_4px_14px_-4px_color-mix(in_oklab,var(--uc-secondary)_75%,transparent)]">
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
        <path d="M6 0l1.57 3.6L11.5 4 8.6 6.4 9.7 10 6 7.9 2.3 10l1.1-3.6L.5 4l3.93-.4L6 0z" />
      </svg>
      Best Seller
    </span>
  );
}

export function ProductCatalogWA({
  id,
  props,
  businessName,
  whatsappNumber,
  category = "",
}: {
  id: string;
  props: CatalogSectionProps;
  businessName: string;
  whatsappNumber: string;
  category?: string;
}) {
  const categories = props.categories.length > 0
    ? props.categories
    : [...new Set(props.products.map((p) => p.category))];
  // Tab filter hanya berarti bila ada ≥2 kategori produk berbeda — satu tab
  // "Semua" tunggal tidak menyaring apa pun; render grid langsung tanpa island
  // (nol JS client) dan tanpa risiko filter kategori kosong.
  const distinctCategories = [
    ...new Set(props.products.map((p) => p.category).filter((c) => c && c !== "Semua")),
  ];

  const renderGrid = (filter: string) => {
    const list = filter === "Semua" ? props.products : props.products.filter((p) => p.category === filter);
    if (list.length === 0) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] px-6 py-10 text-center">
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8 text-[color-mix(in_oklab,var(--uc-primary)_60%,transparent)]"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            {/* kardus terbuka — jujur: rak kategori ini masih kosong */}
            <path d="M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16V8Z" />
            <path d="M3.5 8 12 12.2 20.5 8M12 12.2v8.3" />
          </svg>
          <p className="max-w-xs text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
            Belum ada produk di kategori ini — cek kategori lain, ya!
          </p>
        </div>
      );
    }
    return (
      <ul className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
        {list.map((p, i) => (
          <li
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_1px_2px_color-mix(in_oklab,var(--uc-ink)_6%,transparent),0_12px_32px_-16px_color-mix(in_oklab,var(--uc-ink)_16%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--uc-primary)_40%,transparent)] focus-within:ring-2 focus-within:ring-[var(--uc-primary)]"
          >
            <div className="relative">
              <SafeImage src={p.image_url} alt={p.name} label={p.name} category={category} seed={i} aspect="aspect-[4/3]" className="rounded-b-none" />
              {p.is_bestseller ? <BestSellerBadge /> : null}
            </div>
            <div className="flex grow flex-col gap-2 p-3.5">
              <h3 className="font-[family-name:var(--uc-font-heading)] text-[0.95rem] font-bold leading-snug text-[var(--uc-ink)]">
                {p.name}
              </h3>
              {p.description ? (
                <p className="line-clamp-2 text-pretty text-xs leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
                  {p.description}
                </p>
              ) : null}
              <div className="mt-auto flex flex-col gap-2.5 pt-1">
                <PriceTag price={p.price} original={p.original_price} />
                <WaButton href={createWhatsAppOrderLink(whatsappNumber, p.name, p.price, businessName)} productId={p.id} full>
                  Pesan via WA
                </WaButton>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      {distinctCategories.length >= 2 ? (
        <CatalogTabs categories={categories}>{renderGrid}</CatalogTabs>
      ) : (
        renderGrid("Semua")
      )}
    </SectionShell>
  );
}
