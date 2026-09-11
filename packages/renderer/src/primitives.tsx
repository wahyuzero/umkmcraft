/**
 * Primitives renderer — pondasi visual semua modul.
 * World tenant: warm Indonesian commerce, WhatsApp-native (COMPONENTS.md).
 * Kontras WCAG AA, fokus keyboard terlihat, tanpa kicker/eyebrow (craft floor).
 * v2: placeholder ilustratif per-kategori (SVG deterministik, warna dari tema),
 * ritme section 3 tone, pola dekoratif CSS-murni, target sentuh ≥44px.
 */
import type { ReactNode } from "react";
import { formatRupiah } from "@umkmcraft/utils";
import { TrackedLink } from "./client/TrackedLink";

/* ---------------------------------------------------------------- */
/* SectionShell — pembungkus section dengan ritme vertikal konsisten */
/* tone: bg (dasar) | surface (kartu terang) | wash (sapuan primary) */
/* ---------------------------------------------------------------- */

export function SectionShell({
  id,
  children,
  tone = "bg",
  className = "",
}: {
  id: string;
  children: ReactNode;
  tone?: "bg" | "surface" | "wash";
  className?: string;
}) {
  const bg =
    tone === "surface"
      ? "bg-[var(--uc-surface)]"
      : tone === "wash"
        ? "bg-[color-mix(in_oklab,var(--uc-primary)_5%,var(--uc-bg))]"
        : "bg-[var(--uc-bg)]";
  return (
    <section id={id} className={`uc-reveal relative scroll-mt-4 ${bg} px-5 py-14 sm:px-8 sm:py-16 ${className}`}>
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
  const centered = align === "center";
  return (
    <div className={`${centered ? "text-center" : "text-left"} mb-8 sm:mb-10`}>
      {title ? (
        <h2 className="font-[family-name:var(--uc-font-heading)] text-[1.75rem] font-extrabold leading-[1.15] tracking-[-0.025em] text-[var(--uc-ink)] sm:text-[2.1rem]">
          {title}
        </h2>
      ) : null}
      {title ? (
        <div
          aria-hidden
          className={`mt-3.5 h-1 w-12 rounded-full bg-[var(--uc-primary)] ${centered ? "mx-auto" : ""}`}
        />
      ) : null}
      {subtitle ? (
        <p className={`mt-3.5 text-[0.95rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)] ${centered ? "mx-auto max-w-lg" : "max-w-xl"}`}>
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* WaButton — CTA WhatsApp. Hover lift + glow, tekan menyusut halus, */
/* tinggi sentuh ≥44px (ramah jempol, kontrak aksesibilitas)         */
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
  const pad =
    size === "lg"
      ? "min-h-[52px] px-7 py-3.5 text-base"
      : "min-h-[44px] px-3.5 py-2.5 text-sm";
  return (
    <TrackedLink
      href={href}
      event={productId ? "wa_product_click" : "wa_click"}
      productId={productId}
      className={`group inline-flex items-center justify-center gap-2 rounded-2xl ${pad} font-semibold whitespace-nowrap shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_10px_28px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)] active:translate-y-0 active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${full ? "w-full" : ""} bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)]`}
    >
      <WaIcon className="h-[1.15em] w-[1.15em] shrink-0 transition-transform duration-200 ease-out group-hover:scale-110" />
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
      <span className="text-[1.08rem] font-bold tabular-nums tracking-[-0.01em] text-[var(--uc-primary-text)]">
        {formatRupiah(price)}
      </span>
      {hasDiscount ? (
        <>
          <span className="text-xs tabular-nums text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)] line-through">
            {formatRupiah(original!)}
          </span>
          <span className="rounded-full bg-[color-mix(in_oklab,var(--uc-secondary)_12%,transparent)] px-1.5 py-0.5 text-xs font-bold tabular-nums text-[var(--uc-secondary-text)]">
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
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--uc-primary)_22%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_7%,var(--uc-surface))] px-3 py-1.5 text-xs font-semibold text-[var(--uc-ink)] shadow-[0_1px_2px_color-mix(in_oklab,var(--uc-ink)_5%,transparent)]">
      <span aria-hidden className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--uc-primary)]" />
      {children}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* PlaceholderImage — fail-safe elegan (kontrak §6 lapis 3)          */
/* Ilustrasi geometris deterministik per kategori — jujur (bukan     */
/* foto palsu), namun crafted & harmonis dengan warna tema situs.    */
/* ---------------------------------------------------------------- */

type PlaceholderMotif = "kuliner" | "coffee" | "barbershop" | "fashion" | "bengkel" | "laundry" | "default";

const MOTIF_KEYS: Array<[string, PlaceholderMotif]> = [
  ["kuliner", "kuliner"],
  ["coffee", "coffee"],
  ["kopi", "coffee"],
  ["barbershop", "barbershop"],
  ["cukur", "barbershop"],
  ["salon", "barbershop"],
  ["fashion", "fashion"],
  ["butik", "fashion"],
  ["bengkel", "bengkel"],
  ["service", "bengkel"],
  ["laundry", "laundry"],
  ["cuci", "laundry"],
];

function motifFor(category: string): PlaceholderMotif {
  const c = category.toLowerCase();
  for (const [key, motif] of MOTIF_KEYS) {
    if (c.includes(key)) return motif;
  }
  return "default";
}

/* Motif digambar di viewBox 160x120; warna mengalir dari --uc-* */
function Motif({ motif }: { motif: PlaceholderMotif }) {
  switch (motif) {
    case "kuliner":
      return (
        <g>
          {/* mangkuk + uap */}
          <path d="M52 62h56a28 28 0 0 1-56 0Z" fill="var(--uc-primary)" />
          <rect x="46" y="92" width="68" height="7" rx="3.5" fill="var(--uc-primary)" opacity="0.35" />
          <path d="M70 50c0-6 6-6 6-12M84 50c0-6 6-6 6-12" stroke="var(--uc-secondary)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
      );
    case "coffee":
      return (
        <g>
          {/* cup kopi + tatakan + uap */}
          <path d="M64 52h32l-4 34a8 8 0 0 1-8 7h-8a8 8 0 0 1-8-7l-4-34Z" fill="var(--uc-primary)" />
          <rect x="60" y="44" width="40" height="9" rx="4.5" fill="var(--uc-secondary)" opacity="0.75" />
          <rect x="66" y="66" width="28" height="10" rx="2" fill="var(--uc-on-primary)" opacity="0.5" />
          <ellipse cx="80" cy="98" rx="30" ry="5" fill="var(--uc-primary)" opacity="0.3" />
          <path d="M72 34c0-5 5-5 5-10M84 34c0-5 5-5 5-10" stroke="var(--uc-secondary)" strokeWidth="3.5" strokeLinecap="round" fill="none" opacity="0.55" />
        </g>
      );
    case "barbershop":
      return (
        <g>
          {/* gunting stilasi: dua bilah + cincin */}
          <g transform="rotate(-18 80 60)">
            <rect x="76" y="26" width="7" height="46" rx="3.5" fill="var(--uc-primary)" />
            <circle cx="79.5" cy="82" r="9" fill="none" stroke="var(--uc-primary)" strokeWidth="5.5" />
          </g>
          <g transform="rotate(18 80 60)">
            <rect x="77" y="26" width="7" height="46" rx="3.5" fill="var(--uc-secondary)" opacity="0.8" />
            <circle cx="80.5" cy="82" r="9" fill="none" stroke="var(--uc-secondary)" strokeWidth="5.5" opacity="0.8" />
          </g>
          <circle cx="80" cy="58" r="4" fill="var(--uc-on-primary)" opacity="0.85" />
        </g>
      );
    case "fashion":
      return (
        <g>
          {/* kaos gantung */}
          <path d="M62 40l12-8 6 5 6-5 12 8-6 10-5-3v32a4 4 0 0 1-4 4H77a4 4 0 0 1-4-4V47l-5 3-6-10Z" fill="var(--uc-primary)" />
          <path d="M74 32a6 6 0 0 0 12 0" fill="none" stroke="var(--uc-on-primary)" strokeWidth="3" opacity="0.6" />
          <rect x="52" y="92" width="56" height="6" rx="3" fill="var(--uc-primary)" opacity="0.28" />
        </g>
      );
    case "bengkel":
      return (
        <g>
          {/* gir 8 gigi */}
          <g transform="rotate(12 80 62)">
            <circle cx="80" cy="62" r="20" fill="var(--uc-primary)" />
            {Array.from({ length: 8 }).map((_, i) => (
              <rect
                key={i}
                x="76.5"
                y="34"
                width="7"
                height="12"
                rx="2.5"
                fill="var(--uc-primary)"
                transform={`rotate(${i * 45} 80 62)`}
              />
            ))}
            <circle cx="80" cy="62" r="8" fill="var(--uc-on-primary)" opacity="0.75" />
          </g>
          <circle cx="118" cy="38" r="7" fill="var(--uc-secondary)" opacity="0.5" />
          <rect x="44" y="92" width="72" height="6" rx="3" fill="var(--uc-primary)" opacity="0.28" />
        </g>
      );
    case "laundry":
      return (
        <g>
          {/* gelembung + lipatan handuk */}
          <circle cx="62" cy="46" r="13" fill="var(--uc-primary)" opacity="0.55" />
          <circle cx="92" cy="36" r="8" fill="var(--uc-secondary)" opacity="0.5" />
          <circle cx="106" cy="54" r="10" fill="var(--uc-primary)" opacity="0.4" />
          <rect x="54" y="66" width="56" height="12" rx="6" fill="var(--uc-primary)" />
          <rect x="60" y="80" width="44" height="12" rx="6" fill="var(--uc-primary)" opacity="0.6" />
          <rect x="48" y="96" width="68" height="6" rx="3" fill="var(--uc-primary)" opacity="0.28" />
        </g>
      );
    default:
      return (
        <g>
          {/* label harga + tali — netral untuk kategori apa pun */}
          <g transform="rotate(-10 80 60)">
            <rect x="56" y="40" width="48" height="34" rx="8" fill="var(--uc-primary)" />
            <circle cx="96" cy="48" r="4" fill="var(--uc-on-primary)" opacity="0.8" />
            <rect x="64" y="52" width="24" height="5" rx="2.5" fill="var(--uc-on-primary)" opacity="0.6" />
            <rect x="64" y="61" width="16" height="5" rx="2.5" fill="var(--uc-on-primary)" opacity="0.4" />
          </g>
          <path d="M100 42c8-8 16-8 22-2" stroke="var(--uc-secondary)" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.5" />
          <rect x="50" y="92" width="60" height="6" rx="3" fill="var(--uc-primary)" opacity="0.28" />
        </g>
      );
  }
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
  const motif = motifFor(category);
  const shift = (seed * 13) % 24 - 12; // -12..+11, deterministik per item
  const tilt = ((seed * 7) % 5) - 2; // -2..2 derajat
  const dotsId = `uc-dots-${motif}-${seed}`;
  return (
    <div
      role="img"
      aria-label={`Foto ${label} (placeholder)`}
      className={`relative w-full overflow-hidden rounded-2xl ${aspect} ${className}`}
      style={{
        background:
          "linear-gradient(145deg, color-mix(in oklab, var(--uc-primary) 9%, var(--uc-surface)), color-mix(in oklab, var(--uc-secondary) 7%, var(--uc-surface)))",
      }}
    >
      {/* tekstur titik halus — identitas "stiker craft" */}
      <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.5]">
        <defs>
          <pattern id={dotsId} width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.1" fill="var(--uc-primary)" opacity="0.16" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${dotsId})`} />
      </svg>
      {/* lengkung latar (arch) — panggung motif */}
      <div
        aria-hidden
        className="absolute left-1/2 top-[18%] h-[74%] w-[58%] -translate-x-1/2 rounded-t-full"
        style={{
          background: "color-mix(in oklab, var(--uc-primary) 12%, transparent)",
          transform: `translateX(calc(-50% + ${shift}px)) rotate(${tilt}deg)`,
        }}
      />
      <svg
        viewBox="0 0 160 120"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        aria-hidden
      >
        <Motif motif={motif} />
      </svg>
      {/* Chip keterangan: ink 65% (bukan 55%) agar teks kecil tetap ≥4.5:1
          di atas semua preset — kontras WCAG AA untuk teks tubuh.
          text-xs (12px): chip < 12px gagal keterbacaan (audit P2).
          Status placeholder hanya di aria-label — caption tidak menulis "(contoh)". */}
      <span className="absolute bottom-2 left-1/2 max-w-[92%] -translate-x-1/2 truncate rounded-full bg-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)] px-2.5 py-1 text-xs font-medium leading-4 text-[var(--uc-bg)]">
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
      className={`w-full rounded-2xl object-cover ring-1 ring-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] ${aspect} ${className}`}
      // onError tak tersedia di RSC; fallback ditangani sanitizer + default props
    />
  );
}
