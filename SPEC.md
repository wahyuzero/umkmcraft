# UMKM Craft — Technical Specification & JSON Schema

> **Spesifikasi Teknis Data Model & API Contract**  
> **Status:** Canonical Schema Specification v1.0

> ⚠️ **Status Implementasi:** Schema di bawah belum diimplementasi di kode — ini kontrak yang disepakati sebelum development dimulai. Lihat ARCHITECTURE.md untuk konteks desain lengkap.

---

## 1. Canonical JSON Schema (`UmkmWebsiteConfig`)

Setiap website UMKM di UMKM Craft direpresentasikan dalam satu objek JSON terstruktur berikut:

```json
{
  "$schema": "https://umkmcraft.id/schema/v1.json",
  "meta": {
    "site_id": "sambal-cumi-juara",
    "business_name": "Sambal Cumi Asap Juara",
    "business_category": "kuliner",
    "tagline": "Pedas Gurih Bikin Nagih, 100% Cumi Segar Pilihan",
    "theme": {
      "preset": "spicy_amber",
      "primary_color": "#d97706",
      "secondary_color": "#78350f",
      "background_color": "#fffbeb",
      "font_heading": "Plus Jakarta Sans",
      "font_body": "Plus Jakarta Sans"
    },
    "whatsapp_number": "6281234567890",
    "seo": {
      "title": "Sambal Cumi Asap Juara — Pesan Online Bandung",
      "description": "Sambal cumi asap khas Bandung siap santap. Halal, tanpa pengawet, kirim ke seluruh Indonesia.",
      "keywords": ["sambal cumi", "kuliner bandung", "makanan pedas"]
    }
  },
  "sections": [
    {
      "id": "sec-hero-1",
      "type": "hero_storefront",
      "props": {
        "badge": "🔥 Best Seller Kuliner Bandung",
        "title": "Sambal Cumi Asap Juara",
        "subtitle": "Aroma asap autentik dengan potongan cumi melimpah di setiap sendok.",
        "image_url": "/images/placeholders/sambal-hero.jpg",
        "cta_primary": {
          "label": "Pesan via WhatsApp",
          "action": "whatsapp_direct",
          "prefill_message": "Halo kak, saya mau pesan Sambal Cumi Asap Juara!"
        },
        "badges": ["100% Halal", "Tanpa Pengawet", "Kemasan Higienis"]
      }
    },
    {
      "id": "sec-catalog-1",
      "type": "product_catalog_wa",
      "props": {
        "section_title": "Pilihan Menu Favorit",
        "section_subtitle": "Pilih varian rasa favoritmu, klik langsung terhubung ke WhatsApp",
        "categories": ["Semua", "Sambal", "Paket Hemat"],
        "products": [
          {
            "id": "prod-1",
            "name": "Sambal Cumi Asap Original 150g",
            "price": 35000,
            "original_price": 45000,
            "category": "Sambal",
            "description": "Pedas sedang dengan aroma asap menggoda dan cumi empuk.",
            "image_url": "/images/placeholders/prod-1.jpg",
            "is_bestseller": true
          },
          {
            "id": "prod-2",
            "name": "Sambal Cumi Ekstra Pedas 150g",
            "price": 38000,
            "original_price": 48000,
            "category": "Sambal",
            "description": "Khusus pencinta pedas level nendang!",
            "image_url": "/images/placeholders/prod-2.jpg",
            "is_bestseller": false
          }
        ]
      }
    },
    {
      "id": "sec-hours-1",
      "type": "operating_hours_map",
      "props": {
        "section_title": "Lokasi & Jam Buka",
        "address": "Jl. Cihampelas No. 120, Bandung, Jawa Barat",
        "gmaps_url": "https://maps.google.com/?q=Bandung",
        "schedule": [
          { "day": "Senin - Jumat", "hours": "09:00 - 21:00 WIB" },
          { "day": "Sabtu - Minggu", "hours": "09:00 - 22:00 WIB" }
        ],
        "delivery_note": "Melayani pengiriman Sameday & Paxel ke luar kota."
      }
    },
    {
      "id": "sec-channels-1",
      "type": "channel_marketplace",
      "props": {
        "section_title": "Temukan Kami di Marketplace",
        "channels": [
          { "platform": "shopee", "label": "Shopee Official", "url": "https://shopee.co.id" },
          { "platform": "tokopedia", "label": "Tokopedia Store", "url": "https://tokopedia.com" },
          { "platform": "gofood", "label": "GoFood Super Partner", "url": "https://gofood.link" },
          { "platform": "grabfood", "label": "GrabFood Merchant", "url": "https://grab.com" }
        ]
      }
    },
    {
      "id": "sec-faq-1",
      "type": "faq_accordion",
      "props": {
        "section_title": "Pertanyaan yang Sering Diajukan",
        "items": [
          {
            "q": "Berapa lama ketahanan sambal ini?",
            "a": "Tahan 1 bulan di suhu ruang (segel) dan hingga 3 bulan di dalam freezer."
          },
          {
            "q": "Apakah bisa kirim ke luar pulau Jawa?",
            "a": "Bisa! Kami menggunakan kemasan vacuum kedap udara sehingga aman dikirim ke seluruh Indonesia."
          }
        ]
      }
    }
  ]
}
```

---

### 1.1 Escape Hatch: `rich_text_block`

Untuk bisnis yang tidak persis cocok dengan modul kurasi (lihat ARCHITECTURE.md §6 — Batasan & Extensibility Strategy), tersedia satu modul serbaguna yang tetap deterministik dan aman — bukan raw HTML/JS injection:

```json
{
  "id": "sec-custom-1",
  "type": "rich_text_block",
  "props": {
    "section_title": "Tentang Bengkel Kami",
    "body_markdown": "Kami sudah melayani servis motor sejak 2015. Spesialis motor matic dan bebek, dengan mekanik bersertifikat.",
    "image_url": "/images/placeholders/workshop.jpg",
    "image_position": "right"
  }
}
```

---

### 1.2 Extended & Optional Modules (On-Demand / Kategori Spesifik)

Modul-modul ini **bersifat opsional** — dipanggil secara kondisional oleh AI sesuai jenis bisnis atau ditambahkan manual oleh user via visual editor:

#### A. `gallery_grid` (Portofolio Visual & Before-After)
*Cocok untuk: Barbershop, Salon/MUA, Bengkel Modifikasi, Kerajinan Tangan, Interior.*
```json
{
  "id": "sec-gallery-1",
  "type": "gallery_grid",
  "props": {
    "section_title": "Galeri Hasil Potong & Grooming",
    "section_subtitle": "Koleksi model rambut favorit pelanggan kami",
    "layout": "grid_3_col",
    "items": [
      { "title": "Fade & Pompadour", "image_url": "/images/gallery/1.jpg", "caption": "Classic Clean Fade" },
      { "title": "Comma Hair Style", "image_url": "/images/gallery/2.jpg", "caption": "Korean Texture Look" }
    ]
  }
}
```

#### B. `service_pricing_table` (Tabel Paket Layanan Berjenjang)
*Cocok untuk: Laundry Kiloan/Satuan, Cuci Sepatu/Mobil, Jasa Kursus/Bimbel, Service AC.*
```json
{
  "id": "sec-services-1",
  "type": "service_pricing_table",
  "props": {
    "section_title": "Daftar Paket Cuci & Setrika",
    "tiers": [
      {
        "id": "tier-1",
        "name": "Cuci Lipat Reguler",
        "price": 6000,
        "unit": "per kg",
        "duration": "2 Hari Selesai",
        "features": ["Deterjen Ramah Lingkungan", "Pewangi Premium", "Packing Rapi Plastik"],
        "is_popular": false
      },
      {
        "id": "tier-2",
        "name": "Cuci Setrika Express",
        "price": 12000,
        "unit": "per kg",
        "duration": "4 Jam Siap Ambil",
        "features": ["Setrika Uap Anti-Kusut", "Antar Jemput Gratis (min. 5kg)", "Garansi Wangi 7 Hari"],
        "is_popular": true
      }
    ]
  }
}
```

#### C. `trust_badges_strip` (Metode Bayar, Ekspedisi & Legalitas)
*Cocok untuk: Semua UMKM Online & Pengiriman Luar Kota.*
```json
{
  "id": "sec-trust-1",
  "type": "trust_badges_strip",
  "props": {
    "section_title": "Metode Pembayaran & Pengiriman Terpercaya",
    "payment_methods": ["qris", "bca", "mandiri", "bri", "cod"],
    "shipping_couriers": ["jne", "jnt", "sicepat", "paxel", "gosend"],
    "certifications": ["halal_mui", "bpom", "pirt"]
  }
}
```

#### D. `step_how_to_order` (Langkah Mudah Pemesanan)
*Cocok untuk: Toko Custom Order, Pre-Order, Katering.*
```json
{
  "id": "sec-steps-1",
  "type": "step_how_to_order",
  "props": {
    "section_title": "Cara Mudah Pesan di Toko Kami",
    "steps": [
      { "step_number": 1, "title": "Pilih Produk / Menu", "description": "Tentukan produk dan varian yang ingin kamu pesan." },
      { "step_number": 2, "title": "Klik Pesan via WA", "description": "Format pesanan otomatis terisi rapi di WhatsApp admin." },
      { "step_number": 3, "title": "Konfirmasi & Kirim", "description": "Lakukan pembayaran atau pilih opsi COD, pesanan langsung kami proses!" }
    ]
  }
}
```

---

## 2. Zod Schema Validation Definition (TypeScript)

```typescript
// src/schema/config.ts
import { z } from "zod";

export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number().positive(),
  original_price: z.number().optional(),
  category: z.string(),
  description: z.string(),
  image_url: z.string().default("/placeholder-product.png"),
  is_bestseller: z.boolean().default(false),
});

export const SectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    // === Core Universal Modules ===
    "hero_storefront",
    "product_catalog_wa",
    "promo_banner",
    "operating_hours_map",
    "social_proof_reviews",
    "channel_marketplace",
    "faq_accordion",
    "contact_direct",
    "rich_text_block",
    // === Extended / Category Optional Modules ===
    "gallery_grid",
    "service_pricing_table",
    "trust_badges_strip",
    "step_how_to_order"
  ]),
  props: z.record(z.any()),
});

export const UmkmWebsiteConfigSchema = z.object({
  meta: z.object({
    site_id: z.string(),
    business_name: z.string(),
    business_category: z.string(),
    tagline: z.string(),
    theme: z.object({
      preset: z.string(),
      primary_color: z.string(),
      secondary_color: z.string(),
      background_color: z.string(),
      font_heading: z.string(),
      font_body: z.string(),
    }),
    whatsapp_number: z.string().regex(/^62\d{8,13}$/),
    seo: z.object({
      title: z.string(),
      description: z.string(),
      keywords: z.array(z.string()),
    }),
  }),
  sections: z.array(SectionSchema),
});

export type UmkmWebsiteConfig = z.infer<typeof UmkmWebsiteConfigSchema>;
```

---

## 3. System Prompt Template untuk AI Generator

```markdown
Anda adalah UMKM Craft AI Engine — asisten pembuat website profesional khusus UMKM Indonesia.
Tugas Anda adalah mengubah deskripsi bisnis santai dari pemilik UMKM menjadi konfigurasi JSON valid sesuai schema `UmkmWebsiteConfigSchema`.

ATURAN WAJIB:
1. Hanya keluarkan format JSON murni tanpa markdown pembuka/penutup tambahan jika diminta raw JSON.
2. Buatkan copywriting bahasa Indonesia yang ramah, menjual, dan persuasif (*high-converting*).
3. Format nomor WhatsApp WAJIB dimulai dengan angka 62 (contoh: 6281234567890).
4. Pilih palet warna yang sesuai dengan jenis bisnis (Kuliner: Warm Amber/Red, Barbershop: Dark Charcoal, Fashion: Pastel/Rose, Service: Blue/Emerald).
5. Buatkan 3-5 produk sampel realistis jika user belum menyebutkan daftar lengkap.
6. Pemilihan Modul (Prinsip Efisiensi):
   - Gunakan 4-6 modul inti yang paling relevan untuk struktur utama website.
   - Panggil modul opsional (`gallery_grid`, `service_pricing_table`, `trust_badges_strip`, `step_how_to_order`) HANYA jika relevan dengan konteks bisnis user.
   - Jika kebutuhan bisnis tidak cocok dengan modul terdaftar, gunakan `rich_text_block` sebagai fallback aman — jangan pernah membuat tipe section di luar enum schema.
```
