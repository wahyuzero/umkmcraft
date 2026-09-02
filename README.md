# UMKM Craft (umkmcraft)

<div align="center">

![UMKM Craft Banner](https://img.shields.io/badge/UMKM%20Craft-v1.0.0-blue?style=for-the-badge)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)
[![Next.js 15](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Gemini%20API-orange?style=for-the-badge)](https://ai.google.dev/)

**Fast, Token-Efficient Modular JSON & AI Website Engine for Indonesian MSMEs (UMKM).**  
*Bikin website usaha profesional, katalog WhatsApp 1-klik, dan informasi bisnis dalam 30 detik via obrolan AI.*

[Fitur Utama](#-fitur-utama) • [Arsitektur Hybrid](#-arsitektur-hybrid) • [Struktur Modul](#-katalog-modul-lego) • [Dokumentasi](#-dokumentasi-lengkap) • [Roadmap](#-roadmap)

</div>

---

## 💡 Mengapa UMKM Craft Dibuat?

64+ Juta pelaku UMKM di Indonesia (kuliner, fashion, bengkel, barbershop, jasa service, coffee shop, laundry, toko kelontong) membutuhkan kehadiran digital resmi. Namun, solusi yang ada saat ini memiliki masalah:

* ❌ **WordPress / Wix / Shopify:** Terlalu rumit, banyak menu bahasa Inggris, biaya hosting mahal, dan sulit dipelajari pemula.
* ❌ **Linktree / Bio Links:** Terlalu sederhana, hanya berupa daftar tombol teks tanpa visual katalog produk, jam buka, atau peta lokasi.
* ❌ **Raw AI Code Generation:** Mahal biaya token LLM ($0.15 - $0.30 per prompt), rawan error/sintaks patah (*hallucination*), dan sulit diedit manual oleh pemilik usaha.

### 🌟 Solusi: UMKM Craft (The Hybrid Engine)
**UMKM Craft** menggabungkan **kemudahan wawancara AI santai (*Conversational Intake*)** dengan **keandalan *JSON Schema-Driven Modular Engine***:
1. Pemilik UMKM hanya bercerita santai tentang usahanya lewat chat WhatsApp-style.
2. AI menghasilkan konfigurasi JSON terstruktur dalam 2 detik (**biaya token < $0.001**).
3. Engine merender komponen blok LEGO React yang indah, 100% bebas error, mobile-native, dan siap menerima pesanan WhatsApp.

---

## 🚀 Fitur Utama

- 💬 **Conversational AI Intake:** Wawancara interaktif bahasa Indonesia santai untuk mengekstrak brief bisnis secara otomatis.
- 📱 **WhatsApp 1-Click Ordering:** Tombol beli langsung membuka pesan WhatsApp dengan format order yang otomatis terisi rapi.
- 🧩 **Modular LEGO Sections:** Bebas tambah, hapus, ganti warna, dan atur urutan section dengan visual drag-and-drop.
- ⚡ **Zero-Runtime-Error Guarantee:** Menggunakan arsitektur *pre-built curated components*—mustahil terjadi bug syntax CSS/JS yang rusak di HP pembeli.
- 📍 **LocalBusiness SEO & Maps:** Otomatis menghasilkan *Google LocalBusiness Schema*, jam operasional dinamis (*Buka Sekarang / Tutup*), dan navigasi Google Maps.
- 🛍️ **Multi-Channel Hub:** Integrasi 1-klik ke Shopee, Tokopedia, GoFood, GrabFood, TikTok Shop, dan Instagram.
- 💸 **Ultra Token-Efficient:** Hemat biaya AI hingga 99% dibanding platform yang men-generate kode mentah.

---

## 🏗️ Katalog Modul LEGO

### 🧱 Modul Inti (Core Universal)
| Modul | Fungsi Utama |
|---|---|
| 🏪 `hero_storefront` | Nama brand usaha, foto tempat/produk utama, tagline, dan badge legalitas (Halal, BPOM, P-IRT). |
| 🍱 `product_catalog_wa` | Grid katalog produk/menu, harga, diskon, dan tombol order WhatsApp instan. |
| ⚡ `promo_banner` | Pengumuman flash sale, kupon diskon hari ini, atau pengumuman hari libur. |
| ⏰ `operating_hours_map` | Status buka/tutup toko real-time, peta interaktif, dan tombol rute Google Maps & Waze. |
| ⭐ `social_proof_reviews` | Galeri testimoni pembeli, ulasan WhatsApp, dan rating bintang. |
| 🛒 `channel_marketplace` | Hub tombol menuju toko Shopee, Tokopedia, GoFood, GrabFood, dan TikTok Shop. |
| ❓ `faq_accordion` | Pertanyaan umum: cara pengiriman, ongkir, metode pembayaran, reseller. |
| 📞 `contact_direct` | Alamat lengkap, nomor telepon, admin WhatsApp, dan form pesan langsung. |
| 📝 `rich_text_block` | Modul narasi bebas (markdown + gambar) untuk profil/cerita usaha di luar modul kurasi. |

### 🧩 Modul Opsional (Extended & On-Demand)
| Modul | Target Bisnis & Fungsi |
|---|---|
| 🖼️ `gallery_grid` | Galeri portofolio visual & before-after (Barbershop, Salon, Bengkel, Kerajinan). |
| 📋 `service_pricing_table` | Tabel pricelist paket layanan berjenjang (Laundry, Cuci Mobil, Service AC, Bimbel). |
| 🛡️ `trust_badges_strip` | Strip logo metode bayar (QRIS/Bank), kurir ekspedisi (J&T/Paxel), & sertifikasi. |
| 👣 `step_how_to_order` | Panduan langkah pemesanan bertahap untuk toko pre-order & kustom. |

---

## 📚 Dokumentasi Lengkap

Dokumentasi teknis mendalam tersedia pada berkas berikut:

- 📖 **[`ARCHITECTURE.md`](ARCHITECTURE.md):** Analisis arsitektur sistem, perbandingan efisiensi token, dan perbandingan dengan `umkmcepat`.
- 📋 **[`SPEC.md`](SPEC.md):** Skema data JSON lengkap (*JSON Schema*), spesifikasi payload API, dan prompt templates AI.
- 🧩 **[`COMPONENTS.md`](COMPONENTS.md):** Spesifikasi desain komponen visual, sistem warna OKLCH, dan generator format WhatsApp.
- 🗺️ **[`ROADMAP.md`](ROADMAP.md):** Rencana rilis bertahap dari MVP hingga integrasi multi-tenant SaaS.

---

## 📦 Tech Stack

- **Framework:** Next.js 15 (App Router) / React 19 / TypeScript
- **Styling:** Tailwind CSS & Lucide Icons
- **State & Reordering:** Zustand & `@dnd-kit`
- **AI Engine:** Google Gemini API (1.5 Flash / Pro) via Vercel AI SDK
- **Database (Multi-Tenant):** PostgreSQL / Prisma ORM / Cloudflare R2
- **Deployment:** Vercel / Netlify / Cloudflare Pages

---

## 📄 Lisensi

Didistribusikan di bawah Lisensi MIT. Bebas digunakan untuk pengembangan komersial maupun portofolio open-source.

---

<div align="center">
  <sub>Dibuat dengan ❤️ untuk kemajuan 64+ juta UMKM Indonesia oleh <b>Wahyu</b>.</sub>
</div>
