/**
 * Modul social_proof_reviews — COMPONENTS.md §2.
 * Ulasan pelanggan: bintang SVG emas, kartu bergaya gelembung chat WhatsApp
 * untuk sumber whatsapp, tanda G empat warna untuk Google, tanda kutip netral
 * untuk manual. is_sample=true WAJIB menampilkan strip jujur "contoh tampilan"
 * (produk melarang ulasan palsu tanpa label). RSC murni — 0 JS client.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell, WaIcon } from "../primitives";

export type SocialProofReviewsProps = SectionProps<"social_proof_reviews">;

export const reviewsDefaults: SocialProofReviewsProps = {
  section_title: "Kata Pelanggan",
  section_subtitle: "",
  is_sample: true, // default jujur: konten contoh harus berlabel sampai diganti ulasan asli
  reviews: [],
};

type ReviewItem = SocialProofReviewsProps["reviews"][number];

/** Warna gelembung WA: fixed green via color-mix, bukan warna tema. */
const WA_BUBBLE = "color-mix(in oklab, #22c55e 16%, var(--uc-surface))";

/* ---------------------------------------------------------------- */
/* Bintang — SVG emas, isi vs garis                                  */
/* ---------------------------------------------------------------- */

const STAR_PATH =
  "M12 3.2l2.62 5.44 5.98.72-4.4 4.1 1.15 5.9L12 16.5l-5.35 2.86 1.15-5.9-4.4-4.1 5.98-.72L12 3.2z";

function Stars({ rating }: { rating: number }) {
  return (
    <span role="img" aria-label={`Rating ${rating} dari 5 bintang`} className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className="h-4 w-4"
          aria-hidden
          fill={i <= rating ? "#f59e0b" : "none"}
          stroke="#f59e0b"
          strokeWidth={i <= rating ? 0 : 1.8}
          strokeLinejoin="round"
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Tanda sumber                                                      */
/* ---------------------------------------------------------------- */

function GoogleG({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function QuoteIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M9.8 6.2C6.9 7.7 5.1 10 5.1 13.1c0 2.5 1.6 4.2 3.7 4.2 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3h-.5c.3-1.5 1.5-2.9 3.1-3.8L9.8 6.2zm8.3 0c-2.9 1.5-4.7 3.8-4.7 6.9 0 2.5 1.6 4.2 3.7 4.2 1.9 0 3.3-1.4 3.3-3.2 0-1.7-1.2-3-2.9-3h-.5c.3-1.5 1.5-2.9 3.1-3.8l-2-1.1z" />
    </svg>
  );
}

function SourceChip({ source }: { source: ReviewItem["source"] }) {
  const base = "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold";
  if (source === "whatsapp") {
    return (
      <span className={`${base} bg-[color-mix(in_oklab,#25d366_14%,transparent)] text-[#0f7a3d]`}>
        <WaIcon className="h-3 w-3 text-[#25d366]" />
        WhatsApp
      </span>
    );
  }
  if (source === "google") {
    return (
      <span className={`${base} bg-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`}>
        <GoogleG className="h-3 w-3" />
        Google
      </span>
    );
  }
  return (
    <span className={`${base} bg-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`}>
      <QuoteIcon className="h-3 w-3" />
      Ulasan
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Avatar — foto atau inisial di lingkaran warna tema                */
/* ---------------------------------------------------------------- */

function Avatar({ review }: { review: ReviewItem }) {
  if (review.avatar_url) {
    return (
      <SafeImage
        src={review.avatar_url}
        alt={`Foto ${review.name}`}
        label={review.name}
        aspect="aspect-square"
        className="h-10 w-10 shrink-0 rounded-full"
      />
    );
  }
  const initial = review.name.trim().charAt(0).toUpperCase();
  return (
    <span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--uc-primary)] font-[family-name:var(--uc-font-heading)] text-sm font-extrabold text-[var(--uc-on-primary)]"
    >
      {initial || "?"}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Kartu ulasan                                                      */
/* ---------------------------------------------------------------- */

function ReviewCard({ review }: { review: ReviewItem }) {
  const isWa = review.source === "whatsapp";
  return (
    <figure
      className={`relative flex flex-col gap-3 rounded-2xl p-4 ${
        isWa
          ? "rounded-tl-md shadow-[0_2px_8px_color-mix(in_oklab,var(--uc-ink)_7%,transparent)]"
          : "border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)]"
      }`}
      style={isWa ? { background: WA_BUBBLE } : undefined}
    >
      {isWa ? (
        <svg viewBox="0 0 12 12" className="absolute -top-[7px] left-4 h-3 w-3" style={{ color: WA_BUBBLE }} aria-hidden>
          <path fill="currentColor" d="M0 12C.6 5.6 4.2 1.4 11 0L11 12Z" />
        </svg>
      ) : null}
      <div className="flex items-center gap-3">
        <Avatar review={review} />
        <div className="min-w-0 grow">
          <figcaption className="truncate text-sm font-bold text-[var(--uc-ink)]">{review.name}</figcaption>
          {review.date ? (
            <p className="text-[0.7rem] text-[color-mix(in_oklab,var(--uc-ink)_52%,transparent)]">{review.date}</p>
          ) : null}
        </div>
        <SourceChip source={review.source} />
      </div>
      <Stars rating={review.rating} />
      <blockquote className="text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_78%,transparent)]">
        {review.text}
      </blockquote>
    </figure>
  );
}

/* ---------------------------------------------------------------- */
/* Modul                                                             */
/* ---------------------------------------------------------------- */

export function SocialProofReviews({ id, props }: { id: string; props: SocialProofReviewsProps }) {
  return (
    <SectionShell id={id}>
      {props.is_sample ? (
        <p className="mb-6 flex items-start gap-2.5 rounded-xl border border-dashed border-[color-mix(in_oklab,var(--uc-secondary)_50%,transparent)] bg-[color-mix(in_oklab,var(--uc-secondary)_7%,transparent)] px-4 py-3 text-xs font-medium leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.9"
            strokeLinecap="round"
            className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-secondary)]"
            aria-hidden
          >
            <circle cx="12" cy="12" r="8.6" />
            <path d="M12 11.2v4.3" />
            <path d="M12 8.2h.01" />
          </svg>
          Contoh tampilan ulasan — ganti dengan ulasan pelanggan asli Anda.
        </p>
      ) : null}

      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />

      {props.reviews.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[color-mix(in_oklab,var(--uc-ink)_20%,transparent)] p-8 text-center text-sm text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)]">
          Belum ada ulasan — jadilah pelanggan pertama yang berbagi cerita!
        </p>
      ) : (
        <ul className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {props.reviews.map((review, i) => (
            <li key={`${review.name}-${i}`}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
