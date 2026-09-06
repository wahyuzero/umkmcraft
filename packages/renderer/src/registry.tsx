/**
 * MODULE_REGISTRY + SectionRenderer (ARCHITECTURE §3, SYSTEM_DESIGN §6).
 * Renderer PURE: config → ReactNode, tanpa window, tanpa state global.
 * Ini satu-satunya tempat pemetaan type → komponen.
 */
import type { ReactNode } from "react";
import type { Section, SectionType, UmkmMeta } from "@umkmcraft/schema";

import { HeroStorefront } from "./modules/HeroStorefront";
import { ProductCatalogWA } from "./modules/ProductCatalogWA";
import { PromoBanner } from "./modules/PromoBanner";
import { OperatingHoursMap } from "./modules/OperatingHoursMap";
import { SocialProofReviews } from "./modules/SocialProofReviews";
import { ChannelMarketplace } from "./modules/ChannelMarketplace";
import { FaqAccordion } from "./modules/FaqAccordion";
import { ContactDirect } from "./modules/ContactDirect";
import { RichTextBlock } from "./modules/RichTextBlock";
import { GalleryGrid } from "./modules/GalleryGrid";
import { ServicePricingTable } from "./modules/ServicePricingTable";
import { TrustBadgesStrip } from "./modules/TrustBadgesStrip";
import { StepHowToOrder } from "./modules/StepHowToOrder";

/** Props umum yang diterima semua modul. */
export interface ModuleCommonProps {
  id: string;
  props: Section["props"];
  businessName: string;
  whatsappNumber: string;
  category: string;
  /** Anchor katalog untuk CTA "Lihat Katalog" */
  catalogHref: string;
}

type ModuleComponent = (props: ModuleCommonProps) => ReactNode;

export const MODULE_REGISTRY: Record<SectionType, ModuleComponent> = {
  hero_storefront: ({ id, props, businessName, whatsappNumber, category, catalogHref }) => (
    <HeroStorefront
      props={props as never}
      businessName={businessName}
      whatsappNumber={whatsappNumber}
      category={category}
      onCatalogHref={catalogHref}
    />
  ),
  product_catalog_wa: ({ id, props, businessName, whatsappNumber, category }) => (
    <ProductCatalogWA id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} category={category} />
  ),
  promo_banner: ({ id, props }) => <PromoBanner id={id} props={props as never} />,
  operating_hours_map: ({ id, props }) => <OperatingHoursMap id={id} props={props as never} />,
  social_proof_reviews: ({ id, props }) => <SocialProofReviews id={id} props={props as never} />,
  channel_marketplace: ({ id, props }) => <ChannelMarketplace id={id} props={props as never} />,
  faq_accordion: ({ id, props }) => <FaqAccordion id={id} props={props as never} />,
  contact_direct: ({ id, props, businessName }) => (
    <ContactDirect id={id} props={props as never} businessName={businessName} />
  ),
  rich_text_block: ({ id, props }) => <RichTextBlock id={id} props={props as never} />,
  gallery_grid: ({ id, props }) => <GalleryGrid id={id} props={props as never} />,
  service_pricing_table: ({ id, props, businessName, whatsappNumber, category }) => (
    <ServicePricingTable id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} category={category} />
  ),
  trust_badges_strip: ({ id, props }) => <TrustBadgesStrip id={id} props={props as never} />,
  step_how_to_order: ({ id, props }) => <StepHowToOrder id={id} props={props as never} />,
};

/**
 * renderSections — urutan section menentukan urutan render.
 * Section dengan type tak dikenal DILEWATI (fail-safe, tidak pernah throw).
 */
export function renderSections(meta: UmkmMeta, sections: Section[]): ReactNode[] {
  const catalogId = sections.find((s) => s.type === "product_catalog_wa")?.id ?? "katalog";
  return sections
    .filter((s) => s.type in MODULE_REGISTRY)
    .map((section) => {
      const Component = MODULE_REGISTRY[section.type]!;
      return (
        <Component
          key={section.id}
          id={section.id}
          props={section.props}
          businessName={meta.business_name}
          whatsappNumber={meta.whatsapp_number}
          category={meta.business_category}
          catalogHref={`#${catalogId}`}
        />
      );
    });
}
