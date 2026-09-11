"use client";

/**
 * Inspector — panel edit label: field per tipe section.
 * Field sederhana (teks/angka/warna/toggle) + repeater untuk list
 * (produk, langkah, FAQ, tier). Simpan via store → autosave debounce.
 *
 * Kontrak visual (DESIGN.md): input bg-card + border cutline, fokus =
 * ring signal-soft; toggle ON = sinyal (bukan hijau — hijau hanya live);
 * repeater = kartu shadow-plate dengan urutan/hapus 44px + hapus dua
 * langkah; grup field ("Tampilan", "Konten", "CTA") sebagai caption
 * fungsional; field yang jarang dipakai disembunyikan di "Opsi lanjutan".
 * Editor khusus: open_hours per hari (operating_hours_map) — sumber data
 * badge Buka/Tutup di situs terbit (island OpenNowBadge).
 */
import { useEditor } from "@/lib/editor-store";
import type { SectionType } from "@umkmcraft/schema";
import {
  ArrowDown,
  ArrowUp,
  CalendarCheck,
  CalendarDays,
  Camera,
  Check,
  ChevronDown,
  Clock,
  Download,
  FileText,
  HelpCircle,
  History,
  Images,
  Instagram,
  ListOrdered,
  Loader2,
  MapPin,
  Megaphone,
  MousePointerClick,
  Newspaper,
  Package,
  PackageOpen,
  Phone,
  Plus,
  QrCode,
  Receipt,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Trash2,
  TrendingUp,
  Users,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

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

/* Ikon + nama ramah per tipe section — kepala inspector */
const TYPE_META: Record<SectionType, { icon: LucideIcon; label: string }> = {
  hero_storefront: { icon: Store, label: "Hero Etalase" },
  product_catalog_wa: { icon: ShoppingBag, label: "Katalog Produk" },
  promo_banner: { icon: Megaphone, label: "Banner Promo" },
  operating_hours_map: { icon: Clock, label: "Jam Buka & Peta" },
  social_proof_reviews: { icon: Star, label: "Ulasan Pelanggan" },
  channel_marketplace: { icon: Share2, label: "Channel & Marketplace" },
  faq_accordion: { icon: HelpCircle, label: "FAQ" },
  contact_direct: { icon: Phone, label: "Kontak Langsung" },
  rich_text_block: { icon: FileText, label: "Teks Bebas" },
  gallery_grid: { icon: Images, label: "Galeri Foto" },
  service_pricing_table: { icon: Receipt, label: "Tabel Harga" },
  trust_badges_strip: { icon: ShieldCheck, label: "Lencana Kepercayaan" },
  step_how_to_order: { icon: ListOrdered, label: "Cara Pesan" },
  stats_counter_strip: { icon: TrendingUp, label: "Statistik" },
  value_props_grid: { icon: Sparkles, label: "Keunggulan" },
  menu_price_list: { icon: UtensilsCrossed, label: "Daftar Menu" },
  product_spotlight: { icon: Package, label: "Sorotan Produk" },
  cta_banner_full: { icon: MousePointerClick, label: "Banner CTA" },
  team_members_grid: { icon: Users, label: "Tim" },
  timeline_story: { icon: History, label: "Cerita Toko" },
  booking_whatsapp_form: { icon: CalendarCheck, label: "Form Booking WA" },
  event_schedule_list: { icon: CalendarDays, label: "Jadwal Acara" },
  branch_locations_list: { icon: MapPin, label: "Lokasi Cabang" },
  instagram_showcase_grid: { icon: Instagram, label: "Galeri Instagram" },
  updates_blog_list: { icon: Newspaper, label: "Kabar Terbaru" },
  download_catalog_cta: { icon: Download, label: "Unduh Katalog" },
  qr_code_whatsapp: { icon: QrCode, label: "QR WhatsApp" },
};

/* Batas karakter sesuai skema — counter "62/80" di label field */
const LIMITS: Record<string, number> = {
  title: 80,
  section_title: 80,
  subtitle: 220,
  section_subtitle: 220,
};

/* Pengelompokan field: caption fungsional, bukan eyebrow.
   Key CTA = tombol/tautan/pesan otomatis; Tampilan = judul & label;
   sisanya Konten. */
const CTA_KEYS = new Set([
  "cta_label",
  "button_label",
  "whatsapp_label",
  "secondary_label",
  "secondary_url",
  "prefill_message",
  "prefill_note",
  "coupon_code",
  "discount_text",
  "file_label",
]);
const APPEARANCE_KEYS = new Set([
  "section_title",
  "section_subtitle",
  "title",
  "subtitle",
  "badge",
  "eyebrow",
  "handle",
]);

function groupOf(f: FieldDef): "Tampilan" | "Konten" | "CTA" {
  if (CTA_KEYS.has(f.key)) return "CTA";
  if (APPEARANCE_KEYS.has(f.key)) return "Tampilan";
  return "Konten";
}
const GROUP_ORDER = ["Tampilan", "Konten", "CTA"] as const;

/* Field yang jarang diubah — disembunyikan di balik "Opsi lanjutan" */
const ADVANCED_KEYS = new Set([
  "email",
  "waze_url",
  "delivery_note",
  "ends_at",
  "secondary_label",
  "secondary_url",
  "prefill_message",
  "prefill_note",
  "file_label",
  "caption",
]);

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
  stats_counter_strip: {
    simple: [F("section_title", "Judul section (boleh kosong)")],
    repeaters: [
      { key: "stats", label: "Statistik", itemLabel: "Angka", fields: [F("value", "Angka (contoh: 500+)"), F("label", "Keterangan")], newItem: () => ({ value: "100+", label: "Pelanggan Puas" }) },
    ],
  },
  value_props_grid: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "items", label: "Keunggulan", itemLabel: "Keunggulan", fields: [F("icon", "Ikon", "text", "star / truck / shield / clock / chat / wallet / leaf / flame / tool / heart"), F("title", "Judul"), F("description", "Penjelasan", "textarea")], newItem: () => ({ icon: "star", title: "Keunggulan Baru", description: "" }) },
    ],
  },
  menu_price_list: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "items", label: "Menu", itemLabel: "Menu", fields: [F("name", "Nama menu"), F("description", "Deskripsi", "textarea"), F("price", "Harga", "number"), F("category", "Kelompok (Minuman, dll)"), F("is_recommended", "Rekomendasi?", "toggle")], newItem: () => ({ name: "Menu Baru", description: "", price: 15000, category: "Menu", is_recommended: false }) },
    ],
  },
  product_spotlight: {
    simple: [F("eyebrow", "Label kecil di atas judul"), F("title", "Nama produk"), F("description", "Deskripsi", "textarea"), F("price", "Harga", "number"), F("original_price", "Harga asli (coret)", "number"), F("image_url", "Foto produk", "image"), F("cta_label", "Label tombol"), F("prefill_message", "Pesan otomatis WA", "textarea")],
    repeaters: [
      { key: "highlights", label: "Poin keunggulan", itemLabel: "Poin", fields: [F("", "Teks")], newItem: () => "" },
    ],
  },
  cta_banner_full: {
    simple: [F("title", "Judul besar"), F("subtitle", "Subjudul", "textarea"), F("button_label", "Label tombol WA"), F("prefill_message", "Pesan otomatis WA", "textarea"), F("secondary_label", "Label tombol kedua (opsional)"), F("secondary_url", "URL tombol kedua", "url")],
  },
  team_members_grid: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "members", label: "Anggota tim", itemLabel: "Anggota", fields: [F("name", "Nama"), F("role", "Peran/jabatan"), F("bio", "Bio singkat", "textarea"), F("avatar_url", "Foto", "image")], newItem: () => ({ name: "Anggota Baru", role: "", bio: "", avatar_url: "" }) },
    ],
  },
  timeline_story: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "milestones", label: "Momen", itemLabel: "Momen", fields: [F("year", "Tahun/label waktu"), F("title", "Judul momen"), F("description", "Cerita singkat", "textarea")], newItem: () => ({ year: "2026", title: "Momen baru", description: "" }) },
    ],
  },
  booking_whatsapp_form: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea"), F("button_label", "Label tombol kirim"), F("prefill_note", "Kalimat pembuka pesan WA", "textarea")],
    repeaters: [
      { key: "service_options", label: "Pilihan layanan", itemLabel: "Layanan", fields: [F("", "Nama layanan")], newItem: () => "Layanan Baru" },
      { key: "time_slots", label: "Pilihan jam", itemLabel: "Jam", fields: [F("", "Jam (contoh: 09:00)")], newItem: () => "09:00" },
    ],
  },
  event_schedule_list: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "events", label: "Acara", itemLabel: "Acara", fields: [F("date_label", "Tanggal (contoh: 12 Sep)"), F("title", "Nama acara"), F("location", "Lokasi"), F("note", "Catatan"), F("maps_url", "Link Maps", "url")], newItem: () => ({ date_label: "", title: "Acara Baru", location: "", note: "", maps_url: "" }) },
    ],
  },
  branch_locations_list: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "branches", label: "Cabang", itemLabel: "Cabang", fields: [F("name", "Nama cabang"), F("address", "Alamat", "textarea"), F("hours", "Jam buka"), F("gmaps_url", "Link Maps", "url"), F("whatsapp_number", "WA cabang (62xxx)")], newItem: () => ({ name: "Cabang Baru", address: "", hours: "", gmaps_url: "" }) },
    ],
  },
  instagram_showcase_grid: {
    simple: [F("section_title", "Judul section"), F("handle", "Username IG (@nama)"), F("profile_url", "Link profil IG", "url")],
    repeaters: [
      { key: "posts", label: "Foto", itemLabel: "Foto", fields: [F("image_url", "Gambar", "image"), F("caption", "Caption"), F("post_url", "Link post IG", "url")], newItem: () => ({ image_url: "", caption: "", post_url: "" }) },
    ],
  },
  updates_blog_list: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea")],
    repeaters: [
      { key: "posts", label: "Kabar", itemLabel: "Kabar", fields: [F("title", "Judul"), F("date_label", "Tanggal"), F("excerpt", "Ringkasan", "textarea"), F("url", "Link (opsional)", "url"), F("image_url", "Thumbnail", "image")], newItem: () => ({ title: "Kabar Baru", date_label: "", excerpt: "", url: "", image_url: "" }) },
    ],
  },
  download_catalog_cta: {
    simple: [F("section_title", "Judul section"), F("description", "Deskripsi", "textarea"), F("file_url", "Link file (PDF)", "url"), F("file_label", "Label tombol unduh")],
  },
  qr_code_whatsapp: {
    simple: [F("section_title", "Judul section"), F("section_subtitle", "Subjudul", "textarea"), F("qr_image_url", "Gambar QR WhatsApp", "image", "Screenshot/gambar QR dari WhatsApp Business"), F("caption", "Caption")],
  },
};

export function Inspector() {
  const sections = useEditor((s) => s.config.sections);
  const selectedId = useEditor((s) => s.selectedId);
  const update = useEditor((s) => s.updateSectionProps);
  const section = sections.find((s) => s.id === selectedId);

  if (!section) {
    return (
      <div className="p-4">
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
  const meta = TYPE_META[section.type];
  const liveTitle = String(props.section_title ?? props.title ?? "").trim();

  /* Bagi field sederhana per grup + pisahkan yang "lanjutan" */
  const simple = spec?.simple ?? [];
  const visible = simple.filter((f) => !ADVANCED_KEYS.has(f.key));
  const advanced = simple.filter((f) => ADVANCED_KEYS.has(f.key));
  const groups = GROUP_ORDER.map((name) => ({ name, fields: visible.filter((f) => groupOf(f) === name) })).filter((g) => g.fields.length > 0);
  const showCaptions = groups.length > 1;

  return (
    <div className="p-4">
      {/* Kepala: ikon tipe + judul section yang sedang diedit */}
      <div className="mb-4">
        <h2 className="px-1 font-display text-sm font-bold uppercase tracking-[0.06em] text-ink-soft">Edit Label</h2>
        <div className="mt-2.5 flex items-center gap-2.5 rounded-2xl border border-cutline/60 bg-card p-3 shadow-plate">
          <span aria-hidden className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-signal-soft text-signal">
            <meta.icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-display text-sm font-bold text-ink">{liveTitle || meta.label}</p>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-ink-soft">{meta.label}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {groups.map((g) => (
          <div key={g.name}>
            {showCaptions ? (
              <p className="mb-2 px-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft/60">{g.name}</p>
            ) : null}
            <div className="flex flex-col gap-3">
              {g.fields.map((f) => (
                <Field key={f.key} def={f} value={props[f.key]} onChange={(v) => update(section.id, f.key, v)} />
              ))}
            </div>
          </div>
        ))}

        {section.type === "operating_hours_map" ? (
          <OpenHoursEditor value={props.open_hours} onChange={(v) => update(section.id, "open_hours", v)} />
        ) : null}

        {advanced.length > 0 ? (
          <details className="group rounded-xl uc-cutline bg-card/60">
            <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between px-3 text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-signal [&::-webkit-details-marker]:hidden">
              Opsi lanjutan
              <ChevronDown aria-hidden className={`h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180`} />
            </summary>
            <div className="flex flex-col gap-3 border-t border-cutline/60 p-3">
              {advanced.map((f) => (
                <Field key={f.key} def={f} value={props[f.key]} onChange={(v) => update(section.id, f.key, v)} />
              ))}
            </div>
          </details>
        ) : null}

        {spec?.repeaters?.map((r) => (
          <Repeater
            key={r.key}
            def={r}
            items={props[r.key] as Array<Record<string, unknown> | string> | undefined}
            onChange={(items) => update(section.id, r.key, items)}
          />
        ))}

        {!spec ? (
          <p className="rounded-xl bg-card p-4 text-sm text-ink-soft">Section ini tidak butuh pengaturan tambahan.</p>
        ) : null}
      </div>
    </div>
  );
}

/* ---------------- field primitives ---------------- */

/* Input dasar: bg-card + border cutline, fokus ring signal-soft (DESIGN.md) */
const inputCls =
  "w-full rounded-xl border border-cutline bg-card px-3 py-2.5 text-sm text-ink transition-colors duration-200 placeholder:text-ink-soft/50 focus:border-signal focus:outline-none focus:ring-3 focus:ring-signal/15";

function Field({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const limit = LIMITS[def.key];
  const len = String(value ?? "").length;

  /* Toggle: baris penuh 44px, ON = sinyal + wash (depth-as-state) */
  if (def.type === "toggle") {
    const on = Boolean(value);
    return (
      <button
        type="button"
        role="switch"
        aria-checked={on}
        onClick={() => onChange(!on)}
        className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2 text-left transition-colors duration-200 ${
          on ? "border-signal/40 bg-signal-soft/50" : "border-cutline bg-card"
        }`}
      >
        <span className="text-sm font-medium text-ink">{def.label}</span>
        <span aria-hidden className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${on ? "bg-signal" : "bg-cutline"}`}>
          <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-card shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0"}`} />
        </span>
      </button>
    );
  }

  /* Field foto: unggah dari galeri HP (via /uploads) + alternatif tempel
     link. Butuh state lokal → logikanya di ImageField di bawah. */
  if (def.type === "image") {
    return <ImageField def={def} value={value} onChange={onChange} />;
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-ink">{def.label}</span>
        {limit ? (
          <span className={`text-[0.65rem] tabular-nums ${len > limit * 0.9 ? "font-bold text-signal" : "text-ink-soft/70"}`}>
            {len}/{limit}
          </span>
        ) : null}
      </span>
      {def.type === "textarea" ? (
        <textarea value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} rows={3} className={`${inputCls} resize-y`} />
      ) : (
        <input
          type={def.type === "number" ? "number" : "text"}
          value={String(value ?? "")}
          onChange={(e) => onChange(def.type === "number" ? Number(e.target.value || 0) : e.target.value)}
          className={`${inputCls} min-h-[44px]`}
        />
      )}
      {def.hint ? <span className="mt-1 block text-xs leading-snug text-ink-soft">{def.hint}</span> : null}
    </label>
  );
}

/* ---------------- field foto (unggah + tempel link) ---------------- */

/**
 * Foto pedagang ada di galeri HP, bukan di internet — jadi tombol unggah
 * adalah jalan utama, tempel link hanya alternatif. Satu <input type=file>
 * saja: dari accept, browser HP menawarkan kamera maupun galeri. Hasil
 * unggahan berupa URL /uploads/... dan diset lewat onChange yang sama
 * dengan mengetik. Link Drive/IG diperingatkan saat blur — halaman itu
 * bukan file gambar, <img>-nya pasti rusak (tidak menyekat mengetik).
 */
function ImageField({ def, value, onChange }: { def: FieldDef; value: unknown; onChange: (v: unknown) => void }) {
  const siteId = useEditor((s) => s.siteId);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkWarn, setLinkWarn] = useState(false);
  const src = String(value ?? "");

  async function uploadFile(file: File) {
    if (busy) return;
    setError(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`/api/sites/${siteId}/upload`, { method: "POST", body: fd });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: string } | null;
      if (!res.ok || !data?.url) throw new Error(data?.error ?? "Gagal mengunggah foto — coba lagi, Kak.");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengunggah foto — coba lagi, Kak.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const actionBtn =
    "flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl uc-cutline bg-card text-sm font-bold transition-colors duration-200 hover:bg-signal-soft disabled:pointer-events-none disabled:opacity-40";

  return (
    <div>
      <span className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold text-ink">{def.label}</span>
      </span>
      <div className="flex items-start gap-2.5">
        {src.trim() ? (
          // URL foto bebas dari pengguna — next/image butuh allowlist domain,
          // jadi <img> polos (pola sama dengan packages/renderer).
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src.trim()}
            alt="Pratinjau foto"
            loading="lazy"
            decoding="async"
            className="h-14 w-14 shrink-0 rounded-xl object-cover ring-1 ring-cutline"
          />
        ) : null}
        <div className="flex min-w-0 flex-1 gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className={`${actionBtn} min-w-0 flex-1 text-signal`}
          >
            {busy ? (
              <Loader2 aria-hidden className="h-4 w-4 shrink-0 animate-spin" />
            ) : (
              <Camera aria-hidden className="h-4 w-4 shrink-0" />
            )}
            {busy ? "Mengunggah…" : "Ambil Foto"}
          </button>
          <button
            type="button"
            aria-label="Hapus foto"
            disabled={busy || !src.trim()}
            onClick={() => {
              setError(null);
              setLinkWarn(false);
              onChange("");
            }}
            className={`${actionBtn} shrink-0 px-3 text-ink-soft`}
          >
            <Trash2 aria-hidden className="h-4 w-4" />
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void uploadFile(file);
        }}
      />
      <span className="mt-2 block text-xs font-semibold text-ink-soft">…atau tempel link foto</span>
      <input
        type="text"
        value={src}
        onChange={(e) => {
          onChange(e.target.value);
          setLinkWarn(false);
        }}
        onBlur={() => setLinkWarn(/drive\.google\.com|instagram\.com/i.test(src))}
        placeholder="https://…jpg/png"
        disabled={busy}
        className={`${inputCls} mt-1.5 min-h-[44px]`}
      />
      {linkWarn ? (
        <p className="mt-1 text-xs leading-snug text-signal">
          Link itu bukan file gambar — buka linknya, klik kanan fotonya, salin alamat gambar.
        </p>
      ) : null}
      {error ? <p className="mt-1 text-xs font-semibold leading-snug text-signal">{error}</p> : null}
      <span className="mt-1 block text-xs leading-snug text-ink-soft">
        {def.hint ?? "Ambil foto dari galeri kakak, atau tempel link langsung ke file .jpg/.png"}
      </span>
    </div>
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
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);

  /* Hapus dua langkah: batal otomatis setelah 3 detik */
  useEffect(() => {
    if (confirmIdx === null) return;
    const t = setTimeout(() => setConfirmIdx(null), 3000);
    return () => clearTimeout(t);
  }, [confirmIdx]);

  function setItem(idx: number, key: string, value: unknown) {
    const next = list.map((it, i) => {
      if (i !== idx) return it;
      return key ? { ...(it as Record<string, unknown>), [key]: value } : (value as string | Record<string, unknown>);
    });
    onChange(next);
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...list];
    [next[idx + dir], next[idx]] = [next[idx]!, next[idx + dir]!];
    onChange(next);
  }

  const orderBtn =
    "grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors duration-200 hover:bg-signal-soft hover:text-signal disabled:pointer-events-none disabled:opacity-30";

  return (
    <div>
      <div className="mb-2 flex items-center justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">{def.label}</span>
        {list.length > 0 ? <span className="text-[0.65rem] font-semibold tabular-nums text-ink-soft/70">{list.length}</span> : null}
      </div>

      {list.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-paper/70 px-4 py-5 text-center">
          <span aria-hidden className="uc-cutline grid h-11 w-11 place-items-center rounded-full text-ink-soft">
            <PackageOpen className="h-5 w-5" />
          </span>
          <p className="text-xs leading-relaxed text-ink-soft">
            Belum ada {def.label.toLowerCase()}. Tambah {def.itemLabel.toLowerCase()} pertama kakak di bawah.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {list.map((item, idx) => {
            const rec = (item ?? {}) as Record<string, unknown>;
            const title = String(rec.name ?? rec.q ?? rec.label ?? rec.title ?? (typeof item === "string" && item ? item : `${def.itemLabel} ${idx + 1}`));
            const open = openIdx === idx;
            const confirming = confirmIdx === idx;
            return (
              <li
                key={idx}
                className={`overflow-hidden rounded-xl border shadow-plate transition-colors duration-200 ${
                  open ? "border-signal/40 bg-signal-soft/30" : "border-cutline/60 bg-card"
                }`}
              >
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setOpenIdx(open ? null : idx)}
                    aria-expanded={open}
                    className="flex min-h-[44px] min-w-0 flex-1 items-center gap-1.5 py-2 pl-3 pr-1 text-left"
                  >
                    <ChevronDown
                      aria-hidden
                      className={`h-4 w-4 shrink-0 text-ink-soft transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                    />
                    <span className="truncate text-sm font-semibold text-ink">{title || `${def.itemLabel} ${idx + 1}`}</span>
                  </button>

                  {confirming ? (
                    <>
                      <span className="pr-0.5 text-xs font-bold text-signal">Hapus?</span>
                      <button
                        type="button"
                        aria-label={`Ya, hapus ${title}`}
                        onClick={() => {
                          onChange(list.filter((_, i) => i !== idx));
                          setConfirmIdx(null);
                          if (openIdx !== null && openIdx > idx) setOpenIdx(openIdx - 1);
                          else if (openIdx === idx) setOpenIdx(null);
                        }}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal text-card transition-colors duration-200 hover:bg-signal/90"
                      >
                        <Check aria-hidden className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Batal hapus"
                        onClick={() => setConfirmIdx(null)}
                        className={`${orderBtn} mr-1`}
                      >
                        <X aria-hidden className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Panah naik/turun — bukan chevron, supaya beda jelas
                          dari chevron buka-tutup di kiri baris (dulu glyph
                          identik berdampingan bikin salah tap). */}
                      <button type="button" aria-label="Naikkan" disabled={idx === 0} onClick={() => move(idx, -1)} className={orderBtn}>
                        <ArrowUp aria-hidden className="h-4 w-4" />
                      </button>
                      <button type="button" aria-label="Turunkan" disabled={idx === list.length - 1} onClick={() => move(idx, 1)} className={orderBtn}>
                        <ArrowDown aria-hidden className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Hapus ${title}`}
                        onClick={() => setConfirmIdx(idx)}
                        className={`${orderBtn} mr-1`}
                      >
                        <Trash2 aria-hidden className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>

                {open ? (
                  <div className="flex flex-col gap-3 border-t border-cutline/60 p-3">
                    {def.fields.map((f) => {
                      // Field list sederhana (badges) punya key ""
                      const key = f.key || "";
                      const val = key ? rec[key] : item;
                      return (
                        <Field key={f.label} def={f} value={val} onChange={(v) => setItem(idx, key, v)} />
                      );
                    })}
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}

      <button
        type="button"
        onClick={() => {
          onChange([...list, def.newItem(list.length)]);
          setOpenIdx(list.length);
          setConfirmIdx(null);
        }}
        className="uc-cutline mt-2.5 flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl bg-card/50 text-sm font-bold text-signal transition-colors duration-200 hover:bg-signal-soft"
      >
        <Plus aria-hidden className="h-4 w-4" />
        Tambah {def.itemLabel}
      </button>
    </div>
  );
}

/* ---------------- editor jam operasional (badge buka/tutup) ---------------- */

/**
 * OpenHoursEditor — satu-satunya jalan mengisi open_hours terstruktur di
 * section operating_hours_map. Field inilah yang menghidupkan badge
 * Buka/Tutup di situs terbit (island OpenNowBadge) — sebelumnya tidak ada
 * editornya sama sekali, jadi badge tak pernah tampil di situs mana pun.
 * Hari tanpa entri = "tanpa info" (bukan tutup) — renderer hanya menghitung
 * hari yang ada di array. <input type="time"> menghasilkan "HH:MM" persis
 * seperti pola skema, dan di HP memunculkan pemilih jam bawaan.
 */
const HARI_EDITOR: Array<{ dow: number; label: string }> = [
  { dow: 1, label: "Senin" },
  { dow: 2, label: "Selasa" },
  { dow: 3, label: "Rabu" },
  { dow: 4, label: "Kamis" },
  { dow: 5, label: "Jumat" },
  { dow: 6, label: "Sabtu" },
  { dow: 0, label: "Minggu" },
];

/* Nilai fallback saat input time dikosongkan — skema mewajibkan "HH:MM". */
const JAM_BUKA_DEFAULT = "09:00";
const JAM_TUTUP_DEFAULT = "17:00";

function sanitizeTimeInput(v: string, fallback: string): string {
  return /^\d{2}:\d{2}$/.test(v) ? v : fallback;
}

function OpenHoursEditor({ value, onChange }: { value: unknown; onChange: (v: unknown) => void }) {
  const rows = Array.isArray(value) ? (value as Array<Record<string, unknown>>) : [];
  const byDow = new Map<number, Record<string, unknown>>();
  for (const r of rows) {
    const dow = Number(r?.day_of_week);
    if (Number.isInteger(dow) && dow >= 0 && dow <= 6) byDow.set(dow, r);
  }

  function setDay(dow: number, entry: Record<string, unknown> | null) {
    // Dibangun ulang dari HARI_EDITOR → urutan tersimpan selalu konsisten.
    const next = HARI_EDITOR.map(({ dow: d }) => {
      if (d === dow) return entry;
      const cur = byDow.get(d);
      return cur ? { ...cur } : null;
    }).filter((e): e is Record<string, unknown> => e !== null);
    onChange(next);
  }

  const timeInputCls = `${inputCls} min-h-[44px] w-[104px] px-2 py-2 text-center tabular-nums`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between px-1">
        <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">Jam operasional (untuk badge buka/tutup)</span>
        {rows.length > 0 ? <span className="text-[0.65rem] font-semibold tabular-nums text-ink-soft/70">{rows.length}</span> : null}
      </div>
      <ul className="flex flex-col gap-1.5">
        {HARI_EDITOR.map(({ dow, label }) => {
          const entry = byDow.get(dow);
          const on = Boolean(entry);
          return (
            <li
              key={dow}
              className={`flex min-h-[44px] items-center gap-2.5 rounded-xl border px-2.5 py-1.5 transition-colors duration-200 ${
                on ? "border-signal/40 bg-signal-soft/30" : "border-cutline/60 bg-card"
              }`}
            >
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Buka hari ${label}`}
                onClick={() => setDay(dow, on ? null : { day_of_week: dow, open: JAM_BUKA_DEFAULT, close: JAM_TUTUP_DEFAULT })}
                className="shrink-0"
              >
                <span aria-hidden className={`relative block h-6 w-10 rounded-full transition-colors duration-200 ${on ? "bg-signal" : "bg-cutline"}`}>
                  <span className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-card shadow-sm transition-transform duration-200 ${on ? "translate-x-4" : "translate-x-0"}`} />
                </span>
              </button>
              <span className="w-14 shrink-0 text-sm font-semibold text-ink">{label}</span>
              {on ? (
                <span className="ml-auto flex items-center gap-1.5">
                  <input
                    type="time"
                    value={sanitizeTimeInput(String(entry?.open ?? ""), JAM_BUKA_DEFAULT)}
                    onChange={(e) => setDay(dow, { ...entry, day_of_week: dow, open: sanitizeTimeInput(e.target.value, JAM_BUKA_DEFAULT) })}
                    aria-label={`Jam buka hari ${label}`}
                    className={timeInputCls}
                  />
                  <span aria-hidden className="text-xs font-semibold text-ink-soft">–</span>
                  <input
                    type="time"
                    value={sanitizeTimeInput(String(entry?.close ?? ""), JAM_TUTUP_DEFAULT)}
                    onChange={(e) => setDay(dow, { ...entry, day_of_week: dow, close: sanitizeTimeInput(e.target.value, JAM_TUTUP_DEFAULT) })}
                    aria-label={`Jam tutup hari ${label}`}
                    className={timeInputCls}
                  />
                </span>
              ) : (
                <span className="ml-auto text-xs font-medium text-ink-soft/70">Tanpa info</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 px-1 text-xs leading-snug text-ink-soft">
        Hari yang dinyalakan membuat badge Buka/Tutup dihitung otomatis. Buka lewat tengah malam (mis. 21:00–02:00) juga didukung.
      </p>
    </div>
  );
}
