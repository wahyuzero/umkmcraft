/**
 * Modul step_how_to_order — langkah cara pesan (COMPONENTS.md §M).
 * Timeline vertikal satu kolom: lingkaran nomor primary + konektor dashed
 * (border-l dashed di posisi absolut), judul tebal + deskripsi ink-70.
 * Skema props tidak punya CTA — modul murni informasi, RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type StepHowToOrderProps = SectionProps<"step_how_to_order">;

export const stepsDefaults: StepHowToOrderProps = {
  section_title: "Cara Mudah Pesan",
  steps: [],
};

export function StepHowToOrder({ id, props }: { id: string; props: StepHowToOrderProps }) {
  const sorted = [...props.steps].sort((a, b) => a.step_number - b.step_number);
  const count = sorted.length;

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      <ol className="flex flex-col gap-8">
        {sorted.map((step, i) => {
          const isLast = i === count - 1;
          return (
            <li key={`${step.step_number}-${step.title}`} className="relative flex gap-4 sm:gap-5">
              {/* Konektor dashed: dari bawah lingkaran menembus gap ke langkah berikutnya */}
              {!isLast ? (
                <span
                  aria-hidden
                  className="absolute -bottom-8 left-[calc(1.375rem-1px)] top-14 border-l-2 border-dashed border-[color-mix(in_oklab,var(--uc-primary)_35%,transparent)]"
                />
              ) : null}
              <span
                aria-hidden
                className="relative z-10 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--uc-primary)] font-[family-name:var(--uc-font-heading)] text-lg font-extrabold tabular-nums text-[var(--uc-on-primary-text)] shadow-[0_4px_14px_color-mix(in_oklab,var(--uc-primary)_35%,transparent)]"
              >
                {step.step_number}
              </span>
              <div className="min-w-0 pt-1.5">
                <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.02rem] font-bold leading-snug text-[var(--uc-ink)]">
                  {step.title}
                </h3>
                {step.description ? (
                  <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
                    {step.description}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
