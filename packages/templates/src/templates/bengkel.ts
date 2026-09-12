/**
 * Bengkel motor — bengkel-v1, preset electric_blue.
 * 13 section: hero, harga servis, alasan pilih kami, alur servis, booking
 * triage, ulasan, statistik, trust badge, galeri, FAQ, jam & lokasi,
 * kontak, CTA. Semua field mengikuti skema v1
 * (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric,
 * token {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const bengkelTemplate: TemplateDefinition = {
  id: "bengkel-v1",
  category: "bengkel",
  label: "Bengkel",
  description:
    "Bengkel motor dengan daftar harga servis, garansi, jam buka, dan booking lewat WhatsApp — tinggal ganti data kakak.",
  demo: { businessName: "Jaya Motor Servis", city: "Medan" },
  config: {
    meta: {
      site_id: "jaya-motor-servis",
      business_name: "Jaya Motor Servis",
      business_category: "bengkel",
      tagline: "Servis jujur dari {{nama_usaha}} — diagnosa dulu, harga disepakati.",
      schema_version: 1,
      theme: {
        preset: "electric_blue",
        primary_color: "#2563eb",
        secondary_color: "#1e40af",
        background_color: "#f0f9ff",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "Jaya Motor Servis — Bengkel Motor Terpercaya",
        description:
          "Bengkel motor di {{kota}}: servis rutin, ganti oli, rem, tune up. Harga disepakati dulu, garansi 7 hari.",
        keywords: ["bengkel motor", "servis motor", "ganti oli", "tune up", "garansi"],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Gratis cek pertama",
          title: "Diagnosa dulu, harga disepakati, baru dikerjakan",
          subtitle:
            "Kirim keluhan + video kalau ada suara aneh — kami balas dengan estimasi. Tanpa biaya kejutan, kak.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Konsultasi Gratis via WhatsApp",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, motor saya [keluhan]. Mau tanya estimasi servis.",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Harga Servis",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["Garansi 7 hari", "Mekanik bersertifikat", "Progres via WA"],
        },
      },
      {
        id: "sec-pricing-1",
        type: "service_pricing_table",
        props: {
          section_title: "Daftar Harga Servis",
          section_subtitle:
            "Harga jujur, disepakati sebelum pengerjaan dimulai — kalau pas dibuka ada temuan lain, kami chat dulu sebelum lanjut.",
          tiers: [
            {
              id: "tier-rutin-matic",
              name: "Servis Rutin Matic",
              price: 50000,
              unit: "",
              duration: "45 mnt",
              features: ["Cek 12 titik", "Tune up ringan"],
              is_popular: false,
              cta_label: "Booking Servis Ini",
            },
            {
              id: "tier-oli-filter",
              name: "Ganti Oli + Filter",
              price: 85000,
              unit: "",
              duration: "30 mnt",
              features: ["Oli resmi sesuai rekomendasi pabrikan", "Harga sejajar toko online"],
              is_popular: true,
              cta_label: "Booking Servis Ini",
            },
            {
              id: "tier-rem",
              name: "Servis Rem Depan/Belakang",
              price: 90000,
              unit: "",
              duration: "1 jam",
              features: ["Kampas rem standar/OEM", "Termasuk pemasangan"],
              is_popular: false,
              cta_label: "Booking Servis Ini",
            },
            {
              id: "tier-vbelt-roller",
              name: "Ganti V-Belt + Roller",
              price: 175000,
              unit: "",
              duration: "1,5 jam",
              features: ["V-belt sesuai model motor", "Part lama kami tunjukin dulu"],
              is_popular: false,
              cta_label: "Booking Servis Ini",
            },
            {
              id: "tier-tuneup-besar",
              name: "Tune Up Besar",
              price: 150000,
              unit: "",
              duration: "2–3 jam",
              features: ["Komponen digelindingin dulu", "Progres dikabarin via WA"],
              is_popular: false,
              cta_label: "Booking Servis Ini",
            },
          ],
        },
      },
      {
        id: "sec-value-1",
        type: "value_props_grid",
        props: {
          section_title: "Kenapa Servis di Sini",
          section_subtitle: "Pelanggan bengkel paling takut dibebani biaya di akhir — di sini aturan mainnya jelas, kak.",
          items: [
            {
              icon: "shield",
              title: "Garansi pengerjaan 7 hari / 1.000 km",
              description: "Keluhan yang sama muncul lagi? Balik saja — kami benahi gratis, tanpa drama.",
            },
            {
              icon: "wallet",
              title: "Harga disepakati sebelum kerja",
              description: "Ada temuan di luar estimasi? Kami chat dulu, nggak langsung ganti. Nggak ada biaya siluman.",
            },
            {
              icon: "chat",
              title: "Progres dikerjakan dikabarin via WA",
              description: "Motor kakak sampai mana, selesai hari ini atau besok — dikabarin, nggak perlu nungguin di bengkel.",
            },
            {
              icon: "clock",
              title: "Nunggu sambil minum kopi — ada WiFi",
              description: "Servis ringan 45 menit. Duduk manis, kopi dan WiFi-nya gratis kami siapkan.",
            },
          ],
        },
      },
      {
        id: "sec-steps-1",
        type: "step_how_to_order",
        props: {
          section_title: "Alur Servisnya Sesederhana Ini",
          steps: [
            {
              step_number: 1,
              title: "Chat keluhan (+video/suara)",
              description:
                "Ceritakan keluhannya, kalau ada suara aneh rekam sebentar — makin gampang kami menduga sumbernya.",
            },
            {
              step_number: 2,
              title: "Diagnosa + estimasi",
              description:
                "Kami balas dengan dugaan masalah dan estimasi biaya. Nggak sampai selesai, harga bisa berubah sepihak.",
            },
            {
              step_number: 3,
              title: "Setuju, dikerjakan",
              description:
                "Harga disepakati dulu, baru pengerjaan dimulai. Ada temuan lain di tengah jalan? Kami chat dulu sebelum lanjut.",
            },
            {
              step_number: 4,
              title: "Cek bersama + garansi",
              description:
                "Motor dicek berdua sebelum pulang, lalu garansi 7 hari / 1.000 km mulai berlaku.",
            },
          ],
        },
      },
      {
        id: "sec-booking-1",
        type: "booking_whatsapp_form",
        props: {
          section_title: "Booking Jadwal Servis",
          section_subtitle: "Isi form singkat ini — admin balas dengan estimasi dan slot yang kosong.",
          service_options: [
            "Servis rutin / ganti oli",
            "Servis rem",
            "Ganti V-Belt + roller",
            "Tune up besar",
            "Motor mogok — perlu dijemput",
            "Lainnya (tanya dulu)",
          ],
          time_slots: [
            "Pagi 08.00–10.00",
            "Siang 10.00–13.00",
            "Sore 13.00–17.00",
            "Minggu 09.00–14.00",
            "Senin–Kamis sore (paling lancar)",
          ],
          button_label: "Kirim Booking via WhatsApp",
          prefill_note:
            "Format: [Tipe motor] – [Tahun] – [Keluhan] – [Lokasi kakak]. Contoh: Beat 2021 – tangan lemas – Cibinong.",
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
              name: "Bang Andi — Kurir Online, Medan Baru",
              rating: 5,
              text: "Motor mati jam 6 pagi, chat bengkel jam 6.05, jam 6.30 udah dijemput. Nyelametin hari kuriran saya.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Galih — Medan Tembung",
              rating: 5,
              text: "Oli mesinnya asli, harganya sejajar toko online. Jadi nggak mikir palsu nggak palsu.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Eko S. — Amplas",
              rating: 5,
              text: "Garansi 7 hari berlaku beneran: rantai sempat bunyi lagi, diganti gratis tanpa drama.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Citra — Medan Johor",
              rating: 4,
              text: "Sabtu pagi rame, saya nunggu hampir 2 jam — lain kali booking dulu. Tapi buat yang nggak ngerti motor: dijelasin pelan-pelan, nggak diketawain. Itu alasannya balik-balik ke sini.",
              source: "google",
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
            { value: "15.000+", label: "Kendaraan dilayani" },
            { value: "12 tahun", label: "Pengalaman di bengkel" },
            { value: "7 hari", label: "Garansi pengerjaan" },
          ],
        },
      },
      {
        id: "sec-trust-1",
        type: "trust_badges_strip",
        props: {
          section_title: "Pembayaran",
          payment_methods: ["qris", "cod", "bca"],
          shipping_couriers: [],
          certifications: [],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Suasana Bengkel",
          section_subtitle: "Foto kerja kami sendiri — yang kelihatan ya yang Kakak dapat, kak.",
          layout: "grid_3_col",
          items: [
            {
              title: "Blok silinder digelindingin",
              image_url: "",
              caption: "Servis besar: komponen digelindingin dulu, mana ganti mana masih bagus",
            },
            { title: "Rantai baru terpasang", image_url: "", caption: "Setel rantai digabung tiap servis besar, nggak usah minta" },
            { title: "Kampas rem lama vs baru", image_url: "", caption: "Yang tipis kami tunjukin dulu, baru diganti" },
            {
              title: "Ganti oli rapi",
              image_url: "",
              caption: "Botol oli bekas kami serahkan — bukti oli diganti beneran",
            },
            { title: "Bangku nunggu", image_url: "", caption: "Kipas, WiFi, dan kopi gratis sambil nunggu servis ringan" },
            { title: "Area jemput motor", image_url: "", caption: "Motor mogok di jalan? Kirim lokasi, kami jemput" },
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
              q: "Bawa sparepart sendiri boleh?",
              a: "Boleh kak, biaya jasa tetap normal. Catatan ya: garansi dari kami hanya untuk pengerjaan — kalau part-nya bermasalah, itu garansi toko tempat Kakak beli partnya.",
            },
            {
              q: "Garansinya detailnya bagaimana?",
              a: "Garansi 7 hari atau 1.000 km untuk pengerjaan kami kak. Setelah servis kalau keluhan yang sama muncul lagi, balik saja — kami cek dan benahi gratis.",
            },
            {
              q: "Servis ringan lama nggak?",
              a: "Ganti oli plus cek ringan 30–45 menit kalau nggak antri kak. Sabtu pagi biasanya rame; kalau mau lancar, datang Senin–Kamis sore.",
            },
            {
              q: "Harganya bisa tahu dulu, nggak langsung kerja?",
              a: "Bisa kak. Kirim keluhannya plus video atau suara kalau ada, kami balas dengan estimasi. Kalau pas dibuka ada temuan lain, kami chat dulu sebelum lanjut — nggak ada biaya kejutan.",
            },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Jl. Raya Bogor No. 45, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin – Sabtu", hours: "08.00 – 17.00" },
            { day: "Minggu", hours: "09.00 – 14.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "09:00", close: "14:00" },
            { day_of_week: 1, open: "08:00", close: "17:00" },
            { day_of_week: 2, open: "08:00", close: "17:00" },
            { day_of_week: 3, open: "08:00", close: "17:00" },
            { day_of_week: 4, open: "08:00", close: "17:00" },
            { day_of_week: 5, open: "08:00", close: "17:00" },
            { day_of_week: 6, open: "08:00", close: "17:00" },
          ],
          delivery_note: "Motor mogok? Gratis jemput radius 3 km — kirim lokasi.",
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
          prefill_message: "Halo {{nama_usaha}}, motor saya mau tanya estimasi servis kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Motor mulai aneh-aneh, kak? Chat sekarang, mumpung belum jadi besar.",
          subtitle: "Cek pertama gratis — ceritakan keluhannya, kami balas dengan estimasi hari ini juga.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, motor saya [keluhan]. Mau tanya estimasi servis.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
