/**
 * Modul promo_banner — COMPONENTS.md §2.
 * Band promo menarik: kartu rounded-3xl sapuan primary + tekstur garis CSS-murni,
 * ikon megafon, pesan promo besar-tebal, diskon bergaya splash, kode kupon gaya
 * "tiket" (island salin) + hitung mundur chip gelap (island timer).
 * RSC — JS client hanya dari dua island.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { CopyCoupon } from "../client/CopyCoupon";
import { PromoTimer } from "../client/PromoTimer";

export type PromoBannerProps = SectionProps<"promo_banner">;

export const promoDefaults: PromoBannerProps = {
  message: "Promo spesial minggu ini — jangan sampai kelewat!",
};

function MegaphoneIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M3 10.5v3A1.5 1.5 0 0 0 4.5 15H6l3.8 3.8a.9.9 0 0 0 1.5-.64V5.84a.9.9 0 0 0-1.5-.64L6 9H4.5A1.5 1.5 0 0 0 3 10.5Z" />
      <path d="M15 9.5c1 .9 1 4.1 0 5" />
      <path d="M18 7c2.2 2.4 2.2 7.6 0 10" />
    </svg>
  );
}

export function PromoBanner({ id, props }: { id: string; props: PromoBannerProps }) {
  return (
    <section id={id} className="bg-[var(--uc-bg)] px-5 py-10 sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        {/* Band promo: sapuan primary + tekstur garis (CSS murni), memudar diagonal */}
        <div className="relative overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--uc-primary)_20%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_7%,var(--uc-surface))] shadow-[0_10px_34px_-18px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]">
          <div
            aria-hidden
            className="uc-pattern-lines pointer-events-none absolute inset-0 [mask-image:linear-gradient(115deg,black,transparent_65%)]"
          />
          <div className="relative flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex items-start gap-4 sm:items-center">
              <span
                aria-hidden
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)] shadow-[0_6px_16px_-6px_color-mix(in_oklab,var(--uc-primary)_60%,transparent)]"
              >
                <MegaphoneIcon className="h-6 w-6" />
              </span>
              <div className="min-w-0">
                <p className="font-[family-name:var(--uc-font-heading)] text-[1.15rem] font-extrabold leading-snug tracking-[-0.01em] text-[var(--uc-ink)] sm:text-2xl">
                  {props.message}
                </p>
                {props.discount_text ? (
                  <p className="mt-2.5">
                    <span className="inline-block -rotate-1 rounded-lg bg-[color-mix(in_oklab,var(--uc-secondary)_16%,transparent)] px-2.5 py-1 font-[family-name:var(--uc-font-heading)] text-xl font-extrabold tabular-nums tracking-tight text-[var(--uc-secondary)] sm:text-2xl">
                      {props.discount_text}
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
            {props.coupon_code || props.ends_at ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-[color-mix(in_oklab,var(--uc-primary)_16%,transparent)] pt-4">
                {props.coupon_code ? <CopyCoupon code={props.coupon_code} /> : null}
                {props.ends_at ? <PromoTimer endsAt={props.ends_at} /> : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
