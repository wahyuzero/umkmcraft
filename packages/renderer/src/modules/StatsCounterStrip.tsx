/**
 * Modul stats_counter_strip — band angka pencapaian (TEMPLATE_RESEARCH §4).
 * Referensi pola: Baker counts, Arsha stats, Mobirise counters.
 * Band full-width bertekstur `.uc-pattern-dots` (CSS murni, tanpa kartu):
 * angka display besar (font heading, tabular) + label kecil di bawah.
 * Nilai berupa teks bebas ("500+", "4.9★") — tanpa animasi hitung agar tetap RSC murni.
 * Bila angka masih persis default contoh modul, strip diberi chip "Contoh angka"
 * (pola kejujuran social_proof_reviews) agar klaim template tidak dianggap data asli.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader } from "../primitives";

export type StatsCounterStripProps = SectionProps<"stats_counter_strip">;

export const statsDefaults: StatsCounterStripProps = {
  section_title: "",
  stats: [
    { value: "500+", label: "Pelanggan Puas" },
    { value: "3 Thn", label: "Melayani" },
    { value: "4.9★", label: "Rating Pelanggan" },
  ],
};

/**
 * Angka contoh yang BELUM diganti (persis default modul) wajib berlabel jujur —
 * pola sama dengan SampleChip di social_proof_reviews. Tanpa ini, AI bisa
 * mengirim klaim besar ("12.000+ Pelanggan") yang sebenarnya masih template.
 */
function isSampleStats(stats: StatsCounterStripProps["stats"]): boolean {
  const sample = statsDefaults.stats;
  return (
    stats.length === sample.length &&
    stats.every((s, i) => s.value === sample[i]!.value && s.label === sample[i]!.label)
  );
}

/** Chip "Contoh" — label kejujuran, visual identik dengan SocialProofReviews. */
function SampleChip() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[color-mix(in_oklab,var(--uc-secondary)_55%,transparent)] bg-[color-mix(in_oklab,var(--uc-secondary)_8%,transparent)] px-2.5 py-1 text-xs font-bold text-[var(--uc-secondary-text)]">
      Contoh angka
    </span>
  );
}

export function StatsCounterStrip({ id, props }: { id: string; props: StatsCounterStripProps }) {
  const cols =
    props.stats.length >= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : props.stats.length === 3
        ? "grid-cols-2 sm:grid-cols-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1"
        : "grid-cols-1 sm:grid-cols-1";
  const isSample = isSampleStats(props.stats);

  return (
    <section id={id} className="uc-reveal relative scroll-mt-4 overflow-hidden bg-[color-mix(in_oklab,var(--uc-primary)_5%,var(--uc-bg))] px-5 py-12 sm:px-8 sm:py-14">
      {/* Tekstur titik halus — identitas craft, di belakang konten */}
      <div aria-hidden className="uc-pattern-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-3xl">
        {props.section_title ? <SectionHeader title={props.section_title} /> : null}
        {isSample ? (
          <div className="mb-6 flex justify-center">
            <SampleChip />
          </div>
        ) : null}
        <dl className={`grid gap-x-4 gap-y-8 ${cols}`}>
          {props.stats.map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-2 text-center">
              <dd className="font-[family-name:var(--uc-font-heading)] text-[2.1rem] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-[var(--uc-primary)] sm:text-[2.6rem]">
                {stat.value}
              </dd>
              <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
                {stat.label}
              </dt>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
