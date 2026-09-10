/**
 * Modul instagram_showcase_grid — showcase feed IG statis (TEMPLATE_RESEARCH §4).
 * Referensi pola: Colorlib/DiverseKit lookbook grid, Wix fashion templates.
 * Chip handle + glyph di atas grid (link ke profil bila ada), grid kotak 3-4 kolom,
 * hover/focus = overlay glyph instagram. Tanpa API Instagram — pemilik usaha
 * hanya menempel URL gambar. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

export type InstagramShowcaseProps = SectionProps<"instagram_showcase_grid">;

export const instagramDefaults: InstagramShowcaseProps = {
  section_title: "Ikuti Kami di Instagram",
  handle: "@usaha.kamu",
  profile_url: "",
  posts: [
    { image_url: "", caption: "Produk terbaru hari ini", post_url: "" },
    { image_url: "", caption: "Behind the scene", post_url: "" },
    { image_url: "", caption: "Pelanggan bahagia", post_url: "" },
    { image_url: "", caption: "Promo spesial!", post_url: "" },
  ],
};

function IgMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramShowcaseGrid({ id, props, category = "" }: { id: string; props: InstagramShowcaseProps; category?: string }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      {/* Chip handle — link ke profil bila URL tersedia */}
      {props.profile_url ? (
        <div className="mb-5 flex justify-center">
          <a
            href={props.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] bg-[var(--uc-surface)] px-4 py-2 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
          >
            <IgMark className="h-4 w-4" />
            {props.handle || "Instagram"}
          </a>
        </div>
      ) : props.handle ? (
        <p className="mb-5 flex items-center justify-center gap-1.5 text-sm font-bold text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
          <IgMark className="h-4 w-4" /> {props.handle}
        </p>
      ) : null}
      <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-2.5">
        {props.posts.map((post, i) => (
          <li key={i} className="group relative overflow-hidden rounded-xl">
            {post.post_url ? (
              <a
                href={post.post_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
              >
                <SafeImage
                  src={post.image_url}
                  alt={post.caption || `Foto Instagram ${i + 1}`}
                  label={post.caption || "Instagram"}
                  category={category}
                  aspect="aspect-square"
                  className="rounded-xl transition-transform duration-300 ease-out group-hover:scale-105"
                />
              </a>
            ) : (
              <SafeImage
                src={post.image_url}
                alt={post.caption || `Foto Instagram ${i + 1}`}
                label={post.caption || "Instagram"}
                category={category}
                aspect="aspect-square"
                className="rounded-xl"
              />
            )}
            {/* Overlay glyph saat hover / fokus keyboard */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--uc-ink)_45%,transparent)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              <IgMark className="h-6 w-6 text-[var(--uc-bg)]" />
            </span>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
