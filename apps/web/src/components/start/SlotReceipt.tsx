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
    { icon: Store, label: "Usaha", value: businessName, multiline: true },
    { icon: Tag, label: "Jenis", value: category, multiline: false },
    { icon: Phone, label: "WA", value: whatsappNumber, multiline: false },
    { icon: MapPin, label: "Lokasi", value: location, multiline: false },
    {
      icon: Package,
      label: "Produk",
      value: productCount > 0 ? `${productCount} produk` : undefined,
      multiline: false,
    },
  ].filter((r) => Boolean(r.value));

  if (rows.length === 0) return null;

  return (
    <div className="uc-cutline uc-stick-in rounded-2xl bg-card p-4 shadow-plate">
      <p className="font-display text-sm font-bold text-ink">Ringkasan usahamu</p>
      <dl className="mt-2.5 flex flex-col gap-1.5 border-t border-dashed border-cutline pt-2.5">
        {rows.map(({ icon: Icon, label, value, multiline }) => (
          <div key={label} className={`flex gap-2.5 ${multiline ? "items-start" : "items-center"}`}>
            <Icon
              className={`h-3.5 w-3.5 shrink-0 text-signal ${multiline ? "mt-1" : ""}`}
              strokeWidth={2.2}
              aria-hidden
            />
            <dt className="w-14 shrink-0 text-[11px] font-semibold uppercase tracking-wide text-ink-soft">
              {label}
            </dt>
            <dd className={`min-w-0 flex-1 text-sm font-medium text-ink ${multiline ? "line-clamp-2" : "truncate"}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
