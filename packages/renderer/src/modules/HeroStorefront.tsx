/**
 * Modul hero_storefront — COMPONENTS.md §2.A.
 * Elemen: badge promo (chip berikon), H1 display besar, tagline, foto hero
 * berbingkai "stiker" (ring latar + offset putus-putus), CTA WhatsApp (glow
 * hover), 3 pill badges keunggulan. RSC — 0 JS client kecuali CTA terlacak.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { PillBadge, SafeImage, WaButton } from "../primitives";

export type HeroStorefrontProps = SectionProps<"hero_storefront">;

export const heroDefaults: HeroStorefrontProps = {
  badge: "",
  title: "Nama Usaha Anda",
  subtitle: "Ceritakan keunggulan usaha Anda di sini dalam satu kalimat yang menggoda.",
  image_url: "",
  image_position: "right",
  cta_primary: {
    label: "Pesan via WhatsApp",
    action: "whatsapp_direct",
    prefill_message: "",
    url: "",
  },
  badges: [],
};

export function HeroStorefront({
  props,
  businessName,
  whatsappNumber,
  category = "",
  onCatalogHref = "#katalog",
}: {
  props: HeroStorefrontProps;
  businessName: string;
  whatsappNumber: string;
  category?: string;
  onCatalogHref?: string;
}) {
  const waHref = createWhatsAppChatLink(whatsappNumber, props.cta_primary.prefill_message || `Halo ${businessName}! 👋 Saya lihat websitenya, mau tanya-tanya produk kak.`);

  return (
    <header className="relative overflow-hidden bg-[var(--uc-bg)]">
      {/* Field dekoratif: pola titik craft (memudar ke bawah) + satu blob radial lembut */}
      <div
        aria-hidden
        className="uc-pattern-dots pointer-events-none absolute inset-x-0 top-0 h-64 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)] sm:h-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.13]"
        style={{ background: "radial-gradient(circle, var(--uc-primary), transparent 70%)" }}
      />
      <div className="relative mx-auto grid w-full max-w-3xl gap-8 px-5 pb-14 pt-10 sm:px-8 sm:pb-16 sm:pt-14 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <div className="flex flex-col items-start gap-5">
          {/* Teks chip di-campur 12% ke arah ink: bg chip sendiri adalah sapuan
              secondary 10% di atas surface — token secondary-text saja belum
              cukup (4.4:1); kontrak AA ≥4.5:1 untuk teks 12px. */}
          {props.badge ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[color-mix(in_oklab,var(--uc-secondary)_25%,transparent)] bg-[color-mix(in_oklab,var(--uc-secondary)_10%,var(--uc-surface))] px-3.5 py-1.5 text-xs font-bold tracking-wide text-[color-mix(in_oklab,var(--uc-secondary-text)_88%,var(--uc-ink))]">
              <svg viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="currentColor" aria-hidden>
                <path d="M6 0l1.57 3.6L11.5 4 8.6 6.4 9.7 10 6 7.9 2.3 10l1.1-3.6L.5 4l3.93-.4L6 0z" />
              </svg>
              {props.badge}
            </span>
          ) : null}
          <h1 className="font-[family-name:var(--uc-font-heading)] text-5xl font-extrabold leading-[1.02] tracking-[-0.03em] text-[var(--uc-ink)] sm:text-6xl">
            {props.title}
          </h1>
          {props.subtitle ? (
            <p className="max-w-md text-[1.02rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_75%,transparent)]">
              {props.subtitle}
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            {props.cta_primary.action === "url" && props.cta_primary.url ? (
              <a
                href={props.cta_primary.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--uc-primary)] px-7 py-4 text-base font-semibold text-[var(--uc-on-primary-text)] shadow-[0_2px_10px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
              >
                {props.cta_primary.label}
              </a>
            ) : (
              <WaButton href={waHref} size="lg">
                {props.cta_primary.label}
              </WaButton>
            )}
            {props.cta_secondary ? (
              <a
                href={props.cta_secondary.action === "url" && props.cta_secondary.url ? props.cta_secondary.url : onCatalogHref}
                className="inline-flex items-center justify-center rounded-2xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-6 py-3.5 text-sm font-bold text-[var(--uc-primary-text)] transition-colors duration-200 hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
              >
                {props.cta_secondary.label}
              </a>
            ) : null}
          </div>
          {props.badges.length > 0 ? (
            <ul className="mt-2 flex flex-wrap gap-2" aria-label="Keunggulan usaha">
              {props.badges.map((b) => (
                <li key={b}>
                  <PillBadge>{b}</PillBadge>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {/* Bingkai "stiker": ring warna latar + SATU offset dekoratif putus-putus di belakang.
            Frame offset hanya saat foto asli ada — di atas placeholder abu-abu ia terbaca
            sebagai crop rusak (audit P2), bukan aksen. */}
        <div className="relative">
          {props.image_url ? (
            <div
              aria-hidden
              className="absolute inset-0 translate-x-2.5 translate-y-2.5 rounded-3xl border-2 border-dashed border-[color-mix(in_oklab,var(--uc-secondary)_40%,transparent)]"
            />
          ) : null}
          <div className="relative overflow-hidden rounded-3xl bg-[color-mix(in_oklab,var(--uc-primary)_8%,var(--uc-surface))] shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--uc-primary)_55%,transparent)] ring-4 ring-[var(--uc-bg)]">
            <SafeImage
              src={props.image_url}
              alt={businessName}
              label={businessName}
              category={category}
              aspect="aspect-[4/3] md:aspect-[3.4/4]"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
