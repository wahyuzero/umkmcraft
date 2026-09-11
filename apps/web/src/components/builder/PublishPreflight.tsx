"use client";

/**
 * PublishPreflight — gerbang kualitas sebelum publish.
 * scanUnfinished() memindai config DI MEMORI (bukan versi tersimpan) untuk
 * penanda "belum selesai":
 *  - foto kosong (hero / item produk / item galeri / spotlight) — renderer
 *    melukis placeholder generik saat image_url "" (lihat SafeImage), jadi
 *    publik akan melihat foto contoh, bukan foto usaha;
 *  - angka stats_counter_strip yang persis default modul — replika
 *    isSampleStats() di packages/renderer/src/modules/StatsCounterStrip.tsx,
 *    dijalankan client-side di atas JSON config;
 *  - alamat + maps kosong padahal modul jam-operasional ada (deteksi andal:
 *    schema mem-default kedua field ke "").
 * PreflightCard: kartu peringatan inline di bawah tombol publish (BUKAN
 * modal) — kakak memilih "Perbaiki dulu" atau "Terbitkan saja".
 */
import { TriangleAlert, X } from "lucide-react";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

/** Nilai contoh stats_counter_strip — HARUS identik dengan `statsDefaults`
 *  di StatsCounterStrip.tsx (sumber kebenaran chip "Contoh angka"). Kalau
 *  default modul berubah, ubah di sini juga agar deteksi tetap persis. */
const SAMPLE_STATS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "500+", label: "Pelanggan Puas" },
  { value: "3 Thn", label: "Melayani" },
  { value: "4.9★", label: "Rating Pelanggan" },
];

function isSampleStats(stats: ReadonlyArray<{ value: string; label: string }>): boolean {
  return (
    stats.length === SAMPLE_STATS.length &&
    stats.every((s, i) => s.value === SAMPLE_STATS[i]!.value && s.label === SAMPLE_STATS[i]!.label)
  );
}

/** Kumpulkan kalimat peringatan dari config saat ini — hasil kosong = siap terbit. */
export function scanUnfinished(config: UmkmWebsiteConfig): string[] {
  const issues: string[] = [];

  let emptyPhotos = 0;
  for (const section of config.sections) {
    if (section.type === "hero_storefront" || section.type === "product_spotlight") {
      if (!section.props.image_url) emptyPhotos += 1;
    } else if (section.type === "product_catalog_wa") {
      emptyPhotos += section.props.products.filter((p) => !p.image_url).length;
    } else if (section.type === "gallery_grid") {
      emptyPhotos += section.props.items.filter((i) => !i.image_url).length;
    }
  }
  if (emptyPhotos > 0) {
    issues.push(`${emptyPhotos} foto masih kosong (tampil sebagai contoh)`);
  }

  const sampleStats = config.sections.some(
    (s) => s.type === "stats_counter_strip" && isSampleStats(s.props.stats),
  );
  if (sampleStats) {
    issues.push("Angka statistik masih contoh — bisa dianggap palsu oleh pembeli");
  }

  const noAddress = config.sections.some(
    (s) => s.type === "operating_hours_map" && !s.props.address && !s.props.gmaps_url,
  );
  if (noAddress) {
    issues.push("Alamat lokasi masih kosong — pembeli bisa bingung mencari tempatnya");
  }

  return issues;
}

interface PreflightCardProps {
  issues: string[];
  onFixFirst: () => void;
  onPublishAnyway: () => void;
  onDismiss: () => void;
}

export function PreflightCard({ issues, onFixFirst, onPublishAnyway, onDismiss }: PreflightCardProps) {
  return (
    <div
      role="alert"
      className="absolute right-0 top-full z-40 mt-2 w-[min(20rem,calc(100vw-2.5rem))] rounded-2xl border border-cutline bg-card p-4 shadow-kemasan"
    >
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup peringatan"
        className="absolute right-1 top-1 flex h-11 w-11 items-center justify-center rounded-xl text-ink-soft transition-colors duration-200 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
      >
        <X aria-hidden className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-2.5 pr-11">
        <TriangleAlert aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
        <p className="font-display text-sm font-bold text-ink">Sebelum terbit, cek dulu ya</p>
      </div>
      {/* Bullet rata dengan teks judul: lebar ikon (1.25rem) + gap (0.625rem) */}
      <ul className="mt-2 flex list-disc flex-col gap-1.5 pl-[1.875rem] text-sm leading-snug text-ink-soft marker:text-cutline">
        {issues.map((issue) => (
          <li key={issue}>{issue}</li>
        ))}
      </ul>
      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onFixFirst}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-cutline bg-paper px-3 text-sm font-bold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Perbaiki dulu
        </button>
        <button
          type="button"
          onClick={onPublishAnyway}
          className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-signal px-3 text-sm font-bold text-card shadow-plate transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          Terbitkan saja
        </button>
      </div>
    </div>
  );
}
