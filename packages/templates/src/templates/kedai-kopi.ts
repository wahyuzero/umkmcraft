/**
 * Kedai kopi — kedai-kopi-v1 (kafe), preset roasted_mocha.
 * 11 section: hero, value props, menu harga, spotlight, ulasan, galeri,
 * jam & lokasi, agenda acara, FAQ, kontak, CTA. Semua field mengikuti
 * skema v1 (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric
 * (renderer memformat), token {{kota}} di lokasi/subtitle, tanpa emoji,
 * copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const kedaiKopiTemplate: TemplateDefinition = {
  id: "kedai-kopi-v1",
  category: "kafe",
  label: "Kedai Kopi",
  description:
    "Kedai kopi santai dengan menu harga jelas, jam buka, ulasan pelanggan, dan pesan langsung lewat WhatsApp.",
  demo: { businessName: "Kala Senja Coffee", city: "Yogyakarta" },
  config: {
    meta: {
      site_id: "kala-senja-coffee",
      business_name: "Kala Senja Coffee",
      business_category: "kafe",
      tagline: "Kopi single origin {{nama_usaha}} — digiling per pesanan, WiFi kencang buat nugas.",
      schema_version: 1,
      theme: {
        preset: "roasted_mocha",
        primary_color: "#78350f",
        secondary_color: "#b45309",
        background_color: "#faf5ee",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "Kala Senja Coffee — Kopi Susu Gula Aren & WiFi Kencang",
        description:
          "Kedai kopi di {{kota}}: kopi susu gula aren, Americano, matcha, sampai croissant. WiFi 100 Mbps, colokan tiap meja, buka sampai 23.00.",
        keywords: [
          "kedai kopi",
          "kopi susu gula aren",
          "coffee shop",
          "nugas",
          "wifi kencang",
          "single origin",
          "croissant",
          "matcha latte",
        ],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Buka sampai 23.00",
          title: "Kopi susu gula aren, digiling per pesanan",
          subtitle:
            "Biji single origin dari petani koperasi Aceh Tengah — WiFi kencang dan colokan di tiap meja. Mampir ke kedai kami di {{kota}}, kak.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Pesan via WhatsApp",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, saya mau pesan [nama menu].",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Menu & Harga",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["WiFi 100 Mbps", "Colokan tiap meja", "Buka s/d 23.00"],
        },
      },
      {
        id: "sec-values-1",
        type: "value_props_grid",
        props: {
          section_title: "Kenapa Betah di Sini?",
          section_subtitle: "Alasan pelanggan balik lagi — dari yang paling sering ditanya, kak.",
          items: [
            {
              icon: "star",
              title: "WiFi 100 Mbps, iya beneran",
              description: "Video meeting tanpa putus — meja panjang dekat stop kontak paling cepat penuh.",
            },
            {
              icon: "flame",
              title: "Biji digiling per pesanan",
              description: "Nggak ada bubuk stok — biji Gayo masuk gilingan pas kakak pesan, aromanya beda.",
            },
            {
              icon: "heart",
              title: "Kamar belakang lebih sunyi",
              description: "Buat yang butuh fokus: lebih sepi dari area depan, colokan tetap tersedia.",
            },
            {
              icon: "wallet",
              title: "Refil kopi tubruk Rp5.000",
              description: "Gelas kedua cuma Rp5.000 — untuk yang mau betah kerja sampai malam.",
            },
          ],
        },
      },
      {
        id: "sec-menu-1",
        type: "menu_price_list",
        props: {
          section_title: "Menu & Harga",
          section_subtitle: "Diseduh pas saat kakak pesan — manisnya bisa minta kurang, gula aren-nya asli.",
          items: [
            {
              name: "Kopi Susu Gula Aren",
              description: "Es atau panas — gula aren asli Sumbawa, espresso double shot.",
              price: 18000,
              category: "Kopi",
              is_recommended: true,
            },
            {
              name: "Americano",
              description: "Double shot biji Gayo, body tebal, pahitnya bersih.",
              price: 15000,
              category: "Kopi",
              is_recommended: false,
            },
            {
              name: "Cappuccino",
              description: "Foam susu lembut, rasa kopi dan susunya seimbang.",
              price: 22000,
              category: "Kopi",
              is_recommended: false,
            },
            {
              name: "Kopi Tubruk Gayo",
              description: "Cara khas, digiling dadakan — gelas kedua refil Rp5.000.",
              price: 15000,
              category: "Kopi",
              is_recommended: false,
            },
            {
              name: "Vietnam Drip",
              description: "Dites lambat di atas susu kental manis, pekat dan legit.",
              price: 20000,
              category: "Kopi",
              is_recommended: false,
            },
            {
              name: "Kopi Susu Pandan",
              description: "Wangi daun pandan dari rebusan sendiri, tanpa essens.",
              price: 20000,
              category: "Kopi",
              is_recommended: false,
            },
            {
              name: "Matcha Latte",
              description: "Matcha premium disikat sampai halus, nggak serpih.",
              price: 25000,
              category: "Non-Kopi",
              is_recommended: false,
            },
            {
              name: "Es Teh Leci",
              description: "Teh melati + leci utuh, manis alami tanpa sirup.",
              price: 18000,
              category: "Non-Kopi",
              is_recommended: false,
            },
            {
              name: "Coklat Panas",
              description: "Coklat couverture asli dilelehkan pelan, bukan bubuk instan.",
              price: 22000,
              category: "Non-Kopi",
              is_recommended: false,
            },
            {
              name: "Croissant Butter",
              description: "Renyah berlapis, wangi mentega — kami hangatkan dulu, kak.",
              price: 22000,
              category: "Camilan",
              is_recommended: false,
            },
            {
              name: "Roti Bakar Srikaya",
              description: "Roti sourdough bakar arang, srikaya racikan dapur sendiri.",
              price: 15000,
              category: "Camilan",
              is_recommended: false,
            },
            {
              name: "Kentang Goreng",
              description: "Potong tebal, gurih di dalam — sambal mayo bikinan sendiri.",
              price: 20000,
              category: "Camilan",
              is_recommended: false,
            },
          ],
        },
      },
      {
        id: "sec-spotlight-1",
        type: "product_spotlight",
        props: {
          eyebrow: "Paket Paling Dicari",
          title: "Paket Kerja 3 Jam",
          description:
            "Americano + croissant + refil air mineral. Duduk kerja tiga jam tanpa mikir tambahan-tambahan lagi, kak.",
          price: 35000,
          original_price: 42000,
          image_url: "",
          image_position: "right",
          highlights: ["Americano double shot", "Croissant butter dihangatkan", "Refil air mineral sepuasnya"],
          cta_label: "Pesan Paket Ini",
          prefill_message: "Halo kak, saya mau pesan Paket Kerja 3 Jam.",
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
              name: "Raka — Kotagede",
              rating: 5,
              text: "WiFi-nya beneran kenceng, jadi langganan kerja tiap sore.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Salsa — Prawirotaman",
              rating: 5,
              text: "Gula arennya asli Sumbawa, nggak bikin serak. Kopi susunya juara.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Nadia — Tegalrejo",
              rating: 4,
              text: "Sudut jendelanya enak buat baca. Ramainya masih aman kalau weekday.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Bagas — Demangan",
              rating: 5,
              text: "Paket Kerja 3 Jam worth it banget — croissantnya dihangatkan dulu.",
              source: "manual",
              avatar_url: "",
              date: "",
            },
          ],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Suasana Kedai",
          section_subtitle: "Potret kedai dari sore ke malam — semuanya foto asli kedai kami, kak.",
          layout: "grid_3_col",
          items: [
            { title: "Bar senja", image_url: "", caption: "Tempat barista meracik — boleh ngobrol soal biji" },
            { title: "Sudut jendela", image_url: "", caption: "Cahaya sorenya pas buat foto dan baca" },
            { title: "Kamar belakang", image_url: "", caption: "Lebih sunyi, favorit yang bawa laptop" },
            { title: "Gilingan biji", image_url: "", caption: "Digiling per pesanan, nggak ada bubuk stok" },
            { title: "Rak pastry", image_url: "", caption: "Croissant dan roti bakar, sering habis sebelum malam" },
            { title: "Terasan depan", image_url: "", caption: "Angin sore, merokok boleh di sini, kak" },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Jl. Prawirotaman No. 21, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin", hours: "08.00 – 23.00" },
            { day: "Selasa", hours: "08.00 – 23.00" },
            { day: "Rabu", hours: "08.00 – 23.00" },
            { day: "Kamis", hours: "08.00 – 23.00" },
            { day: "Jumat", hours: "08.00 – 23.00" },
            { day: "Sabtu", hours: "08.00 – 23.00" },
            { day: "Minggu", hours: "08.00 – 23.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "08:00", close: "23:00" },
            { day_of_week: 1, open: "08:00", close: "23:00" },
            { day_of_week: 2, open: "08:00", close: "23:00" },
            { day_of_week: 3, open: "08:00", close: "23:00" },
            { day_of_week: 4, open: "08:00", close: "23:00" },
            { day_of_week: 5, open: "08:00", close: "23:00" },
            { day_of_week: 6, open: "08:00", close: "23:00" },
          ],
          delivery_note: "Pesan antar via ojek online, radius 4 km se-{{kota}}.",
        },
      },
      {
        id: "sec-events-1",
        type: "event_schedule_list",
        props: {
          section_title: "Agenda Kedai",
          section_subtitle: "Yang bikin sore di sini nggak cuma soal kopi, kak.",
          events: [
            {
              date_label: "Tiap Jumat",
              title: "Live acoustic mulai 19.30",
              location: "Area terasan kedai",
              note: "Gratis, cukup pesan menu apa aja.",
              maps_url: "",
            },
            {
              date_label: "Tiap Sabtu",
              title: "Cupping biji baru, jam 10.00",
              location: "Kamar belakang",
              note: "Kuota 8 orang — daftar dulu lewat WhatsApp, kak.",
              maps_url: "",
            },
            {
              date_label: "Bulanan",
              title: "Kelas latte art untuk pemula",
              location: "Bar kedai",
              note: "Jadwal bulan ini? Chat kami, kak.",
              maps_url: "",
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
              q: "Laptop-friendly?",
              a: "Friendly banget kak — WiFi 100 Mbps, colokan di tiap meja, dan kamar belakang lebih sunyi. Pagi weekday paling lega buat kerja.",
            },
            {
              q: "Ada area outdoor?",
              a: "Ada kak, terasan depan dan area belakang. Merokok cukup di terasan — area dalam kedai kami jaga tetap bebas asap.",
            },
            {
              q: "Bayar QRIS?",
              a: "Bisa kak — QRIS, tunai, atau transfer, terserah yang gampang buat kakak.",
            },
            {
              q: "Bisa reservasi untuk grup?",
              a: "Bisa kak, untuk 6 orang ke atas: chat kami tanggal dan jamnya, meja kami siapkan. Acara privat di luar jam buka juga bisa dibicarakan.",
            },
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
          prefill_message: "Halo {{nama_usaha}}, mau tanya menu hari ini kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Sore ini mampir, kak? Kopinya yang nggak bikin deg-degan.",
          subtitle: "Buka sampai 23.00 — WiFi nyala, colokan kosong, gula aren-nya manisnya pas.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, saya mau pesan [nama menu].",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
