/**
 * Modul stats_counter_strip — band angka pencapaian (TEMPLATE_RESEARCH §4).
 * Referensi pola: Baker counts, Arsha stats, Mobirise counters.
 * Band full-width bertekstur `.uc-pattern-dots` (CSS murni, tanpa kartu):
 * angka display besar (font heading, tabular) + label kecil di bawah.
 * Nilai berupa teks bebas ("500+", "4.9★") — tanpa animasi hitung agar tetap RSC murni.
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

export function StatsCounterStrip({ id, props }: { id: string; props: StatsCounterStripProps }) {
  const cols =
    props.stats.length >= 4
      ? "grid-cols-2 sm:grid-cols-4"
      : props.stats.length === 3
        ? "grid-cols-2 sm:grid-cols-3 [&>*:last-child]:col-span-2 sm:[&>*:last-child]:col-span-1"
        : "grid-cols-1 sm:grid-cols-1";

  return (
    <section id={id} className="uc-reveal relative scroll-mt-4 overflow-hidden bg-[color-mix(in_oklab,var(--uc-primary)_5%,var(--uc-bg))] px-5 py-12 sm:px-8 sm:py-14">
      {/* Tekstur titik halus — identitas craft, di belakang konten */}
      <div aria-hidden className="uc-pattern-dots pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto w-full max-w-3xl">
        {props.section_title ? <SectionHeader title={props.section_title} /> : null}
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
