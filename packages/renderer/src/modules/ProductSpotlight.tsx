/**
 * Modul product_spotlight — sorotan satu produk unggulan (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Shop Item, Savora "signature dish".
 * Kartu editorial 2 kolom (sm+): foto | garis primary + judul + chip badge +
 * harga besar + checklist lingkaran-centang + CTA WhatsApp terlacak.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { PillBadge, PriceTag, SafeImage, SectionShell, WaButton } from "../primitives";

export type SpotlightProps = SectionProps<"product_spotlight">;

export const spotlightDefaults: SpotlightProps = {
  eyebrow: "Produk Unggulan",
  title: "Produk Andalan Kami",
  description: "Produk paling dicari pelanggan. Stok terbatas setiap harinya — amankan pesanan kamu sekarang.",
  price: 50000,
  original_price: 65000,
  image_url: "",
  image_position: "right",
  highlights: ["Bahan berkualitas", "Dibuat fresh setiap hari", "Bisa request rasa/varian"],
  cta_label: "Pesan Produk Ini",
  prefill_message: "",
};

export function ProductSpotlight({
  id,
  props,
  businessName,
  whatsappNumber,
  category = "",
}: {
  id: string;
  props: SpotlightProps;
  businessName: string;
  whatsappNumber: string;
  category?: string;
}) {
  const waHref = createWhatsAppChatLink(
    whatsappNumber,
    props.prefill_message || `Halo ${businessName}! 👋 Saya mau pesan "${props.title}" yang ada di website.`,
  );

  return (
    <SectionShell id={id} tone="wash">
      <div className="overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_16px_44px_-20px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]">
        <div className={`grid sm:grid-cols-2 ${props.image_position === "left" ? "sm:[&>*:first-child]:order-2" : ""}`}>
          <SafeImage
            src={props.image_url}
            alt={props.title}
            label={props.title}
            category={category}
            aspect="aspect-[4/3] sm:aspect-auto sm:h-full"
            className="rounded-none sm:min-h-[300px]"
          />
          <div className="flex flex-col gap-4 p-5 sm:p-7">
            {/* Garis primary tipis — aksen editorial, satu-satunya ornamen */}
            <div aria-hidden className="h-1 w-12 rounded-full bg-[var(--uc-primary)]" />
            <h2 className="font-[family-name:var(--uc-font-heading)] text-2xl font-extrabold leading-tight tracking-[-0.02em] text-[var(--uc-ink)] sm:text-[1.75rem]">
              {props.title}
            </h2>
            {props.eyebrow ? (
              <span className="-mt-2 self-start">
                <PillBadge>{props.eyebrow}</PillBadge>
              </span>
            ) : null}
            {/* Harga diperbesar lewat PriceTag (span pertama = harga utama) */}
            <div className="[&>div>span:first-child]:text-[1.6rem] [&>div>span:first-child]:font-extrabold">
              <PriceTag price={props.price} original={props.original_price} />
            </div>
            {props.description ? (
              <p className="text-[0.95rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)]">
                {props.description}
              </p>
            ) : null}
            {props.highlights.length > 0 ? (
              <ul className="flex flex-col gap-2.5">
                {props.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--uc-ink)]">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-[1.15rem] w-[1.15rem] shrink-0 text-[var(--uc-primary)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" />
                      <path d="m8.25 12.4 2.6 2.6 5-5.4" />
                    </svg>
                    {h}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="pt-1">
              <WaButton href={waHref} size="lg" productId="spotlight">
                {props.cta_label}
              </WaButton>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
