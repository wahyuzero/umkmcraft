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
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--uc-secondary)] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-white shadow-sm">
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

  const renderGrid = (filter: string) => {
    const list = filter === "Semua" ? props.products : props.products.filter((p) => p.category === filter);
    if (list.length === 0) {
      return (
        <p className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] p-8 text-center text-sm text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
          Belum ada produk di kategori ini.
        </p>
      );
    }
    return (
      <ul className="grid grid-cols-2 gap-3.5 sm:gap-5 lg:grid-cols-3">
        {list.map((p, i) => (
          <li
            key={p.id}
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--uc-primary)_40%,transparent)]"
          >
            <div className="relative">
              <SafeImage src={p.image_url} alt={p.name} label={p.name} category={category} seed={i} aspect="aspect-[4/3]" className="rounded-b-none" />
              {p.is_bestseller ? <span className="absolute left-2.5 top-2.5"><BestSellerBadge /></span> : null}
            </div>
            <div className="flex grow flex-col gap-2 p-3.5">
              <h3 className="font-[family-name:var(--uc-font-heading)] text-[0.92rem] font-bold leading-snug text-[var(--uc-ink)]">
                {p.name}
              </h3>
              {p.description ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
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
      <CatalogTabs categories={categories}>{renderGrid}</CatalogTabs>
    </SectionShell>
  );
}
