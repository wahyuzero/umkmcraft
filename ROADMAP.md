# UMKM Craft — Product Roadmap & Execution Phases

> **Rencana Rilis & Pengembangan Bertahap**  
> **Status:** Active Roadmap 2026 — Fase 1–3 selesai (MVP), Fase 4 fondasi terpasang

---

## 🟢 Fase 1: Core Engine & Component Registry (MVP) ✅ SELESAI
- [x] Dokumen Arsitektur & Skema JSON Standar Bertingkat (`SPEC.md`).
- [x] Implementasi modul komponen dasar Core (`hero_storefront`, `product_catalog_wa`, `operating_hours_map`, `channel_marketplace`, `rich_text_block`, dll.) — 9/9 modul di `packages/renderer/src/modules/`.
- [x] Implementasi modul komponen Extended / Optional (`gallery_grid`, `service_pricing_table`, `trust_badges_strip`, `step_how_to_order`) — 4/4.
- [x] Utilitas otomatis format mata uang Rupiah & link WhatsApp Generator (`createWhatsAppOrderLink`) — `packages/utils`.
- [x] Testing rendering statis dengan data mockup UMKM kuliner, barbershop, laundry, dan jasa — 48 test (vitest + fast-check + golden fixtures) hijau.
- [x] + Discriminated union Zod schema per tipe section + sanitizer deterministik (SYSTEM_DESIGN §6/§7.3).
- [x] + Monorepo boundary: `packages/schema|renderer|ai|utils` — renderer pure tanpa import builder (SYSTEM_DESIGN §3).
- [x] + RSC by default; JS client hanya island (tabs, lightbox, timer, coupon, beacon).

## 🟡 Fase 2: Visual Studio Builder (No-Code Experience) ✅ SELESAI (MVP)
- [x] Panel editor di sisi kiri (*Sidebar Controls*) untuk mengedit teks, harga, dan foto produk — Inspector schema-driven + repeater (upload file → pipeline R2 di Fase 4; saat ini field URL).
- [x] Tombol `[ + Tambah Seksi ]` — ModuleCatalog "Lembar Stiker" dengan 13 modul.
- [x] Layar pratinjau responsif (*Live Mobile Preview*) dengan frame HP — PhonePreview merender engine asli.
- [x] Fitur *Drag-and-Drop Reordering* section — `@atlaskit/pragmatic-drag-and-drop` (React 19-ready; keputusan risiko terbuka §17.5).
- [x] Fitur *Color Theme Switcher* — 6 preset warna 1-klik.
- [x] + Autosave draft debounce 800ms → immutable `site_versions` + publish pointer swap + revalidateTag (ADR-2, diangkat dari Fase 4 sesuai §16).
- [x] + Publish subdomain wildcard (proxy.ts host-routing) + path preview `/sites/{slug}` — loop E2E (buat→live→terima WA) tervalidasi.

## 🟣 Fase 3: Conversational AI Intake Engine ✅ SELESAI (MVP, graceful degradation)
- [x] Integrasi Google Gemini 2.5 Flash-Lite via AI SDK 6 (`generateText` + `Output.object`; `streamText` untuk intake) — koreksi kematian Gemini 1.5 (SYSTEM_DESIGN riset #1).
- [x] *Category-Based Prompt Slicing* — hanya modul relevan disuntik; anti-halusinasi + larangan review palsu di system prompt (SPEC §15).
- [x] Chatbot intake ramah bahasa Indonesia — `/start` anon-first; slot extraction DETERMINISTIK di server (ADR-3), tidak memercayai teks LLM.
- [x] Generator JSON otomatis (*Prompt-to-Website*) — repair loop ≤2 retry + fallback model + graceful degradation ke template engine (tanpa API key pun produk jalan penuh).
- [x] Fitur *AI Copywriting Magic Button* — `/api/ai/polish` (fallback template tanpa key).
- [x] + Rate limit & kuota per IP (generate 5/jam anon, intake 30/jam) + reserved slug list anti-phishing (SYSTEM_DESIGN §7.6/§9).

## 🔵 Fase 4: Multi-Tenant Deployment & Growth Features ◐ SEBAGIAN (fondasi terpasang)
- [x] Routing multi-tenant subdomain otomatis — `proxy.ts` host-based (Next 16, Node runtime); dev pakai `*.lvh.me`.
- [ ] Dukungan custom domain pribadi (*CNAME mapping*) — model `Domain` + verifikasi tersedia di store/Prisma; provisioning Cloudflare for SaaS butuh infra produksi.
- [x] Dashboard analitik sederhana — beacon `sendBeacon` tanpa cookie (`/api/t`) + event PAGEVIEW/WA_CLICK/WA_PRODUCT_CLICK/OUTBOUND; penyimpanan JSONL per site.
- [x] Generator Google LocalBusiness Schema & Product JSON-LD + robots + OG image dinamis (`next/og`) — JSON-LD terverifikasi di situs tenant live.
- [x] + Moderasi & anti-abuse: reserved slugs, moderasi konten saat publish, tombol "Laporkan situs", halaman SUSPENDED (SYSTEM_DESIGN §9 — bukan opsional).
- [ ] Auth penuh (Auth.js v5 Google OAuth + email OTP) — MVP anon-first dengan sesi cookie httpOnly + ownership binding; jalur upgrade tersedia.
- [ ] Prisma 7 + Postgres produksi — `apps/web/prisma/schema.prisma` siap (interface store 1:1 dengan file-backed MVP).

---

*Koreksi teknologi 2026 (SYSTEM_DESIGN §15): Next.js 16.3.4 (`proxy.ts`, `cacheComponents`), React 19.2, Tailwind CSS v4.3, Zod 4, AI SDK 6 + Gemini 2.5 Flash-Lite, Prisma schema @7.*

*Roadmap ini dapat disesuaikan seiring validasi feedback dari para pelaku UMKM nyata di lapangan.*
