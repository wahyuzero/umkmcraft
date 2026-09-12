/**
 * Barbershop — barbershop-v1, preset charcoal_slate.
 * 12 section: hero, stats, daftar harga, booking WA, kapster, galeri,
 * ulasan, value props, jam & lokasi, FAQ, kontak, CTA. Semua field
 * mengikuti skema v1 (packages/schema/src/v1/config.ts).
 *
 * Kepatuhan: hero di indeks 0, semua image_url/avatar_url "",
 * WA demo 6280000000000, review is_sample:true, harga numeric, token
 * {{kota}} di lokasi, tanpa emoji, copy hangat gaya "kakak".
 */
import type { TemplateDefinition } from "../types";

export const barbershopTemplate: TemplateDefinition = {
  id: "barbershop-v1",
  category: "barbershop",
  label: "Barbershop",
  description:
    "Barbershop siap pakai: daftar harga layanan, booking WhatsApp, jam buka, dan ulasan pelanggan. Tinggal ganti data kakak.",
  demo: { businessName: "Rapih Barbershop", city: "Surabaya" },
  config: {
    meta: {
      site_id: "rapih-barbershop",
      business_name: "Rapih Barbershop",
      business_category: "barbershop",
      tagline: "Potong rapi 30 menit, tanpa nunggu lama — ala {{nama_usaha}}.",
      schema_version: 1,
      theme: {
        preset: "charcoal_slate",
        primary_color: "#1e293b",
        secondary_color: "#0ea5e9",
        background_color: "#f8fafc",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: "6280000000000",
      seo: {
        title: "Rapih Barbershop — Potong Rambut & Booking via WhatsApp",
        description:
          "Barbershop di {{kota}}: classic cut, skin fade, cukur jenggot, kids cut. Harga jelas mulai Rp25.000 — booking via WhatsApp, walk-in diterima.",
        keywords: [
          "barbershop",
          "potong rambut pria",
          "skin fade",
          "kids cut",
          "cukur jenggot",
          "booking whatsapp",
        ],
      },
    },
    sections: [
      {
        id: "sec-hero-1",
        type: "hero_storefront",
        props: {
          badge: "Buka sampai 21.00",
          title: "Potong rapi 30 menit, tanpa nunggu lama",
          subtitle: "Booking dulu lewat WhatsApp biar langsung dilayani begitu sampai, kak.",
          image_url: "",
          image_position: "right",
          cta_primary: {
            label: "Booking Sekarang",
            action: "whatsapp_direct",
            prefill_message: "Halo kak, mau booking potong rambut hari ini.",
            url: "",
          },
          cta_secondary: {
            label: "Lihat Harga",
            action: "scroll_catalog",
            url: "",
          },
          badges: ["5 kapster senior", "Bisa walk-in", "Kids friendly"],
        },
      },
      {
        id: "sec-stats-1",
        type: "stats_counter_strip",
        props: {
          section_title: "",
          stats: [
            { value: "4,9★", label: "Rating di Google" },
            { value: "12.000+", label: "Kepala dilayani" },
            { value: "5", label: "Kapster senior" },
          ],
        },
      },
      {
        id: "sec-pricing-1",
        type: "service_pricing_table",
        props: {
          section_title: "Daftar Harga Layanan",
          section_subtitle: "Harga jelas dari depan, di kasir nggak ada tambahan siluman, kak.",
          tiers: [
            {
              id: "tier-classic",
              name: "Classic Cut",
              price: 35000,
              unit: "",
              duration: "30 mnt",
              features: ["Termasuk cuci & styling", "Rapi buat ke kantor maupun santai"],
              is_popular: false,
              cta_label: "Booking Slot Ini",
            },
            {
              id: "tier-fade",
              name: "Fade / Skin Fade",
              price: 45000,
              unit: "",
              duration: "45 mnt",
              features: ["Spesialisasi kami", "Termasuk cuci & styling pomade"],
              is_popular: true,
              cta_label: "Booking Slot Ini",
            },
            {
              id: "tier-beard",
              name: "Cukur Jenggot + Hot Towel",
              price: 30000,
              unit: "",
              duration: "30 mnt",
              features: ["Bentuk janggut dirapikan", "Sisir panas + balsem penutup"],
              is_popular: false,
              cta_label: "Booking Slot Ini",
            },
            {
              id: "tier-kids",
              name: "Kids Cut (≤10 thn)",
              price: 25000,
              unit: "",
              duration: "30 mnt",
              features: ["Kursi kids + stiker", "Kapster yang sabar sama anak"],
              is_popular: false,
              cta_label: "Booking Slot Ini",
            },
            {
              id: "tier-paket",
              name: "Paket Komplit",
              price: 65000,
              unit: "",
              duration: "60 mnt",
              features: ["Cut + cukur jenggot + cuci", "Kalau lepas pisah Rp85.000 — hemat Rp20.000"],
              is_popular: false,
              cta_label: "Booking Slot Ini",
            },
          ],
        },
      },
      {
        id: "sec-booking-1",
        type: "booking_whatsapp_form",
        props: {
          section_title: "Booking via WhatsApp",
          section_subtitle: "Pilih layanan dan jamnya — kami konfirmasi slot kosongnya lewat chat, kak.",
          service_options: [
            "Classic Cut — Rp35.000",
            "Fade / Skin Fade — Rp45.000",
            "Cukur Jenggot + Hot Towel — Rp30.000",
            "Kids Cut — Rp25.000",
            "Paket Komplit — Rp65.000",
          ],
          time_slots: [
            "10.00 – 11.00",
            "11.00 – 12.00",
            "13.00 – 14.00",
            "15.00 – 16.00",
            "16.00 – 17.00",
            "18.00 – 19.00",
            "19.00 – 20.00",
            "20.00 – 21.00",
          ],
          button_label: "Kirim Booking via WhatsApp",
          prefill_note: "Sebutkan layanan + jam yang kakak mau, kami konfirmasi slotnya.",
        },
      },
      {
        id: "sec-team-1",
        type: "team_members_grid",
        props: {
          section_title: "Kapster Kami",
          section_subtitle: "Pilih kapster pas booking — masing-masing punya spesialisasi sendiri.",
          members: [
            {
              name: "Reza Pratama",
              role: "Spesialis skin fade",
              bio: "8 tahun di dunia barbering — garis fadenya presisi sampai belakang kupu.",
              avatar_url: "",
            },
            {
              name: "Dimas Aryo",
              role: "Spesialis classic cut",
              bio: "Barber sejak 2019; potongan rapi gaya kantor yang nggak lekang waktu.",
              avatar_url: "",
            },
            {
              name: "Yoga Saputra",
              role: "Kids cut & grooming",
              bio: "Sabar sama anak — kursi kids plus stiker, dijamin betah sampai selesai.",
              avatar_url: "",
            },
          ],
        },
      },
      {
        id: "sec-gallery-1",
        type: "gallery_grid",
        props: {
          section_title: "Karya Kami",
          section_subtitle: "Hasil potongan asli pelanggan kami — bukan foto stok, kak.",
          layout: "grid_4_col",
          items: [
            { title: "Fade rapi", image_url: "", caption: "Skin fade garis tajam, hasil tangan Reza" },
            { title: "Textured crop", image_url: "", caption: "Potongan santai yang tetap terurus" },
            { title: "Before-after jenggot", image_url: "", caption: "Bentuk janggut dirapikan + hot towel" },
            { title: "Classic side part", image_url: "", caption: "Gaya kantor yang tak lekang waktu" },
            { title: "Kids corner", image_url: "", caption: "Kursi spesial biar anak nyaman duduk" },
            { title: "Cuci + pijat kepala", image_url: "", caption: "Gratis di setiap potongan, kak" },
            { title: "Alat steril", image_url: "", caption: "Disterilkan tiap selesai satu pelanggan" },
            { title: "Suasana kursi", image_url: "", caption: "Musik enak, ngopi dulu sambil nunggu giliran" },
          ],
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
              name: "Fajar — Darmo",
              rating: 5,
              text: "Booking jam 7 malem langsung ada slot. Rapih banget hasilnya.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Yoga — Gubeng",
              rating: 5,
              text: "Fadenya presisi — Reza ngerti maunya cuma dari deskripsi.",
              source: "google",
              avatar_url: "",
              date: "",
            },
            {
              name: "Putra — Wonokromo",
              rating: 4,
              text: "Anak saya duduk manis di kids chair, sabar banget sama anak kecil.",
              source: "whatsapp",
              avatar_url: "",
              date: "",
            },
            {
              name: "Rizky — Tegalsari",
              rating: 5,
              text: "Harga jelas di web, di kasir nggak ada tambahan aneh-aneh.",
              source: "manual",
              avatar_url: "",
              date: "",
            },
          ],
        },
      },
      {
        id: "sec-values-1",
        type: "value_props_grid",
        props: {
          section_title: "Kenapa Pilih Kami?",
          section_subtitle: "Hal-hal kecil yang bikin pelanggan balik lagi, kak.",
          items: [
            {
              icon: "shield",
              title: "Alat disterilkan tiap pelanggan",
              description: "Gunting, clipper, dan pisau cukur dicuci + disterilkan setiap selesai satu orang.",
            },
            {
              icon: "clock",
              title: "Walk-in tetap dilayani",
              description: "Nggak sempat booking? Datang aja — booking cuma biar nunggunya nol.",
            },
            {
              icon: "heart",
              title: "Kids friendly",
              description: "Ada kursi kids, stiker, dan kapster yang nggak buru-buru sama anak.",
            },
            {
              icon: "wallet",
              title: "Harga transparan",
              description: "Semua harga tertera di sini — di kasir nggak ada biaya siluman.",
            },
          ],
        },
      },
      {
        id: "sec-hours-1",
        type: "operating_hours_map",
        props: {
          section_title: "Lokasi & Jam Buka",
          address: "Jl. Darmo No. 88, {{kota}}",
          gmaps_url: "",
          waze_url: "",
          schedule: [
            { day: "Senin – Sabtu", hours: "09.00 – 21.00" },
            { day: "Minggu", hours: "10.00 – 18.00" },
          ],
          // Kontrak HourRangeSchema: day_of_week 0 = Minggu (badge Buka/Tutup).
          open_hours: [
            { day_of_week: 0, open: "10:00", close: "18:00" },
            { day_of_week: 1, open: "09:00", close: "21:00" },
            { day_of_week: 2, open: "09:00", close: "21:00" },
            { day_of_week: 3, open: "09:00", close: "21:00" },
            { day_of_week: 4, open: "09:00", close: "21:00" },
            { day_of_week: 5, open: "09:00", close: "21:00" },
            { day_of_week: 6, open: "09:00", close: "21:00" },
          ],
          delivery_note: "Walk-in diterima; reservasi disarankan akhir pekan.",
        },
      },
      {
        id: "sec-faq-1",
        type: "faq_accordion",
        props: {
          section_title: "Pertanyaan yang Sering Diajukan",
          items: [
            {
              q: "Bisa langsung datang?",
              a: "Bisa kak, walk-in tetap kami layani. Tapi kalau mau nunggunya nol — apalagi akhir pekan — booking dulu lewat WhatsApp ya.",
            },
            {
              q: "Bisa reschedule?",
              a: "Bisa kak. Chat kami minimal 1–2 jam sebelum jadwal, slotnya kami pindahin gratis.",
            },
            {
              q: "Bayarnya bisa transfer?",
              a: "Bisa kak — tunai, QRIS, atau transfer bank, semua diterima.",
            },
            {
              q: "Ada kids chair?",
              a: "Ada kak — kursi spesial buat anak sampai 10 tahun, plus kapster yang sabar. Kids Cut cuma Rp25.000.",
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
          prefill_message: "Halo {{nama_usaha}}, saya mau booking jadwal kak.",
        },
      },
      {
        id: "sec-cta-1",
        type: "cta_banner_full",
        props: {
          title: "Kamar depan lagi kosong, kak. Mau ditarok jam berapa?",
          subtitle: "Slot sore paling cepat penuh — booking dulu, nunggunya di rumah aja.",
          button_label: "Booking via WhatsApp",
          prefill_message: "Halo kak, mau booking potong rambut hari ini.",
          secondary_label: "",
          secondary_url: "",
        },
      },
    ],
  },
};
