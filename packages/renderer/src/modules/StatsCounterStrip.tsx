/**
 * Modul stats_counter_strip — baris angka pencapaian (TEMPLATE_RESEARCH §4).
 * Referensi pola: Baker counts, Arsha stats, Mobirise counters.
 * Nilai berupa teks bebas ("500+", "4.9★") — tanpa animasi hitung agar tetap RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

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
  return (
    <SectionShell id={id} className="!py-10">
      {props.section_title ? <SectionHeader title={props.section_title} /> : null}
      <dl
        className={`grid gap-4 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-6 sm:p-8 ${
          props.stats.length >= 4 ? "grid-cols-2 lg:grid-cols-4" : props.stats.length === 3 ? "grid-cols-3" : "grid-cols-1"
        }`}
      >
        {props.stats.map((stat, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5 text-center">
            <dd className="font-[family-name:var(--uc-font-heading)] text-[1.9rem] font-extrabold leading-none tracking-[-0.02em] tabular-nums text-[var(--uc-primary)] sm:text-4xl">
              {stat.value}
            </dd>
            <dt className="text-xs font-bold uppercase tracking-[0.08em] text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
              {stat.label}
            </dt>
          </div>
        ))}
      </dl>
    </SectionShell>
  );
}
