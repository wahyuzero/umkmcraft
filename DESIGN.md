# DESIGN.md — UMKM Craft

<!-- Dicatat dari dunia yang dibangun (bukan niat) — format Google Stitch design-md. -->

## Brand
- **Name:** UMKM Craft
- **Voice:** bahasa Indonesia santai dan hangat; memanggil pengguna "kak"; copy menjual tanpa hype.
- **Position:** alat kerja UMKM — terasa seperti meja kerja tukang, bukan dashboard korporat.

## World — "Label Press" (Meja Sablon Label)
Builder = meja sablon label UMKM: daftar section adalah **lembar stiker die-cut**, preview HP adalah **kemasan** yang diberi label, modul opsional ditandai **stiker starburst**. Seed key: `ccf404e6` (mode operate). Raises: satu sinyal amber + depth-as-state (cracktro), penguasa kalibrasi berlabel (oscilloscope), lock grid 4px (gameboy), state paling terang disimpan untuk mode live (cyclorama).

## Tokens (Builder App)
| Token | Value | Use |
|---|---|---|
| `--color-paper` | `#f6f1e7` | ground builder |
| `--color-paper-deep` | `#ebe2cf` | area preview |
| `--color-card` | `#fffdf8` | kartu/stiker |
| `--color-ink` | `#231c10` | teks utama |
| `--color-ink-soft` | `#6b6250` | teks sekunder |
| `--color-signal` | `#9a3412` | SATU-satunya aksi/aktif (amber sinyal) |
| `--color-signal-soft` | `#f3ddce` | wash state aktif |
| `--color-cutline` | `#d8cdb4` | garis die-cut putus-putus |
| `--color-live` | `#1a7f4b` | status published/live |
| display | Bricolage Grotesque (var `--font-bricolage`) | judul, angka besar |
| UI | Inter (var `--font-inter`) | body, kontrol |
| radius | kartu 16px (`rounded-2xl`), stiker kecil 12px | pills hanya kontrol kecil |
| shadow | `0 1px 2px` + `0 8px 24px -12px` (plate); kemasan lebih dalam | offset + blur lembut |
| motion | ease-out-expo `cubic-bezier(0.16,1,0.3,1)`; satu momen orkestrasi: stiker "menempel" saat ditambah | `prefers-reduced-motion` dihormati |

## Tokens (Situs Tenant) — brief-pinned (COMPONENTS.md §1)
6 preset kategori via CSS vars runtime `--uc-*`:
`spicy_amber` (#d97706/#fffbeb), `roasted_mocha` (#78350f/#faf5ee), `charcoal_slate` (#1e293b/#f8fafc), `blush_rose` (#e11d48/#fff1f2), `electric_blue` (#2563eb/#f0f9ff), `fresh_emerald` (#059669/#f0fdf4). Font default tenant: **Plus Jakarta Sans** (Tokotype, Jakarta — identitas nasional; dapat dioverride per-tenant via `theme.font_*`).

## Components
- **SectionShell / SectionHeader** — ritme vertikal konsisten; judul tanpa eyebrow, underline bar pendek warna primary.
- **WaButton / WaIcon** — CTA WhatsApp; hover lift + glow lembut; icon SVG resmi geometris.
- **PriceTag** — Rupiah "Rp35.000" (PUEBI, tanpa spasi), harga coret + badge -%.
- **PillBadge, BestSellerBadge, Starburst** — badge keunggulan; starburst = clip-path geometris murni.
- **PlaceholderImage / SafeImage** — fail-safe elegan berlabel "Foto … (placeholder)"; geometri deterministik per kategori.
- **Stiker section (builder)** — kartu die-cut dashed; aktif = wash `signal-soft` + lift (depth-as-state, bukan border tambahan).
- **PhonePreview ("kemasan")** — frame HP dengan penguasa kalibrasi "PRATINJAU 390PX"; merender engine ASLI.
- **FAQ akordeon** — `<details>/<summary>` murni, 0 JS; animasi `interpolate-size` dengan fallback aman.
- **Browser surfaces** — selection amber, scrollbar tipis bertema, focus ring primary 3px konsisten.

## Layout
- Builder: header rak alat (72px) → 3 kolom: lembar stiker 300px / kemasan tengah / inspector 340px; grid lock 4px.
- Tenant: max-w-3xl, padding 20/32px, ritme py-14/16; densitas bervariasi antar section (katalog rapat, jam buuka kartu lega).
- Landing: hero editorial 2 kolom dengan bukti produk nyata (engine render), bukan screenshot palsu.

## Motion
Satu momen orkestrasi: stiker menempel (`uc-stick-in`, ease-out-expo). Lainnya mikro: lift hover 150–200ms, dot pulse 1.6s (motion-safe), FAQ expand 300ms. Dilarang bounce/elastic.

## Anti-patterns yang dilarang (terverifikasi detector = 0 findings)
Eyebrow/kicker, gradient text, glass, side-tab border >1px, hard offset shadow, icon emoji di chrome UI, bounce easing, cards-in-cards, testimonial palsu (aturan produk).
