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

## Tenant v2 — pole visual (branch polish/ui-ux-overnight)
- **Placeholder ilustratif per kategori** — motif SVG geometris deterministik (mangkuk+kopi, cup, gunting, kaos, gir, gelembung, label) yang warnanya mengalir dari `--uc-*`, dengan panggung arch + tekstur titik. Jujur (tetap berlabel "contoh"), tapi crafted.
- **Ritme 3 tone** — `SectionShell tone="bg | surface | wash"`; wash = sapuan primary 5%. Variasi densitas antar section dipertahankan.
- **Pola CSS murni** — `.uc-pattern-dots` / `.uc-pattern-lines` (tema-tinted) untuk hero, band promo, stats, CTA.
- **Teks turunan AA** — `--uc-primary-text` / `--uc-secondary-text` (AA di latar terang) dan `--uc-on-primary-text` (AA di atas latar primary; putih pada amber hanya 3.19:1 → dihitung jadi gelap 4.7:1). Modul memakai var teks, var warna mentah untuk dekorasi/latar.
- **Sentuh ≥44px** — semua tombol/tab/row interaktif; tombol WA teks nowrap, active scale 0.98.
- **Scroll-reveal yang tidak bisa menghilang** — `.uc-reveal` memakai `animation-timeline: view()` dengan `animation-fill-mode: none`: kondisi istirahat selalu terlihat; browser tanpa dukungan/berperilaku aneh menampilkan konten penuh. Alasan: kontrak "pembeli tidak pernah melihat konten hilang" > flourish.
- **FAQ** — satu kartu `divide-y`, ikon plus berputar via `group-open`, expand halus `::details-content` (progresif).
- **Kartu konsisten** — `.uc-card` (bayangan dua lapis halus); anti cards-in-cards: daftar panjang memakai `divide-y`, bukan kartu dalam kartu.

## Components
- **SectionShell / SectionHeader** — ritme vertikal konsisten; judul tanpa eyebrow, underline bar pendek warna primary.
- **WaButton / WaIcon** — CTA WhatsApp; hover lift + glow lembut; icon SVG resmi geometris.
- **PriceTag** — Rupiah "Rp35.000" (PUEBI, tanpa spasi), harga coret + badge -%.
- **PillBadge, BestSellerBadge, Starburst** — badge keunggulan; starburst = clip-path geometris murni.
- **PlaceholderImage / SafeImage** — fail-safe elegan berlabel terlihat "Foto … (contoh)"; geometri deterministik per kategori.
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

## Builder v2 — mobile-first & ramah awam
- **HP = tab bawah** — di <lg, 3 kolom menjadi satu panel penuh + toolbar 3 tab (Susun / Pratinjau / Atur, ≥48px, safe-area). Desktop tak berubah.
- **Inspector** — kontrol terpadu (fokus ring signal, counter karakter dari batas skema, toggle 44px, repeater: urutkan ChevronUp/Down, hapus 2-langkah, tambah = cutline dashed), grup field Tampilan/Konten/CTA, "Opsi lanjutan" disclosure.
- **Ikon = lucide-react** di seluruh chrome builder (ikon per tipe section di lembar stiker & katalog modul); tenant tetap inline SVG.
- **PublishButton** — alur draft → Menyegel… → Live (hijau `--color-live` + aksi "Lihat situs"); toast lempeng bawah-tengah dengan aksi.
- **Skeleton loading** per route; error boundary ramah ("Waduh, ada yang error"); 404 tenant & suspended bernada kak.

## Anti-patterns yang dilarang (terverifikasi detector = 0 findings)
Eyebrow/kicker, gradient text, glass, side-tab border >1px, hard offset shadow, icon emoji di chrome UI, bounce easing, cards-in-cards, testimonial palsu (aturan produk).

## Sistem Malam Polishing (12 Sep 2026) — loop riset-2026 → kritik keras → perbaiki

Semua sistem di bawah lahir dari 4 ronde kritik agent + riset tren 2025-2026.
Prinsip satu kalimat: **kebenaran dulu, keindahan menyusul** — produk ini
berjualan kepercayaan pedagang awam, jadi setiap state yang berbohong
(badge LIVE saat ada draf, angka karangan, jam buka basi) adalah bug P0.

### Kebenaran konten (honesty system)
- Placeholder foto memakai ilustrasi motif per kategori (bukan fotonyata);
  caption ≥12px, tanpa "(contoh)" — aria-label yang mengungkap status.
- Chip "Contoh angka" di stats saat nilai = default modul; pre-flight terbit
  menyorot SEMUA angka statistik terisi + foto kosong (hero/produk/galeri/
  tim/IG) + alamat sentinel "Alamat akan diperbarui…" dianggap kosong.
- lintCopy (packages/ai) membuang brosur-speak ("solusi", "kebutuhan" ganda,
  "terbaik untuk kebutuhan Anda") dari SEMUA jalur generate; voice per
  kategori di copy-voice.ts + aturan keras di prompt LLM.
- Data demo diperbarui lewat pipeline asli: warung v9, barber v13 (stats
  karangan dihapus), bengkel-6 v4.

### Rantai jam buka (intake → generate → render)
- extractHours menangkap "buka tiap hari 7 pagi sampai 3 sore" →
  hoursToOpenHours() mengubah ke open_hours terstruktur (pagi/siang/sore/
  malam/HH.MM, rentang hari, "kecuali") → OpenNowBadge (island) menghitung
  Buka/Tutup dari jam perangkat pembeli, re-check per menit, SSR netral
  tanpa CLS. Jangan pernah memanggil `new Date()` saat render RSC.

### Upload foto (HP-first)
- POST /api/sites/[id]/upload: cek kepemilikan sesi, jpg/png/webp ≤5MB,
  nama acak, EXIF/GPS JPEG dibuang (jpeg-exif.ts, fail-open).
- GET /uploads/[...path]: anti path-traversal, cache immutable.
- Inspector: "Ambil Foto" + "tempel link .jpg/.png" + peringatan Drive/IG.

### Kebenaran state editor & pemilik
- PublishButton: staleInitially dari server (draft ≠ published terlihat
  sejak load), publish await flushSave(), pre-flight card
  ("Perbaiki dulu" primer / "Terbitkan saja" outline).
- /situs-saya: badge "Ada draf baru" + Pratinjau (draf, banner + noindex +
  Sunting/Keluar) vs Lihat (?v=published). Orang luar selalu lihat versi
  terbit; draf tak pernah bocor.
- SectionList: urutan tampil = orderedSections() registry (hero pinned,
  pin icon, bukan chevron bohong); hapus = konfirmasi 6s + undo toast;
  dnd-kit ref callbacks WAJIB return cleanup.
- Versi draf dipangkas ke 10 terakhir per situs (ADR-2, published aman).

### Pola 2026 yang dipakai
- Streaming intake NDJSON ({t:"text"} → {t:"done",slots}); typing bubble
  hanya menunggu token pertama; rollback saat offline tetap bersih.
- View transitions antar-halaman (globals.css, motion-safe, 250ms
  ease-out-expo); tekan-ke-kertas (press-in) untuk tombol primer, bukan
  hover-lift; container `wide` lg:max-w-5xl untuk modul galeri/katalog/hero.
- PhonePreview = iframe 390px + React root kedua: breakpoint responsif ke
  lebar ponsel, section bisa diklik untuk memilih (jangan membajak klik
  a/button/summary), scroll-sync dua arah.
- StickyOrderBar (setelah hero keluar viewport, spacer diukur, auto-hide di
  dasar halaman) + SectionNav chip (>6 section, aria-current).
- OG: font Bricolage di-vendor (assets/fonts .woff — satori TIDAK dukung
  woff2); options lewat SATU objek ImageResponse (jangan argumen ke-3!).
