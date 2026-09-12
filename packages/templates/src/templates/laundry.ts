/**
 * Laundry — laundry-v1, preset fresh_emerald.
 * 12 section: hero, daftar harga, cara order, value props, form penjemputan,
 * ulasan, stats, trust badge, jam & lokasi, FAQ, kontak, CTA. Semua field
 * mengikuti skema v1 (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric,
 * token {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const laundryTemplate: TemplateDefinition = {
  id: "laundry-v1",
  category: "laundry",
  label: "Laundry",
  description:
    "Laundry dengan harga per kg yang jelas, antar-jemput, jam buka, dan ulasan pelanggan — tinggal ganti data kakak.",
  demo: { businessName: "BersihKilat Laundry", city: "Depok" },
  config: {
    meta: {
      site_id: "bersihkilat-laundry",
      business_name: "BersihKilat Laundry",
      business_category: "laundry",
      tagline: "{{nama_usaha}} — dijemput pagi, pulang sore sudah wangi.",
      schema_version: 1,
      theme: {
        preset: "fresh_emerald",
        primary_color: "#059669",
        secondary_color: "#047857",
        background_color: "#f0fdf4",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "BersihKilat Laundry — Antar-Jemput, 1 Order 1 Mesin",
        description:
          "Laundry di {{kota}}: kiloan Rp8.000/kg, express 6 jam, cuci setrika. Gratis antar-jemput radius 3 km, timbangan direkam video, 1 order 1 mesin.",
        keywords: [
          "laundry",
          "laundry antar jemput",
          "laundry kilat",
          "cuci setrika",
          "laundry terdekat",
          "langganan laundry",
        ],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Gratis antar-jemput",
          title: "Dijemput pagi, pulang sore sudah wangi",
          subtitle:
            "1 order 1 mesin — cucian kakak tidak tercampur dengan siapa pun. Timbangan direkam video.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Jemput Cucian Saya",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, mau jadwal penjemputan laundry.",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Harga",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["QRIS & COD", "Express 6 jam", "Ganti rugi"],
        },
      },
      {
        id: "sec-pricing-1",
        type: "service_pricing_table",
        props: {
          section_title: "Daftar Harga Layanan",
          section_subtitle:
            "Semua harga per kg — ditimbang di depan kamera saat penjemputan, nggak ada selisih, kak.",
          tiers: [
            {
              id: "tier-reguler",
              name: "Kiloan Reguler",
              price: 8000,
              unit: "kg",
              duration: "2 hari",
              features: ["Cuci + kering + lipat", "Minimum 3 kg"],
              is_popular: false,
              cta_label: "Jemput Cucian Saya",
            },
            {
              id: "tier-cuci-setrika",
              name: "Cuci + Setrika",
              price: 12000,
              unit: "kg",
              duration: "2 hari",
              features: ["Kemeja & seragam rapi", "Minimum 3 kg"],
              is_popular: false,
              cta_label: "Jemput Cucian Saya",
            },
            {
              id: "tier-express-1",
              name: "Express 1 Hari",
              price: 13000,
              unit: "kg",
              duration: "1 hari",
              features: ["Masuk sebelum jam 20.00", "Minimum 3 kg"],
              is_popular: false,
              cta_label: "Jemput Cucian Saya",
            },
            {
              id: "tier-express-6",
              name: "Express 6 Jam",
              price: 18000,
              unit: "kg",
              duration: "6 jam",
              features: ["Prioritas antrian", "Masuk sebelum jam 14.00"],
              is_popular: true,
              cta_label: "Jemput Cucian Saya",
            },
            {
              id: "tier-setrika",
              name: "Setrika Saja",
              price: 6000,
              unit: "kg",
              duration: "2 hari",
              features: ["Untuk cucian yang sudah bersih", "Lipat rapi atau digantung"],
              is_popular: false,
              cta_label: "Jemput Cucian Saya",
            },
          ],
        },
      },
      {
        id: "sec-steps-1",
        type: "step_how_to_order",
        props: {
          section_title: "Cara Ordernya Gampang — dari chat sampai balik wangi, kak.",
          steps: [
            {
              step_number: 1,
              title: "Chat WhatsApp",
              description: "Tentukan jam penjemputan dan jenis layanannya.",
            },
            {
              step_number: 2,
              title: "Kurir jemput + timbang",
              description: "Penimbangan di depan kamera — beratnya terekam video.",
            },
            {
              step_number: 3,
              title: "Cuci, kering, lipat",
              description: "1 order 1 mesin — cucian kakak tidak tercampur siapa pun.",
            },
            {
              step_number: 4,
              title: "Diantar kembali",
              description: "Sekalian bukti video timbangannya dikirim ke chat.",
            },
          ],
        },
      },
      {
        id: "sec-values-1",
        type: "value_props_grid",
        props: {
          section_title: "Kenapa Pilih Kami?",
          section_subtitle: "Janji kerja kami di setiap order, bukan cuma slogan.",
          items: [
            {
              icon: "truck",
              title: "Gratis antar radius 3 km",
              description: "Kurir kami datang sesuai jadwal — kakak tinggal siapin cucian di pintu.",
            },
            {
              icon: "shield",
              title: "1 order 1 mesin",
              description: "Cucian kakak tidak tercampur dengan pelanggan lain, dari cuci sampai lipat.",
            },
            {
              icon: "star",
              title: "Timbangan direkam video",
              description: "Berat dan kondisi cucian dicatat di depan kamera — nggak ada selisih diam-diam.",
            },
            {
              icon: "flame",
              title: "Setrika uap, wangi tahan lama",
              description: "Hasil setrikaan licin, wangi parfin laundry tahan sampai beberapa hari.",
            },
          ],
        },
      },
      {
        id: "sec-booking-1",
        type: "booking_whatsapp_form",
        props: {
          section_title: "Jadwalkan Penjemputan",
          section_subtitle: "Isi pilihannya, pesanan terkirim ke WhatsApp kami — kurir siap jalan, kak.",
          service_options: [
            "Kiloan Reguler — Rp8.000/kg",
            "Cuci + Setrika — Rp12.000/kg",
            "Express 1 Hari — Rp13.000/kg",
            "Express 6 Jam — Rp18.000/kg",
            "Setrika Saja — Rp6.000/kg",
          ],
          time_slots: [
            "09.00 – 10.00",
            "10.00 – 11.00",
            "11.00 – 12.00",
            "13.00 – 14.00",
            "14.00 – 15.00",
            "15.00 – 16.00",
            "16.00 – 17.00",
          ],
          button_label: "Jadwalkan Penjemputan",
          prefill_note:
            "Tulis nama, alamat penjemputan, jenis layanan, dan perkiraan berat cucian — kami balas dengan jadwal kurirnya.",
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
              name: "Pak Hendra — Beji",
              rating: 5,
              text: "Langganan kantor, tiap Senin dijemput jam 9 tepat. Rapi semua.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Mbak Rina — Margonda",
              rating: 5,
              text: "Dijemput pagi, sore sudah sampai rumah wangi. Lipatannya rapi banget.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Dika — Sukmajaya",
              rating: 5,
              text: "Express 6 jam penyelamat baju kondangan saya — masuk jam 12, selesai jam 6.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Sari — Pancoran Mas",
              rating: 4,
              text: "Beneran 1 order 1 mesin, nggak nyampur. Video timbangannya bikin tenang.",
              source: "manual",
              avatar_url: "",
              date: "",
            },
          ],
        },
      },
      {
        id: "sec-stats-1",
        type: "stats_counter_strip",
        props: {
          section_title: "",
          stats: [
            { value: "50.000+", label: "Kg cucian dicuci" },
            { value: "4,8★", label: "Rating di Google" },
            { value: "7 hari", label: "Antar-jemput per minggu" },
          ],
        },
      },
      {
        id: "sec-trust-1",
        type: "trust_badges_strip",
        props: {
          section_title: "Pembayaran & Jaminan",
          payment_methods: ["qris", "cod", "bca"],
          shipping_couriers: [],
          certifications: [],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Jl. Margonda No. 152, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin", hours: "08.00 – 20.00" },
            { day: "Selasa", hours: "08.00 – 20.00" },
            { day: "Rabu", hours: "08.00 – 20.00" },
            { day: "Kamis", hours: "08.00 – 20.00" },
            { day: "Jumat", hours: "08.00 – 20.00" },
            { day: "Sabtu", hours: "08.00 – 20.00" },
            { day: "Minggu", hours: "08.00 – 20.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "08:00", close: "20:00" },
            { day_of_week: 1, open: "08:00", close: "20:00" },
            { day_of_week: 2, open: "08:00", close: "20:00" },
            { day_of_week: 3, open: "08:00", close: "20:00" },
            { day_of_week: 4, open: "08:00", close: "20:00" },
            { day_of_week: 5, open: "08:00", close: "20:00" },
            { day_of_week: 6, open: "08:00", close: "20:00" },
          ],
          delivery_note:
            "Area Kec. Beji, Pancoran Mas, Sukmajaya. Di luar area? Chat kami, bisa diatur.",
        },
      },
      {
        id: "sec-faq-1",
        type: "faq_accordion",
        props: {
          section_title: "Pertanyaan yang Sering Diajukan",
          items: [
            {
              q: "Kalau ada yang hilang atau rusak?",
              a: "Kami ganti rugi hingga 10x biaya layanan item tersebut kak. Semua order dicatat, ditimbang, dan direkam videonya sebelum dicuci.",
            },
            {
              q: "Minimum berapa?",
              a: "Minimum 3 kg untuk layanan antar-jemput kak. Titip langsung ke outlet bisa tanpa minimum.",
            },
            {
              q: "Express 6 jam bisa?",
              a: "Bisa kak — masuk sebelum jam 14.00, selesai sore itu juga. Cocok buat baju kondangan dadakan.",
            },
            {
              q: "Bayar di tempat bisa?",
              a: "Bisa kak — COD saat cucian diantar, atau QRIS/transfer BCA sebelumnya, pilih yang gampang.",
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
          prefill_message: "Halo {{nama_usaha}}, saya mau jadwalkan penjemputan kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Langganan kantor/kost 20 kg/bulan cuma Rp140.000",
          subtitle: "Jadwal tetap tiap minggu, kurir datang sendiri — chat untuk daftar, kak.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, saya mau daftar langganan laundry bulanan.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
