"use client";

/**
 * SectionList — lembar stiker dengan drag-and-drop reorder.
 * pragmatic-drag-and-drop (React 19-ready): draggable + dropTarget per kartu.
 * State aktif = wash amber + lift (depth-as-state), bukan border tambahan.
 * Setiap stiker: ikon tipe + nama + ringkasan isi 1 baris.
 */
import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import {
  BarChart3, CalendarCheck, CalendarDays, Clock, Download, FileText, GripVertical,
  HelpCircle, History, Images, Instagram, Lightbulb, ListOrdered, MapPin, Megaphone,
  MegaphoneOff, Newspaper, Phone, QrCode, Receipt, Share2, ShieldCheck, ShoppingBag,
  Sparkles, Star, Sticker, Store, Users, UtensilsCrossed,
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

/** Ringkasan 1 baris isi stiker (hitung item bila array, else deskripsi singkat). */
function summarize(section: Section): string {
  const props = (section.props ?? {}) as Record<string, unknown>;
  const count = (key: string, unit: string): string | null => {
    const v = props[key];
    if (Array.isArray(v) && v.length > 0) return `${v.length} ${unit}`;
    return null;
  };
  switch (section.type) {
    case "product_catalog_wa": return count("products", "produk") ?? "Belum ada produk";
    case "menu_price_list": return count("items", "menu") ?? "Belum ada menu";
    case "faq_accordion": return count("items", "pertanyaan") ?? "Belum ada pertanyaan";
    case "step_how_to_order": return count("steps", "langkah") ?? "Belum ada langkah";
    case "social_proof_reviews": return count("reviews", "ulasan") ?? "Belum ada ulasan";
    case "service_pricing_table": return count("tiers", "paket") ?? "Belum ada paket";
    case "team_members_grid": return count("members", "anggota") ?? "Belum ada anggota";
    case "event_schedule_list": return count("events", "acara") ?? "Belum ada acara";
    case "branch_locations_list": return count("branches", "cabang") ?? "Belum ada cabang";
    case "gallery_grid": return count("items", "foto") ?? "Belum ada foto";
    case "timeline_story": return count("milestones", "momen") ?? "Belum ada momen";
    case "hero_storefront": return typeof props.title === "string" && props.title ? String(props.title) : "Judul & tagline utama";
    default: return "Ketuk untuk mengisi";
  }
}

export function SectionList({ onAdd }: { onAdd?: () => void }) {
  const sections = useEditor((s) => s.config.sections);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const moveSection = useEditor((s) => s.moveSection);
  const removeSection = useEditor((s) => s.removeSection);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  // Stiker baru (dari katalog) dapat entrance uc-stick-in; stiker lama tidak.
  const knownIds = useRef<Set<string> | null>(null);
  const freshIds = new Set<string>();
  if (knownIds.current) {
    for (const s of sections) if (!knownIds.current.has(s.id)) freshIds.add(s.id);
  }
  useEffect(() => {
    knownIds.current = new Set(sections.map((s) => s.id));
  });

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
            className="mt-1 inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
          >
            Buka Lembar Modul
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-2" aria-label="Daftar section">
      {sections.map((section, index) => {
        const active = section.id === selectedId;
        const Icon = TYPE_ICON[section.type];
        return (
          <li
            key={section.id}
            ref={(el) => {
              if (!el) return;
              const idx = index;
              draggable({
                element: el,
                onDragStart: () => setDragIndex(idx),
                onDrop: () => {
                  setDragIndex(null);
                  setOverIndex(null);
                },
              });
              dropTargetForElements({
                element: el,
                onDragEnter: () => setOverIndex(idx),
                onDragLeave: () => setOverIndex((v) => (v === idx ? null : v)),
                onDrop: () => {
                  if (dragIndex !== null && dragIndex !== idx) moveSection(dragIndex, idx);
                  setDragIndex(null);
                  setOverIndex(null);
                },
              });
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
              className={`group flex cursor-grab touch-manipulation items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left transition-all duration-150 ease-out active:cursor-grabbing ${
                active
                  ? "translate-y-0 bg-signal-soft shadow-[0_6px_18px_-6px_rgb(154_52_18/0.35)]"
                  : "bg-card shadow-[0_1px_2px_rgb(35_28_16/0.05)] hover:bg-signal-soft/30"
              } ${overIndex === index && dragIndex !== null && dragIndex !== index ? "uc-cutline-active" : "uc-cutline"} ${freshIds.has(section.id) ? "uc-stick-in" : ""}`}
            >
              {/* Pegangan drag */}
              <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-ink-soft/50 transition-colors group-hover:text-ink-soft group-active:cursor-grabbing" strokeWidth={2.2} aria-hidden />
              {/* Ikon tipe */}
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${active ? "bg-signal/15 text-signal" : "bg-paper-deep/70 text-ink-soft"}`}
                aria-hidden
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className={`truncate text-sm font-semibold ${active ? "text-signal" : "text-ink"}`}>
                    {TYPE_LABEL[section.type]}
                  </span>
                  {EXTENDED.has(section.type) ? (
                    <span className="shrink-0 rounded-md bg-paper-deep/80 px-1 py-px text-[0.55rem] font-bold uppercase tracking-wide text-ink-soft/70">
                      opsional
                    </span>
                  ) : null}
                </span>
                <span className="block truncate text-xs text-ink-soft">{summarize(section)}</span>
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.id);
                }}
                aria-label={`Hapus ${TYPE_LABEL[section.type]}`}
                className="shrink-0 rounded-lg p-2 text-ink-soft/50 opacity-0 transition-opacity hover:bg-signal/10 hover:text-signal focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
              >
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                  <path d="m3 3 10 10M13 3 3 13" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
