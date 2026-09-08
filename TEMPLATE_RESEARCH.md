# Riset Template & Section Web — Referensi Perluasan Modul UMKM Craft

> **Tanggal:** 2026-09-08 · **Status:** Referensi implementasi
> **Tujuan:** Inventarisasi 50+ template/section web dari ekosistem nyata sebagai dasar
> perluasan modul editor UMKM Craft (13 modul → 27 modul).
> **Metode:** Survei galeri section, library template Bootstrap, marketplace template,
> roundup vertikal bisnis (restoran, barbershop, fashion, jasa), dan builder lokal Indonesia.

---

## 1. Ringkasan Temuan

Dari 80+ template yang disurvei, pola section yang berulang terkonsolidasi menjadi **taksonomi 43 section**. UMKM Craft saat ini baru punya 13 modul. 14 modul terpilih untuk diimplementasikan pada gelombang ini (§4), sisanya masuk backlog (§5).

**Prinsip penyaringan** (semua modul baru wajib lolos):
1. **WhatsApp-native** — setiap section harus bermuara ke chat/jualan WA, bukan estetika kosong.
2. **RSC-first** — tanpa JS client kecuali memang interaktif (satu island baru: form booking).
3. **Props terkunci Zod** — AI tidak bisa mengarang field di luar schema.
4. **Konten bisa diisi pemilik UMKM** — tanpa API pihak ketiga, tanpa upload backend (URL/path gambar saja).

---

## 2. Referensi (80+ template & galeri)

### A. Galeri & library blok section — inspirasi per-section

| # | Nama | Sumber | Section khas yang dipinjam |
|---|---|---|---|
| 1 | Landingfolio | [landingfolio.com](https://landingfolio.com/) | Taksonomi kategori section: hero, features, stats, logos, testimonials, pricing, FAQ, CTA |
| 2 | One Page Love | [onepagelove.com](https://onepagelove.com/) | Struktur one-page: urutan section single-scroll |
| 3 | SaaSpages | [saaspages.xyz](https://saaspages.xyz/) | Pola section SaaS: logos strip, metrics, testimonial wall |
| 4 | Land-book | [land-book.com](https://land-book.com/) | Galeri landing page kurasi; pola CTA band |
| 5 | Mobirise Blocks (200+/4000+) | [mobirise.com](https://mobirise.com/) · [GitHub](https://github.com/Mobirise/Mobirise) | Kategori blok: headers, galleries, shops, pricing tables, testimonials, **team blocks, counters** |
| 6 | Web Anatomy — Hero examples | [webanatomy.ai](https://www.webanatomy.ai/best-landing-pages/sections/hero) | Anatomi hero: headline, subheadline, CTA, visual |
| 7 | SaaS Hero — 12 Social Proof Tactics | [saashero.net](https://www.saashero.net/content/landing-page-social-proof-examples/) | Penempatan logos/metrics di hero, testimoni dekat CTA |
| 8 | Dribbble — Fashion ecommerce tag | [dribbble.com/tags/fashion-ecommerce-website](https://dribbble.com/tags/fashion-ecommerce-website) | Lookbook grid, product spotlight |
| 9 | saaslandingpage.com — inspiration sites | [saaslandingpage.com](https://saaslandingpage.com/articles/10-inspiration-sites-every-landing-page-lover-should-bookmark/) | Indeks galeri per-section |
| 10 | Taap.bio — landing page ideas | [taap.bio/blog/landing-page-ideas](https://taap.bio/blog/landing-page-ideas) | Hero + logo block + testimonial layout |

### B. BootstrapMade — template konkret (restoran, bisnis, portfolio)

| # | Template | Sumber | Section khas |
|---|---|---|---|
| 11 | **Restaurantly** | [bootstrapmade.com/restaurantly-restaurant-template](https://bootstrapmade.com/restaurantly-restaurant-template/) | Menu list, **Book-a-Table form**, gallery, chefs, events, why-us, testimonials |
| 12 | **Maxim** | [bootstrapmade.com](https://bootstrapmade.com/) | About, menu 2 kolom, specials, events, book-a-table, chefs |
| 13 | **Delicious** | [bootstrapmade.com/delicious-free-restaurant-bootstrap-theme](https://bootstrapmade.com/delicious-free-restaurant-bootstrap-theme/) | One-page restoran flat: menu, gallery, reservations |
| 14 | **Savora** | [bootstrapmade.com/savora-bootstrap-restaurant-template](https://bootstrapmade.com/savora-bootstrap-restaurant-template/) | Hero "signature dishes", menu sections |
| 15 | **Baker** | [bootstrapmade.com](https://bootstrapmade.com/) | About + **counts (statistik)**, menu, chefs, testimonials |
| 16 | **Arsha** | [bootstrapmade.com](https://bootstrapmade.com/) | **Stats counters**, services grid, team, pricing, FAQ, **CTA band** |
| 17 | **BizLand** | [bootstrapmade.com](https://bootstrapmade.com/) | Clients logo strip, featured services, testimonials carousel |
| 18 | **Gp** | [bootstrapmade.com](https://bootstrapmade.com/) | About w/ video, services, features, team, pricing |
| 19 | **FlexStart** | [bootstrapmade.com](https://bootstrapmade.com/) | Features grid, counts, portfolio, team, pricing, FAQ |
| 20 | **Bootslander** | [bootstrapmade.com](https://bootstrapmade.com/) | Landing: details, features, gallery, team, pricing, FAQ |
| 21 | **Presento** | [bootstrapmade.com](https://bootstrapmade.com/) | **Clients strip**, services, counts, team, pricing |
| 22 | **Mentor** | [bootstrapmade.com](https://bootstrapmade.com/) | Courses, **trainers (team)**, **events**, pricing, FAQ |
| 23 | **Laura** | [bootstrapmade.com/laura-free-creative-bootstrap-theme](https://bootstrapmade.com/laura-free-creative-bootstrap-theme/) | One-page kreatif ringan: about, services, contact |
| 24 | **Kelly** | [bootstrapmade.com](https://bootstrapmade.com/) | Portfolio personal: about, resume timeline, services |
| 25 | **Knight** | [bootstrapmade.com](https://bootstrapmade.com/) | Portfolio: services, portfolio filter, facts |
| 26 | **iPortfolio** | [bootstrapmade.com](https://bootstrapmade.com/) | Resume timeline, portfolio, facts |
| 27 | **OnePage** | [bootstrapmade.com](https://bootstrapmade.com/) | About, services, roadmap timeline, team, pricing, FAQ |
| 28 | **DevFolio** | [bootstrapmade.com](https://bootstrapmade.com/) | Freelancer: services, portfolio, blog list |

### C. Start Bootstrap — template konkret

| # | Template | Sumber | Section khas |
|---|---|---|---|
| 29 | **Agency** | [startbootstrap.com](https://startbootstrap.com/) | Services, portfolio grid, **about timeline**, **team**, **clients logos strip** |
| 30 | **Creative** | [startbootstrap.com](https://startbootstrap.com/) | One-page: services, portfolio, **full-bleed CTA band** |
| 31 | **Grayscale** | [startbootstrap.com](https://startbootstrap.com/) | Dark one-page, CTA bertingkat |
| 32 | **Shop Homepage** | [startbootstrap.com](https://startbootstrap.com/) | Grid produk toko dengan badge "Sale" |
| 33 | **Shop Item** | [startbootstrap.com](https://startbootstrap.com/) | **Detail produk tunggal**: harga, bullet highlights, CTA |
| 34 | **Business Frontpage** | [startbootstrap.com](https://startbootstrap.com/) | Services + **team kartu** + testimonials |
| 35 | **Business Casual** | [startbootstrap.com](https://startbootstrap.com/) | Kartu menu/produk bergaya kasual |
| 36 | **Landing Page** | [startbootstrap.com](https://startbootstrap.com/) | Feature blocks selang-seling gambar |
| 37 | **Clean Blog** | [startbootstrap.com](https://startbootstrap.com/) | **Daftar post blog/berita** |
| 38 | **Resume / CV** | [startbootstrap.com](https://startbootstrap.com/) | **Timeline pengalaman** |
| 39 | **Coming Soon** | [startbootstrap.com](https://startbootstrap.com/) | **Countdown** + subscribe |
| 40 | **Heroic Features** | [startbootstrap.com](https://startbootstrap.com/) | Grid kartu fitur ringkas |
| 41 | **Modern Business** | [startbootstrap.com](https://startbootstrap.com/) | Kit multi-halaman: pricing, FAQ, testimonials, blog |

### D. HTML5 UP — template one-page/portfolio

| # | Template | Sumber | Section khas |
|---|---|---|---|
| 42 | Dimension | [html5up.net](https://html5up.net/) | One-page artistik berlapis (panel per section) |
| 43 | Massively | [html5up.net](https://html5up.net/) | Blog editorial, post list |
| 44 | Stellar | [html5up.net](https://html5up.net/) | One-page section bertumpuk + CTA |
| 45 | Phantom | [html5up.net](https://html5up.net/) | Grid tile kategori |
| 46 | Editorial | [html5up.net](https://html5up.net/) | Blog/portfolio dengan sidebar |
| 47 | Strata | [html5up.net](https://html5up.net/) | Portfolio + **counter statistik** |
| 48 | Hyperspace | [html5up.net](https://html5up.net/) | App landing: features, CTA sidebar |
| 49 | Alpha | [html5up.net](https://html5up.net/) | Marketing: **CTA banners** berulang |

### E. Marketplace template & page builder besar

| # | Template/Theme | Sumber | Section khas |
|---|---|---|---|
| 50 | Avada (ThemeForest #1) | [themeforest.net](https://themeforest.net/) | Demo library: countdown, tabs, timeline, team, pricing table |
| 51 | Flatsome (WooCommerce top) | [themeforest.net](https://themeforest.net/) | UX Builder blocks: banner, product row, testimonial |
| 52 | Porto (multi-demo) | [themeforest.net](https://themeforest.net/) | Demo restoran/toko: menu, about, team |
| 53 | Webflow Salon & Barbershop | [webflow.com/templates/subcategory/salon-and-barbershop-websites](https://webflow.com/templates/subcategory/salon-and-barbershop-websites) | **Booking appointment**, service menu, gallery gaya rambut |
| 54 | Webflow Clothing ecommerce | [webflow.com/list/clothing-ecommerce](https://webflow.com/list/clothing-ecommerce) | Lookbook, collection grid, size guide |
| 55 | Framer "Barber" | [framer.com/marketplace](https://www.framer.com/marketplace/templates/barber-hair-salon-hairdresser-website-template/) | Gallery, pricing, testimonials, **team**, **booking**, contact |
| 56 | Wix Restaurants & Food | [wix.com/website/templates/html/restaurants-food](https://www.wix.com/website/templates/html/restaurants-food) | Menu, reservasi, **QR menu**, gallery |
| 57 | Wix Fashion & Clothing | [wix.com/website/templates/html/online-store/fashion-clothing](https://www.wix.com/website/templates/html/online-store/fashion-clothing) | Lookbook, product grid, shipping info |
| 58 | Squarespace restaurant family | [squarespace.com/templates](https://www.squarespace.com/templates) | Menu page, reservation CTA, hours |
| 59 | Shopify Dawn/Impulse/Motion | [shopify.com/themes](https://www.shopify.com/themes) | Product grid, collection list, **shipping/payment info bar**, announcement bar |
| 60 | Canva restaurant templates | [canva.com/website-builder/templates/restaurant](https://www.canva.com/website-builder/templates/restaurant/) | Menu visual, reservasi, kontak |
| 61 | Figma Community — Restaurant | [figma.com/community/website-templates/restaurant](https://www.figma.com/community/website-templates/restaurant) | Menu + gallery + atmosfer |
| 62 | Figma Community — Fashion | [figma.com/community/website-templates/fashion](https://www.figma.com/community/website-templates/fashion) | Lookbook, product gallery |
| 63 | Nicepage — Barber one-page | [nicepage.com/k/barber-one-page-template](https://nicepage.com/k/barber-one-page-template) | Layanan + harga satu halaman |
| 64 | Lovable TrimSync Barbershop | [lovable.dev/templates](https://lovable.dev/templates/websites/services/trimsync-premium-barbershop-booking-template) | **Booking-first flow**, services grid, gallery |
| 65 | Etsy — Barbershop HTML5 | [etsy.com/market/barbershop_website_template](https://www.etsy.com/market/barbershop_website_template) | Booking page, fade gallery |
| 66 | Etsy — Restaurant QR menu | [etsy.com/market/restaurant_website_template](https://www.etsy.com/market/restaurant_website_template?page=5) | **QR menu** untuk pelanggan di tempat |

### F. Roundup vertikal & panduan struktur

| # | Sumber | Link | Temuan |
|---|---|---|---|
| 67 | Site Builder Report — Restaurant (20+) | [sitebuilderreport.com/restaurant-website-templates](https://www.sitebuilderreport.com/restaurant-website-templates) | Menu, testimoni, form reservasi |
| 68 | Site Builder Report — Barbershop/Salon (100+) | [sitebuilderreport.com/templates/barbershop-salon](https://www.sitebuilderreport.com/templates/barbershop-salon) | Booking di depan, harga layanan jelas |
| 69 | The Foody Gram — 11 restaurant templates | [thefoodygram.com](https://www.thefoodygram.com/blogs/restaurant-resources/best-restaurant-website-templates) | Menu, gallery, reservasi, order online |
| 70 | TrooThemes — restaurant roundup | [troothemes.com](https://www.troothemes.com/blog/best-restaurant-website-templates/) | Reservasi, menu, special offers |
| 71 | ThemesPride — barber roundup | [themespride.com](https://www.themespride.com/blogs/theme/barber-website-templates) | Booking, service menu, gallery |
| 72 | Slider Revolution — barbershop | [sliderrevolution.com](https://www.sliderrevolution.com/design/barbershop-website-template/) | Hero visual, showcase karya |
| 73 | MetropolitanHost — fashion guide | [metropolitanhost.com](https://metropolitanhost.com/blog/fashion-apparel-templates/fashion-ecommerce-website-template-guide/) | Lookbook page, product photography, **size guide** |
| 74 | DiverseKit — 16 fashion templates | [diversekit.com](https://diversekit.com/blog/best-16-fashion-website-templates-for-modern-brands) | Brand storytelling, product presentation |
| 75 | Colorlib — 26 free fashion templates | [colorlib.com/wp/free-fashion-website-templates](https://colorlib.com/wp/free-fashion-website-templates/) | **Lookbook grid**, brand story, WooCommerce-ready |
| 76 | GetResponse — Landing Pages 101 | [getresponse.com/blog/landing-page](https://www.getresponse.com/blog/landing-page) | Social proof, pricing, FAQ, CTA beli |
| 77 | Involve.me — landing structure | [involve.me/blog/landing-page-structure](https://www.involve.me/blog/landing-page-structure) | Peran tiap section: hero→proof→CTA |
| 78 | Leadfeeder — SaaS landing | [leadfeeder.com](https://www.leadfeeder.com/blog/conversion-optimization/saas-landing-pages-that-convert/) | Urutan: Hero→Features→Proof→Why-us |
| 79 | Taqwah — 29 SaaS examples | [taqwah.agency](https://taqwah.agency/blog/saas-landing-page-examples) | Anatomi hero above-the-fold |
| 80 | Spaced Digital — B2B guide | [spaced.digital/b2b-landing-page-guide](https://spaced.digital/b2b-landing-page-guide/) | CTA primer tunggal yang jelas |

### G. Builder lokal Indonesia (kalibrasi pasar)

| # | Produk | Link | Relevansi |
|---|---|---|---|
| 81 | Jubelio Store | [jubelio.store](https://jubelio.store/) | Tema gratis UMKM: banner hero, product grid, testimoni, info pengiriman |
| 82 | Rakit.dev (kompetitor langsung) | [rakit.dev](https://rakit.dev/solutions/umkm) | "Toko instan dari prompt", checkout QRIS — pembanding positioning |

---

## 3. Taksonomi Section Hasil Survei (43 pola)

| Pola section | Ada di referensi | Status UMKM Craft |
|---|---|---|
| Announcement bar | #59 Shopify | Backlog |
| Navbar sticky | #1–10 semua | Di luar lingkup (tenant one-scroll) |
| Hero split/centered/background | #6, #11, #79 | ✅ `hero_storefront` |
| Hero video | #18 Gp | Backlog |
| Logo/client strip | #17, #21, #29 | Backlog |
| **Stats/counters** | #15, #16, #19, #47 | 🆕 `stats_counter_strip` |
| **Features/why-us grid (ikon)** | #16, #19, #40, #78 | 🆕 `value_props_grid` |
| About/cerita brand | #11, #27 | ✅ `rich_text_block` |
| **Timeline cerita/sejarah** | #24, #26, #29, #38 | 🆕 `timeline_story` |
| **Tim/chef/barber** | #11, #22, #29, #34, #55 | 🆕 `team_members_grid` |
| **Menu list harga (dotted)** | #11, #12, #13, #56 | 🆕 `menu_price_list` |
| Katalog/grid produk | #32, #51, #59 | ✅ `product_catalog_wa` |
| **Produk unggulan (spotlight)** | #33, #14 | 🆕 `product_spotlight` |
| Gallery/lookbook + lightbox | #11, #53, #55, #75 | ✅ `gallery_grid` |
| Before/after slider | #53 (salon) | Backlog (butuh island interaktif) |
| Video embed section | #18, #50 | Backlog |
| **Instagram/social showcase** | #74, #8 | 🆕 `instagram_showcase_grid` |
| Testimoni/reviews | #11, #17, #55 | ✅ `social_proof_reviews` |
| Rating summary (Google/WA) | #7 | Backlog |
| Pricing table berjenjang | #16, #19, #50 | ✅ `service_pricing_table` |
| Price list layanan sederhana | #53, #55, #63 | (tercakup `service_pricing_table` + `menu_price_list`) |
| Comparison table | #50 | Backlog |
| **Form booking/appointment** | #11, #53, #55, #64 | 🆕 `booking_whatsapp_form` |
| Reservation (restoran) | #11, #56, #67 | (varian `booking_whatsapp_form`) |
| Contact form/kontak | semua | ✅ `contact_direct` |
| Map + jam buka | #58, #67 | ✅ `operating_hours_map` |
| **Daftar cabang/outlet** | #52, #59 (store locator) | 🆕 `branch_locations_list` |
| FAQ akordeon | #16, #19, #76 | ✅ `faq_accordion` |
| Steps / how to order | #77 | ✅ `step_how_to_order` |
| Trust badges (bayar/kurir/sertifikat) | #59, #81 | ✅ `trust_badges_strip` |
| Promo banner + countdown | #39, #50 | ✅ `promo_banner` |
| Kupon/diskon | #32 (badge sale) | ✅ (dalam `promo_banner`) |
| **Jadwal acara/bazar** | #11, #12, #22 (events) | 🆕 `event_schedule_list` |
| **Blog/kabar terbaru** | #37, #43, #46 | 🆕 `updates_blog_list` |
| Newsletter subscribe | #39 | Backlog (ganti: langganan promo via WA) |
| **Download katalog/brosur PDF** | #66 (QR menu), #73 | 🆕 `download_catalog_cta` |
| **QR code "scan untuk chat"** | #56, #66 | 🆕 `qr_code_whatsapp` |
| **CTA band full-width** | #30, #31, #49, #77 | 🆕 `cta_banner_full` |
| Link-in-bio grid | #10 (taap.bio) | Backlog |
| Marketplace/social hub | #81 | ✅ `channel_marketplace` |
| Hiring/karier banner | jarang di UMKM | Backlog |
| Footer (kontak, sosial, legal) | semua | ✅ `TenantFooter` (global) |
| Floating WA button | #81 | ✅ (global tenant layout) |

---

## 4. Keputusan Implementasi — 14 Modul Baru

Total modul: **13 existing + 14 baru = 27 tipe section**. Semua tetap dalam kontrak
`UmkmWebsiteConfigSchema` (maks 20 section per config tidak berubah).

| Modul baru | Pola sumber utama | Ringkasan props | Render |
|---|---|---|---|
| `stats_counter_strip` | #15 Baker counts, #16 Arsha | `stats[] {value, label}` | Baris angka besar 2–4 kolom, RSC |
| `value_props_grid` | #16 Arsha services, #40 Heroic Features | `items[] {icon(enum 10), title, description}` | Grid kartu ikon geometris, RSC |
| `menu_price_list` | #11 Restaurantly menu | `items[] {name, description, price, category, is_recommended}` — dikelompokkan renderer per kategori | Leader titik-titik ala menu restoran, RSC |
| `product_spotlight` | #33 Shop Item | `title, description, price, original_price, image_url, highlights[], cta_label, prefill_message` | Kartu split produk + WA CTA, RSC |
| `cta_banner_full` | #30 Creative, #49 Alpha | `title, subtitle, button_label, prefill_message, secondary_label/url` | Band gradasi primary + tombol besar, RSC |
| `team_members_grid` | #29 Agency team, #34 | `members[] {name, role, bio, avatar_url}` | Grid avatar (inisial warna bila tanpa foto), RSC |
| `timeline_story` | #29 Agency timeline, #38 | `milestones[] {year, title, description}` | Vertikal timeline + titik primary, RSC |
| `booking_whatsapp_form` | #11 Book-a-Table, #53, #64 | `service_options[], time_slots[], button_label, prefill_note` | **Island client**: form nama/tanggal/layanan/jam → susun pesan → buka wa.me |
| `event_schedule_list` | #11/#12/#22 Events | `events[] {date_label, title, location, note, maps_url}` | Daftar baris chip tanggal + link maps, RSC |
| `branch_locations_list` | #52/#59 store locator | `branches[] {name, address, hours, gmaps_url, whatsapp_number?}` | Kartu cabang + tombol rute & WA, RSC |
| `instagram_showcase_grid` | #74/#75 lookbook | `handle, profile_url, posts[] {image_url, caption, post_url}` | Grid kotak 4 kolom + tombol follow, RSC |
| `updates_blog_list` | #37 Clean Blog | `posts[] {title, date_label, excerpt, url, image_url}` | Kartu berita bertumpuk, RSC |
| `download_catalog_cta` | #66, #73 | `title, description, file_url, file_label` | Kartu unduh PDF + fallback minta via WA, RSC |
| `qr_code_whatsapp` | #56/#66 QR menu | `title, section_subtitle, qr_image_url, caption` | Kartu QR tengah (upload gambar QR), RSC |

**Aturan desain yang dipertahankan dari modul existing:**
- Pembungkus `SectionShell` + `SectionHeader` (ritme vertikal & tipografi konsisten).
- CTA via `WaButton`/`createWhatsAppChatLink` (event `wa_click` terlacak).
- Gambar lewat `SafeImage` → placeholder SVG deterministik per kategori (tanpa gambar rusak).
- Fallback "hampa": section tanpa konten render `null`, tidak pernah crash.
- Kontras WCAG AA memakai token tema `--uc-*` + `color-mix`, tanpa warna hardcoded di teks utama.

## 5. Backlog (kandidat gelombang berikutnya)

1. `video_embed_showcase` — YouTube/TikTok embed (lazy iframe facade).
2. `before_after_slider` — transformasi (salon/laundry/renovasi); butuh island drag.
3. `announcement_ticker` — bar berjalan di atas hero.
4. `client_logo_strip` — "dipercaya oleh" / fit media.
5. `link_in_bio_grid` — mode bio-link (alternatif Linktree) untuk share WA/Facebook.
6. `newsletter_whatsapp_subscribe` — daftar info promo via chat WA.
7. `comparison_table` — "kami vs lainnya".
8. `rating_summary` — agregat bintang Google/WA dengan sumber jelas (anti-review-palsu tetap berlaku).
9. Size guide (fashion) — tabel ukuran statis.

## 6. Lampiran — Pemetaan Kategori → Modul (AI prompt slicing)

Diperbarui di `packages/ai/src/prompts.ts`:

- **kuliner**: + `menu_price_list`, `product_spotlight`, `cta_banner_full`, `stats_counter_strip`, `qr_code_whatsapp`, `download_catalog_cta`
- **coffee**: + `menu_price_list`, `instagram_showcase_grid`, `timeline_story`, `cta_banner_full`
- **barbershop**: + `booking_whatsapp_form`, `team_members_grid`, `instagram_showcase_grid`, `stats_counter_strip`, `cta_banner_full`
- **fashion**: + `product_spotlight`, `instagram_showcase_grid`, `value_props_grid`, `cta_banner_full`, `download_catalog_cta`
- **bengkel**: + `booking_whatsapp_form`, `value_props_grid`, `branch_locations_list`, `cta_banner_full`
- **laundry**: + `booking_whatsapp_form`, `value_props_grid`, `branch_locations_list`
- **default**: + `value_props_grid`, `cta_banner_full`, `stats_counter_strip`
