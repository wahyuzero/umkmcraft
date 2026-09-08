/**
 * UMKM Craft — kontrak domain tunggal.
 * Setiap tipe section punya props schema sendiri (SYSTEM_DESIGN §6):
 * AI yang berhalusinasi field TIDAK PERNAH sampai ke renderer.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ */
/* Primitif                                                            */
/* ------------------------------------------------------------------ */

export const WaNumberSchema = z
  .string()
  .regex(/^62\d{8,13}$/, "Nomor WhatsApp harus format 62xxxxxxxxxx (8-13 digit setelah 62)");

export const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{6})$/, "Warna harus hex 6 digit, contoh #d97706");

export const SafeUrlSchema = z
  .string()
  .max(2048)
  .refine((u) => {
    try {
      const parsed = new URL(u);
      return parsed.protocol === "https:" || parsed.protocol === "http:";
    } catch {
      return false;
    }
  }, "URL harus http(s) absolut")
  .or(z.literal(""));

export const ImageUrlSchema = z
  .string()
  .max(2048)
  .refine(
    (u) =>
      u === "" ||
      u.startsWith("/") || // path internal (placeholder/asset lokal)
      (() => {
        try {
          const p = new URL(u);
          return p.protocol === "https:" || (p.protocol === "http:" && process.env.NODE_ENV !== "production");
        } catch {
          return false;
        }
      })(),
    "image_url harus kosong, path internal (/…), atau URL http(s)",
  )
  .default("");

/* ------------------------------------------------------------------ */
/* Meta + Theme                                                        */
/* ------------------------------------------------------------------ */

export const ThemeSchema = z.object({
  preset: z.string().default("spicy_amber"),
  primary_color: HexColorSchema,
  secondary_color: HexColorSchema,
  background_color: HexColorSchema,
  font_heading: z.string().max(60).default("Plus Jakarta Sans"),
  font_body: z.string().max(60).default("Plus Jakarta Sans"),
});

export const MetaSchema = z.object({
  site_id: z
    .string()
    .regex(/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/, "slug 3-64 char: huruf kecil, angka, tanda hubung"),
  business_name: z.string().min(1).max(80),
  business_category: z.string().max(40).default("lainnya"),
  tagline: z.string().max(140).default(""),
  schema_version: z.number().int().default(1),
  theme: ThemeSchema,
  whatsapp_number: WaNumberSchema,
  seo: z.object({
    title: z.string().max(80),
    description: z.string().max(200),
    keywords: z.array(z.string().max(40)).max(12).default([]),
  }),
});

/* ------------------------------------------------------------------ */
/* Props per modul (9 core + 4 extended)                               */
/* ------------------------------------------------------------------ */

const CtaActionSchema = z.enum(["whatsapp_direct", "whatsapp_catalog", "url", "scroll_catalog"]);

export const HeroPropsSchema = z.object({
  badge: z.string().max(60).optional(),
  title: z.string().min(1).max(80),
  subtitle: z.string().max(220).default(""),
  image_url: ImageUrlSchema,
  image_position: z.enum(["right", "left", "background"]).default("right"),
  cta_primary: z.object({
    label: z.string().min(1).max(40).default("Pesan via WhatsApp"),
    action: CtaActionSchema.default("whatsapp_direct"),
    prefill_message: z.string().max(300).default(""),
    url: SafeUrlSchema.default(""),
  }),
  cta_secondary: z
    .object({
      label: z.string().min(1).max(40),
      action: CtaActionSchema.default("scroll_catalog"),
      url: SafeUrlSchema.default(""),
    })
    .optional(),
  badges: z.array(z.string().max(40)).max(4).default([]),
});

export const ProductSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(80),
  price: z.number().nonnegative().max(1_000_000_000),
  original_price: z.number().nonnegative().max(1_000_000_000).optional(),
  category: z.string().max(40).default("Umum"),
  description: z.string().max(300).default(""),
  image_url: ImageUrlSchema,
  is_bestseller: z.boolean().default(false),
});

export const CatalogPropsSchema = z.object({
  section_title: z.string().max(80).default("Katalog Produk"),
  section_subtitle: z.string().max(160).default(""),
  categories: z.array(z.string().max(40)).max(8).default([]),
  products: z.array(ProductSchema).min(1).max(60),
});

export const PromoPropsSchema = z.object({
  message: z.string().min(1).max(160),
  coupon_code: z.string().max(24).optional(),
  discount_text: z.string().max(40).optional(),
  ends_at: z.string().max(40).optional(), // ISO date — timer hitung mundur (client island)
});

export const HourRangeSchema = z.object({
  day_of_week: z.number().int().min(0).max(6), // 0 = Minggu
  open: z.string().regex(/^\d{2}:\d{2}$/),
  close: z.string().regex(/^\d{2}:\d{2}$/),
});

export const ScheduleRowSchema = z.object({
  day: z.string().max(40),
  hours: z.string().max(60),
});

export const HoursPropsSchema = z.object({
  section_title: z.string().max(80).default("Lokasi & Jam Buka"),
  address: z.string().max(240).default(""),
  gmaps_url: SafeUrlSchema.default(""),
  waze_url: SafeUrlSchema.default(""),
  schedule: z.array(ScheduleRowSchema).max(7).default([]),
  open_hours: z.array(HourRangeSchema).max(21).default([]), // status Buka/Tutup otomatis
  delivery_note: z.string().max(160).default(""),
});

export const ReviewSchema = z.object({
  name: z.string().min(1).max(60),
  rating: z.number().int().min(1).max(5),
  text: z.string().min(1).max(400),
  source: z.enum(["whatsapp", "google", "manual"]).default("manual"),
  avatar_url: ImageUrlSchema,
  date: z.string().max(40).default(""),
});

export const ReviewsPropsSchema = z.object({
  section_title: z.string().max(80).default("Kata Pelanggan"),
  section_subtitle: z.string().max(160).default(""),
  is_sample: z.boolean().default(false), // WAJIB true bila konten contoh — larangan review palsu
  reviews: z.array(ReviewSchema).min(1).max(12),
});

export const ChannelSchema = z.object({
  platform: z.enum([
    "shopee", "tokopedia", "gofood", "grabfood", "tiktok_shop", "lazada",
    "instagram", "facebook", "whatsapp", "website",
  ]),
  label: z.string().min(1).max(40),
  url: SafeUrlSchema,
});

export const ChannelsPropsSchema = z.object({
  section_title: z.string().max(80).default("Temukan Kami di"),
  channels: z.array(ChannelSchema).min(1).max(8),
});

export const FaqPropsSchema = z.object({
  section_title: z.string().max(80).default("Pertanyaan yang Sering Diajukan"),
  items: z
    .array(z.object({ q: z.string().min(1).max(160), a: z.string().min(1).max(800) }))
    .min(1)
    .max(12),
});

export const ContactPropsSchema = z.object({
  section_title: z.string().max(80).default("Hubungi Kami"),
  address: z.string().max(240).default(""),
  phone: z.string().max(24).default(""),
  whatsapp_number: WaNumberSchema.optional(),
  whatsapp_label: z.string().max(40).default("Chat Admin"),
  email: z.string().max(80).default(""),
  gmaps_url: SafeUrlSchema.default(""),
  prefill_message: z.string().max(300).default(""),
});

export const RichTextPropsSchema = z.object({
  section_title: z.string().max(80).default(""),
  body_markdown: z.string().min(1).max(4000),
  image_url: ImageUrlSchema,
  image_position: z.enum(["left", "right", "top"]).default("right"),
});

export const GalleryItemSchema = z.object({
  title: z.string().max(60).default(""),
  image_url: ImageUrlSchema,
  caption: z.string().max(120).default(""),
});

export const GalleryPropsSchema = z.object({
  section_title: z.string().max(80).default("Galeri"),
  section_subtitle: z.string().max(160).default(""),
  layout: z.enum(["grid_2_col", "grid_3_col", "grid_4_col"]).default("grid_3_col"),
  items: z.array(GalleryItemSchema).min(1).max(24),
});

export const PricingTierSchema = z.object({
  id: z.string().min(1).max(40),
  name: z.string().min(1).max(60),
  price: z.number().nonnegative().max(1_000_000_000),
  unit: z.string().max(24).default(""),
  duration: z.string().max(40).default(""),
  features: z.array(z.string().max(80)).max(8).default([]),
  is_popular: z.boolean().default(false),
  cta_label: z.string().max(40).default("Pesan Paket Ini"),
});

export const PricingPropsSchema = z.object({
  section_title: z.string().max(80).default("Daftar Harga Layanan"),
  section_subtitle: z.string().max(160).default(""),
  tiers: z.array(PricingTierSchema).min(1).max(6),
});

export const PaymentMethodSchema = z.enum([
  "qris", "bca", "mandiri", "bri", "bni", "cod", "gopay", "ovo", "dana", "shopeepay",
]);
export const CourierSchema = z.enum([
  "jne", "jnt", "sicepat", "paxel", "gosend", "antaraja", "pos", "wahana", "instant",
]);
export const CertificationSchema = z.enum(["halal_mui", "bpom", "pirt", "nib", "hki"]);

export const TrustPropsSchema = z.object({
  section_title: z.string().max(80).default("Metode Pembayaran & Pengiriman"),
  payment_methods: z.array(PaymentMethodSchema).max(10).default([]),
  shipping_couriers: z.array(CourierSchema).max(9).default([]),
  certifications: z.array(CertificationSchema).max(5).default([]),
});

export const StepSchema = z.object({
  step_number: z.number().int().min(1).max(6),
  title: z.string().min(1).max(60),
  description: z.string().max(200).default(""),
});

export const StepsPropsSchema = z.object({
  section_title: z.string().max(80).default("Cara Mudah Pesan"),
  steps: z.array(StepSchema).min(1).max(6),
});

/* ------------------------------------------------------------------ */
/* Props modul gelombang 2 (riset TEMPLATE_RESEARCH.md §4)             */
/* ------------------------------------------------------------------ */

export const StatItemSchema = z.object({
  value: z.string().min(1).max(20), // teks bebas: "500+", "4.9★", "10 Thn"
  label: z.string().min(1).max(40),
});

export const StatsCounterPropsSchema = z.object({
  section_title: z.string().max(80).default(""),
  stats: z.array(StatItemSchema).min(1).max(4),
});

export const ValuePropIconSchema = z.enum([
  "star", "truck", "shield", "clock", "chat", "wallet", "leaf", "flame", "tool", "heart",
]);

export const ValuePropItemSchema = z.object({
  icon: ValuePropIconSchema.default("star"),
  title: z.string().min(1).max(60),
  description: z.string().max(200).default(""),
});

export const ValuePropsGridPropsSchema = z.object({
  section_title: z.string().max(80).default("Kenapa Pilih Kami?"),
  section_subtitle: z.string().max(160).default(""),
  items: z.array(ValuePropItemSchema).min(1).max(6),
});

export const MenuItemSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(160).default(""),
  price: z.number().nonnegative().max(1_000_000_000),
  category: z.string().max(40).default("Menu"),
  is_recommended: z.boolean().default(false),
});

export const MenuListPropsSchema = z.object({
  section_title: z.string().max(80).default("Menu Kami"),
  section_subtitle: z.string().max(160).default(""),
  items: z.array(MenuItemSchema).min(1).max(30),
});

export const SpotlightPropsSchema = z.object({
  eyebrow: z.string().max(40).default(""),
  title: z.string().min(1).max(80),
  description: z.string().max(400).default(""),
  price: z.number().nonnegative().max(1_000_000_000),
  original_price: z.number().nonnegative().max(1_000_000_000).optional(),
  image_url: ImageUrlSchema,
  image_position: z.enum(["left", "right"]).default("right"),
  highlights: z.array(z.string().max(80)).max(5).default([]),
  cta_label: z.string().max(40).default("Pesan Produk Ini"),
  prefill_message: z.string().max(300).default(""),
});

export const CtaBannerPropsSchema = z.object({
  title: z.string().min(1).max(80),
  subtitle: z.string().max(200).default(""),
  button_label: z.string().max(40).default("Chat WhatsApp Sekarang"),
  prefill_message: z.string().max(300).default(""),
  secondary_label: z.string().max(40).default(""),
  secondary_url: SafeUrlSchema.default(""),
});

export const TeamMemberSchema = z.object({
  name: z.string().min(1).max(60),
  role: z.string().max(60).default(""),
  bio: z.string().max(200).default(""),
  avatar_url: ImageUrlSchema,
});

export const TeamPropsSchema = z.object({
  section_title: z.string().max(80).default("Tim Kami"),
  section_subtitle: z.string().max(160).default(""),
  members: z.array(TeamMemberSchema).min(1).max(8),
});

export const MilestoneSchema = z.object({
  year: z.string().max(20),
  title: z.string().min(1).max(60),
  description: z.string().max(200).default(""),
});

export const TimelinePropsSchema = z.object({
  section_title: z.string().max(80).default("Cerita Kami"),
  section_subtitle: z.string().max(160).default(""),
  milestones: z.array(MilestoneSchema).min(2).max(6),
});

export const BookingPropsSchema = z.object({
  section_title: z.string().max(80).default("Booking Jadwal"),
  section_subtitle: z.string().max(160).default(""),
  service_options: z.array(z.string().max(60)).max(8).default([]),
  time_slots: z.array(z.string().max(40)).max(12).default([]),
  button_label: z.string().max(40).default("Kirim Booking via WhatsApp"),
  prefill_note: z.string().max(300).default(""),
});

export const EventItemSchema = z.object({
  date_label: z.string().max(40),
  title: z.string().min(1).max(80),
  location: z.string().max(120).default(""),
  note: z.string().max(120).default(""),
  maps_url: SafeUrlSchema.default(""),
});

export const EventsPropsSchema = z.object({
  section_title: z.string().max(80).default("Jadwal Acara & Bazar"),
  section_subtitle: z.string().max(160).default(""),
  events: z.array(EventItemSchema).min(1).max(8),
});

export const BranchSchema = z.object({
  name: z.string().min(1).max(60),
  address: z.string().max(200).default(""),
  hours: z.string().max(80).default(""),
  gmaps_url: SafeUrlSchema.default(""),
  whatsapp_number: WaNumberSchema.optional(),
});

export const BranchesPropsSchema = z.object({
  section_title: z.string().max(80).default("Cabang Kami"),
  section_subtitle: z.string().max(160).default(""),
  branches: z.array(BranchSchema).min(1).max(8),
});

export const InstagramPostSchema = z.object({
  image_url: ImageUrlSchema,
  caption: z.string().max(120).default(""),
  post_url: SafeUrlSchema.default(""),
});

export const InstagramShowcasePropsSchema = z.object({
  section_title: z.string().max(80).default("Ikuti Kami di Instagram"),
  handle: z.string().max(60).default(""),
  profile_url: SafeUrlSchema.default(""),
  posts: z.array(InstagramPostSchema).min(1).max(8),
});

export const UpdatePostSchema = z.object({
  title: z.string().min(1).max(80),
  date_label: z.string().max(40).default(""),
  excerpt: z.string().max(200).default(""),
  url: SafeUrlSchema.default(""),
  image_url: ImageUrlSchema,
});

export const UpdatesPropsSchema = z.object({
  section_title: z.string().max(80).default("Info & Kabar Terbaru"),
  section_subtitle: z.string().max(160).default(""),
  posts: z.array(UpdatePostSchema).min(1).max(9),
});

export const DownloadCtaPropsSchema = z.object({
  section_title: z.string().max(80).default("Katalog / Brosur"),
  description: z.string().max(200).default(""),
  file_url: SafeUrlSchema.default(""),
  file_label: z.string().max(40).default("Unduh Katalog (PDF)"),
});

export const QrCodePropsSchema = z.object({
  section_title: z.string().max(80).default("Scan untuk Chat"),
  section_subtitle: z.string().max(160).default("Arahkan kamera HP ke kode ini untuk mulai chat WhatsApp."),
  qr_image_url: ImageUrlSchema,
  caption: z.string().max(120).default(""),
});

/* ------------------------------------------------------------------ */
/* Section = discriminated union (inti Zero-Runtime-Error)             */
/* ------------------------------------------------------------------ */

export const SectionTypes = [
  "hero_storefront",
  "product_catalog_wa",
  "promo_banner",
  "operating_hours_map",
  "social_proof_reviews",
  "channel_marketplace",
  "faq_accordion",
  "contact_direct",
  "rich_text_block",
  "gallery_grid",
  "service_pricing_table",
  "trust_badges_strip",
  "step_how_to_order",
  "stats_counter_strip",
  "value_props_grid",
  "menu_price_list",
  "product_spotlight",
  "cta_banner_full",
  "team_members_grid",
  "timeline_story",
  "booking_whatsapp_form",
  "event_schedule_list",
  "branch_locations_list",
  "instagram_showcase_grid",
  "updates_blog_list",
  "download_catalog_cta",
  "qr_code_whatsapp",
] as const;

export type SectionType = (typeof SectionTypes)[number];

const SectionEnvelope = <P extends z.ZodType, T extends SectionType>(type: T, props: P) =>
  z.object({ id: z.string().min(1).max(40), type: z.literal(type), props });

export const SectionSchema = z.discriminatedUnion("type", [
  SectionEnvelope("hero_storefront", HeroPropsSchema),
  SectionEnvelope("product_catalog_wa", CatalogPropsSchema),
  SectionEnvelope("promo_banner", PromoPropsSchema),
  SectionEnvelope("operating_hours_map", HoursPropsSchema),
  SectionEnvelope("social_proof_reviews", ReviewsPropsSchema),
  SectionEnvelope("channel_marketplace", ChannelsPropsSchema),
  SectionEnvelope("faq_accordion", FaqPropsSchema),
  SectionEnvelope("contact_direct", ContactPropsSchema),
  SectionEnvelope("rich_text_block", RichTextPropsSchema),
  SectionEnvelope("gallery_grid", GalleryPropsSchema),
  SectionEnvelope("service_pricing_table", PricingPropsSchema),
  SectionEnvelope("trust_badges_strip", TrustPropsSchema),
  SectionEnvelope("step_how_to_order", StepsPropsSchema),
  SectionEnvelope("stats_counter_strip", StatsCounterPropsSchema),
  SectionEnvelope("value_props_grid", ValuePropsGridPropsSchema),
  SectionEnvelope("menu_price_list", MenuListPropsSchema),
  SectionEnvelope("product_spotlight", SpotlightPropsSchema),
  SectionEnvelope("cta_banner_full", CtaBannerPropsSchema),
  SectionEnvelope("team_members_grid", TeamPropsSchema),
  SectionEnvelope("timeline_story", TimelinePropsSchema),
  SectionEnvelope("booking_whatsapp_form", BookingPropsSchema),
  SectionEnvelope("event_schedule_list", EventsPropsSchema),
  SectionEnvelope("branch_locations_list", BranchesPropsSchema),
  SectionEnvelope("instagram_showcase_grid", InstagramShowcasePropsSchema),
  SectionEnvelope("updates_blog_list", UpdatesPropsSchema),
  SectionEnvelope("download_catalog_cta", DownloadCtaPropsSchema),
  SectionEnvelope("qr_code_whatsapp", QrCodePropsSchema),
]);

/* ------------------------------------------------------------------ */
/* Konfigurasi penuh                                                   */
/* ------------------------------------------------------------------ */

export const UmkmWebsiteConfigSchema = z.object({
  meta: MetaSchema,
  sections: z.array(SectionSchema).min(1).max(20),
});

export type UmkmWebsiteConfig = z.infer<typeof UmkmWebsiteConfigSchema>;
export type UmkmMeta = UmkmWebsiteConfig["meta"];
export type UmkmTheme = UmkmMeta["theme"];
export type Section = UmkmWebsiteConfig["sections"][number];
export type Product = z.infer<typeof ProductSchema>;
export type PricingTier = z.infer<typeof PricingTierSchema>;
export type Review = z.infer<typeof ReviewSchema>;
export type Channel = z.infer<typeof ChannelSchema>;
export type GalleryItem = z.infer<typeof GalleryItemSchema>;
export type Step = z.infer<typeof StepSchema>;
export type StatItem = z.infer<typeof StatItemSchema>;
export type ValuePropItem = z.infer<typeof ValuePropItemSchema>;
export type MenuItem = z.infer<typeof MenuItemSchema>;
export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type EventItem = z.infer<typeof EventItemSchema>;
export type Branch = z.infer<typeof BranchSchema>;
export type InstagramPost = z.infer<typeof InstagramPostSchema>;
export type UpdatePost = z.infer<typeof UpdatePostSchema>;

/** Tipe helper: ambil tipe props dari literal tipe section. */
export type SectionProps<T extends SectionType> = Extract<
  Section,
  { type: T }
>["props"];
