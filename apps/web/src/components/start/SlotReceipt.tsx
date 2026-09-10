"use client";

/**
 * "Sticker receipt" — ringkasan slot yang sudah tertangkap, tampil sebagai
 * kartu die-cut (border putus-putus) di atas CTA final.
 */
import { MapPin, Package, Phone, Store, Tag } from "lucide-react";

interface SlotReceiptProps {
  businessName?: string;
  category?: string;
  whatsappNumber?: string;
  location?: string;
  productCount: number;
}

export function SlotReceipt({
  businessName,
  category,
  whatsappNumber,
  location,
  productCount,
}: SlotReceiptProps) {
  const rows = [
    { icon: Store, label: "Usaha", value: businessName },
    { icon: Tag, label: "Jenis", value: category },
    { icon: Phone, label: "WA", value: whatsappNumber },
    { icon: MapPin, label: "Lokasi", value: location },
    { icon: Package, label: "Produk", value: productCount > 0 ? `${productCount} produk` : undefined },
  ].filter((r) => Boolean(r.value));

  if (rows.length === 0) return null;

  return (
    <div className="uc-cutline uc-stick-in rounded-2xl bg-card p-4 shadow-plate">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-soft">Ringkasan usahamu</p>
      <dl className="mt-2.5 flex flex-col gap-1.5 border-t border-dashed border-cutline pt-2.5">
        {rows.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2.5">
            <Icon className="h-3.5 w-3.5 shrink-0 text-signal" strokeWidth={2.2} aria-hidden />
            <dt className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {label}
            </dt>
            <dd className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
