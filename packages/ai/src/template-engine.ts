/**
 * Template Engine deterministik — graceful degradation (SYSTEM_DESIGN §7.2 tahap 3):
 * bila AI gagal/absen, config tetap dihasilkan dari slot + template kategori.
 * Juga dipakai untuk demo & test. Output SELALU lolos UmkmWebsiteConfigSchema.
 */
import { guessPresetForCategory, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { slugify } from "@umkmcraft/utils";

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

const DEFAULT_PRODUCTS: Record<string, Array<{ name: string; price: number; description: string }>> = {
  kuliner: [
    { name: "Paket Nasi Komplit", price: 25000, description: "Nasi, lauk utama, sambal, dan sayur. Porsi kenyang." },
    { name: "Menu Best Seller", price: 18000, description: "Menu favorit pelanggan, rasa konsisten tiap hari." },
    { name: "Minuman Segar", price: 8000, description: "Es teh, es jeruk, dan aneka minuman dingin." },
  ],
  default: [
    { name: "Layanan Reguler", price: 50000, description: "Layanan standar dengan kualitas terbaik." },
    { name: "Layanan Premium", price: 100000, description: "Layanan lengkap dengan benefit tambahan." },
  ],
};

export function generateTemplateConfig(slots: IntakeSlots): UmkmWebsiteConfig {
  const category = slots.category || "lainnya";
  const preset = guessPresetForCategory(category);
  const baseSlug = slugify(slots.businessName) || "usaha-baru";
  const products = slots.products?.length ? slots.products : DEFAULT_PRODUCTS[category] ?? DEFAULT_PRODUCTS.default!;

  const sections: UmkmWebsiteConfig["sections"] = [
    {
      id: "sec-hero-1",
      type: "hero_storefront",
      props: {
        badge: slots.promo ? "Promo Spesial" : "",
        title: slots.businessName,
        subtitle: slots.story || `Solusi terbaik ${category} untuk kebutuhan Anda. Hubungi kami langsung via WhatsApp, respon cepat dan ramah.`,
        image_url: "",
        image_position: "right",
        cta_primary: {
          label: "Pesan via WhatsApp",
          action: "whatsapp_direct",
          prefill_message: `Halo ${slots.businessName}! Saya dapat nomor dari website, mau tanya-tanya kak.`,
          url: "",
        },
        badges: ["Respon Cepat", "Harga Jujur", "Kualitas Terjamin"],
      },
    },
    {
      id: "sec-catalog-1",
      type: "product_catalog_wa",
      props: {
        section_title: "Pilihan Unggulan",
        section_subtitle: "Klik tombol WhatsApp di produk, pesanan langsung terhubung ke admin.",
        categories: ["Semua"],
        products: products.map((p, i) => ({
          id: `prod-${i + 1}`,
          name: p.name,
          price: p.price ?? 0,
          category: "Umum",
          description: p.description ?? "",
          image_url: "",
          is_bestseller: i === 0,
        })),
      },
    },
    {
      id: "sec-hours-1",
      type: "operating_hours_map",
      props: {
        section_title: "Lokasi & Jam Buka",
        address: slots.location || "Alamat akan diperbarui oleh pemilik usaha",
        gmaps_url: "",
        waze_url: "",
        schedule: [{ day: "Setiap Hari", hours: slots.hours || "09:00 - 17:00 WIB" }],
        open_hours: [],
        delivery_note: "",
      },
    },
    {
      id: "sec-faq-1",
      type: "faq_accordion",
      props: {
        section_title: "Pertanyaan yang Sering Diajukan",
        items: [
          { q: "Bagaimana cara memesan?", a: "Klik tombol WhatsApp pada produk atau hubungi kami — pesanan Anda langsung diproses admin." },
          { q: "Apakah bisa kirim ke luar kota?", a: "Bisa! Silakan chat admin untuk cek ongkir dan estimasi pengiriman ke lokasi Anda." },
        ],
      },
    },
    {
      id: "sec-contact-1",
      type: "contact_direct",
      props: {
        section_title: "Hubungi Kami",
        address: slots.location || "",
        phone: "",
        whatsapp_number: slots.whatsappNumber,
        whatsapp_label: "Chat Admin",
        email: "",
        gmaps_url: "",
        prefill_message: `Halo ${slots.businessName}! 👋`,
      },
    },
  ];

  return {
    meta: {
      site_id: baseSlug,
      business_name: slots.businessName,
      business_category: category,
      tagline: slots.story?.slice(0, 140) || `Kebutuhan ${category} Anda, solusi kami.`,
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
        title: `${slots.businessName} — ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        description: slots.story?.slice(0, 200) || `${slots.businessName}: ${category} pilihan terbaik. Pesan mudah via WhatsApp.`,
        keywords: [slots.businessName.toLowerCase(), category],
      },
    },
    sections,
  };
}
