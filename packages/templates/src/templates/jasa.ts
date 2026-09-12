/**
 * Percetakan — jasa-v1, preset electric_blue.
 * 11 section: hero, harga cetak, cara order, galeri hasil, statistik,
 * trust badge, FAQ, jam & lokasi, ulasan, kontak, CTA. Semua field mengikuti
 * skema v1 (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url "", WA demo 6280000000000,
 * review is_sample:true, phone/email "" (tidak mengarang), harga numeric,
 * token {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const jasaTemplate: TemplateDefinition = {
  id: "jasa-v1",
  category: "jasa",
  label: "Jasa Percetakan",
  description:
    "Percetakan dengan daftar harga jelas, jam buka, dan pesan langsung lewat WhatsApp — tinggal ganti data kakak.",
  demo: { businessName: "SolusiPrint", city: "Jakarta" },
  config: {
    meta: {
      site_id: "solusiprint",
      business_name: "SolusiPrint",
      business_category: "jasa",
      tagline: "Cetak hari ini, ambil besok — begitu cara kerja {{nama_usaha}}.",
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
        title: "SolusiPrint — Percetakan Cepat & Rapi",
        description:
          "Percetakan di {{kota}}: banner, stiker, kartu nama, undangan. Kirim desain via WhatsApp, cetak hari ini ambil besok.",
        keywords: ["percetakan", "cetak banner", "kartu nama", "stiker", "undangan"],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Express 2 jam",
          title: "Cetak hari ini, ambil besok",
          subtitle:
            "Kirim desain ke WhatsApp — kami cek gratis, kirim proof sebelum produksi. File pecah? Kami kabarin dari awal, bukan pas sudah jadi.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Kirim Desain via WhatsApp",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, mau cetak [produk]. File-nya saya kirim ke sini ya.",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Harga",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["Proof sebelum cetak", "Revisi 2x gratis", "Ambil express 2 jam"],
        },
      },
      {
        id: "sec-pricing-1",
        type: "service_pricing_table",
        props: {
          section_title: "Daftar Harga Cetak",
          section_subtitle: "Harga sama dengan di kasir — file dicek dulu, baru jalan, kak.",
          tiers: [
            {
              id: "tier-banner-flexi",
              name: "Banner Flexi",
              price: 25000,
              unit: "m²",
              duration: "1 hari kerja",
              features: ["Flexi 280gr, full color", "Pasang area dalam kota bisa diatur"],
              is_popular: false,
              cta_label: "Pesan Cetak Ini",
            },
            {
              id: "tier-stiker-vinyl",
              name: "Stiker Vinyl A3+",
              price: 15000,
              unit: "lembar",
              duration: "1 hari kerja",
              features: ["Vinyl anti air", "Bisa potong satu-satu"],
              is_popular: false,
              cta_label: "Pesan Cetak Ini",
            },
            {
              id: "tier-kartu-nama",
              name: "Kartu Nama",
              price: 35000,
              unit: "box",
              duration: "1 hari kerja",
              features: ["1 box isi 100 pcs", "Art carton 260gr, 2 sisi"],
              is_popular: true,
              cta_label: "Pesan Cetak Ini",
            },
            {
              id: "tier-undangan-softcover",
              name: "Undangan Softcover",
              price: 2500,
              unit: "pcs",
              duration: "2–3 hari",
              features: ["Banyak pilihan kertas", "Minimum order 50 pcs"],
              is_popular: false,
              cta_label: "Pesan Cetak Ini",
            },
            {
              id: "tier-lanyard-id",
              name: "Lanyard + ID Card",
              price: 12000,
              unit: "pcs",
              duration: "1–2 hari",
              features: ["Termasuk tali lanyard", "Desain ID dibantu dari data kakak"],
              is_popular: false,
              cta_label: "Pesan Cetak Ini",
            },
          ],
        },
      },
      {
        id: "sec-steps-1",
        type: "step_how_to_order",
        props: {
          section_title: "Cara Order Cetak",
          steps: [
            {
              step_number: 1,
              title: "Kirim file (PDF paling aman)",
              description:
                "Desain dari Canva? Export ke PDF Print dengan bleed. JPG dari HP juga boleh — kami cek dulu hasilnya.",
            },
            {
              step_number: 2,
              title: "Cek file + proof via WA",
              description:
                "File ada masalah? Kami kabarin dari awal, bukan pas sudah jadi. Proof dikirim sebelum produksi jalan.",
            },
            {
              step_number: 3,
              title: "DP 50% (order di atas 300rb)",
              description: "Order kecil bisa bayar pas ambil. DP bisa transfer atau QRIS.",
            },
            {
              step_number: 4,
              title: "Cetak, lalu ambil atau kirim",
              description: "Ambil di ruko atau kami kirim. Butuh cepat? Ambil express 2 jam — chat dulu jadwalnya.",
            },
          ],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Hasil Cetak Kami",
          section_subtitle: "Semua foto pekerjaan sendiri — hasil nyata yang keluar dari mesin kami, kak.",
          layout: "grid_4_col",
          items: [
            { title: "Banner wisuda", image_url: "", caption: "Flexi 3x1 m, dipasang di depan rumah, tahan hujan" },
            { title: "Stiker brand kopi", image_url: "", caption: "Potong satu-satu, tinggal tempel di cup" },
            { title: "Menu kafe art carton", image_url: "", caption: "Art carton 260gr, warnanya dalam" },
            { title: "Kartu nama dua sisi", image_url: "", caption: "Tajam setelah laminating doff" },
            { title: "Undangan softcover", image_url: "", caption: "200 pcs selesai sebelum hari-H" },
            { title: "Yasinan jilid lem", image_url: "", caption: "Musim hajatan, jilidnya rapi sampai dasar" },
            { title: "Lanyard + ID card", image_url: "", caption: "Untuk acara dan karyawan, tali bisa pilih warna" },
            { title: "Spanduk toko", image_url: "", caption: "Pasang area dalam kota, bisa diatur sore hari" },
          ],
        },
      },
      {
        id: "sec-stats-1",
        type: "stats_counter_strip",
        props: {
          section_title: "",
          stats: [
            { value: "8.000+", label: "Order selesai" },
            { value: "Sejak 2017", label: "Percetakan di {{kota}}" },
            { value: "2 jam", label: "Ambil express" },
          ],
        },
      },
      {
        id: "sec-trust-1",
        type: "trust_badges_strip",
        props: {
          section_title: "Pembayaran",
          payment_methods: ["qris", "bca", "cod"],
          shipping_couriers: [],
          certifications: [],
        },
      },
      {
        id: "sec-faq-1",
        type: "faq_accordion",
        props: {
          section_title: "Pertanyaan yang Sering Diajukan",
          items: [
            {
              q: "Format file apa yang diterima?",
              a: "Paling aman PDF ya kak. Desain dari Canva? Export ke PDF Print dengan centang crop marks dan bleed — kami bantu cek. JPG dari HP juga bisa dicoba, tapi kami kabarin dulu hasilnya tajam atau pecah.",
            },
            {
              q: "Revisi bisa berapa kali?",
              a: "Gratis 2 kali sebelum file disetujui kak. Setelah disetujui dan masuk produksi, hasilnya nggak bisa direvisi lagi — cetak ulang dikenakan biaya karena bahannya sudah terpakai.",
            },
            {
              q: "Perlu DP?",
              a: "Order di atas 300rb atau cetak custom, DP 50% kak. Order kecil bisa bayar pas ambil. Transfer, QRIS, atau cash semuanya bisa.",
            },
            {
              q: "Warna hasil beda dengan di layar?",
              a: "Normal ya kak — layar HP pakai RGB, mesin cetak pakai CMYK. Kalau warnanya penting, misal warna logo, minta proof dulu, jangan cuma lihat di layar. Proofnya kami kirim via WA sebelum produksi.",
            },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Ruko Sentra Niaga Blok C No. 12, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin – Sabtu", hours: "08.00 – 20.00" },
            { day: "Minggu", hours: "10.00 – 16.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "10:00", close: "16:00" },
            { day_of_week: 1, open: "08:00", close: "20:00" },
            { day_of_week: 2, open: "08:00", close: "20:00" },
            { day_of_week: 3, open: "08:00", close: "20:00" },
            { day_of_week: 4, open: "08:00", close: "20:00" },
            { day_of_week: 5, open: "08:00", close: "20:00" },
            { day_of_week: 6, open: "08:00", close: "20:00" },
          ],
          delivery_note: "Butuh hari ini? Ambil express 2 jam — chat dulu jadwalnya.",
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
              name: "Fajar — Mahasiswa, Kemayoran",
              rating: 5,
              text: "Brosur 500 lembar deadline besok pagi, kabarin malam, paginya udah jadi. Penyelamat tugas kampus.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Rina — Cempaka Putih",
              rating: 5,
              text: "Ada satu typo dari file saya, adminnya nanya dulu sebelum cetak. Hampir saja 200 undangan jadi salah.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Bu Wulan — Johar",
              rating: 5,
              text: "Harga di website sama dengan di kasir, nggak ada tambahan. Proof dikirim dulu via WA sebelum produksi.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Sinta — Owner Brand Kopi, Priok",
              rating: 4,
              text: "File saya dari Canva, ternyata bisa diproses — diajari export PDF Print dengan bleed. Waktu rame sempat nunggu agak lama, tapi adminnya ngabarin terus.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
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
          prefill_message: "Halo {{nama_usaha}}, saya mau kirim file buat dicetak kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Musim hajatan mulai rame, kak. Print sekarang biar nggak mepet.",
          subtitle: "Antrean produksi makin panjang menjelang akhir pekan — kirim filenya sekarang, kami susun jadwalnya.",
          button_label: "Chat WhatsApp Sekarang",
          prefill_message: "Halo kak, mau cetak [produk]. File-nya saya kirim ke sini ya.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
