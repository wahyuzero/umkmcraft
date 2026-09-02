# UMKM Craft — Product Roadmap & Execution Phases

> **Rencana Rilis & Pengembangan Bertahap**  
> **Status:** Active Roadmap 2026

---

## 🟢 Fase 1: Core Engine & Component Registry (MVP)
- [x] Dokumen Arsitektur & Skema JSON Standar Bertingkat (`SPEC.md`).
- [ ] Implementasi modul komponen dasar Core (`hero_storefront`, `product_catalog_wa`, `operating_hours_map`, `channel_marketplace`, `rich_text_block`, dll.).
- [ ] Implementasi modul komponen Extended / Optional (`gallery_grid`, `service_pricing_table`, `trust_badges_strip`, `step_how_to_order`).
- [ ] Utilitas otomatis format mata uang Rupiah & link WhatsApp Generator (`createWhatsAppOrderLink`).
- [ ] Testing rendering statis dengan data mockup UMKM kuliner, barbershop, dan jasa.

---

## 🟡 Fase 2: Visual Studio Builder (No-Code Experience)
- [ ] Panel editor di sisi kiri (*Sidebar Controls*) untuk mengedit teks, harga, dan upload foto produk.
- [ ] Tombol `[ + Tambah Seksi ]` untuk menyisipkan modul opsional dari katalog komponen kapan saja.
- [ ] Layar pratinjau responsif (*Live Mobile Preview*) di sisi kanan dengan frame HP interaktif.
- [ ] Fitur *Drag-and-Drop Reordering* section menggunakan library `@dnd-kit`.
- [ ] Fitur *Color Theme Switcher* untuk mengganti preset warna usaha dalam 1 klik.

---

## 🟣 Fase 3: Conversational AI Intake Engine
- [ ] Integrasi Google Gemini 1.5 Flash API via Vercel AI SDK.
- [ ] *Category-Based Prompt Slicing* (hanya menyuntikkan schema modul relevan untuk hemat token < $0.001 & anti-halusinasi).
- [ ] Chatbot intake ramah bahasa Indonesia untuk mewawancarai pemilik UMKM dan mengekstrak brief bisnis.
- [ ] Generator JSON otomatis (*Prompt-to-Website*) dengan waktu inferensi < 3 detik.
- [ ] Fitur *AI Copywriting Magic Button* untuk memoles deskripsi produk yang kurang menarik menjadi kalimat jualan yang menggugah selera.

---

## 🔵 Fase 4: Multi-Tenant Deployment & Growth Features
- [ ] Routing multi-tenant subdomain otomatis (misal: `kedaikopi.umkmcraft.id`).
- [ ] Dukungan custom domain pribadi (*CNAME mapping*).
- [ ] Dashboard analitik sederhana: Hitung jumlah klik tombol WhatsApp, pengunjung harian, dan produk paling populer.
- [ ] Generator Google LocalBusiness Schema & Sitemap XML otomatis untuk SEO lokal.

---

*Roadmap ini dapat disesuaikan seiring validasi feedback dari para pelaku UMKM nyata di lapangan.*
