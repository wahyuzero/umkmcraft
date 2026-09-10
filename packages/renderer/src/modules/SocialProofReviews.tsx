/**
 * Modul social_proof_reviews — COMPONENTS.md §2.
 * Ulasan pelanggan: kartu .uc-card dengan tanda kutip dekoratif, bintang SVG
 * warna tema, avatar inisial ber-tint deterministik, chip sumber (WhatsApp/
 * Google). is_sample=true WAJIB berlabel jujur: strip section + chip "Contoh"
 * per kartu (produk melarang ulasan palsu tanpa label). RSC murni — 0 JS client.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell, WaIcon } from "../primitives";

export type SocialProofReviewsProps = SectionProps<"social_proof_reviews">;

export const reviewsDefaults: SocialProofReviewsProps = {
  section_title: "Kata Pelanggan",
  section_subtitle: "Cerita jujur dari pelanggan kami — pengalaman belanja kakak juga bisa nambah di sini.",
  is_sample: true, // default jujur: konten contoh harus berlabel sampai diganti ulasan asli
  reviews: [],
};

type ReviewItem = SocialProofReviewsProps["reviews"][number];

/* ---------------------------------------------------------------- */
/* Bintang — SVG isi warna tema: terisi primary, kosong ink 15%      */
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
          fill={i <= rating ? "var(--uc-primary)" : "color-mix(in oklab, var(--uc-ink) 15%, transparent)"}
        >
          <path d={STAR_PATH} />
        </svg>
      ))}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Tanda sumber — marka brand di dalam chip netral tema              */
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

const SOURCE_CHIP_BASE = "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-bold";

function SourceChip({ source }: { source: ReviewItem["source"] }) {
  if (source === "whatsapp") {
    return (
      <span
        className={`${SOURCE_CHIP_BASE} bg-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`}
      >
        <WaIcon className="h-3 w-3 text-[#25d366]" />
        WhatsApp
      </span>
    );
  }
  if (source === "google") {
    return (
      <span
        className={`${SOURCE_CHIP_BASE} bg-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`}
      >
        <GoogleG className="h-3 w-3" />
        Google
      </span>
    );
  }
  return (
    <span
      className={`${SOURCE_CHIP_BASE} bg-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]`}
    >
      <QuoteIcon className="h-3 w-3" />
      Ulasan
    </span>
  );
}

/** Chip "Contoh" — label kejujuran untuk ulasan contoh (aturan produk, bukan review palsu). */
function SampleChip() {
  return (
    <span className="inline-flex shrink-0 items-center rounded-full border border-dashed border-[color-mix(in_oklab,var(--uc-secondary)_55%,transparent)] bg-[color-mix(in_oklab,var(--uc-secondary)_8%,transparent)] px-2.5 py-1 text-[0.65rem] font-bold text-[var(--uc-secondary)]">
      Contoh
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Avatar — foto atau inisial; tint deterministik dari nama (hash)    */
/* lewat palet kecil campuran primary/secondary tema                  */
/* ---------------------------------------------------------------- */

const AVATAR_TONES: Array<{ bg: string; fg: string }> = [
  { bg: "color-mix(in oklab, var(--uc-primary) 16%, var(--uc-surface))", fg: "var(--uc-primary)" },
  { bg: "color-mix(in oklab, var(--uc-secondary) 16%, var(--uc-surface))", fg: "var(--uc-secondary)" },
  {
    bg: "color-mix(in oklab, var(--uc-secondary) 9%, var(--uc-surface))",
    fg: "color-mix(in oklab, var(--uc-secondary) 78%, var(--uc-ink))",
  },
  {
    bg: "color-mix(in oklab, var(--uc-primary) 9%, var(--uc-surface))",
    fg: "color-mix(in oklab, var(--uc-primary) 78%, var(--uc-ink))",
  },
];

function toneForName(name: string): { bg: string; fg: string } {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 997;
  return AVATAR_TONES[h % AVATAR_TONES.length]!;
}

function Avatar({ review }: { review: ReviewItem }) {
  if (review.avatar_url) {
    return (
      <SafeImage
        src={review.avatar_url}
        alt={`Foto ${review.name}`}
        label={review.name}
        aspect="aspect-square"
        className="h-9 w-9 shrink-0 rounded-full"
      />
    );
  }
  const initial = review.name.trim().charAt(0).toUpperCase();
  const tone = toneForName(review.name);
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-[family-name:var(--uc-font-heading)] text-sm font-extrabold"
      style={{ background: tone.bg, color: tone.fg }}
    >
      {initial || "?"}
    </span>
  );
}

/* ---------------------------------------------------------------- */
/* Kartu ulasan — .uc-card tunggal, kutip dekoratif primary lembut    */
/* ---------------------------------------------------------------- */

function ReviewCard({ review, isSample }: { review: ReviewItem; isSample: boolean }) {
  return (
    <figure className="uc-card relative flex flex-col gap-3.5 overflow-hidden p-5">
      <QuoteIcon className="pointer-events-none absolute -top-1.5 right-4 h-10 w-10 text-[color-mix(in_oklab,var(--uc-primary)_14%,transparent)]" />
      <Stars rating={review.rating} />
      <blockquote className="grow text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_78%,transparent)]">
        {review.text}
      </blockquote>
      <figcaption className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[color-mix(in_oklab,var(--uc-ink)_7%,transparent)] pt-3.5">
        <Avatar review={review} />
        <div className="min-w-0 grow">
          <p className="truncate text-sm font-bold text-[var(--uc-ink)]">{review.name}</p>
          {review.date ? (
            <p className="text-[0.7rem] text-[color-mix(in_oklab,var(--uc-ink)_52%,transparent)]">{review.date}</p>
          ) : null}
        </div>
        <span className="flex shrink-0 flex-wrap items-center gap-1.5">
          <SourceChip source={review.source} />
          {isSample ? <SampleChip /> : null}
        </span>
      </figcaption>
    </figure>
  );
}

/* ---------------------------------------------------------------- */
/* Modul                                                             */
/* ---------------------------------------------------------------- */

export function SocialProofReviews({ id, props }: { id: string; props: SocialProofReviewsProps }) {
  return (
    <SectionShell id={id} tone="wash">
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
        <ul className="grid items-start gap-4 sm:grid-cols-2">
          {props.reviews.map((review, i) => (
            <li key={`${review.name}-${i}`}>
              <ReviewCard review={review} isSample={props.is_sample} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  );
}
