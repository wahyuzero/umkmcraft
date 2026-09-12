/**
 * Template referensi lengkap — warung-makan-v1 (kuliner).
 * Ini TEMPLATE ANDALAN: 12 section, semua field mengikuti skema v1
 * (packages/schema/src/v1/config.ts). Agen pengaya konten hanya mengganti
 * ISI file ini — struktur export `warungMakanTemplate: TemplateDefinition`
 * harus dipertahankan.
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric
 * (renderer memformat), tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const warungMakanTemplate: TemplateDefinition = {
  id: "warung-makan-v1",
  category: "kuliner",
  label: "Warung Makan",
  description:
    "Warung makan rumahan siap pakai: menu harga, pesan antar, jam buka, sampai QR dine-in. Tinggal ganti nama dan nomor kakak.",
  demo: { businessName: "Warung Bu Sari", city: "Bandung" },
  config: {
    meta: {
      site_id: "warung-bu-sari",
      business_name: "Warung Bu Sari",
      business_category: "kuliner",
      tagline: "Masakan rumahan {{nama_usaha}} — digoreng dadakan, sambal ulek sepuasnya.",
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
        title: "Warung Bu Sari — Masakan Rumahan & Sambal Ulek",
        description:
          "Warung makan rumahan di {{kota}}: ayam geprek sambal bawang ulek dadakan, nasi goreng kampung, paket hemat. Pesan antar via WhatsApp.",
        keywords: ["warung makan", "ayam geprek", "sambal ulek", "nasi goreng", "makanan rumahan", "pesan antar"],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Buka sampai 21.00",
          title: "Masakan rumahan rasa ibu, digoreng dadakan",
          subtitle:
            "Sambal diulek fresh tiap hari, bumbu racikan sendiri. Makan di warung atau pesan antar se-{{kota}}, kak.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Pesan via WhatsApp",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, saya mau pesan makanan.",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Menu & Harga",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["Halal", "Sejak 2015", "4,7★ di Google"],
        },
      },
      {
        id: "sec-stats-1",
        type: "stats_counter_strip",
        props: {
          section_title: "",
          stats: [
            { value: "4,7★", label: "Rating di Google" },
            { value: "10.000+", label: "Porsi per bulan" },
            { value: "2015", label: "Sejak buka" },
          ],
        },
      },
      {
        id: "sec-menu-1",
        type: "menu_price_list",
        props: {
          section_title: "Menu & Harga",
          section_subtitle: "Semua dimasak dadakan saat kakak pesan, sambalnya bisa minta level.",
          items: [
            {
              name: "Ayam Geprek Sambal Bawang",
              description: "Sambal diulek saat kakak pesan, level 1–5.",
              price: 18000,
              category: "Makanan",
              is_recommended: true,
            },
            {
              name: "Nasi Goreng Kampung",
              description: "Bumbu grossok wajan, ada terasi dan sayuran.",
              price: 15000,
              category: "Makanan",
              is_recommended: false,
            },
            {
              name: "Sop Iga Sapi",
              description: "Kuah bening gurih, iganya empuk banget.",
              price: 32000,
              category: "Makanan",
              is_recommended: false,
            },
            {
              name: "Es Teh Manis Jumbo",
              description: "Teh tubruk, manisnya pas.",
              price: 6000,
              category: "Minuman",
              is_recommended: false,
            },
            {
              name: "Es Jeruk Peras",
              description: "Jeruk peras asli, tanpa sirup.",
              price: 8000,
              category: "Minuman",
              is_recommended: false,
            },
            {
              name: "Paket Kenyang",
              description: "Nasi goreng + es teh, hemat Rp6.000.",
              price: 20000,
              category: "Paket",
              is_recommended: false,
            },
          ],
        },
      },
      {
        id: "sec-spotlight-1",
        type: "product_spotlight",
        props: {
          eyebrow: "Paling Dicari",
          title: "Paket Kenyang 2 Orang",
          description: "2 nasi goreng + 2 es teh + telur dadar. Makan siang berdua jadi kenyang tanpa mikir, kak.",
          price: 35000,
          original_price: 42000,
          image_url: "",
          image_position: "right",
          highlights: ["2 nasi goreng kampung", "2 es teh jumbo", "Telur dadar dadakan"],
          cta_label: "Pesan Paket Ini",
          prefill_message: "Halo kak, saya mau pesan Paket Kenyang 2 Orang.",
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
              name: "Dewi — Antapani",
              rating: 5,
              text: "Sambalnya juara, pesan antar sampai rumah masih anget.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Rizky — Cibiru",
              rating: 5,
              text: "Ayam gepreknya krispi, sambal bawangnya nagih. Jadi langganan makan siang kantor.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Ibu Yanti — Lengkong",
              rating: 5,
              text: "Pesan tumpeng buat arisan, pengerjaannya rapi dan ramah banget.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Andi — Buahbatu",
              rating: 4,
              text: "Harga cocok buat anak kos, porsi kenyang. Es tehnya jumbo beneran.",
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
          section_title: "Dapur Kami",
          section_subtitle: "Suasana dapur {{nama_usaha}} — masak dadakan di depan mata kakak.",
          layout: "grid_3_col",
          items: [
            { title: "Gerobak sambal ulek", image_url: "", caption: "Cobek batu, ulek fresh tiap hari" },
            { title: "Ayam geprek dadakan", image_url: "", caption: "Digoreng pas kakak pesan" },
            { title: "Nasi goreng kampung", image_url: "", caption: "Wajan panas, bumbu meresap" },
            { title: "Sop iga sapi", image_url: "", caption: "Kuah bening, iga empuk" },
            { title: "Es teh jumbo", image_url: "", caption: "Segernya nampis, gelas bener-bener jumbo" },
            { title: "Meja warung", image_url: "", caption: "Teduh dan luas, cocok makan rame-rame" },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Jl. Merdeka No. 45, seberang Alfamart, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin", hours: "08.00 – 21.00" },
            { day: "Selasa", hours: "08.00 – 21.00" },
            { day: "Rabu", hours: "08.00 – 21.00" },
            { day: "Kamis", hours: "08.00 – 21.00" },
            { day: "Jumat", hours: "08.00 – 21.00" },
            { day: "Sabtu", hours: "08.00 – 21.00" },
            { day: "Minggu", hours: "08.00 – 21.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "08:00", close: "21:00" },
            { day_of_week: 1, open: "08:00", close: "21:00" },
            { day_of_week: 2, open: "08:00", close: "21:00" },
            { day_of_week: 3, open: "08:00", close: "21:00" },
            { day_of_week: 4, open: "08:00", close: "21:00" },
            { day_of_week: 5, open: "08:00", close: "21:00" },
            { day_of_week: 6, open: "08:00", close: "21:00" },
          ],
          delivery_note: "Pesan antar radius 3 km, min. Rp25.000.",
        },
      },
      {
        id: "sec-faq-1",
        type: "faq_accordion",
        props: {
          section_title: "Pertanyaan yang Sering Diajukan",
          items: [
            {
              q: "Halal nggak, kak?",
              a: "Halal kak. Bahan-bahannya dibeli segar tiap pagi dari pasar terdekat dan dapurnya dijaga bersih.",
            },
            {
              q: "Bisa pesan antar?",
              a: "Bisa kak. Radius 3 km pakai kurir warung, minimum Rp25.000. Di luar itu bisa lewat GoFood, GrabFood, atau ShopeeFood.",
            },
            {
              q: "Parkirnya bagaimana?",
              a: "Motor parkir langsung di depan warung. Mobil bisa di samping seberang Alfamart, gratis kak.",
            },
            {
              q: "Bayarnya bisa apa aja?",
              a: "Tunai atau QRIS kak — scan di kasir, nggak perlu aplikasi tambahan.",
            },
          ],
        },
      },
      {
        id: "sec-channels-1",
        type: "channel_marketplace",
        props: {
          section_title: "Bisa Dipesan dari Sini",
          channels: [
            { platform: "gofood", label: "GoFood", url: "" },
            { platform: "grabfood", label: "GrabFood", url: "" },
            // Enum ChannelSchema tidak punya "shopeefood" — platform sah: "shopee".
            { platform: "shopee", label: "ShopeeFood", url: "" },
          ],
        },
      },
      {
        id: "sec-qr-1",
        type: "qr_code_whatsapp",
        props: {
          section_title: "Makan di Warung? Scan Aja",
          section_subtitle: "Duduk manis, scan kode di meja — pesanan langsung masuk dapur, kak.",
          qr_image_url: "",
          caption: "Kode QR terpasang di setiap meja warung.",
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
          prefill_message: "Halo {{nama_usaha}}, saya mau tanya-tanya dulu kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Laper? Pesan sekarang, anget sampai rumah, kak.",
          subtitle: "Masak dadakan dari dapur {{kota}}, langsung kirim ke alamat kakak.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, saya mau pesan makanan.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
