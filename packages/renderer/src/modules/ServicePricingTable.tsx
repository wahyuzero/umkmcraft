/**
 * Modul service_pricing_table — kartu paket harga berjenjang (COMPONENTS.md §K).
 * Tier is_popular: border primary 2px + chip "Terpopuler" menumpuk di atas kartu
 * + angkat halus. CTA: tier populer = primary penuh, tier lain = outline.
 * CTA per tier mengenerate link WhatsApp order dengan harga terformat Rupiah.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppOrderLink, formatRupiah } from "@umkmcraft/utils";
import { SectionHeader, SectionShell, WaButton, WaIcon } from "../primitives";
import { TrackedLink } from "../client/TrackedLink";

export type ServicePricingTableProps = SectionProps<"service_pricing_table">;

export const pricingDefaults: ServicePricingTableProps = {
  section_title: "Daftar Harga Layanan",
  section_subtitle: "Pilih paket yang pas — semua pesanan dikonfirmasi lewat WhatsApp.",
  tiers: [],
};

const ClockIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="h-4 w-4 shrink-0 text-[var(--uc-primary)]"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
);

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-primary)]"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
);

export function ServicePricingTable({
  id,
  props,
  businessName,
  whatsappNumber,
  category = "",
}: {
  id: string;
  props: ServicePricingTableProps;
  businessName: string;
  whatsappNumber: string;
  /** Diseragamkan dengan modul lain; pricing tidak memakai foto placeholder. */
  category?: string;
}) {
  void category;
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
        {props.tiers.map((tier) => {
          const popular = tier.is_popular;
          const waHref = createWhatsAppOrderLink(whatsappNumber, tier.name, tier.price, businessName);
          return (
            <li
              key={tier.id}
              className={`relative flex flex-col rounded-2xl bg-[var(--uc-surface)] p-6 transition-[transform,box-shadow] duration-200 ease-out ${
                popular
                  ? "z-[1] border-2 border-[var(--uc-primary)] pt-8 shadow-[0_16px_38px_-16px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] sm:-translate-y-1.5"
                  : "border border-[color-mix(in_oklab,var(--uc-ink)_10%,transparent)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] hover:-translate-y-1 hover:shadow-[0_12px_28px_-14px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)]"
              }`}
            >
              {popular ? (
                <span
                  className="absolute -top-3.5 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--uc-primary)] px-3.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--uc-on-primary-text)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_40%,transparent)]"
                >
                  Terpopuler
                </span>
              ) : null}
              <h3 className="font-[family-name:var(--uc-font-heading)] text-lg font-extrabold leading-snug text-[var(--uc-ink)]">
                {tier.name}
              </h3>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                <span className="text-[1.65rem] font-extrabold leading-none tabular-nums tracking-[-0.01em] text-[var(--uc-primary)]">
                  {formatRupiah(tier.price)}
                </span>
                {tier.unit ? (
                  <span className="text-xs font-semibold text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
                    / {tier.unit}
                  </span>
                ) : null}
              </div>
              {tier.duration ? (
                <p className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-semibold text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]">
                  <ClockIcon />
                  {tier.duration}
                </p>
              ) : null}
              {tier.features.length > 0 ? (
                <ul className="mt-4 space-y-2.5 border-t border-dashed border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] pt-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <CheckIcon />
                      <span className="text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_80%,transparent)]">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="mt-auto pt-5">
                {popular ? (
                  <WaButton full href={waHref}>
                    {tier.cta_label}
                  </WaButton>
                ) : (
                  <TrackedLink
                    href={waHref}
                    event="wa_click"
                    className="group inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_35%,transparent)] px-3.5 py-2.5 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 ease-out hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                  >
                    <WaIcon className="h-[1.15em] w-[1.15em] shrink-0" />
                    {tier.cta_label}
                  </TrackedLink>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
