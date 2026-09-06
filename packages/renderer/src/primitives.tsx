/**
 * Primitives renderer — pondasi visual semua modul.
 * World tenant: warm Indonesian commerce, WhatsApp-native (COMPONENTS.md).
 * Kontras WCAG AA, fokus keyboard terlihat, tanpa kicker/eyebrow (craft floor).
 */
import type { ReactNode } from "react";
import { formatRupiah } from "@umkmcraft/utils";
import { TrackedLink } from "./client/TrackedLink";

/* ---------------------------------------------------------------- */
/* SectionShell — pembungkus section dengan ritme vertikal konsisten */
/* ---------------------------------------------------------------- */

export function SectionShell({
  id,
  children,
  tone = "bg",
  className = "",
}: {
  id: string;
  children: ReactNode;
  tone?: "bg" | "surface";
  className?: string;
}) {
  const bg = tone === "surface" ? "bg-[var(--uc-surface)]" : "bg-[var(--uc-bg)]";
  return (
    <section id={id} className={`${bg} px-5 py-14 sm:px-8 sm:py-16 ${className}`}>
      <div className="mx-auto w-full max-w-3xl">{children}</div>
    </section>
  );
}

/* ---------------------------------------------------------------- */
/* SectionHeader — judul + subjudul. Tanpa eyebrow. Spasi: atas > bawah */
/* ---------------------------------------------------------------- */

export function SectionHeader({
  title,
  subtitle,
  align = "center",
}: {
  title?: string;
  subtitle?: string;
  align?: "center" | "left";
}) {
  if (!title && !subtitle) return null;
  return (
    <div className={`${align === "center" ? "text-center" : "text-left"} mb-8`}>
      {title ? (
        <h2 className="font-[family-name:var(--uc-font-heading)] text-[1.65rem] font-extrabold leading-tight tracking-[-0.02em] text-[var(--uc-ink)] sm:text-3xl">
          {title}
        </h2>
      ) : null}
      {subtitle ? (
        <p className="mt-3 text-[0.95rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)]">
          {subtitle}
        </p>
      ) : null}
      {title ? (
        <div
          aria-hidden
          className={`mt-4 h-1.5 w-14 rounded-full bg-[var(--uc-primary)] ${align === "center" ? "mx-auto" : ""}`}
        />
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* WaButton — CTA WhatsApp. Hover glow halus (COMPONENTS.md §2.A)    */
/* ---------------------------------------------------------------- */

export function WaButton({
  href,
  children,
  productId,
  size = "md",
  full = false,
}: {
  href: string;
  children: ReactNode;
  productId?: string;
  size?: "md" | "lg";
  full?: boolean;
}) {
  const pad = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-3 text-sm";
  return (
    <TrackedLink
      href={href}
      event={productId ? "wa_product_click" : "wa_click"}
      productId={productId}
      className={`group inline-flex items-center justify-center gap-2 rounded-2xl ${pad} font-semibold shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${full ? "w-full" : ""} bg-[var(--uc-primary)] text-[var(--uc-on-primary)]`}
    >
      <WaIcon className="h-[1.15em] w-[1.15em] shrink-0" />
      <span>{children}</span>
    </TrackedLink>
  );
}

/* ---------------------------------------------------------------- */
/* Ikon WhatsApp — SVG resmi geometris (bukan emoji)                 */
/* ---------------------------------------------------------------- */

export function WaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.85 9.85 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23Zm4.52-6.16c-.25-.13-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.14.16-.29.18-.54.06-.25-.13-1.05-.39-2-1.23-.73-.66-1.23-1.47-1.38-1.72-.14-.24-.01-.38.11-.5.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.13-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.6.19 1.14.16 1.57.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* PriceTag — harga Rupiah + harga coret                             */
/* ---------------------------------------------------------------- */

export function PriceTag({ price, original }: { price: number; original?: number }) {
  const hasDiscount = typeof original === "number" && original > price && price > 0;
  const pct = hasDiscount ? Math.round(((original! - price) / original!) * 100) : 0;
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className="text-[1.05rem] font-bold tabular-nums text-[var(--uc-primary)]">
        {formatRupiah(price)}
      </span>
      {hasDiscount ? (
        <>
          <span className="text-xs tabular-nums text-[color-mix(in_oklab,var(--uc-ink)_45%,transparent)] line-through">
            {formatRupiah(original!)}
          </span>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--uc-secondary)_12%,transparent)] px-1.5 py-0.5 text-[0.65rem] font-bold tabular-nums text-[var(--uc-secondary)]">
            -{pct}%
          </span>
        </>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* PillBadge — pill keunggulan (Halal, Ready Stock, dll)             */
/* ---------------------------------------------------------------- */

export function PillBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--uc-primary)_25%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_8%,var(--uc-surface))] px-3 py-1.5 text-xs font-semibold text-[var(--uc-ink)]">
      <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-[var(--uc-primary)]" />
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* PlaceholderImage — fail-safe elegan (kontrak §6 lapis 3)          */
/* SVG geometris deterministik per kategori — bukan ilustrasi palsu  */
/* ---------------------------------------------------------------- */

const PLACEHOLDER_TONES: Record<string, [string, string]> = {
  kuliner: ["#f59e0b", "#b45309"],
  barbershop: ["#334155", "#0ea5e9"],
  fashion: ["#fb7185", "#be123c"],
  bengkel: ["#3b82f6", "#1e40af"],
  laundry: ["#34d399", "#047857"],
  default: ["#a8a29e", "#57534e"],
};

function tonesFor(category: string): [string, string] {
  const c = category.toLowerCase();
  for (const [key, tones] of Object.entries(PLACEHOLDER_TONES)) {
    if (key !== "default" && c.includes(key)) return tones;
  }
  return PLACEHOLDER_TONES.default!;
}

export function PlaceholderImage({
  label,
  category = "",
  aspect = "aspect-[4/3]",
  seed = 0,
  className = "",
}: {
  label: string;
  category?: string;
  aspect?: string;
  seed?: number;
  className?: string;
}) {
  const [a, b] = tonesFor(category);
  const x = 20 + (seed * 37) % 60;
  return (
    <div
      role="img"
      aria-label={`Foto ${label} (placeholder)`}
      className={`relative w-full overflow-hidden rounded-xl ${aspect} ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}22, ${b}44)` }}
    >
      <svg
        viewBox="0 0 160 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <circle cx={x} cy="52" r="34" fill={a} opacity="0.35" />
        <circle cx={x + 26} cy="66" r="22" fill={b} opacity="0.4" />
        <rect x="14" y="86" width="132" height="6" rx="3" fill={b} opacity="0.3" />
        <rect x="34" y="98" width="92" height="4" rx="2" fill={b} opacity="0.2" />
      </svg>
      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-2.5 py-1 text-[0.65rem] font-medium text-white">
        Foto {label}
      </span>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* SafeImage — img dengan width/height (CLS=0) + fallback placeholder */
/* ---------------------------------------------------------------- */

export function SafeImage({
  src,
  alt,
  category,
  aspect = "aspect-[4/3]",
  seed,
  className = "",
  label,
}: {
  src?: string;
  alt: string;
  category?: string;
  aspect?: string;
  seed?: number;
  className?: string;
  label?: string;
}) {
  if (!src) {
    return <PlaceholderImage label={label ?? alt} category={category} aspect={aspect} seed={seed} className={className} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={`w-full rounded-xl object-cover ${aspect} ${className}`}
      // onError tak tersedia di RSC; fallback ditangani sanitizer + default props
    />
  );
}
