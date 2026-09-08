/**
 * Modul updates_blog_list — info & kabar terbaru (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Clean Blog, HTML5 UP Massively/Editorial.
 * Kartu berita bertumpuk: tanggal, judul, ringkasan, link opsional, thumbnail opsional.
 * RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

export type UpdatesProps = SectionProps<"updates_blog_list">;

export const updatesDefaults: UpdatesProps = {
  section_title: "Info & Kabar Terbaru",
  section_subtitle: "",
  posts: [
    {
      title: "Kami Buka Lagi!",
      date_label: "Sep 2026",
      excerpt: "Mulai minggu ini jam operasional kembali normal. Titip pesan dulu biar nggak antre.",
      url: "",
      image_url: "",
    },
  ],
};

function UpdateCard({ post, seed, category }: { post: UpdatesProps["posts"][number]; seed: number; category: string }) {
  const body = (
    <>
      {post.image_url ? (
        <div className="w-full sm:w-40 sm:shrink-0">
          <SafeImage
            src={post.image_url}
            alt={post.title}
            label={post.title}
            category={category}
            aspect="aspect-[16/10] sm:aspect-square"
            seed={seed}
            className="h-full rounded-xl sm:rounded-xl"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {post.date_label ? (
          <p className="text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-[var(--uc-primary)]">
            {post.date_label}
          </p>
        ) : null}
        <h3 className="mt-0.5 font-[family-name:var(--uc-font-heading)] text-[1.08rem] font-extrabold text-[var(--uc-ink)] group-hover:text-[var(--uc-primary)] sm:text-lg">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_66%,transparent)]">
            {post.excerpt}
          </p>
        ) : null}
        {post.url ? (
          <span className="mt-2.5 inline-block text-xs font-bold text-[var(--uc-primary)]">
            Baca selengkapnya →
          </span>
        ) : null}
      </div>
    </>
  );

  const cardCls =
    "uc-update-card group flex gap-4 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-4 transition-[border-color,box-shadow] duration-200 hover:border-[color-mix(in_oklab,var(--uc-primary)_40%,transparent)] sm:p-5";

  return post.url ? (
    <a href={post.url} target="_blank" rel="noopener noreferrer" className={`${cardCls} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]`}>
      {body}
    </a>
  ) : (
    <div className={cardCls}>{body}</div>
  );
}

export function UpdatesBlogList({ id, props, category = "" }: { id: string; props: UpdatesProps; category?: string }) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="flex flex-col gap-3.5">
        {props.posts.map((post, i) => (
          <li key={i}>
            <UpdateCard post={post} seed={i} category={category} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
