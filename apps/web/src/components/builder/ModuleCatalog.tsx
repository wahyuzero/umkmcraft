"use client";

/**
 * ModuleCatalog — "lembar stiker" tempat memilih modul baru.
 * Signature moment: kartu modul = stiker die-cut; klik = menempel ke halaman.
 */
import { useEffect, useRef } from "react";
import type { SectionType } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";
import * as defaults from "@umkmcraft/renderer";

const CATALOG: Array<{ type: SectionType; label: string; desc: string; extended: boolean }> = [
  { type: "hero_storefront", label: "Hero / Etalase", desc: "Nama besar, tagline, foto, tombol WA", extended: false },
  { type: "product_catalog_wa", label: "Katalog + WhatsApp", desc: "Grid produk dengan pesanan 1-klik", extended: false },
  { type: "promo_banner", label: "Banner Promo", desc: "Pengumuman, kupon, hitung mundur", extended: false },
  { type: "operating_hours_map", label: "Jam Buka & Peta", desc: "Status buka/tutup + rute maps", extended: false },
  { type: "social_proof_reviews", label: "Ulasan Pembeli", desc: "Testimoni asli + rating bintang", extended: false },
  { type: "channel_marketplace", label: "Marketplace Hub", desc: "Shopee, Tokopedia, GoFood, dll.", extended: false },
  { type: "faq_accordion", label: "FAQ", desc: "Pertanyaan umum akordeon", extended: false },
  { type: "contact_direct", label: "Kontak", desc: "Alamat, telepon, chat admin", extended: false },
  { type: "rich_text_block", label: "Teks Bebas", desc: "Cerita usaha dengan markdown + foto", extended: false },
  { type: "gallery_grid", label: "Galeri", desc: "Portofolio foto + lightbox", extended: true },
  { type: "service_pricing_table", label: "Tabel Harga", desc: "Paket layanan berjenjang", extended: true },
  { type: "trust_badges_strip", label: "Badge Kepercayaan", desc: "QRIS, kurir, Halal/BPOM/P-IRT", extended: true },
  { type: "step_how_to_order", label: "Cara Pesan", desc: "Timeline langkah pemesanan", extended: true },
  { type: "stats_counter_strip", label: "Statistik", desc: "Angka pencapaian: pelanggan, tahun, rating", extended: true },
  { type: "value_props_grid", label: "Kenapa Pilih Kami", desc: "Grid keunggulan dengan ikon", extended: true },
  { type: "menu_price_list", label: "Daftar Menu", desc: "Menu + harga ala restoran, tanpa foto", extended: true },
  { type: "product_spotlight", label: "Produk Unggulan", desc: "Sorotan 1 produk + harga + CTA", extended: true },
  { type: "cta_banner_full", label: "Band CTA", desc: "Ajakan pesan besar penutup halaman", extended: true },
  { type: "team_members_grid", label: "Tim Kami", desc: "Foto/inisial + peran + bio kru", extended: true },
  { type: "timeline_story", label: "Cerita & Perjalanan", desc: "Timeline sejarah usaha", extended: true },
  { type: "booking_whatsapp_form", label: "Form Booking", desc: "Pilih layanan & jam → kirim ke WA", extended: true },
  { type: "event_schedule_list", label: "Jadwal Acara", desc: "Bazar, pop-up stand, event kota", extended: true },
  { type: "branch_locations_list", label: "Daftar Cabang", desc: "Outlet + rute maps + WA per cabang", extended: true },
  { type: "instagram_showcase_grid", label: "Instagram Showcase", desc: "Grid foto IG + tombol follow", extended: true },
  { type: "updates_blog_list", label: "Info & Kabar", desc: "Berita, pengumuman, blog singkat", extended: true },
  { type: "download_catalog_cta", label: "Katalog PDF", desc: "Unduh brosur/katalog lengkap", extended: true },
  { type: "qr_code_whatsapp", label: "QR WhatsApp", desc: "Scan kode → langsung chat", extended: true },
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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function add(type: SectionType) {
    const defaultProps = (defaults as Record<string, unknown>)[DEFAULTS_KEY[type]!] as Record<string, unknown>;
    addSection(type, JSON.parse(JSON.stringify(defaultProps)));
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-6" onClick={onClose} role="presentation">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Katalog modul"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="uc-stick-in max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-paper p-6 shadow-kemasan sm:rounded-3xl sm:outline-3 sm:outline-signal/20"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-[-0.02em] text-ink">
              Lembar Stiker Modul
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Pilih blok, langsung menempel di bawah section yang sedang dipilih.
            </p>
          </div>
          <button onClick={onClose} aria-label="Tutup" className="rounded-xl p-2 text-ink-soft transition-colors hover:bg-paper-deep hover:text-ink">
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {CATALOG.map((m) => {
            const count = sections.filter((s) => s.type === m.type).length;
            return (
              <li key={m.type}>
                <button
                  onClick={() => add(m.type)}
                  className="uc-cutline group relative w-full rounded-2xl bg-card p-4 text-left transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-signal hover:shadow-[0_10px_24px_-10px_rgb(154_52_18/0.35)]"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-[0.95rem] font-bold text-ink group-hover:text-signal">
                      {m.label}
                    </h3>
                    {m.extended ? (
                      <span className="uc-starburst shrink-0 bg-signal-soft px-2 py-1.5 text-[0.55rem] font-extrabold uppercase tracking-wide text-signal">
                        Opsional
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{m.desc}</p>
                  {count > 0 ? (
                    <p className="mt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-live">
                      ✓ {count}× di halaman
                    </p>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
