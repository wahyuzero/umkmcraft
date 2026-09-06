# Product

<!-- impeccable:product-schema 1 -->

> **Provenance note:** every fact below is inferred from the project's own canonical docs
> (README.md, SPEC.md, ARCHITECTURE.md, COMPONENTS.md, ROADMAP.md, SYSTEM_DESIGN.md), written
> by the product owner. Sections marked *(inferred)* are synthesised judgments from those docs.
> Written under explicit user directive to proceed autonomously ("kerjakan semua") without interview.

## Platform

web

## Stack

Delegated (user: "kerjakan semua yang ada di md" — stack sudah ditentukan dokumen): Next.js 16 App Router + React 19 + TypeScript, Tailwind CSS v4 (CSS-first), Zod 4 discriminated-union schema, Vercel AI SDK 6 + Google Gemini 2.5 Flash-Lite, pnpm monorepo (apps/web + packages/schema|renderer|ai|utils), Vitest + fast-check. Penyimpanan MVP: file-backed JSON store di belakang interface repository (Prisma 7 schema disertakan sebagai kontrak DB untuk Fase 4).

## Users

- **Primary:** pemilik UMKM Indonesia (kuliner, fashion, bengkel, barbershop, laundry, coffee shop, toko kelontong) — non-teknis, mengakses dari HP Android, jarang pakai bahasa Inggris, tidak punya waktu/biaya untuk WordPress. Job: punya "website resmi" yang langsung menghasilkan pesanan WhatsApp.
- **Secondary:** pembeli end-customer yang membuka situs tenant dari link WhatsApp Group/Status — mobile-first, koneksi 4G, berharap langsung chat admin.
- *(inferred)* Tersier: admin platform (moderasi abuse report) — saat ini user "Wahyu" sendiri.

## Product Purpose

UMKM Craft = dua produk dalam satu sistem: (1) **Builder App** — wawancara AI santai bahasa Indonesia + editor visual no-code yang menghasilkan JSON konfigurasi; (2) **Published Sites** — ribuan situs tenant statis-cepat yang dirender dari JSON oleh 13 modul komponen deterministik. Sukses = pemilik UMKM dari "curhat" sampai situs live + menerima chat WhatsApp pembeli pertama dalam < 30 menit, tanpa pernah menyentuh kode.

## Positioning

JSON-driven modular engine dengan **WhatsApp-native commerce**: AI tidak menulis kode (murat & mahal), hanya mengisi konfigurasi JSON (~$0.00035/generasi) yang dirender komponen terkurasi — mustahil syntax error di HP pembeli. Diferensiasi yang tidak bisa di-copy builder generik: tombol order WhatsApp 1-klik dengan prefill pesanan rapi, badge Halal/BPOM/P-IRT, hub multi-marketplace Indonesia (Shopee/Tokopedia/GoFood/GrabFood/TikTok Shop), dan status buka/tutup real-time.

## Operating Context

- Bahasa UI: **Indonesia santai** ("kak", bukan "Dear Customer"). `<html lang="id">`.
- Perangkat pemilik: HP Android kecil-kecilan; editor harus bisa dipakai satu tangan.
- Pembeli datang dari tautan WA → preview kartu OG di WhatsApp adalah saluran akuisisi utama.
- Konversi = klik tombol WhatsApp (WA-native, bukan cart-checkout ala Barat).
- Dua surface visual berbeda: **Builder App** (Operate) dan **Situs Tenant** (Persuade, di-theme per preset kategori dari COMPONENTS.md).

## Capabilities and Constraints

- 13 modul: 9 core (hero_storefront, product_catalog_wa, promo_banner, operating_hours_map, social_proof_reviews, channel_marketplace, faq_accordion, contact_direct, rich_text_block) + 4 extended on-demand (gallery_grid, service_pricing_table, trust_badges_strip, step_how_to_order).
- Zero-Runtime-Error Guarantee: schema Zod discriminated union per tipe section + sanitizer deterministik + default props per modul + renderer pure RSC. DILARANG raw HTML/JS injection dari user.
- 6 preset warna kategori (spicy_amber, roasted_mocha, charcoal_slate, blush_rose, electric_blue, fresh_emerald) dari COMPONENTS.md — binding.
- AI: Gemini 2.5 Flash-Lite via AI SDK 6 `Output.object`, prompt slicing per kategori, retry-repair ≤2, fallback model lebih besar, graceful degradation ke template default kategori.
- Anti-abuse wajib (SYSTEM_DESIGN §9): reserved slug list, sanitasi URL https-only, tombol "Laporkan situs", status SUSPENDED.
- Analytics: beacon sendBeacon tanpa cookie (PAGEVIEW, WA_CLICK, WA_PRODUCT_CLICK, OUTBOUND).
- Belum diputuskan (open): auth provider final (Auth.js v5 Google OAuth + email OTP di-desain, MVP anon-first), CF for SaaS custom domain (Fase 4, butuh infra).

## Brand Commitments

- Nama: **UMKM Craft**. Voice: ramah, santai, menjual, bahasa Indonesia sehari-hari; menganggap pemilik usaha "kak".
- Made by Wahyu "untuk kemajuan 64+ juta UMKM Indonesia".
- Icon library wajib konsisten (lucide-react) — dilarang emoji sebagai icon system di UI builder; emoji di copy konten tenant diperbolehkan sesuai konteks WhatsApp.
- Footer situs tenant wajib membawa tombol "Laporkan situs" (kepercayaan platform).

## Evidence on Hand

- Spesifikasi lengkap 6 dokumen (lihat atas) + contoh konfigurasi JSON nyata (Sambal Cumi Asap Juara).
- Belum ada: foto produk asli, testimoni asli, logo, benchmark terukur. **DILARANG** mengarang ulasan pelanggan palsu (aturan prompt SPEC.md/SYSTEM_DESIGN.md §15) — modul `social_proof_reviews` hanya terisi konten demo yang jelas dilabeli contoh, atau kosong dengan empty-state elegan.

## Product Principles

1. **Zero-Runtime-Error Guarantee** — pembeli tidak pernah melihat layar putih; keandalan > fleksibilitas.
2. **WhatsApp-native commerce** — setiap flow diuji terhadap perilaku nyata "nego via chat", bukan pola e-commerce Barat.
3. **Ultra token efficiency** — AI mengisi JSON, bukan menulis kode; setiap klaim biaya harus terukur (tabel AiUsage).
4. **Dual editing** — chat AI DAN kontrol visual, kapan saja, tanpa mode terkunci.
5. **Lokal dulu** — bahasa, marketplace, pembayaran, kurir, dan legalitas (Halal/BPOM/P-IRT) Indonesia bukan add-on melainkan fondasi.

## Accessibility & Inclusion

- Kontras WCAG AA (klaim COMPONENTS.md §1: palet lolos AA — wajib diverifikasi saat implementasi).
- Target pengguna lintas literasi digital: label bahasa Indonesia jelas, tombol besar ramah jempol (≥44px), fokus keyboard di editor.
- `prefers-reduced-motion` dihormati untuk animasi.
