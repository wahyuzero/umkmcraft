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
import { StatsCounterStrip } from "./modules/StatsCounterStrip";
import { ValuePropsGrid } from "./modules/ValuePropsGrid";
import { MenuPriceList } from "./modules/MenuPriceList";
import { ProductSpotlight } from "./modules/ProductSpotlight";
import { CtaBannerFull } from "./modules/CtaBannerFull";
import { TeamMembersGrid } from "./modules/TeamMembersGrid";
import { TimelineStory } from "./modules/TimelineStory";
import { BookingWhatsAppForm } from "./modules/BookingWhatsAppForm";
import { EventScheduleList } from "./modules/EventScheduleList";
import { BranchLocationsList } from "./modules/BranchLocationsList";
import { InstagramShowcaseGrid } from "./modules/InstagramShowcaseGrid";
import { UpdatesBlogList } from "./modules/UpdatesBlogList";
import { DownloadCatalogCta } from "./modules/DownloadCatalogCta";
import { QrCodeWhatsApp } from "./modules/QrCodeWhatsApp";

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
  stats_counter_strip: ({ id, props }) => <StatsCounterStrip id={id} props={props as never} />,
  value_props_grid: ({ id, props }) => <ValuePropsGrid id={id} props={props as never} />,
  menu_price_list: ({ id, props }) => <MenuPriceList id={id} props={props as never} />,
  product_spotlight: ({ id, props, businessName, whatsappNumber, category }) => (
    <ProductSpotlight id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} category={category} />
  ),
  cta_banner_full: ({ id, props, businessName, whatsappNumber }) => (
    <CtaBannerFull id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} />
  ),
  team_members_grid: ({ id, props, category }) => (
    <TeamMembersGrid id={id} props={props as never} category={category} />
  ),
  timeline_story: ({ id, props }) => <TimelineStory id={id} props={props as never} />,
  booking_whatsapp_form: ({ id, props, businessName, whatsappNumber }) => (
    <BookingWhatsAppForm id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} />
  ),
  event_schedule_list: ({ id, props }) => <EventScheduleList id={id} props={props as never} />,
  branch_locations_list: ({ id, props, businessName }) => (
    <BranchLocationsList id={id} props={props as never} businessName={businessName} />
  ),
  instagram_showcase_grid: ({ id, props, category }) => (
    <InstagramShowcaseGrid id={id} props={props as never} category={category} />
  ),
  updates_blog_list: ({ id, props, category }) => (
    <UpdatesBlogList id={id} props={props as never} category={category} />
  ),
  download_catalog_cta: ({ id, props, businessName, whatsappNumber }) => (
    <DownloadCatalogCta id={id} props={props as never} businessName={businessName} whatsappNumber={whatsappNumber} />
  ),
  qr_code_whatsapp: ({ id, props, businessName, category }) => (
    <QrCodeWhatsApp id={id} props={props as never} businessName={businessName} category={category} />
  ),
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
