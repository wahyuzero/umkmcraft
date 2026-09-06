"use client";

/**
 * Inspector — panel edit label: field per tipe section.
 * Field sederhana (teks/angka/warna/toggle) + repeater untuk list
 * (produk, langkah, FAQ, tier). Simpan via store → autosave debounce.
 */
import { useEditor } from "@/lib/editor-store";
import type { SectionType } from "@umkmcraft/schema";
import { useState } from "react";

type FieldType = "text" | "textarea" | "number" | "url" | "image" | "toggle";

interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  hint?: string;
}

interface RepeaterDef {
  key: string;
  label: string;
  itemLabel: string;
  fields: FieldDef[];
  newItem: (index: number) => Record<string, unknown> | string;
}

interface TypeSpec {
  simple: FieldDef[];
  repeaters?: RepeaterDef[];
}

const F = (key: string, label: string, type: FieldType = "text", hint?: string): FieldDef => ({ key, label, type, hint });

const SPECS: Partial<Record<SectionType, TypeSpec>> = {
  hero_storefront: {
    simple: [F("badge", "Badge keunggulan", "text", "contoh: Best Seller Bandung"), F("title", "Judul utama"), F("subtitle", "Deskripsi singkat", "textarea"), F("image_url", "Foto etalase", "image")],
    repeaters: [
      { key: "badges", label: "Pill keunggulan", itemLabel: "Pill", fields: [F("", "Teks")], newItem: () => "" },
    ],
  },
  product_catalog_wa: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      {
        key: "products",
        label: "Produk",
        itemLabel: "Produk",
        fields: [F("name", "Nama produk"), F("price", "Harga", "number"), F("original_price", "Harga asli (coret)", "number"), F("description", "Deskripsi", "textarea"), F("image_url", "Foto", "image"), F("is_bestseller", "Best Seller?", "toggle")],
        newItem: () => ({ id: `prod-${Date.now().toString(36)}`, name: "Produk Baru", price: 10000, description: "", image_url: "", is_bestseller: false, category: "Umum" }),
      },
    ],
  },
  promo_banner: {
    simple: [F("message", "Pesan promo", "textarea"), F("discount_text", "Teks diskon"), F("coupon_code", "Kode kupon"), F("ends_at", "Berakhir (ISO, opsional)")],
  },
  operating_hours_map: {
    simple: [F("section_title", "Judul section"), F("address", "Alamat", "textarea"), F("gmaps_url", "Link Google Maps", "url"), F("waze_url", "Link Waze", "url"), F("delivery_note", "Catatan pengiriman")],
  },
  social_proof_reviews: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea"), F("is_sample", "Tandai sebagai contoh", "toggle")],
    repeaters: [
      { key: "reviews", label: "Ulasan", itemLabel: "Ulasan", fields: [F("name", "Nama pelanggan"), F("rating", "Rating (1-5)", "number"), F("text", "Isi ulasan", "textarea"), F("date", "Tanggal")], newItem: () => ({ name: "Pelanggan", rating: 5, text: "", source: "whatsapp", avatar_url: "", date: "" }) },
    ],
  },
  channel_marketplace: {
    simple: [F("section_title", "Judul section")],
    repeaters: [
      { key: "channels", label: "Channel", itemLabel: "Channel", fields: [F("label", "Label"), F("url", "URL", "url")], newItem: () => ({ platform: "shopee", label: "Toko Kami", url: "https://" }) },
    ],
  },
  faq_accordion: {
    simple: [F("section_title", "Judul section")],
    repeaters: [
      { key: "items", label: "Pertanyaan", itemLabel: "FAQ", fields: [F("q", "Pertanyaan"), F("a", "Jawaban", "textarea")], newItem: () => ({ q: "Pertanyaan baru?", a: "Jawabannya." }) },
    ],
  },
  contact_direct: {
    simple: [F("section_title", "Judul section"), F("address", "Alamat", "textarea"), F("phone", "Telepon"), F("whatsapp_number", "Nomor WhatsApp"), F("whatsapp_label", "Label tombol WA"), F("email", "Email"), F("gmaps_url", "Link Maps", "url"), F("prefill_message", "Pesan otomatis WA", "textarea")],
  },
  rich_text_block: {
    simple: [F("section_title", "Judul section"), F("body_markdown", "Isi (markdown)", "textarea"), F("image_url", "Foto", "image")],
  },
  gallery_grid: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "items", label: "Foto", itemLabel: "Foto", fields: [F("title", "Judul"), F("image_url", "Gambar", "image"), F("caption", "Caption")], newItem: () => ({ title: "", image_url: "", caption: "" }) },
    ],
  },
  service_pricing_table: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "tiers", label: "Paket", itemLabel: "Paket", fields: [F("name", "Nama paket"), F("price", "Harga", "number"), F("unit", "Satuan (per kg, dll)"), F("duration", "Durasi"), F("is_popular", "Paling populer?", "toggle"), F("cta_label", "Label tombol")], newItem: () => ({ id: `tier-${Date.now().toString(36)}`, name: "Paket Baru", price: 50000, unit: "", duration: "", features: [], is_popular: false, cta_label: "Pesan Paket Ini" }) },
    ],
  },
  trust_badges_strip: {
    simple: [F("section_title", "Judul section")],
  },
  step_how_to_order: {
    simple: [F("section_title", "Judul section")],
    repeaters: [
      { key: "steps", label: "Langkah", itemLabel: "Langkah", fields: [F("title", "Judul langkah"), F("description", "Penjelasan", "textarea")], newItem: (i = 0) => ({ step_number: i + 1, title: "Langkah baru", description: "" }) },
    ],
  },
};

export function Inspector() {
  const sections = useEditor((s) => s.config.sections);
  const selectedId = useEditor((s) => s.selectedId);
  const update = useEditor((s) => s.updateSectionProps);
  const section = sections.find((s) => s.id === selectedId);

  if (!section) {
    return (
      <div className="p-6">
        <div className="uc-cutline rounded-2xl bg-card p-6 text-center">
          <p className="font-display text-base font-bold text-ink">Belum ada label terpilih</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
            Pilih satu stiker section di panel kiri, lalu ubah isinya di sini.
          </p>
        </div>
      </div>
    );
  }

  const spec = SPECS[section.type];
  const props = section.props as Record<string, unknown>;

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between px-1">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em] text-ink-soft">
          Edit Label
        </h2>
        <span className="rounded-full bg-signal-soft px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-signal">
          {section.type.replaceAll("_", " ")}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {spec?.simple.map((f) => (
          <Field key={f.key} def={f} value={props[f.key]} onChange={(v) => update(section.id, f.key, v)} />
        ))}

        {spec?.repeaters?.map((r) => (
          <Repeater key={r.key} def={r} items={props[r.key] as Array<Record<string, unknown> | string> | undefined} onChange={(items) => update(section.id, r.key, items)} />
        ))}

        {!spec ? (
          <p className="rounded-xl bg-card p-4 text-sm text-ink-soft">Section ini tidak butuh pengaturan tambahan.</p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- field primitives ---------------- */

function Field({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const inputCls =
    "w-full rounded-xl border border-cutline bg-card px-3 py-2.5 text-sm text-ink placeholder:text-ink-soft/50 focus:border-signal focus:outline-none";
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-ink-soft">{def.label}</span>
      {def.type === "textarea" ? (
        <textarea
          value={String(value ?? "")}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={`${inputCls} resize-y`}
        />
      ) : def.type === "toggle" ? (
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(value)}
          onClick={() => onChange(!value)}
          className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${value ? "bg-live" : "bg-cutline"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${value ? "left-6" : "left-1"}`} />
        </button>
      ) : (
        <input
          type={def.type === "number" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(e) => onChange(def.type === "number" ? Number(e.target.value || 0) : e.target.value)}
          className={inputCls}
        />
      )}
      {def.hint ? <span className="mt-1 block text-[0.7rem] text-ink-soft/70">{def.hint}</span> : null}
    </label>
  );
}

function Repeater({
  def,
  items,
  onChange,
}: {
  def: RepeaterDef;
  items?: Array<Record<string, unknown> | string>;
  onChange: (items: Array<Record<string, unknown> | string>) => void;
}) {
  const list = items ?? [];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  function setItem(idx: number, key: string, value: unknown) {
    const next = list.map((it, i) => {
      if (i !== idx) return it;
      return key ? { ...(it as Record<string, unknown>), [key]: value } : (value as string | Record<string, unknown>);
    });
    onChange(next);
  }

  return (
    <div className="uc-cutline rounded-2xl bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-soft">{def.label}</span>
        <button
          type="button"
          onClick={() => {
            onChange([...list, def.newItem(list.length)]);
            setOpenIdx(list.length);
          }}
          className="rounded-lg bg-signal-soft px-2.5 py-1 text-[0.7rem] font-bold text-signal transition-colors hover:bg-signal hover:text-white"
        >
          + Tambah
        </button>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {list.map((item, idx) => {
          const rec = (item ?? {}) as Record<string, unknown>;
          const title = String(rec.name ?? rec.q ?? rec.label ?? rec.title ?? (typeof item === "string" && item ? item : `${def.itemLabel} ${idx + 1}`));
          const open = openIdx === idx;
          return (
            <li key={idx} className="rounded-xl border border-cutline/70 bg-paper/60">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  aria-expanded={open}
                  className="min-w-0 flex-1 truncate px-3 py-2 text-left text-sm font-medium text-ink"
                >
                  {title || `${def.itemLabel} ${idx + 1}`}
                </button>
                <button
                  type="button"
                  aria-label="Naikkan"
                  disabled={idx === 0}
                  onClick={() => {
                    const next = [...list];
                    [next[idx - 1], next[idx]] = [next[idx]!, next[idx - 1]!];
                    onChange(next);
                  }}
                  className="rounded-md px-1.5 py-1 text-xs text-ink-soft hover:text-ink disabled:opacity-30"
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Turunkan"
                  disabled={idx === list.length - 1}
                  onClick={() => {
                    const next = [...list];
                    [next[idx + 1], next[idx]] = [next[idx]!, next[idx + 1]!];
                    onChange(next);
                  }}
                  className="rounded-md px-1.5 py-1 text-xs text-ink-soft hover:text-ink disabled:opacity-30"
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label="Hapus"
                  onClick={() => onChange(list.filter((_, i) => i !== idx))}
                  className="rounded-md px-1.5 py-1 text-xs text-ink-soft hover:text-signal"
                >
                  ✕
                </button>
              </div>
              {open ? (
                <div className="flex flex-col gap-3 border-t border-cutline/60 p-3">
                  {def.fields.map((f) => {
                    // Field list sederhana (badges) punya key ""
                    const key = f.key || "";
                    const val = key ? rec[key] : item;
                    return (
                      <Field
                        key={f.label}
                        def={f}
                        value={val}
                        onChange={(v) => setItem(idx, key, v)}
                      />
                    );
                  })}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
