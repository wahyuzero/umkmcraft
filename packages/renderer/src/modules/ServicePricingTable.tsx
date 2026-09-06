/**
 * Modul service_pricing_table — kartu paket harga berjenjang (COMPONENTS.md §K).
 * Tier is_popular: border primary + badge starburst SVG "Paling Populer".
 * CTA per tier mengenerate link WhatsApp order dengan harga terformat Rupiah.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppOrderLink, formatRupiah } from "@umkmcraft/utils";
import { SectionHeader, SectionShell, WaButton } from "../primitives";

export type ServicePricingTableProps = SectionProps<"service_pricing_table">;

export const pricingDefaults: ServicePricingTableProps = {
  section_title: "Daftar Harga Layanan",
  section_subtitle: "Pilih paket yang pas — semua pesanan dikonfirmasi lewat WhatsApp.",
  tiers: [],
};

/* Path starburst deterministik (12 titik, ellipse) — digambar, bukan gambar. */
function starburstPath(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  irx: number,
  iry: number,
  points: number,
): string {
  let d = "";
  for (let i = 0; i < points * 2; i += 1) {
    const outer = i % 2 === 0;
    const angle = (Math.PI * i) / points - Math.PI / 2;
    const x = cx + (outer ? rx : irx) * Math.cos(angle);
    const y = cy + (outer ? ry : iry) * Math.sin(angle);
    d += `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
  }
  return `${d}Z`;
}

const POPULAR_BURST = starburstPath(48, 16, 46.5, 15.5, 41, 11.5, 12);

function PopularBadge() {
  return (
    <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
      <svg viewBox="0 0 96 32" className="h-8 w-24 drop-shadow-sm" role="img" aria-label="Paling Populer">
        <path d={POPULAR_BURST} fill="var(--uc-secondary)" />
        <text
          x="48"
          y="16.5"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="11"
          fontWeight="800"
          letterSpacing="0.02em"
          fill="#ffffff"
        >
          Paling Populer
        </text>
      </svg>
    </span>
  );
}

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
      <ul className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {props.tiers.map((tier) => {
          const popular = tier.is_popular;
          return (
            <li
              key={tier.id}
              className={`relative flex flex-col rounded-2xl bg-[var(--uc-surface)] p-6 transition-[transform,box-shadow] duration-200 ease-out ${
                popular
                  ? "border-2 border-[var(--uc-primary)] pt-7 shadow-[0_16px_38px_-16px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]"
                  : "border border-[color-mix(in_oklab,var(--uc-ink)_10%,transparent)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] hover:-translate-y-1 hover:shadow-[0_12px_28px_-14px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)]"
              }`}
            >
              {popular ? <PopularBadge /> : null}
              <h3 className="font-[family-name:var(--uc-font-heading)] text-lg font-extrabold leading-snug text-[var(--uc-ink)]">
                {tier.name}
              </h3>
              <div className="mt-3 flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
                <span className="text-[1.65rem] font-extrabold leading-none tabular-nums text-[var(--uc-primary)]">
                  {formatRupiah(tier.price)}
                </span>
                {tier.unit ? (
                  <span className="text-xs font-semibold text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
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
                <WaButton
                  full
                  href={createWhatsAppOrderLink(whatsappNumber, tier.name, tier.price, businessName)}
                >
                  {tier.cta_label}
                </WaButton>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
