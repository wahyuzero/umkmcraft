"use client";

/**
 * SectionList — lembar stiker dengan drag-and-drop reorder.
 * pragmatic-drag-and-drop (React 19-ready): draggable + dropTarget per kartu.
 * State aktif = wash amber + lift (depth-as-state), bukan border tambahan.
 * Setiap stiker: ikon tipe + nama + ringkasan isi 1 baris.
 *
 * Urutan tampil = MIRROR stable-partition hero-first dari renderSections()
 * (packages/renderer/src/registry.tsx): hero selalu tampil pertama di sini
 * DAN di halaman live, jadi urutan yang kakak susun jujur. Drag & chevron
 * tetap menggeser array config asli lewat mapping indeks per id.
 * Hapus = dua langkah (tanya dulu) + toast "Urungkan" 6 detik.
 */
import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import {
  BarChart3, CalendarCheck, CalendarDays, Check, ChevronDown, ChevronUp, Clock, Download, FileText,
  GripVertical, HelpCircle, History, Images, Instagram, Lightbulb, ListOrdered, MapPin,
  Megaphone, MegaphoneOff, Newspaper, Phone, Pin, QrCode, Receipt, Share2, ShieldCheck, ShoppingBag,
  Sparkles, Star, Sticker, Store, Users, UtensilsCrossed, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import type { Section, SectionType } from "@umkmcraft/schema";

export const TYPE_LABEL: Record<SectionType, string> = {
  hero_storefront: "Hero / Etalase",
  product_catalog_wa: "Katalog + WhatsApp",
  promo_banner: "Banner Promo",
  operating_hours_map: "Jam Buka & Peta",
  social_proof_reviews: "Ulasan Pembeli",
  channel_marketplace: "Marketplace Hub",
  faq_accordion: "FAQ",
  contact_direct: "Kontak",
  rich_text_block: "Teks Bebas",
  gallery_grid: "Galeri",
  service_pricing_table: "Tabel Harga",
  trust_badges_strip: "Badge Kepercayaan",
  step_how_to_order: "Cara Pesan",
  stats_counter_strip: "Statistik",
  value_props_grid: "Kenapa Pilih Kami",
  menu_price_list: "Daftar Menu",
  product_spotlight: "Produk Unggulan",
  cta_banner_full: "Band CTA",
  team_members_grid: "Tim Kami",
  timeline_story: "Cerita & Perjalanan",
  booking_whatsapp_form: "Form Booking",
  event_schedule_list: "Jadwal Acara",
  branch_locations_list: "Daftar Cabang",
  instagram_showcase_grid: "Instagram Showcase",
  updates_blog_list: "Info & Kabar",
  download_catalog_cta: "Katalog PDF",
  qr_code_whatsapp: "QR WhatsApp",
};

/** Peta ikon per tipe section — dipakai SectionList & ModuleCatalog. */
export const TYPE_ICON: Record<SectionType, LucideIcon> = {
  hero_storefront: Store,
  product_catalog_wa: ShoppingBag,
  promo_banner: Megaphone,
  operating_hours_map: Clock,
  social_proof_reviews: Star,
  channel_marketplace: Share2,
  faq_accordion: HelpCircle,
  contact_direct: Phone,
  rich_text_block: FileText,
  gallery_grid: Images,
  service_pricing_table: Receipt,
  trust_badges_strip: ShieldCheck,
  step_how_to_order: ListOrdered,
  stats_counter_strip: BarChart3,
  value_props_grid: Sparkles,
  menu_price_list: UtensilsCrossed,
  product_spotlight: Lightbulb,
  cta_banner_full: MegaphoneOff,
  team_members_grid: Users,
  timeline_story: History,
  booking_whatsapp_form: CalendarCheck,
  event_schedule_list: CalendarDays,
  branch_locations_list: MapPin,
  instagram_showcase_grid: Instagram,
  updates_blog_list: Newspaper,
  download_catalog_cta: Download,
  qr_code_whatsapp: QrCode,
};

const EXTENDED: Set<SectionType> = new Set([
  "gallery_grid",
  "service_pricing_table",
  "trust_badges_strip",
  "step_how_to_order",
  "stats_counter_strip",
  "value_props_grid",
  "menu_price_list",
  "product_spotlight",
  "cta_banner_full",
  "team_members_grid",
  "timeline_story",
  "booking_whatsapp_form",
  "event_schedule_list",
  "branch_locations_list",
  "instagram_showcase_grid",
  "updates_blog_list",
  "download_catalog_cta",
  "qr_code_whatsapp",
]);

type Summary = { text: string; filled: boolean };

/**
 * Ringkasan 1 baris isi stiker + apakah modul sudah berisi sesuatu.
 * Repeater berisi dibaca jujur ("3 layanan", "4 poin", "3 angka") —
 * penanda "· opsional" hanya menempel kalau modul memang masih kosong.
 */
function summarize(section: Section): Summary {
  const props = (section.props ?? {}) as Record<string, unknown>;
  const len = (key: string): number => (Array.isArray(props[key]) ? props[key].length : 0);
  const repeater = (key: string, unit: string, emptyLabel: string): Summary =>
    len(key) > 0 ? { text: `${len(key)} ${unit}`, filled: true } : { text: emptyLabel, filled: false };
  const snippet = (value: unknown, emptyLabel: string): Summary => {
    const v = typeof value === "string" ? value.trim() : "";
    return v ? { text: v, filled: true } : { text: emptyLabel, filled: false };
  };
  const hasText = (value: unknown): boolean => typeof value === "string" && value.trim() !== "";
  switch (section.type) {
    case "product_catalog_wa": return repeater("products", "produk", "Belum ada produk");
    case "menu_price_list": return repeater("items", "menu", "Belum ada menu");
    case "faq_accordion": return repeater("items", "pertanyaan", "Belum ada pertanyaan");
    case "step_how_to_order": return repeater("steps", "langkah", "Belum ada langkah");
    case "social_proof_reviews": return repeater("reviews", "ulasan", "Belum ada ulasan");
    case "service_pricing_table": return repeater("tiers", "paket", "Belum ada paket");
    case "team_members_grid": return repeater("members", "anggota", "Belum ada anggota");
    case "event_schedule_list": return repeater("events", "acara", "Belum ada acara");
    case "branch_locations_list": return repeater("branches", "cabang", "Belum ada cabang");
    case "gallery_grid": return repeater("items", "foto", "Belum ada foto");
    case "timeline_story": return repeater("milestones", "momen", "Belum ada momen");
    case "stats_counter_strip": return repeater("stats", "angka", "Belum ada angka");
    case "value_props_grid": return repeater("items", "poin", "Belum ada poin");
    case "channel_marketplace": return repeater("channels", "kanal", "Belum ada kanal");
    case "instagram_showcase_grid": return repeater("posts", "postingan", "Belum ada postingan");
    case "updates_blog_list": return repeater("posts", "kabar", "Belum ada kabar");
    case "booking_whatsapp_form": {
      if (len("service_options") > 0) return { text: `${len("service_options")} layanan`, filled: true };
      if (len("time_slots") > 0) return { text: `${len("time_slots")} slot waktu`, filled: true };
      return { text: "Belum ada layanan", filled: false };
    }
    case "trust_badges_strip": {
      const parts = [
        len("payment_methods") > 0 ? `${len("payment_methods")} metode bayar` : "",
        len("shipping_couriers") > 0 ? `${len("shipping_couriers")} kurir` : "",
        len("certifications") > 0 ? `${len("certifications")} sertifikasi` : "",
      ].filter(Boolean);
      return parts.length > 0
        ? { text: parts.join(" · "), filled: true }
        : { text: "Belum ada badge", filled: false };
    }
    case "promo_banner": return snippet(props.message, "Belum ada pesan promo");
    case "rich_text_block": return snippet(props.body_markdown, "Belum ada teks");
    case "operating_hours_map": return snippet(props.address, "Belum ada alamat");
    case "contact_direct": return snippet(props.phone || props.address, "Belum ada kontak");
    case "product_spotlight": return snippet(props.title, "Belum ada produk unggulan");
    case "cta_banner_full": return snippet(props.title, "Belum ada ajakan");
    case "download_catalog_cta":
      return hasText(props.file_url)
        ? { text: "Katalog siap diunduh", filled: true }
        : { text: "Belum ada file katalog", filled: false };
    case "qr_code_whatsapp":
      return hasText(props.qr_image_url)
        ? { text: "Kode siap dipindai", filled: true }
        : { text: "Belum ada kode QR", filled: false };
    case "hero_storefront": return snippet(props.title, "Judul & tagline utama");
    default: return { text: "Ketuk untuk mengisi", filled: false };
  }
}

/**
 * Stabil partition hero-first — MIRROR dari renderSections() di
 * packages/renderer/src/registry.tsx. Keduanya WAJIB sepakat supaya
 * urutan lembar stiker = urutan halaman live. Bila aturan urutan
 * renderer berubah, ubah di sini juga di commit yang sama.
 */
function orderForDisplay(sections: Section[]): Section[] {
  const heroes = sections.filter((s) => s.type === "hero_storefront");
  const rest = sections.filter((s) => s.type !== "hero_storefront");
  return [...heroes, ...rest];
}

export function SectionList({ onAdd }: { onAdd?: () => void }) {
  const sections = useEditor((s) => s.config.sections);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const moveSection = useEditor((s) => s.moveSection);
  const removeSection = useEditor((s) => s.removeSection);
  const lastRemoved = useEditor((s) => s.lastRemoved);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  // Hapus dua langkah — mirror pola repeater Inspector: tap → "Hapus?"
  // (ya / batal), batal otomatis setelah 6 detik (jangkauan tangan di HP
  // sering lebih lama dari kelihatannya — 3 detik membatalkan di tengah
  // jalan sehingga tap berikutnya mendarat di baris).
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    if (confirmId === null) return;
    const t = setTimeout(() => setConfirmId(null), 6000);
    return () => clearTimeout(t);
  }, [confirmId]);

  // Toast urungkan: auto-tutup 6 detik setelah hapus terakhir.
  useEffect(() => {
    if (!lastRemoved) return;
    const t = setTimeout(() => useEditor.getState().dismissLastRemoved(), 6000);
    return () => clearTimeout(t);
  }, [lastRemoved]);

  // Urutan display mengikuti renderer (hero-first); indeks asli config
  // dihitung per id supaya drag & chevron tetap menggeser array yang benar.
  const rawIndexById = new Map(sections.map((s, i) => [s.id, i] as const));
  const display = orderForDisplay(sections);
  const rawOf = (displayIdx: number): number =>
    rawIndexById.get(display[displayIdx]?.id ?? "") ?? -1;

  // Stiker baru (dari katalog) dapat entrance uc-stick-in; stiker lama tidak.
  // Differing di effect — akses ref saat render dilarang (react-hooks/refs).
  const knownIdsRef = useRef<Set<string> | null>(null);
  const [freshIds, setFreshIds] = useState<Set<string>>(() => new Set());
  useEffect(() => {
    const known = knownIdsRef.current;
    if (known) {
      const fresh = new Set(sections.filter((s) => !known.has(s.id)).map((s) => s.id));
      if (fresh.size > 0) {
        setFreshIds(fresh);
        const t = setTimeout(() => setFreshIds(new Set()), 450);
        knownIdsRef.current = new Set(sections.map((s) => s.id));
        return () => clearTimeout(t);
      }
    }
    knownIdsRef.current = new Set(sections.map((s) => s.id));
  }, [sections]);

  if (sections.length === 0) {
    return (
      <div className="mx-4 mb-2 flex min-h-0 flex-1 flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-cutline px-4 py-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-soft/60 text-signal">
          <Sticker className="h-6 w-6" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-ink">Lembar masih kosong, kak</p>
        <p className="text-xs leading-relaxed text-ink-soft">
          Tambah modul pertama, nanti langsung nempel di halaman.
        </p>
        {onAdd ? (
          <button
            onClick={onAdd}
            className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-card transition-transform duration-150 ease-out hover:-translate-y-0.5"
          >
            Buka Lembar Modul
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-2" aria-label="Daftar section">
        {display.map((section, index) => {
          const active = section.id === selectedId;
          const Icon = TYPE_ICON[section.type];
          const confirming = confirmId === section.id;
          const info = summarize(section);
          return (
            <li
              key={section.id}
              ref={(el) => {
                if (!el) return;
                const idx = index;
                const stopDrag = draggable({
                  element: el,
                  onDragStart: () => setDragIndex(idx),
                  onDrop: () => {
                    setDragIndex(null);
                    setOverIndex(null);
                  },
                });
                const stopDrop = dropTargetForElements({
                  element: el,
                  onDragEnter: () => setOverIndex(idx),
                  onDragLeave: () => setOverIndex((v) => (v === idx ? null : v)),
                  onDrop: () => {
                    if (dragIndex !== null && dragIndex !== idx) {
                      const from = rawOf(dragIndex);
                      const to = rawOf(idx);
                      if (from >= 0 && to >= 0) moveSection(from, to);
                    }
                    setDragIndex(null);
                    setOverIndex(null);
                  },
                });
                // Ref callback wajib mengembalikan cleanup — tanpa ini tiap
                // render mendaftarkan listener BARU tanpa melepas yang lama
                // (ratusan warning "duplicate registration" di konsol).
                return () => {
                  stopDrag();
                  stopDrop();
                };
              }}
            >
              <div
                role="button"
                tabIndex={0}
                aria-pressed={active}
                onClick={() => select(section.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    select(section.id);
                  }
                }}
                className={`group relative flex cursor-grab touch-manipulation items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all duration-150 ease-out active:cursor-grabbing ${
                  active
                    ? "translate-y-0 bg-signal-soft shadow-[0_6px_18px_-6px_rgb(154_52_18/0.35)]"
                    : "bg-card shadow-[0_1px_2px_rgb(35_28_16/0.05)] hover:bg-signal-soft/30"
                } ${overIndex === index && dragIndex !== null && dragIndex !== index ? "uc-cutline-active" : "uc-cutline"} ${freshIds.has(section.id) ? "uc-stick-in" : ""}`}
              >
                {/* Pegangan drag — desktop saja; di sentuh urutan lewat chevron eksplisit */}
                <GripVertical className="hidden h-4 w-4 shrink-0 cursor-grab text-ink-soft/50 transition-colors group-hover:text-ink-soft group-active:cursor-grabbing lg:block" strokeWidth={2.2} aria-hidden />
                {/* Ikon tipe */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-signal/15 text-signal" : "bg-paper-deep/70 text-ink-soft"}`}
                  aria-hidden
                >
                  <Icon className="h-4 w-4" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block truncate text-sm font-semibold ${active ? "text-signal" : "text-ink"}`}>
                    {TYPE_LABEL[section.type]}
                  </span>
                  {/* Ringkasan jujur: "3 layanan" bila berisi; "· opsional" hanya saat kosong */}
                  <span className="block truncate text-xs text-ink-soft">
                    {info.text}
                    {!info.filled && EXTENDED.has(section.type) ? " · opsional" : ""}
                  </span>
                </span>
                {confirming ? (
                  <>
                    {/* Konfirmasi dua langkah (chevron disembunyikan supaya muat) */}
                    <span className="shrink-0 text-xs font-bold text-signal">Hapus?</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(null);
                        removeSection(section.id);
                      }}
                      aria-label={`Ya, hapus ${TYPE_LABEL[section.type]}`}
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-signal text-card transition-colors duration-150 ease-out hover:bg-signal/90"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(null);
                      }}
                      aria-label="Batal hapus"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors duration-150 ease-out hover:bg-signal/10 hover:text-signal"
                    >
                      <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    </button>
                  </>
                ) : (
                  <>
                {section.type === "hero_storefront" ? (
                  // Hero selalu partisi pertama (orderForDisplay) — chevron
                  // naik/turun justru menipu (kelihatannya bisa, nyatanya
                  // tidak). Ganti dengan hint pin: posisinya memang sah.
                  <span
                    title="Selalu di atas — sambutan pelanggan"
                    className="hidden shrink-0 items-center max-lg:flex"
                  >
                    <Pin className="h-4 w-4 text-ink-soft/70" strokeWidth={2.2} aria-hidden />
                    <span className="sr-only">Selalu di atas — sambutan pelanggan</span>
                  </span>
                ) : (
                  /* Urutan eksplisit untuk layar sentuh (maks-lg), target 44px.
                     gap-2 = napas 8px antar tombol — dulu nempel 0px sehingga
                     dua chevron terbaca satu gumpalan di layar 390px. */
                  <div className="hidden shrink-0 items-center gap-2 max-lg:flex">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const from = rawOf(index);
                        const to = rawOf(index - 1);
                        if (from >= 0 && to >= 0) moveSection(from, to);
                      }}
                      disabled={index === 0}
                      aria-label={`Naikkan ${TYPE_LABEL[section.type]}`}
                      className="grid h-11 w-11 place-items-center rounded-xl text-ink-soft transition-colors duration-150 hover:bg-signal/10 hover:text-signal disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        const from = rawOf(index);
                        const to = rawOf(index + 1);
                        if (from >= 0 && to >= 0) moveSection(from, to);
                      }}
                      disabled={index === display.length - 1}
                      aria-label={`Turunkan ${TYPE_LABEL[section.type]}`}
                      className="grid h-11 w-11 place-items-center rounded-xl text-ink-soft transition-colors duration-150 hover:bg-signal/10 hover:text-signal disabled:pointer-events-none disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" strokeWidth={2.2} aria-hidden />
                    </button>
                  </div>
                )}
                    {/* Hapus: dua langkah (tap pertama menanya dulu). Section
                        terakhir tak boleh hilang — tombol mati + penjelasan. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmId(section.id);
                      }}
                      disabled={display.length <= 1}
                      title={display.length <= 1 ? "Situs butuh minimal satu section" : `Hapus ${TYPE_LABEL[section.type]}`}
                      aria-label={`Hapus ${TYPE_LABEL[section.type]}`}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink-soft transition-opacity duration-150 hover:bg-signal/10 hover:text-signal focus-visible:opacity-100 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent max-lg:opacity-100 lg:absolute lg:right-1 lg:top-1/2 lg:z-10 lg:-translate-y-1/2 lg:opacity-0 lg:group-focus-within:opacity-100 lg:group-hover:opacity-100"
                    >
                      <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                        <path d="m3 3 10 10M13 3 3 13" strokeLinecap="round" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {lastRemoved ? <UndoToast removed={lastRemoved} /> : null}
    </>
  );
}

/** Toast urungkan — kartu di bawah-tengah; auto-tutup 6 detik (effect di atas). */
function UndoToast({ removed }: { removed: { section: Section; index: number } }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="uc-stick-in fixed bottom-4 left-1/2 z-50 w-[min(22rem,calc(100vw-2rem))] -translate-x-1/2 rounded-xl border border-cutline/70 bg-card px-3.5 py-2 text-ink shadow-plate"
    >
      <div className="flex min-h-[44px] items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-xs font-semibold">
          <span className="font-bold">{TYPE_LABEL[removed.section.type]}</span> dihapus dari lembar
        </p>
        <button
          type="button"
          onClick={() => useEditor.getState().undoRemoveSection()}
          className="min-h-11 shrink-0 rounded-lg px-3 text-xs font-bold text-signal transition-colors duration-150 ease-out hover:bg-signal-soft/60"
        >
          Urungkan
        </button>
      </div>
    </div>
  );
}
