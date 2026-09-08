/**
 * Modul instagram_showcase_grid — showcase feed IG statis (TEMPLATE_RESEARCH §4).
 * Referensi pola: Colorlib/DiverseKit lookbook grid, Wix fashion templates.
 * Grid foto kotak (link ke post bila ada) + tombol follow ke profil.
 * Tanpa API Instagram — pemilik usaha hanya menempel URL gambar. RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

export type InstagramShowcaseProps = SectionProps<"instagram_showcase_grid">;

export const instagramDefaults: InstagramShowcaseProps = {
  section_title: "Ikuti Kami di Instagram",
  handle: "@usaha.kamu",
  profile_url: "",
  posts: [
    { image_url: "", caption: "Produk terbaru hari ini ✨", post_url: "" },
    { image_url: "", caption: "Behind the scene", post_url: "" },
    { image_url: "", caption: "Pelanggan bahagia 😍", post_url: "" },
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
      <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {props.posts.map((post, i) => {
          const img = (
            <SafeImage
              src={post.image_url}
              alt={post.caption || `Foto Instagram ${i + 1}`}
              label={post.caption || "Instagram"}
              category={category}
              aspect="aspect-square"
              className="transition-transform duration-200 ease-out group-hover:scale-[1.04]"
            />
          );
          return (
            <li key={i} className="group relative">
              {post.post_url ? (
                <a href={post.post_url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-xl focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]">
                  {img}
                </a>
              ) : (
                <div className="overflow-hidden rounded-xl">{img}</div>
              )}
            </li>
          );
        })}
      </ul>
      {props.profile_url ? (
        <div className="mt-5 text-center">
          <a
            href={props.profile_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-5 py-3 text-sm font-bold text-[var(--uc-primary)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
          >
            <IgMark className="h-4.5 w-4.5" />
            {props.handle ? `Follow ${props.handle}` : "Follow di Instagram"}
          </a>
        </div>
      ) : props.handle ? (
        <p className="mt-4 text-center text-sm font-bold text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
          <IgMark className="mr-1 inline h-4 w-4 align-[-0.15em]" /> {props.handle}
        </p>
      ) : null}
    </SectionShell>
  );
}
