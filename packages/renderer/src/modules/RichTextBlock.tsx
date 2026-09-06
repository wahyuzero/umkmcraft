/**
 * Modul rich_text_block — konten cerita/about dengan markdown limited-safe.
 * KEAMANAN: tanpa rehype-raw (HTML mentah tidak pernah dirender), URL dibersihkan
 * sanitizer bawaan react-markdown, <img> markdown dinonaktifkan, h1-h6 dipetakan
 * ke paragraf tebal (judul section hanya dari section_title).
 */
import ReactMarkdown, { type Components } from "react-markdown";
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
const HeadingAsP = ({ children }: { children?: React.ReactNode }) => (
  <p className="pt-2 font-[family-name:var(--uc-font-heading)] text-[1.05rem] font-bold text-[var(--uc-ink)]">
    {children}
  </p>
);

const mdComponents: Components = {
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  a: ({ node, href, children }) => {
    void node;
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="font-semibold text-[var(--uc-primary)] underline decoration-[color-mix(in_oklab,var(--uc-primary)_40%,transparent)] underline-offset-2 transition-colors duration-150 hover:decoration-[var(--uc-primary)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
      >
        {children}
      </a>
    );
  },
  strong: ({ children }) => <strong className="font-bold text-[var(--uc-ink)]">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  h1: HeadingAsP,
  h2: HeadingAsP,
  h3: HeadingAsP,
  h4: HeadingAsP,
  h5: HeadingAsP,
  h6: HeadingAsP,
  ul: ({ children }) => <ul className="uc-md-ul space-y-2.5">{children}</ul>,
  ol: ({ children }) => <ol className="uc-md-ol space-y-2.5">{children}</ol>,
  li: ({ children }) => <li className="uc-md-li leading-relaxed">{children}</li>,
  img: () => null, /* gambar hanya lewat image_url resmi */
  blockquote: ({ children }) => (
    <blockquote className="border-l border-[color-mix(in_oklab,var(--uc-primary)_45%,transparent)] pl-4 italic text-[color-mix(in_oklab,var(--uc-ink)_85%,transparent)]">
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
