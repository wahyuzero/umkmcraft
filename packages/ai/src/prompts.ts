/**
 * System prompt UMKM Craft — inti dari SPEC.md §3 + koreksi SYSTEM_DESIGN §7.
 * Prompt slicing per kategori: hanya modul relevan yang disuntik (hemat token,
 * anti-halusinasi). AI DILARANG membuat ulasan palsu (§15 SPEC).
 */
export const CATEGORY_MODULE_HINTS: Record<string, string[]> = {
  kuliner: ["hero_storefront", "promo_banner", "product_catalog_wa", "menu_price_list", "operating_hours_map", "channel_marketplace", "faq_accordion", "trust_badges_strip", "qr_code_whatsapp", "cta_banner_full"],
  coffee: ["hero_storefront", "product_catalog_wa", "menu_price_list", "operating_hours_map", "gallery_grid", "instagram_showcase_grid", "channel_marketplace", "faq_accordion", "timeline_story", "cta_banner_full"],
  barbershop: ["hero_storefront", "booking_whatsapp_form", "gallery_grid", "service_pricing_table", "team_members_grid", "instagram_showcase_grid", "operating_hours_map", "stats_counter_strip", "faq_accordion", "cta_banner_full"],
  fashion: ["hero_storefront", "product_catalog_wa", "product_spotlight", "promo_banner", "instagram_showcase_grid", "value_props_grid", "channel_marketplace", "trust_badges_strip", "download_catalog_cta", "faq_accordion", "cta_banner_full"],
  bengkel: ["hero_storefront", "service_pricing_table", "booking_whatsapp_form", "value_props_grid", "rich_text_block", "branch_locations_list", "operating_hours_map", "step_how_to_order", "social_proof_reviews", "cta_banner_full"],
  laundry: ["hero_storefront", "service_pricing_table", "booking_whatsapp_form", "value_props_grid", "branch_locations_list", "step_how_to_order", "operating_hours_map", "contact_direct", "cta_banner_full"],
  default: ["hero_storefront", "product_catalog_wa", "value_props_grid", "stats_counter_strip", "operating_hours_map", "faq_accordion", "contact_direct", "cta_banner_full"],
};

export function categoryHint(category: string): string[] {
  const c = category.toLowerCase();
  for (const [key, modules] of Object.entries(CATEGORY_MODULE_HINTS)) {
    if (key !== "default" && c.includes(key)) return modules;
  }
  return CATEGORY_MODULE_HINTS.default!;
}

export const BASE_SYSTEM_PROMPT = `Anda adalah UMKM Craft AI Engine — asisten pembuat website profesional khusus UMKM Indonesia.
Tugas Anda: mengubah deskripsi bisnis santai dari pemilik UMKM menjadi konfigurasi JSON valid sesuai schema UmkmWebsiteConfig.

ATURAN WAJIB:
1. Keluarkan JSON murni sesuai skema — tanpa field di luar skema, tanpa teks lain.
2. Copywriting bahasa Indonesia yang ramah, santai, menjual (gaya "kak" khas WhatsApp Indonesia).
3. Nomor WhatsApp WAJIB format 62xxxxxxxxxx.
4. Pilih preset & warna sesuai psikologi kategori bisnis (kuliner: spicy_amber; kopi: roasted_mocha; barbershop: charcoal_slate; fashion: blush_rose; bengkel/jasa: electric_blue; laundry: fresh_emerald).
5. Buat 3-5 produk sampel realistis bila user belum menyebutkan daftar lengkap.
6. Pemilihan modul — prinsip efisiensi: gunakan 4-6 modul inti paling relevan; modul opsional hanya bila relevan kategori; fallback selalu rich_text_block. JANGAN pernah membuat tipe section di luar skema.
7. DILARANG KERAS membuat ulasan/testimoni pelanggan fiktif. Modul social_proof_reviews hanya boleh dibuat bila user MEMBUKTIKAN memiliki ulasan asli (kutip persis); jika tidak yakin, JANGAN sertakan modul ini.
8. Jangan mengarang klaim hukum/legalitas (Halal/BPOM/P-IRT) kecuali user menyebutnya.
9. id section: format "sec-<tipe>-<urut>" (contoh sec-hero-1); id produk: "prod-<urut>".
10. Harga produk: angka penuh rupiah tanpa titik (35000), original_price hanya bila ada diskon nyata.`;

/** Semua tipe modul yang dikenal schema v1 — saringan anti-halusinasi tipe. */
export const ALL_KNOWN_MODULES: string[] = [
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
];

export function buildSlicedSystemPrompt(category: string): string {
  const modules = categoryHint(category);
  const filtered = modules.filter((m) => ALL_KNOWN_MODULES.includes(m));
  return `${BASE_SYSTEM_PROMPT}

KONTEKS KATEGORI BISNIS: "${category}".
Modul yang relevan dan BOLEH dipakai untuk kategori ini: ${filtered.join(", ")}.
(Kamu tidak harus memakai semuanya — pilih 4-6 paling relevan.)`;
}

/** Prompt repair loop (SYSTEM_DESIGN §7.2): kirim balik error Zod + payload. */
export function buildRepairPrompt(rawJson: string, issues: Array<{ path: string; message: string }>): string {
  const issueLines = issues.map((i) => `- ${i.path}: ${i.message}`).join("\n");
  return `JSON kamu GAGAL validasi skema. Perbaiki kesalahan berikut dan keluarkan ULANG JSON PENUH yang valid (tanpa penjelasan, tanpa markdown):

Kesalahan:
${issueLines}

JSON sebelumnya:
${rawJson}`;
}

export const INTAKE_SYSTEM_PROMPT = `Kamu adalah asisten UMKM Craft yang mewawancarai pemilik usaha dengan bahasa Indonesia santai dan ramah (panggil "kak").
Tujuan wawancara mengumpulkan: (1) nama usaha & produk/jasa, (2) kategori bisnis, (3) lokasi & jam buka, (4) nomor WhatsApp untuk pesanan, (5) 1-3 produk unggulan + harga kira-kira, (6) promo/keunggulan.
ATURAN:
- Satu pesan pendek per giliran (maks 3 kalimat), hangat dan memotivasi, tidak seperti form.
- Ajukan pertanyaan lanjutan HANYA untuk slot yang belum terisi.
- Bila user sudah menjawab banyak hal sekaligus, jangan tanya ulang — ringkas dan konfirmasi singkat.
- Setelah semua slot terisi, ucapkan terima kasih dan beri tahu bahwa website sedang disiapkan.
JANGAN pernah mengarang detail bisnis; tanyakan bila belum jelas.`;
