"use client";

/**
 * SectionList — lembar stiker dengan drag-and-drop reorder.
 * pragmatic-drag-and-drop (React 19-ready): draggable + dropTarget per kartu.
 * State aktif = wash amber + lift (depth-as-state), bukan border tambahan.
 */
import { useEffect, useRef, useState } from "react";
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/adapter/element-adapter";
import { useEditor } from "@/lib/editor-store";
import type { SectionType } from "@umkmcraft/schema";

const TYPE_LABEL: Record<SectionType, string> = {
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

export function SectionList() {
  const sections = useEditor((s) => s.config.sections);
  const selectedId = useEditor((s) => s.selectedId);
  const select = useEditor((s) => s.select);
  const moveSection = useEditor((s) => s.moveSection);
  const removeSection = useEditor((s) => s.removeSection);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  return (
    <ul className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-4 py-2" aria-label="Daftar section">
      {sections.map((section, index) => {
        const active = section.id === selectedId;
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
              className={`group flex cursor-grab items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-150 ease-out active:cursor-grabbing ${
                active
                  ? "translate-y-0 bg-signal-soft shadow-[0_6px_18px_-6px_rgb(154_52_18/0.35)]"
                  : "bg-card shadow-[0_1px_2px_rgb(35_28_16/0.05)] hover:bg-signal-soft/30"
              } ${overIndex === index && dragIndex !== null && dragIndex !== index ? "uc-cutline-active" : "uc-cutline"}`}
            >
              {/* Pegangan drag */}
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0 text-ink-soft/50" fill="currentColor" aria-hidden>
                <circle cx="5" cy="3" r="1.4" /><circle cx="11" cy="3" r="1.4" />
                <circle cx="5" cy="8" r="1.4" /><circle cx="11" cy="8" r="1.4" />
                <circle cx="5" cy="13" r="1.4" /><circle cx="11" cy="13" r="1.4" />
              </svg>
              <span className="min-w-0 flex-1">
                <span className={`block truncate text-sm font-semibold ${active ? "text-signal" : "text-ink"}`}>
                  {TYPE_LABEL[section.type]}
                </span>
                {EXTENDED.has(section.type) ? (
                  <span className="text-[0.65rem] font-medium uppercase tracking-wide text-ink-soft/60">
                    modul opsional
                  </span>
                ) : null}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeSection(section.id);
                }}
                aria-label={`Hapus ${TYPE_LABEL[section.type]}`}
                className="shrink-0 rounded-lg p-1.5 text-ink-soft/50 opacity-0 transition-opacity hover:bg-signal/10 hover:text-signal focus-visible:opacity-100 group-hover:opacity-100"
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
