"use client";

/**
 * "Sticker receipt" — ringkasan slot yang sudah tertangkap, tampil sebagai
 * kartu die-cut (border putus-putus) di atas CTA final.
 * Setiap baris yang terisi BISA diketuk untuk diedit inline (P0: satu-satunya
 * jalan keluar kalau angka/nama yang diekstrak salah) — Simpan/Batal per baris.
 */
import { useEffect, useRef, useState } from "react";
import { Clock, MapPin, Package, Pencil, Phone, Store, Tag, type LucideIcon } from "lucide-react";

export type SlotKey = "businessName" | "category" | "whatsappNumber" | "location" | "hours" | "products";

export interface ProductEntry {
  name: string;
  price?: number;
}

interface SlotReceiptProps {
  businessName?: string;
  category?: string;
  whatsappNumber?: string;
  location?: string;
  hours?: string;
  products: ProductEntry[];
  /** Dipanggil saat baris disimpan. Nilai mentah — normalisasi milik pemilik state.
   *  Balas string pesan error bila nilai DITOLAK: baris tetap terbuka dan pesan
   *  ditampilkan inline (dulu ditolaknya senyap, user tidak tahu kenapa). */
  onEdit?: (key: SlotKey, value: string) => string | undefined;
}

/** Tampilan saja: "6281234567890" → "+62 812-3456-7890". Nilai asli tetap di state. */
function formatWaDisplay(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const rest = digits.startsWith("62") ? digits.slice(2) : digits;
  if (rest.length <= 3) return `+62 ${rest}`.trim();
  const tail = rest.slice(3);
  const groups = tail.match(/.{1,4}/g) ?? [tail];
  return `+62 ${[rest.slice(0, 3), ...groups].join("-")}`;
}

/** Serialisasi produk jadi satu baris teks untuk diedit: "nama harga; nama harga". */
function serializeProducts(products: ProductEntry[]): string {
  return products.map((p) => `${p.name}${p.price ? ` ${p.price}` : ""}`).join("; ");
}

/** Label Indonesia untuk kategori yang dikenal — nilai mentah dari ekstraksi
 *  ("coffee", "bengkel/jasa") jangan ditampilkan apa adanya di Ringkasan.
 *  Nilai asli tetap dipakai untuk edit; hanya tampilan yang diterjemahkan. */
const CATEGORY_LABELS: Array<[pattern: string, label: string]> = [
  ["kuliner", "Kuliner"],
  ["coffee", "Kedai Minuman"],
  ["barbershop", "Barbershop"],
  ["laundry", "Laundry"],
  ["fashion", "Fashion"],
  ["bengkel", "Bengkel/Jasa"],
  ["lainnya", "Lainnya"],
];

function categoryLabel(raw: string): string {
  const key = raw.trim().toLowerCase();
  for (const [pattern, label] of CATEGORY_LABELS) {
    if (key.includes(pattern)) return label;
  }
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

interface Row {
  key: SlotKey;
  icon: LucideIcon;
  label: string;
  value: string;
  editValue: string;
  multiline?: boolean;
  /** Nilai multi-kata yang SEDANG DIVERIFIKASI (jam buka, lokasi) — boleh
   *  wrap, jangan truncate: nilai terpotong ("…3 sore") tak bisa dicek. */
  wrap?: boolean;
  hint?: string;
}

export function SlotReceipt({
  businessName,
  category,
  whatsappNumber,
  location,
  hours,
  products,
  onEdit,
}: SlotReceiptProps) {
  const [editing, setEditing] = useState<SlotKey | null>(null);
  const [draft, setDraft] = useState("");
  const [rowError, setRowError] = useState<string | null>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) editInputRef.current?.select();
  }, [editing]);

  const rows: Row[] = [];
  if (businessName) {
    rows.push({
      key: "businessName",
      icon: Store,
      label: "Usaha",
      value: businessName,
      editValue: businessName,
      multiline: true,
    });
  }
  if (category) {
    rows.push({ key: "category", icon: Tag, label: "Jenis", value: categoryLabel(category), editValue: category });
  }
  if (whatsappNumber) {
    rows.push({
      key: "whatsappNumber",
      icon: Phone,
      label: "WA",
      value: formatWaDisplay(whatsappNumber),
      editValue: whatsappNumber,
      hint: "Contoh: 0812-3456-7890",
    });
  }
  if (location) {
    rows.push({ key: "location", icon: MapPin, label: "Lokasi", value: location, editValue: location, wrap: true });
  }
  if (hours) {
    rows.push({
      key: "hours",
      icon: Clock,
      label: "Jam",
      value: hours,
      editValue: hours,
      wrap: true,
      hint: "Contoh: tiap hari 7 pagi sampai 3 sore",
    });
  }
  if (products.length > 0) {
    rows.push({
      key: "products",
      icon: Package,
      label: "Produk",
      value: `${products.length} produk`,
      editValue: serializeProducts(products),
      hint: "Contoh: Sambal bawang 15000; Sambal matah 18000",
    });
  }

  if (rows.length === 0) return null;

  function beginEdit(row: Row) {
    setEditing(row.key);
    setDraft(row.editValue);
    setRowError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft("");
    setRowError(null);
  }

  function saveEdit() {
    if (!editing) return;
    // Validasi milik pemilik state (page): balasan string = nilai ditolak,
    // baris tetap terbuka supaya pesannya kelihatan langsung di inputnya.
    const err = onEdit?.(editing, draft.trim());
    if (err) {
      setRowError(err);
      return;
    }
    cancelEdit();
  }

  return (
    <div className="uc-cutline uc-stick-in rounded-2xl bg-card p-4 shadow-plate">
      <p className="font-display text-sm font-bold text-ink">Ringkasan usahamu</p>
      <ul className="mt-1.5 flex flex-col border-t border-dashed border-cutline">
        {rows.map((row) => {
          const Icon = row.icon;
          const isEditing = editing === row.key;
          return (
            <li key={row.key} className="py-0.5">
              {isEditing ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveEdit();
                  }}
                  className="flex flex-col gap-2 py-1"
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-signal" strokeWidth={2.2} aria-hidden />
                    <span className="text-[11px] font-semibold text-ink-soft">
                      Perbaiki {row.label.toLowerCase()}
                    </span>
                  </div>
                  <input
                    ref={editInputRef}
                    type="text"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") cancelEdit();
                    }}
                    placeholder={row.hint}
                    aria-label={`Perbaiki ${row.label.toLowerCase()}`}
                    aria-invalid={rowError ? true : undefined}
                    autoComplete="off"
                    className="min-h-[44px] w-full rounded-xl border-[1.5px] border-dashed border-signal/50 bg-paper px-3 py-2.5 text-sm font-medium text-ink outline-none placeholder:text-ink-soft/70 focus:border-signal"
                  />
                  {rowError ? (
                    <p role="alert" className="text-[11px] font-medium text-signal">
                      {rowError}
                    </p>
                  ) : (
                    <p className="text-[11px] text-ink-soft">{row.hint}</p>
                  )}
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="min-h-[44px] flex-1 rounded-xl bg-signal px-4 text-sm font-semibold text-card transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="min-h-[44px] rounded-xl border border-cutline bg-card px-4 text-sm font-semibold text-ink transition-colors duration-150 hover:border-signal/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => beginEdit(row)}
                  className={`flex min-h-[44px] w-full gap-2.5 rounded-lg px-1 py-2 text-left transition-colors duration-150 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
                    row.multiline ? "items-start" : "items-center"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 text-signal ${row.multiline ? "mt-1" : ""}`}
                    strokeWidth={2.2}
                    aria-hidden
                  />
                  <span className={`w-14 shrink-0 text-[11px] font-semibold text-ink-soft ${row.multiline ? "mt-1" : ""}`}>
                    {row.label}
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-sm font-medium text-ink ${
                      row.multiline ? "line-clamp-2" : row.wrap ? "whitespace-normal break-words" : "truncate"
                    }`}
                  >
                    {row.value}
                  </span>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-ink-soft/70" aria-hidden />
                  <span className="sr-only">Ketuk untuk memperbaiki</span>
                </button>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-1.5 border-t border-dashed border-cutline pt-2 text-[11px] text-ink-soft">
        Ada yang salah? Ketuk barisnya untuk memperbaiki ya, kakak.
      </p>
    </div>
  );
}
