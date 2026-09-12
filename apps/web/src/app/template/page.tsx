import type { Metadata } from "next";
import Link from "next/link";
import { listTemplates } from "@umkmcraft/templates";
import TemplateGallery, { type TemplateCard } from "@/components/template/TemplateGallery";

// cacheComponents (Next 16): route dinamis deklarasikan strateginya secara
// eksplisit — pola yang sama dengan /sites/[...path] dan /editor/[siteId].
export const instant = false;

export const metadata: Metadata = {
  // absolute: layout root membungkus title dengan template "%s | UMKM Craft" —
  // tanpa absolute, judul jadi "… — UMKM Craft | UMKM Craft" (dobel).
  title: { absolute: "Template siap pakai — UMKM Craft" },
  description:
    "Delapan contoh situs UMKM siap pakai — warung makan, kafe, barbershop, laundry, toko kue, bengkel, fashion, sampai jasa percetakan. Pratinjau, lalu pakai untuk bisnismu.",
};

/**
 * /template — galeri katalog template siap pakai (server component).
 * TemplateDefinition hidup di @umkmcraft/templates; halaman ini HANYA
 * memproyeksikan kartu serializable (string saja) ke client component —
 * config lengkap tidak dikirim ke galeri, ia hanya dirender di
 * /template/[id]. Ini halaman publik builder: tanpa noindex.
 */
export default function TemplateCatalogPage() {
  const cards: TemplateCard[] = listTemplates().map((t) => ({
    id: t.id,
    category: t.category,
    label: t.label,
    description: t.description,
    name: t.config.meta.business_name,
    primary: t.config.meta.theme.primary_color,
    background: t.config.meta.theme.background_color,
  }));

  return (
    <main className="min-h-dvh bg-paper">
      {/* Header sederhana: merek (tautan kembali ke "/") + jalan pintas ke alur chat */}
      <header className="sticky top-0 z-40 border-b border-cutline/70 bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
              U
            </span>
            <span className="font-display text-base font-bold tracking-tight text-ink sm:text-lg">
              UMKM Craft
            </span>
          </Link>
          <Link
            href="/start"
            className="flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Mulai dari chat
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-8 sm:pt-14">
        <p className="uc-ruler mb-6 h-[5px] w-24" aria-hidden />
        <h1 className="text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
          Pilih template siap pakai
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft">
          Situs contoh dengan menu, harga, dan jam buka yang masuk akal. Kakak tinggal ganti nama, foto, dan harga.
        </p>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-8">
        <TemplateGallery cards={cards} />
      </div>
    </main>
  );
}
