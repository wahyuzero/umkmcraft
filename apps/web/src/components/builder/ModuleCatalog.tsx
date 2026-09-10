"use client";

/**
 * ModuleCatalog — "lembar stiker" tempat memilih modul baru.
 * Signature moment: kartu modul = stiker die-cut; klik = menempel ke halaman.
 * Ada pencarian, focus trap dasar, dan fokus kembali ke pembuka saat ditutup.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Search, Star, X } from "lucide-react";
import type { SectionType } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";
import * as defaults from "@umkmcraft/renderer";
import { TYPE_ICON, TYPE_LABEL } from "./SectionList";

const CATALOG: Array<{ type: SectionType; desc: string; extended: boolean }> = [
  { type: "hero_storefront", desc: "Nama besar, tagline, foto, tombol WA", extended: false },
  { type: "product_catalog_wa", desc: "Grid produk dengan pesanan 1-klik", extended: false },
  { type: "promo_banner", desc: "Pengumuman, kupon, hitung mundur", extended: false },
  { type: "operating_hours_map", desc: "Status buka/tutup + rute maps", extended: false },
  { type: "social_proof_reviews", desc: "Testimoni asli + rating bintang", extended: false },
  { type: "channel_marketplace", desc: "Shopee, Tokopedia, GoFood, dll.", extended: false },
  { type: "faq_accordion", desc: "Pertanyaan umum akordeon", extended: false },
  { type: "contact_direct", desc: "Alamat, telepon, chat admin", extended: false },
  { type: "rich_text_block", desc: "Cerita usaha dengan markdown + foto", extended: false },
  { type: "gallery_grid", desc: "Portofolio foto + lightbox", extended: true },
  { type: "service_pricing_table", desc: "Paket layanan berjenjang", extended: true },
  { type: "trust_badges_strip", desc: "QRIS, kurir, Halal/BPOM/P-IRT", extended: true },
  { type: "step_how_to_order", desc: "Timeline langkah pemesanan", extended: true },
  { type: "stats_counter_strip", desc: "Angka pencapaian: pelanggan, tahun, rating", extended: true },
  { type: "value_props_grid", desc: "Grid keunggulan dengan ikon", extended: true },
  { type: "menu_price_list", desc: "Menu + harga ala restoran, tanpa foto", extended: true },
  { type: "product_spotlight", desc: "Sorotan 1 produk + harga + CTA", extended: true },
  { type: "cta_banner_full", desc: "Ajakan pesan besar penutup halaman", extended: true },
  { type: "team_members_grid", desc: "Foto/inisial + peran + bio kru", extended: true },
  { type: "timeline_story", desc: "Timeline sejarah usaha", extended: true },
  { type: "booking_whatsapp_form", desc: "Pilih layanan & jam → kirim ke WA", extended: true },
  { type: "event_schedule_list", desc: "Bazar, pop-up stand, event kota", extended: true },
  { type: "branch_locations_list", desc: "Outlet + rute maps + WA per cabang", extended: true },
  { type: "instagram_showcase_grid", desc: "Grid foto IG + tombol follow", extended: true },
  { type: "updates_blog_list", desc: "Berita, pengumuman, blog singkat", extended: true },
  { type: "download_catalog_cta", desc: "Unduh brosur/katalog lengkap", extended: true },
  { type: "qr_code_whatsapp", desc: "Scan kode → langsung chat", extended: true },
];

const DEFAULTS_KEY: Record<SectionType, string> = {
  hero_storefront: "heroDefaults",
  product_catalog_wa: "catalogDefaults",
  promo_banner: "promoDefaults",
  operating_hours_map: "hoursDefaults",
  social_proof_reviews: "reviewsDefaults",
  channel_marketplace: "channelsDefaults",
  faq_accordion: "faqDefaults",
  contact_direct: "contactDefaults",
  rich_text_block: "richTextDefaults",
  gallery_grid: "galleryDefaults",
  service_pricing_table: "pricingDefaults",
  trust_badges_strip: "trustDefaults",
  step_how_to_order: "stepsDefaults",
  stats_counter_strip: "statsDefaults",
  value_props_grid: "valuePropsDefaults",
  menu_price_list: "menuDefaults",
  product_spotlight: "spotlightDefaults",
  cta_banner_full: "ctaBannerDefaults",
  team_members_grid: "teamDefaults",
  timeline_story: "timelineDefaults",
  booking_whatsapp_form: "bookingDefaults",
  event_schedule_list: "eventsDefaults",
  branch_locations_list: "branchesDefaults",
  instagram_showcase_grid: "instagramDefaults",
  updates_blog_list: "updatesDefaults",
  download_catalog_cta: "downloadCtaDefaults",
  qr_code_whatsapp: "qrCodeDefaults",
};

export function ModuleCatalog({ onClose }: { onClose: () => void }) {
  const addSection = useEditor((s) => s.addSection);
  const sections = useEditor((s) => s.config.sections);
  const [query, setQuery] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  // Fokus kembali ke tombol pembuka sheet (dipanggil sekali saat unmount).
  const openerRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement | null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter((m) =>
      `${TYPE_LABEL[m.type]} ${m.desc}`.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    searchRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      // Focus trap dasar: Tab berputar di dalam dialog.
      if (e.key === "Tab" && dialogRef.current) {
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, [href], [tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    const opener = openerRef.current;
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [onClose]);

  function add(type: SectionType) {
    const defaultProps = (defaults as Record<string, unknown>)[DEFAULTS_KEY[type]!] as Record<string, unknown>;
    addSection(type, JSON.parse(JSON.stringify(defaultProps)));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Katalog modul"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="uc-stick-in max-h-[85dvh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-paper p-4 shadow-kemasan sm:p-6 sm:rounded-3xl sm:outline-3 sm:outline-signal/20"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-extrabold tracking-[-0.02em] text-ink sm:text-2xl">
              Lembar Stiker Modul
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Pilih blok, langsung menempel di bawah section yang sedang dipilih.
            </p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="shrink-0 rounded-xl p-2.5 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink">
            <X className="h-5 w-5" strokeWidth={2.2} aria-hidden />
          </button>
        </div>

        {/* Pencarian modul */}
        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" aria-hidden />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari modul, misal: menu, booking, QR"
            aria-label="Cari modul"
            className="min-h-11 w-full rounded-xl border border-cutline bg-card pl-9 pr-9 text-sm text-ink placeholder:text-ink-soft/60 focus:border-signal focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink"
            >
              <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            </button>
          ) : null}
        </div>

        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-cutline px-4 py-10 text-center">
            <p className="text-sm font-semibold text-ink">Tidak ketemu, kak</p>
            <p className="text-xs text-ink-soft">Coba kata kunci lain — misal "katalog" atau "jadwal".</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
            {results.map((m) => {
              const Icon = TYPE_ICON[m.type];
              const count = sections.filter((s) => s.type === m.type).length;
              return (
                <li key={m.type}>
                  <button
                    onClick={() => add(m.type)}
                    className="uc-cutline group relative flex h-full w-full flex-col rounded-2xl bg-card p-3 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-signal hover:shadow-[0_10px_24px_-10px_rgb(154_52_18/0.35)]"
                  >
                    {/* Penanda sudut starburst untuk modul opsional */}
                    {m.extended ? (
                      <span
                        className="uc-starburst absolute -right-1.5 -top-1.5 z-10 flex h-6 w-6 items-center justify-center bg-signal-soft"
                        title="Modul opsional"
                      >
                        <Star className="h-2.5 w-2.5 text-signal" fill="currentColor" aria-hidden />
                      </span>
                    ) : null}
                    <span className={`mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:bg-signal group-hover:text-white ${count > 0 ? "bg-signal/15 text-signal" : "bg-signal-soft text-signal"}`} aria-hidden>
                      <Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className="font-display text-[0.85rem] font-bold leading-snug text-ink group-hover:text-signal">
                      {TYPE_LABEL[m.type]}
                    </span>
                    <span className="mt-1 text-xs leading-relaxed text-ink-soft">{m.desc}</span>
                    {count > 0 ? (
                      <span className="mt-auto inline-flex items-center gap-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-live">
                        <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                        {count}× di halaman
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
