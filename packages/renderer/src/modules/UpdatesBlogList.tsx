/**
 * Modul updates_blog_list — info & kabar terbaru (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Clean Blog, HTML5 UP Massively/Editorial.
 * Baris dibagi border halus: chip tanggal (tabular), judul tebal (hover primary),
 * ringkasan clamp-2, thumbnail opsional, chevron meluncur 200ms saat hover.
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

function ChevronMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0 self-center text-[var(--uc-primary)] transition-transform duration-200 ease-out group-hover:translate-x-1"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />
    </svg>
  );
}

function UpdateRow({ post, seed, category }: { post: UpdatesProps["posts"][number]; seed: number; category: string }) {
  const body = (
    <>
      {post.image_url ? (
        <div className="w-24 shrink-0 sm:w-28">
          <SafeImage
            src={post.image_url}
            alt={post.title}
            label={post.title}
            category={category}
            aspect="aspect-square"
            seed={seed}
            className="rounded-xl"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        {post.date_label ? (
          <span className="inline-block rounded-full bg-[color-mix(in_oklab,var(--uc-primary)_9%,var(--uc-surface))] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em] tabular-nums text-[var(--uc-primary)]">
            {post.date_label}
          </span>
        ) : null}
        <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.05rem] font-extrabold leading-snug text-[var(--uc-ink)] transition-colors duration-200 group-hover:text-[var(--uc-primary)] sm:text-lg">
          {post.title}
        </h3>
        {post.excerpt ? (
          <p className="mt-1.5 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_66%,transparent)] line-clamp-2">
            {post.excerpt}
          </p>
        ) : null}
      </div>
      {post.url ? <ChevronMark /> : null}
    </>
  );

  const rowCls = "group flex gap-4";

  return post.url ? (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${rowCls} focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]`}
    >
      {body}
    </a>
  ) : (
    <div className={rowCls}>{body}</div>
  );
}

export function UpdatesBlogList({ id, props, category = "" }: { id: string; props: UpdatesProps; category?: string }) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="divide-y divide-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)]">
        {props.posts.map((post, i) => (
          <li key={i} className="py-5 first:pt-0 last:pb-0">
            <UpdateRow post={post} seed={i} category={category} />
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
