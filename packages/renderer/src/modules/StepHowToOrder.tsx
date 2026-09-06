/**
 * Modul step_how_to_order — timeline cara pesan (COMPONENTS.md §M).
 * Mobile: timeline vertikal dengan konektor dashed. Desktop: grid horizontal
 * 2-4 kolom (mengikuti jumlah langkah) dengan konektor antar lingkaran nomor.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type StepHowToOrderProps = SectionProps<"step_how_to_order">;

export const stepsDefaults: StepHowToOrderProps = {
  section_title: "Cara Mudah Pesan",
  steps: [],
};

const CONNECTOR_COLOR =
  "border-[color-mix(in_oklab,var(--uc-primary)_35%,transparent)]";

/**
 * Sembunyikan konektor desktop pada item terakhir tiap baris grid
 * (agar tidak ada garis menggantung keluar baris). sm = 2 kolom, lg = 4 kolom.
 */
function desktopConnectorVisibility(count: number, index: number): string {
  if (count === 2 && index === 1) return "sm:hidden";
  if (count >= 4 && index % 2 === 1) {
    return index % 4 === 3 ? "sm:hidden" : "sm:hidden lg:block";
  }
  return "";
}

export function StepHowToOrder({ id, props }: { id: string; props: StepHowToOrderProps }) {
  const sorted = [...props.steps].sort((a, b) => a.step_number - b.step_number);
  const count = sorted.length;
  const colsClass =
    count >= 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : count === 3
        ? "sm:grid-cols-3"
        : count === 2
          ? "sm:grid-cols-2"
          : "sm:grid-cols-1";

  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      <ol className={`grid grid-cols-1 gap-6 ${colsClass}`}>
        {sorted.map((step, i) => {
          const isLast = i === count - 1;
          const connectorVisibility = desktopConnectorVisibility(count, i);
          return (
            <li key={`${step.step_number}-${step.title}`} className="relative pl-16 sm:pl-0">
              {/* Konektor mobile: vertikal di bawah lingkaran, menembus gap baris */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={`absolute -bottom-6 left-[calc(1.5rem-1px)] top-14 border-l-2 border-dashed sm:hidden ${CONNECTOR_COLOR}`}
                />
              ) : null}
              {/* Konektor desktop: horizontal dari lingkaran ke lingkaran berikutnya */}
              {!isLast ? (
                <span
                  aria-hidden
                  className={`absolute -right-6 left-[3.4rem] top-[calc(1.5rem-1px)] hidden border-t-2 border-dashed sm:block ${CONNECTOR_COLOR} ${connectorVisibility}`}
                />
              ) : null}
              <span
                aria-hidden
                className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--uc-primary)] font-[family-name:var(--uc-font-heading)] text-lg font-extrabold tabular-nums text-[var(--uc-on-primary)] shadow-[0_4px_14px_color-mix(in_oklab,var(--uc-primary)_40%,transparent)] sm:relative sm:inline-flex"
              >
                {step.step_number}
              </span>
              <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.02rem] font-bold leading-snug text-[var(--uc-ink)] sm:mt-4">
                {step.title}
              </h3>
              {step.description ? (
                <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
                  {step.description}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </SectionShell>
  );
}
