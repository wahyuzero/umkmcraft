/**
 * Modul rich_text_block — konten cerita/about dengan markdown limited-safe.
 * KEAMANAN: tanpa rehype-raw (HTML mentah tidak pernah dirender), URL dibersihkan
 * sanitizer bawaan react-markdown, <img> markdown dinonaktifkan, h1-h6 dipetakan
 * ke paragraf bergaya heading tema (judul section hanya dari section_title).
 */
import ReactMarkdown, { type Components } from "react-markdown";
import type { ReactNode } from "react";
import type { SectionProps } from "@umkmcraft/schema";
import { SafeImage, SectionHeader, SectionShell } from "../primitives";

export type RichTextBlockProps = SectionProps<"rich_text_block">;

export const richTextDefaults: RichTextBlockProps = {
  section_title: "",
  body_markdown: "Ceritakan kisah usaha, proses produksi, dan nilai yang kamu jaga di sini.",
  image_url: "",
  image_position: "right",
};

/*
 * Marker list digambar via CSS murni (uc-md) — tanpa context,
 * supaya modul tetap RSC murni (createContext dilarang di server component).
 */

/* h1-h6 tetap <p> (hierarki judul section aman) — tapi tampil sebagai
   sub-judul bertema: font heading, tracking rapat, dua tingkat ukuran. */
const headingBase =
  "font-[family-name:var(--uc-font-heading)] font-extrabold tracking-[-0.02em] text-[var(--uc-ink)]";

function HeadingLg({ children }: { children?: ReactNode }) {
  return <p className={`pt-3 text-[1.15rem] leading-snug ${headingBase}`}>{children}</p>;
}

function HeadingSm({ children }: { children?: ReactNode }) {
  return <p className={`pt-2 text-[1.02rem] leading-snug ${headingBase}`}>{children}</p>;
}

const mdComponents: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  a: ({ node, href, children }) => {
    void node;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="font-semibold text-[var(--uc-primary)] underline decoration-[color-mix(in_oklab,var(--uc-primary)_40%,transparent)] decoration-2 underline-offset-[3px] transition-colors duration-150 hover:decoration-[var(--uc-primary)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-bold text-[var(--uc-ink)]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: HeadingLg,
  h2: HeadingLg,
  h3: HeadingSm,
  h4: HeadingSm,
  h5: HeadingSm,
  h6: HeadingSm,
  ul: ({ children }) => <ul className="uc-md-ul space-y-2.5">{children}</ul>,
  ol: ({ children }) => <ol className="uc-md-ol space-y-2.5">{children}</ol>,
  li: ({ children }) => <li className="uc-md-li leading-relaxed">{children}</li>,
  img: () => null, /* gambar hanya lewat image_url resmi */
  blockquote: ({ children }) => (
    <blockquote className="rounded-r-xl border-l-[3px] border-[var(--uc-primary)] bg-[color-mix(in_oklab,var(--uc-primary)_6%,transparent)] px-4 py-3 italic text-[color-mix(in_oklab,var(--uc-ink)_85%,transparent)]">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-6 border-t-2 border-dashed border-[color-mix(in_oklab,var(--uc-ink)_15%,transparent)]" />,
};

function MarkdownBody({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-[0.95rem] text-[color-mix(in_oklab,var(--uc-ink)_80%,transparent)]">
      <ReactMarkdown components={mdComponents}>{children}</ReactMarkdown>
    </div>
  );
}

export function RichTextBlock({ id, props }: { id: string; props: RichTextBlockProps }) {
  const { section_title, body_markdown, image_url, image_position } = props;

  const image = (
    <SafeImage
      src={image_url}
      alt={section_title || "Kegiatan usaha"}
      label={section_title || "Kegiatan usaha"}
      aspect={image_position === "top" ? "aspect-[16/9]" : "aspect-[4/3]"}
    />
  );

  const text = (
    <div>
      <SectionHeader align="left" title={section_title} />
      <MarkdownBody>{body_markdown}</MarkdownBody>
    </div>
  );

  return (
    <SectionShell id={id} tone="surface">
      {image_position === "top" ? (
        <div className="flex flex-col gap-7">
          {image}
          {text}
        </div>
      ) : (
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div className={image_position === "right" ? "md:order-2" : ""}>{image}</div>
          {text}
        </div>
      )}
    </SectionShell>
  );
}
