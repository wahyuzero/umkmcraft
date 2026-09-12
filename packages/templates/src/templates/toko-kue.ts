/**
 * Toko kue — toko-kue-v1 (kue), preset spicy_amber.
 * 13 section: hero, katalog WA, spotlight, cara pre-order, kebijakan
 * (rich text), trust badge, galeri, form custom cake, ulasan, FAQ,
 * jam & lokasi, kontak, CTA. Semua field mengikuti skema v1
 * (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric,
 * token {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const tokoKueTemplate: TemplateDefinition = {
  id: "toko-kue-v1",
  category: "kue",
  label: "Toko Kue",
  description:
    "Toko kue rumahan dengan menu harga, jam dapur, ulasan pelanggan, dan pesanan lewat WhatsApp — siap dipakai kakak.",
  demo: { businessName: "Dapur Manis Bu Ratna", city: "Semarang" },
  config: {
    meta: {
      site_id: "dapur-manis-bu-ratna",
      business_name: "Dapur Manis Bu Ratna",
      business_category: "kue",
      tagline: "Kue buatan tangan {{nama_usaha}} — pre-order H-3, manisnya pas buat hari spesial.",
      schema_version: 1,
      theme: {
        preset: "spicy_amber",
        primary_color: "#d97706",
        secondary_color: "#991b1b",
        background_color: "#fffbeb",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "Dapur Manis Bu Ratna — Brownies Kukus & Custom Cake",
        description:
          "Toko kue di {{kota}}: brownies kukus, kue kering, snack box, custom cake. Halal MUI & P-IRT — pre-order H-3 via WhatsApp.",
        keywords: [
          "toko kue",
          "brownies kukus",
          "custom cake",
          "kue kering",
          "snack box",
          "nasi kotak",
          "pre order kue",
        ],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Pre-order H-3",
          title: "Brownies kukus lumer yang selalu dipesan H-3",
          subtitle:
            "Kue rumahan untuk momen spesial — kabari tanggal acaranya, kami yang atur sisanya, kak.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Pre-order via WhatsApp",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, mau pesan kue untuk [tanggal acara].",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Katalog",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["Halal MUI", "P-IRT", "Sejak 2019"],
        },
      },
      {
        id: "sec-catalog-1",
        type: "product_catalog_wa",
        props: {
          section_title: "Katalog & Harga",
          section_subtitle: "Semua dibuat pesanan — fresh dari dapur, bukan stok lama, kak.",
          categories: ["Brownies & Cake", "Kue Kering", "Snack Box", "Custom"],
          products: [
            {
              id: "p-brownies-kukus",
              name: "Brownies Kukus Panggang",
              description: "Loyang 20x20, coklat premium, lumer di mulut.",
              price: 45000,
              category: "Brownies & Cake",
              image_url: "",
              is_bestseller: true,
            },
            {
              id: "p-butter-cake-keju",
              name: "Butter Cake Keju",
              description: "Padat, wangi mentega, taburan keju melimpah.",
              price: 65000,
              category: "Brownies & Cake",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-nastar-toples",
              name: "Nastar Toples 500g",
              description: "Isi penuh sampai dasar toples, renyah dan wangi.",
              price: 85000,
              category: "Kue Kering",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-kastangel",
              name: "Kastangel",
              description: "Keju cheddar asli, gurihnya nampol di gigitan pertama.",
              price: 90000,
              category: "Kue Kering",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-nasi-kotak",
              name: "Nasi Kotak Ayam",
              description: "Minimum 20 box — sudah termasuk air mineral.",
              price: 18000,
              category: "Snack Box",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-snack-box",
              name: "Snack Box 5 Macam",
              description: "Minimum 25 box, cocok buat rapat dan hajatan.",
              price: 12000,
              category: "Snack Box",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-custom-cake",
              name: "Custom Cake 16 cm",
              description: "Mulai dari — desain sesuai tema acara kakak.",
              price: 250000,
              category: "Custom",
              image_url: "",
              is_bestseller: false,
            },
            {
              id: "p-tumpeng",
              name: "Tumpeng Nasi Kuning",
              description: "Untuk 20 porsi, lengkap dengan tataannya.",
              price: 250000,
              category: "Custom",
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
          eyebrow: "Paling Dipesan",
          title: "Custom Cake Ulang Tahun",
          description:
            "Kirim foto referensi + tanggal acaranya — kami balas desain dan harganya di hari yang sama, kak.",
          price: 250000,
          original_price: 300000,
          image_url: "",
          image_position: "right",
          highlights: [
            "Ukuran 16 cm, sekitar 8–12 porsi",
            "Desain mengikuti tema acara",
            "Rasa pilih: coklat, vanilla, red velvet",
          ],
          cta_label: "Konsultasi Desain",
          prefill_message: "Halo kak, saya mau tanya custom cake untuk [tanggal acara].",
        },
      },
      {
        id: "sec-steps-1",
        type: "step_how_to_order",
        props: {
          section_title: "Cara Pre-Order — empat langkah, kak.",
          steps: [
            {
              step_number: 1,
              title: "Pilih menu & tanggal ambil",
              description: "Cek katalog di atas, tentukan tanggal acara atau tanggal ambilnya.",
            },
            {
              step_number: 2,
              title: "Chat WA — konfirmasi & kunci tanggal",
              description: "Kami cek kuota dapur tanggal itu, lalu kabari kakak.",
            },
            {
              step_number: 3,
              title: "DP 50%",
              description: "DP 50% kunci tanggal acara — sisanya saat ambil atau kirim.",
            },
            {
              step_number: 4,
              title: "Ambil atau kirim",
              description: "Ambil di showroom, atau kami kirim sesuai zona kirim.",
            },
          ],
        },
      },
      {
        id: "sec-policy-1",
        type: "rich_text_block",
        props: {
          section_title: "Kebijakan Pre-Order",
          body_markdown: [
            "Biar nggak ada salah paham, ini aturan main dapur kami, kak:",
            "",
            "- **Deadline order H-3.** Order ditutup **Kamis jam 20.00** untuk pengiriman pekan ini — setelah itu masuk jadwal pekan depan.",
            "- **DP 50% mengunci tanggal.** Tanggal acara baru aman setelah DP masuk; sisanya dibayar saat ambil atau kirim.",
            "- **Zona kirim:** Kota {{kota}} dan sekitarnya, radius 7 km — ongkir menyesuaikan jarak.",
            "- **Daya tahan:** kue kukus dan butter cake awet 3–4 hari di suhu ruang; kue kering sampai sebulan kalau toplesnya rapat.",
          ].join("\n"),
          image_url: "",
          image_position: "right",
        },
      },
      {
        id: "sec-trust-1",
        type: "trust_badges_strip",
        props: {
          section_title: "Halal, P-IRT & Pembayaran",
          payment_methods: ["qris", "bca", "cod"],
          shipping_couriers: [],
          certifications: ["halal_mui", "pirt"],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Portofolio Dapur",
          section_subtitle: "Karya yang pernah keluar dari dapur kami — semua foto asli, kak.",
          layout: "grid_3_col",
          items: [
            { title: "Tart tema dinosaurus", image_url: "", caption: "Favorit ulang tahun anak, manisnya nggak berlebihan" },
            { title: "Hampers lebaran", image_url: "", caption: "Kotak rapi, bisa sisipkan kartu ucapan" },
            { title: "Brownies kukus panggang", image_url: "", caption: "Loyang 20x20, tekstur lumer di mulut" },
            { title: "Nasi kotak acara kantor", image_url: "", caption: "120 box terkirim tepat jam istirahat" },
            { title: "Tumpeng nasi kuning", image_url: "", caption: "Tataan lengkap, cukup untuk 20 porsi" },
            { title: "Meja showroom", image_url: "", caption: "Mampir dulu — rasain sample hari itu juga" },
          ],
        },
      },
      {
        id: "sec-booking-1",
        type: "booking_whatsapp_form",
        props: {
          section_title: "Pesan Custom Cake",
          section_subtitle: "Ceritakan acaranya — kami bantu pilih ukuran, rasa, dan desainnya.",
          service_options: [
            "Ulang tahun anak",
            "Ulang tahun dewasa",
            "Tunangan / Lamaran",
            "Aqiqah / Tasyakuran",
            "Kantor / Acara Kantoran",
          ],
          time_slots: [
            "Ambil pagi (09.00 – 11.00)",
            "Ambil siang (11.00 – 14.00)",
            "Ambil sore (14.00 – 17.00)",
            "Kirim pagi",
            "Kirim siang/sore",
          ],
          button_label: "Kirim Detail Acara",
          prefill_note:
            "Tulis jenis acara, tanggal, dan jumlah porsi — kami balas desain + harganya di hari yang sama.",
        },
      },
      {
        id: "sec-reviews-1",
        type: "social_proof_reviews",
        props: {
          section_title: "Kata Pelanggan",
          section_subtitle: "Contoh ulasan dari pelanggan sekitar {{kota}}.",
          is_sample: true,
          reviews: [
            {
              name: "Ibu Dewi — Setiabudi",
              rating: 5,
              text: "Tartnya jadi sorotan! Rapi, nggak manis berlebihan.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Bu Lestari — Banyumanik",
              rating: 5,
              text: "Browniesnya nggak pernah gagal, selalu jadi buat hantaran.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Fitri — Tembalang",
              rating: 5,
              text: "Kirim foto referensi jam 10, sorenya desain + harga sudah masuk chat.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Om Hendra — Pleburan",
              rating: 4,
              text: "Snack box rapat kantor rapi, nasi kotaknya sampai masih hangat.",
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
              q: "DP berapa?",
              a: "DP 50% dari total pesanan kak — tanggal acara baru terkunci setelah DP masuk. Sisanya saat ambil atau kirim.",
            },
            {
              q: "Bisa batal?",
              a: "Batal H-2 atau lebih sebelum acara, DP kami kembalikan penuh kak. Setelah dapur mulai kerja, DP dipakai untuk bahan — bisa dipindah ke order berikutnya.",
            },
            {
              q: "Awet berapa hari?",
              a: "Kue kukus dan butter cake awet 3–4 hari di suhu ruang kak; kue kering sampai sebulan kalau wadahnya rapat.",
            },
            {
              q: "Bisa delivery?",
              a: "Bisa kak — radius 7 km dari showroom, ongkir menyesuaikan jarak. Di luar itu bisa diteruskan via ojek online.",
            },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Showroom",
          address: "Jl. Pandanaran No. 7, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin – Sabtu", hours: "09.00 – 17.00" },
            { day: "Minggu", hours: "Tutup" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 1, open: "09:00", close: "17:00" },
            { day_of_week: 2, open: "09:00", close: "17:00" },
            { day_of_week: 3, open: "09:00", close: "17:00" },
            { day_of_week: 4, open: "09:00", close: "17:00" },
            { day_of_week: 5, open: "09:00", close: "17:00" },
            { day_of_week: 6, open: "09:00", close: "17:00" },
          ],
          delivery_note: "Kirim area {{kota}} radius 7 km, ongkir sesuai jarak.",
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
          prefill_message: "Halo {{nama_usaha}}, saya mau pesan kue kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Acara tanggal berapa, kak? Kami kunci tanggalnya sekarang.",
          subtitle: "Kuota dapur tiap tanggal terbatas — makin cepat, makin aman.",
          button_label: "Pre-order via WhatsApp",
          prefill_message: "Halo kak, mau pesan kue untuk [tanggal acara].",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
