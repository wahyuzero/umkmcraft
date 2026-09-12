/**
 * Butik batik — fashion-v1, preset blush_rose.
 * 12 section: hero, katalog WA, spotlight gajian, marketplace, trust badge,
 * cara order, panduan ukuran (rich text), ulasan, FAQ, galeri, kontak, CTA.
 * Semua field mengikuti skema v1 (packages/schema/src/v1/config.ts) —
 * ukuran tidak punya field sendiri, masuk description (ProductSchema).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric,
 * token {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const fashionTemplate: TemplateDefinition = {
  id: "fashion-v1",
  category: "fashion",
  label: "Fashion",
  description:
    "Butik batik dengan katalog produk, info pengiriman, jam buka, dan tanya stok langsung lewat WhatsApp.",
  demo: { businessName: "Larasati Batik", city: "Pekalongan" },
  config: {
    meta: {
      site_id: "larasati-batik",
      business_name: "Larasati Batik",
      business_category: "fashion",
      tagline: "Batik tulis asli Pekalongan dari {{nama_usaha}} — motif terbatas, tukar ukuran 7 hari.",
      schema_version: 1,
      theme: {
        preset: "blush_rose",
        primary_color: "#e11d48",
        secondary_color: "#be123c",
        background_color: "#fff1f2",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "Larasati Batik — Batik Tulis Pekalongan",
        description:
          "Butik batik di {{kota}}: kemeja pria, dress wanita, sarimbit couple. Bisa COD dan kirim se-Indonesia.",
        keywords: ["batik tulis", "batik pekalongan", "sarimbit", "kemeja batik", "dress batik"],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Batik tulis asli",
          title: "Motif yang tak akan kakak lihat di orang lain",
          subtitle:
            "Batik tulis Pekalongan, motif terbatas — satu motif hanya beberapa potong. Salah ukuran? Tukar gratis 7 hari.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Lihat Koleksi",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, mau tanya koleksi batik terbaru.",
            url: "",
          },
          cta_secondary: {
            label: "Cara Order",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["Tukar ukuran 7 hari", "COD & QRIS", "Kirim hari ini"],
        },
      },
      {
        id: "sec-catalog-1",
        type: "product_catalog_wa",
        props: {
          section_title: "Koleksi Batik",
          section_subtitle:
            "Tulis dan cap asli Pekalongan — stok per motif terbatas, tanya dulu via WA biar aman.",
          categories: ["Pria", "Wanita", "Couple"],
          products: [
            {
              id: "p-kemeja-tulis-parang",
              name: "Kemeja Batik Tulis Parang",
              price: 285000,
              category: "Pria",
              description: "Tulis asli, ukuran M–XL, jahitan double stitch.",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-kemeja-cap-lurik",
              name: "Kemeja Batik Cap Lurik",
              price: 159000,
              original_price: 189000,
              category: "Pria",
              description: "Cap rapi, ukuran M–XXL. Harga gajian, stok per motif 3–5 pcs.",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-dress-kebaya-modern",
              name: "Dress Batik Kebaya Modern",
              price: 350000,
              category: "Wanita",
              description: "Ukuran S–XL, potongan modern, adem dipakai seharian.",
              image_url: "",
              is_bestseller: true,
            },
            {
              id: "p-setelan-couple",
              name: "Setelan Couple Batik",
              price: 495000,
              category: "Couple",
              description: "Kemeja + dress satu motif — favorit pasangan pernikahan.",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-rok-lilit",
              name: "Rok Lilit Batik",
              price: 185000,
              category: "Wanita",
              description: "Ada penjepit tersembunyi, nggak goyang dipakai jalan. Size M–L.",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-kain-tulis-2m",
              name: "Kain Batik Tulis 2m",
              price: 425000,
              category: "Wanita",
              description: "Penuh 2 meter, kain siap jahit sesuai ukuran kakak.",
              image_url: "",
              is_bestseller: false,
            },
          ],
        },
      },
      {
        id: "sec-spotlight-1",
        type: "product_spotlight",
        props: {
          eyebrow: "Promo Bulan Ini",
          title: "Kemeja Batik Cap — Gajian Deal",
          description:
            "Stok per motif cuma 3–5 pcs — motif favorit cepat ludes. Kirim ukuran kakak via WA, kami cek yang masih ada.",
          price: 129000,
          original_price: 159000,
          image_url: "",
          image_position: "right",
          highlights: ["Ukuran M–XXL", "Stok per motif 3–5 pcs", "Tukar ukuran 7 hari"],
          cta_label: "Amanankan Sekarang",
          prefill_message: "Halo kak, mau ambil Kemeja Batik Cap Gajian Deal ukuran [M/L/XL].",
        },
      },
      {
        id: "sec-channels-1",
        type: "channel_marketplace",
        props: {
          section_title: "Juga Tersedia di",
          channels: [
            { platform: "shopee", label: "Shopee", url: "" },
            { platform: "tokopedia", label: "Tokopedia", url: "" },
            { platform: "tiktok_shop", label: "TikTok Shop", url: "" },
            { platform: "instagram", label: "Instagram", url: "" },
          ],
        },
      },
      {
        id: "sec-trust-1",
        type: "trust_badges_strip",
        props: {
          section_title: "Pembayaran & Pengiriman",
          payment_methods: ["qris", "bca", "cod"],
          shipping_couriers: ["jne", "jnt", "sicepat"],
          certifications: [],
        },
      },
      {
        id: "sec-steps-1",
        type: "step_how_to_order",
        props: {
          section_title: "Cara Order — cuma empat langkah, kak.",
          steps: [
            {
              step_number: 1,
              title: "Screenshot produk",
              description: "Pilih motif yang bikin kakak ngecek dua kali — setiap motif cuma beberapa potong.",
            },
            {
              step_number: 2,
              title: "Chat WA — cek stok & ukuran",
              description:
                "Kami cek stok per motif, sekalian bantu pilih ukuran dari tinggi dan berat badan kakak.",
            },
            {
              step_number: 3,
              title: "Bayar QRIS/transfer/COD",
              description:
                "COD area {{kota}} pakai kurir kami sendiri; luar kota transfer atau QRIS dulu biar cepat diproses.",
            },
            {
              step_number: 4,
              title: "Kirim hari ini (order sebelum 15.00)",
              description: "Order sebelum jam 15.00 langsung dijadwalkan kurir hari itu juga, kak.",
            },
          ],
        },
      },
      {
        id: "sec-size-1",
        type: "rich_text_block",
        props: {
          section_title: "Panduan Ukuran",
          body_markdown: [
            "Biar nggak salah pilih, ukuran kami standar Indonesia, kak:",
            "",
            "- **S** — lingkar dada 92 cm, panjang baju 65 cm",
            "- **M** — lingkar dada 98 cm, panjang baju 67 cm",
            "- **L** — lingkar dada 104 cm, panjang baju 69 cm",
            "- **XL** — lingkar dada 110 cm, panjang baju 71 cm",
            "",
            "Model kami **170 cm / 60 kg** memakai **M** dan pas di badan. Toleransi jahitan plus minus 1 cm.",
            "",
            "Masih bingung? **Kirim tinggi & berat badan kakak via WA** — kami bantu pilih ukurannya, bukan asal jualan.",
          ].join("\n"),
          image_url: "",
          image_position: "right",
        },
      },
      {
        id: "sec-reviews-1",
        type: "social_proof_reviews",
        props: {
          section_title: "Kata Pelanggan",
          section_subtitle: "Contoh ulasan dari pembeli {{nama_usaha}}.",
          is_sample: true,
          reviews: [
            {
              name: "Laras — Batang",
              rating: 5,
              text: "Ukurannya pas dengan size chart. Saya 56 kg ambil M, pas di badan. Panduan ukurannya lengkap sampai lingkar dada.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Melati — Semarang",
              rating: 5,
              text: "Pertama beli batik online, takut beda sama foto. Warnanya persis, nggak over-filter. Cucian pertama tetap dipisah kayak saran adminnya.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Ibu Farida — Ketua Arisan, {{kota}}",
              rating: 5,
              text: "Tiga kali pesan seragam arisan di sini. Motifnya konsisten, nggak pernah tertukar walau pesannya campur model.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Nadia — Kendal",
              rating: 4,
              text: "Tukar ukuran gampang: chat, kirim balik, 3 hari kemudian ukuran baru nyampe. Ongkirnya saya tanggung sendiri, wajar sih — toh syaratnya dijelasin dari awal.",
              source: "google",
              avatar_url: "",
              date: "",
            },
          ],
        },
      },
      {
        id: "sec-faq-1",
        type: "faq_accordion",
        props: {
          section_title: "Pertanyaan yang Sering Diajukan",
          items: [
            {
              q: "Kalau salah ukuran, bisa tukar?",
              a: "Bisa kak, maksimal 7 hari sejak barang diterima. Syaratnya: belum dicuci, label masih utuh, motif tetap yang sama, dan ukuran barunya tersedia. Ongkir tukar ditanggung pembeli ya kak.",
            },
            {
              q: "Bisa COD?",
              a: "Bisa kak lewat Shopee, Tokopedia, atau TikTok Shop. Untuk area {{kota}}, COD pakai kurir kami sendiri — bayarnya pas barang di tangan. Luar kota sebaiknya transfer atau QRIS dulu biar cepat diproses.",
            },
            {
              q: "Warnanya luntur nggak?",
              a: "Batik tulis dan cap kami sudah dicuci 2 kali sebelum dikirim, jadi warnanya stabil kak. Cuci pertama di rumah tetap pisahkan dari pakaian lain — ini berlaku untuk semua batik.",
            },
            {
              q: "Ongkirnya berapa?",
              a: "Sesuai tarif kurir kak, kami nggak menambah-nambah. Belanja 300rb ke atas, ongkir area Jawa kami yang tanggung.",
            },
          ],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Dari Ruang Batik Kami",
          section_subtitle: "Foto asli tanpa filter — warna yang Kakak lihat ya yang sampai di rumah.",
          layout: "grid_3_col",
          items: [
            { title: "Koleksi kemeja pria", image_url: "", caption: "Tulis dan cap, ukuran M–XXL" },
            { title: "Dress kebaya modern", image_url: "", caption: "Paling dicari buat kondangan dan resepsi" },
            { title: "Kain tulis siap jahit", image_url: "", caption: "Penuh 2 meter, motif satu-satunya" },
            { title: "Canting dan malam panas", image_url: "", caption: "Motif tulis dikerjakan tangan per potong" },
            { title: "Setelan couple pernikahan", image_url: "", caption: "Satu motif buat berdua, ukuran bisa beda" },
            { title: "Packing bubble wrap", image_url: "", caption: "Dibungkus plastik plus bubble wrap, aman sampai luar kota" },
          ],
        },
      },
      {
        id: "sec-contact-1",
        type: "contact_direct",
        props: {
          section_title: "Hubungi Kami",
          address: "{{kota}}",
          phone: "",
          whatsapp_number: "6280000000000",
          whatsapp_label: "Chat Admin",
          email: "",
          gmaps_url: "",
          prefill_message: "Halo {{nama_usaha}}, saya mau tanya stok dan ukuran kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Motif baru masuk 3 hari ini, kak — semuanya satu-satunya. Mampir dulu?",
          subtitle: "Stok per motif terbatas — yang ditanya hari ini bisa besok sudah ludes.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, mau tanya koleksi batik terbaru.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
