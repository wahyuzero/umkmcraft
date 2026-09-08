/**
 * Modul product_spotlight — sorotan satu produk unggulan (TEMPLATE_RESEARCH §4).
 * Referensi pola: Start Bootstrap Shop Item, Savora "signature dish".
 * Split kartu: foto + detail + bullet highlights + CTA WhatsApp terlacak.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { PriceTag, SafeImage, SectionShell, WaButton } from "../primitives";

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
    <SectionShell id={id}>
      <div className="overflow-hidden rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_16px_44px_-20px_color-mix(in_oklab,var(--uc-primary)_45%,transparent)]">
        <div className={`grid md:grid-cols-2 ${props.image_position === "left" ? "md:[&>*:first-child]:order-2" : ""}`}>
          <SafeImage
            src={props.image_url}
            alt={props.title}
            label={props.title}
            category={category}
            aspect="aspect-[4/3] md:aspect-auto md:h-full"
            className="rounded-none md:min-h-[280px]"
          />
          <div className="flex flex-col gap-4 p-6 sm:p-8">
            {props.eyebrow ? (
              <span className="self-start rounded-full bg-[color-mix(in_oklab,var(--uc-secondary)_14%,transparent)] px-3 py-1 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-[var(--uc-secondary)]">
                {props.eyebrow}
              </span>
            ) : null}
            <h2 className="font-[family-name:var(--uc-font-heading)] text-2xl font-extrabold leading-tight tracking-[-0.02em] text-[var(--uc-ink)] sm:text-[1.75rem]">
              {props.title}
            </h2>
            <PriceTag price={props.price} original={props.original_price} />
            {props.description ? (
              <p className="text-[0.95rem] leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_72%,transparent)]">
                {props.description}
              </p>
            ) : null}
            {props.highlights.length > 0 ? (
              <ul className="flex flex-col gap-2">
                {props.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-[var(--uc-ink)]">
                    <svg
                      viewBox="0 0 24 24"
                      className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-primary)]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.6}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <path d="m4.5 12.5 5 5 10-11" />
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
