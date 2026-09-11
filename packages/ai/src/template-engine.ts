/**
 * Template Engine deterministik — graceful degradation (SYSTEM_DESIGN §7.2 tahap 3):
 * bila AI gagal/absen, config tetap dihasilkan dari slot + template kategori.
 * Juga dipakai untuk demo & test. Output SELALU lolos UmkmWebsiteConfigSchema.
 * Semua input user di-clamp (Oracle #12c) supaya parse pasca-generate tak pernah gagal.
 *
 * Copy default berasal dari copy-voice.ts (satu sumber suara per kategori):
 * tagline ≤ 8 kata, produk-spesifik, gaya pedagang — bukan bahasa brosur.
 * Jalur route tetap menambahkan lintCopy() sebagai jaring pengaman terakhir.
 */
import { guessPresetForCategory, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { slugify } from "@umkmcraft/utils";
import { voiceForCategory, truncateAtWordBoundary } from "./copy-voice";

export interface IntakeSlots {
  businessName: string;
  category: string;
  location?: string;
  whatsappNumber: string;
  products?: Array<{ name: string; price?: number; description?: string }>;
  promo?: string;
  hours?: string;
  story?: string;
}

export function generateTemplateConfig(slots: IntakeSlots): UmkmWebsiteConfig {
  const category = (slots.category || "lainnya").slice(0, 40);
  const preset = guessPresetForCategory(category);
  const voice = voiceForCategory(category);
  const baseSlug = slugify(slots.businessName) || "usaha-baru";
  const name = slots.businessName.slice(0, 80);
  const story = truncateAtWordBoundary((slots.story || "").slice(0, 400), 220);
  const location = (slots.location || "").slice(0, 200);
  const products = (slots.products?.length ? slots.products : voice.products)
    .slice(0, 5)
    .map((p) => ({
      name: p.name.slice(0, 80),
      price: Math.max(0, Math.min(Number(p.price) || 0, 1_000_000_000)),
      description: truncateAtWordBoundary((p.description || "").slice(0, 600), 300),
    }));

  const sections: UmkmWebsiteConfig["sections"] = [
    {
      id: "sec-hero-1",
      type: "hero_storefront",
      props: {
        badge: slots.promo ? "Promo Spesial" : "",
        title: name,
        subtitle: story || voice.subtitle,
        image_url: "",
        image_position: "right",
        cta_primary: {
          label: "Pesan via WhatsApp",
          action: "whatsapp_direct",
          prefill_message: `Halo ${name}! 👋 Saya dapat nomor dari website, mau tanya-tanya kak.`,
          url: "",
        },
        badges: voice.badges,
      },
    },
    {
      id: "sec-catalog-1",
      type: "product_catalog_wa",
      props: {
        section_title: voice.catalogTitle,
        section_subtitle: voice.catalogSubtitle,
        categories: ["Semua"],
        products: products.map((p, i) => ({
          id: `prod-${i + 1}`,
          name: p.name,
          price: p.price,
          category: "Umum",
          description: p.description,
          image_url: "",
          is_bestseller: i === 0,
        })),
      },
    },
    {
      id: "sec-valueprops-1",
      type: "value_props_grid",
      props: {
        section_title: "Kenapa Pilih Kami?",
        section_subtitle: "",
        items: voice.valueProps,
      },
    },
    {
      id: "sec-hours-1",
      type: "operating_hours_map",
      props: {
        section_title: "Lokasi & Jam Buka",
        address: location || "Alamat akan diperbarui oleh pemilik usaha",
        gmaps_url: "",
        waze_url: "",
        schedule: [{ day: "Setiap Hari", hours: (slots.hours || "09:00 - 17:00 WIB").slice(0, 60) }],
        open_hours: [],
        delivery_note: "",
      },
    },
    {
      id: "sec-faq-1",
      type: "faq_accordion",
      props: {
        section_title: "Pertanyaan yang Sering Diajukan",
        items: voice.faqs,
      },
    },
    {
      id: "sec-contact-1",
      type: "contact_direct",
      props: {
        section_title: "Hubungi Kami",
        address: location,
        phone: "",
        whatsapp_number: slots.whatsappNumber,
        whatsapp_label: "Chat Admin",
        email: "",
        gmaps_url: "",
        prefill_message: `Halo ${name}! 👋`,
      },
    },
    {
      id: "sec-ctabanner-1",
      type: "cta_banner_full",
      props: {
        title: voice.ctaTitle,
        subtitle: voice.ctaSubtitle,
        button_label: "Chat WhatsApp Sekarang",
        prefill_message: `Halo ${name}! 👋 Saya mau order kak.`,
        secondary_label: "",
        secondary_url: "",
      },
    },
  ];

  return {
    meta: {
      site_id: baseSlug,
      business_name: name,
      business_category: category,
      tagline: truncateAtWordBoundary(story, 140) || voice.tagline,
      schema_version: 1,
      theme: {
        preset: preset.id,
        primary_color: preset.primary,
        secondary_color: preset.secondary,
        background_color: preset.background,
        font_heading: preset.font_heading,
        font_body: preset.font_body,
      },
      whatsapp_number: slots.whatsappNumber,
      seo: {
        title: `${name} — ${category.charAt(0).toUpperCase() + category.slice(1)}`.slice(0, 80),
        description: story ? truncateAtWordBoundary(story, 200) : voice.seoDescription(name),
        keywords: [name.toLowerCase().slice(0, 40), category].slice(0, 12),
      },
    },
    sections,
  };
}
