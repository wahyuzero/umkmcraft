/**
 * Copy voice & lint (kualitas bahasa) — satu sumber kebenaran untuk "suara"
 * tiap keluarga kategori. Dipakai tiga tempat:
 *   1. prompt LLM (voiceGuide → prompts.ts),
 *   2. template engine deterministik (tagline/subtitle/deskripsi default),
 *   3. lintCopy() — post-processor deterministik di jalur generateConfig agar
 *      copy brosur ("solusi", "kebutuhan Anda", teks terpotong "…") tidak
 *      pernah sampai ke pengguna, baik hasil AI maupun template.
 * Murni TypeScript, tanpa side-effect, tanpa import dari modul AI lain
 * (anti siklus: template-engine & prompts boleh mengimpor modul ini).
 */
import type { SectionProps, UmkmWebsiteConfig } from "@umkmcraft/schema";

/** Ambil langsung dari schema supaya ikut bila enum ikon ditambah. */
type ValuePropIcon = SectionProps<"value_props_grid">["items"][number]["icon"];

export type CopyFamily = "kuliner" | "coffee" | "barbershop" | "laundry" | "fashion" | "bengkel" | "default";

export interface CategoryVoice {
  key: CopyFamily;
  /** Label Indonesia untuk inject ke prompt & judul kategori. */
  label: string;
  /** Blok panduan gaya bahasa untuk system prompt (do/don't + few-shot). */
  voiceGuide: string;
  /** Default copy deterministik — tagline ≤ 8 kata, spesifik produk. */
  tagline: string;
  subtitle: string;
  ctaTitle: string;
  ctaSubtitle: string;
  seoDescription: (name: string) => string;
  badges: string[];
  catalogTitle: string;
  catalogSubtitle: string;
  valueProps: Array<{ icon: ValuePropIcon; title: string; description: string }>;
  faqs: Array<{ q: string; a: string }>;
  products: Array<{ name: string; price: number; description: string }>;
}

/** Kata fungsi/frasa penunjuk yang wajar berulang — tidak ikut di-de-dupe. */
const DEDUPE_STOPWORDS = new Set([
  "adalah", "ialah", "yaitu", "yakni", "bahwa", "sebagai", "sedang", "serta",
  "supaya", "terhadap", "karena", "antara", "sebuah", "sesuai", "setiap",
  "seluruh", "sangat", "lebih", "paling", "sudah", "telah", "mereka", "kita",
  "sekali", "nanti", "kalau", "kakak", "besok",
]);

/**
 * Kalimat brosur generik — kalau muncul di field identitas (tagline/subtitle
 * hero/deskripsi SEO), SELURUH kalimat diganti default kategori. Kata tunggal
 * "terbaik" sengaja tidak masuk (masih wajar dalam kalimat konkret).
 */
export const IDENTITY_SLOP_RE =
  /\b(solusi|kebutuhan|terlengkap|pilihan terbaik|terbaik untuk)\b/i;

/** Swap frasa generik → versi hangat, aman secara tata bahasa di posisi mana pun. */
const BANNED_SWAPS: Array<[RegExp, string]> = [
  [/untuk kebutuhan (anda|kamu)/gi, "buat kamu"],
  [/kebutuhan (anda|kamu)/gi, "keperluanmu"],
  [/solusi terbaik/gi, "pilihan paling pas"],
  [/\bsolusi\b/gi, "pilihan"],
  [/\bAnda\b/g, "kakak"],
];

/** Batas panjang per kunci field copy (selaras schema v1; ambil yang paling ketat). */
const COPY_LIMITS: Record<string, number> = {
  tagline: 140,
  subtitle: 200, // hero 220, cta_banner 200 → pakai yang ketat
  description: 300,
  seo_description: 200,
  section_subtitle: 160,
  section_title: 80,
  q: 160,
  a: 800,
  delivery_note: 160,
  badge: 40,
  badges: 40,
};

/** Kunci field yang dianggap "copy" (dilint). Selain ini (nama, URL, nomor WA, id) diutamakan. */
const COPY_KEYS = new Set(Object.keys(COPY_LIMITS));

export function familyForCategory(category: string): CopyFamily {
  const c = (category || "").toLowerCase();
  if (/coffee|kopi|cafe|kafe/.test(c)) return "coffee";
  if (/barber|pangkas|cukur|rambut/.test(c)) return "barbershop";
  if (/laundry|cuci|kiloan|dhobi/.test(c)) return "laundry";
  if (/fashion|baju|butik|hijab|gamis|dress|pakaian|konveksi|distro|batik|kebaya/.test(c)) return "fashion";
  if (/bengkel|servis|service|motor|mobil|reparasi|montir|otomotif|jasa/.test(c)) return "bengkel";
  if (/kuliner|warung|makan|masak|food|resto|rumahan|sambal|catering|bakso|mie|snack|kue|roti/.test(c)) return "kuliner";
  return "default";
}

const VOICES: Record<CopyFamily, CategoryVoice> = {
  kuliner: {
    key: "kuliner",
    label: "Kuliner / Warung Makan",
    voiceGuide: `GAYA KULINER/WARUNG — makanan dulu, ucapannya belakangan. Kedengaran seperti warung, bukan landing page korporat.
LAKUKAN: ceritakan aroma, tekstur, cara masak, porsi, dan kebiasaan orang yang balik lagi. Sebut bahan konkret ("sambal digoreng dadakan", "kuah dimasak semalaman"). Sapalah pembeli "kakak/kak".
JANGAN: bahasa brosur ("solusi", "kebutuhan", "terbaik untuk Anda"), klaim nomor satu, kalimat yang tidak menyebut makanan sama sekali.
CONTOH BAGUS — tagline: "Sambal dadakan, pedasnya bikin nagih" | deskripsi produk: "Ayam digoreng saat pesanan masuk, sambalnya diulek dadakan. Sekali coba, biasanya besoknya balik lagi."
CONTOH BURUK — tagline: "Kebutuhan kuliner Anda, solusi kami." | deskripsi produk: "Menyediakan berbagai menu terbaik untuk kebutuhan Anda." (generik, korporat, tidak menyebut makanan)`,
    tagline: "Masakan rumahan hangat, tinggal chat",
    subtitle: "Dimasak hari ini, sambal dan lauknya dadakan. Chat kakak, nanti tinggal diambil atau diantar.",
    ctaTitle: "Lapar? Pesan sekarang.",
    ctaSubtitle: "Chat aja kakak, dibalas cepat di jam buka.",
    seoDescription: (name) => `${name} — masakan rumahan hangat, pesan mudah lewat WhatsApp.`,
    badges: ["Masak Dadakan", "Harga Rasa Warung", "Respon Cepat"],
    catalogTitle: "Menu Andalan Hari Ini",
    catalogSubtitle: "Lihat yang cocok? Klik tombol WhatsApp-nya, langsung nyambung ke admin.",
    valueProps: [
      { icon: "flame", title: "Dimasak Dadakan", description: "Pesanan masuk, langsung diwok. Nasi dan lauk sampai di meja masih hangat." },
      { icon: "chat", title: "Respon Cepat", description: "Chat kakak dibalas secepatnya di jam operasional." },
      { icon: "wallet", title: "Harga Rasa Warung", description: "Porsi kenyang, harga tetap bersahabat seperti di warung." },
    ],
    faqs: [
      { q: "Bagaimana cara pesannya?", a: "Klik tombol WhatsApp pada menu yang diinginkan — chat langsung nyambung ke admin. Sebut menu dan jam pengambilannya, nanti langsung disiapkan." },
      { q: "Bisa pesan untuk acara?", a: "Bisa banget. Ceritakan tanggal, jumlah porsi, dan menunya lewat chat — kami bantu hitung kira-kira perlu berapa." },
    ],
    products: [
      { name: "Paket Nasi Lauk", price: 25000, description: "Nasi hangat, lauk pilihan hari ini, plus sambal buatan sendiri. Porsinya bikin kenyang sampai sore." },
      { name: "Sambal Bawang Rumahan", price: 15000, description: "Digoreng dadakan, pedasnya pas di lidah orang Indonesia. Tahan seminggu disimpan di kulkas." },
      { name: "Es Teh Manis Jumbo", price: 8000, description: "Diseduh pekat lalu disajikan sejuk. Teman paling setia makan sambal." },
    ],
  },
  coffee: {
    key: "coffee",
    label: "Coffee Shop / Kedai Kopi",
    voiceGuide: `GAYA COFFEE SHOP — hangat dan santai, seperti mengajak nongkrong.
LAKUKAN: ceritakan biji dan sangrainya, aroma seduhan, suasana tempat, kebiasaan pelanggan tetap. Sapakan "kakak" atau netral "kamu".
JANGAN: "solusi ngopi", "memenuhi kebutuhan kopi Anda", gaya brosur korporat.
CONTOH BAGUS — tagline: "Biji disangrai sendiri, seduhan selalu segar" | deskripsi produk: "Kopi susu gula aren-nya manisnya tipis, kopinya tetap terasa. Banyak yang buru sebelum jam 9 pagi."
CONTOH BURUK — tagline: "Solusi kopi terbaik untuk kebutuhan Anda" | deskripsi produk: "Kami menyediakan aneka kopi berkualitas tinggi." (kosong, tidak ada detail seduhan)`,
    tagline: "Biji segar disangrai, seduhan selalu pas",
    subtitle: "Biji disangrai tiap pekan, diseduh pas kamu datang. Buat dibawa pulang atau nongkrong lama, sama-sama enak.",
    ctaTitle: "Mampir atau bawa pulang?",
    ctaSubtitle: "Chat dulu kakak, pesanan disiapkan sebelum kamu datang.",
    seoDescription: (name) => `${name} — kedai kopi dengan sangrai sendiri, pesan lewat WhatsApp.`,
    badges: ["Biji Segar", "Seduh Sesuai Selera", "Tempat Nyaman"],
    catalogTitle: "Menu Seduhan Kami",
    catalogSubtitle: "Mau pesan? Klik tombol WhatsApp pada menunya — langsung terhubung ke barista.",
    valueProps: [
      { icon: "star", title: "Biji Disangrai Sendiri", description: "Sangrai kecil-kecil tiap pekan supaya aromanya tidak sempat menguap." },
      { icon: "chat", title: "Seduh Sesuai Selera", description: "Minta lebih pekat atau kurang manis? Tinggal bilang, nanti disesuaikan." },
      { icon: "wallet", title: "Harga Bersahabat", description: "Kualitas kedai kota besar, harga tetap ramah di kantong." },
    ],
    faqs: [
      { q: "Bisa pesan untuk dibawa pulang?", a: "Bisa. Chat dulu menu dan jam penjemputannya — biar pas sampai, kopinya baru diseduh." },
      { q: "Ada minuman non-kopi?", a: "Ada, dari cokelat hangat sampai teh melati. Tanya saja kakak adminnya, nanti direkomendasikan yang pas." },
    ],
    products: [
      { name: "Kopi Susu Gula Aren", price: 18000, description: "Espresso, susu segar, dan gula aren asli. Manisnya tipis, kopinya tetap kerasa." },
      { name: "Americano", price: 15000, description: "Diseduh dari biji sangrai pekan ini — rasanya bersih dengan aroma yang kuat." },
      { name: "Roti Bakar Cokelat", price: 12000, description: "Roti dipanggang dadakan, lelehannya melimpah. Pas untuk teman ngobrol santai." },
    ],
  },
  barbershop: {
    key: "barbershop",
    label: "Barbershop / Cukur Rambut",
    voiceGuide: `GAYA BARBERSHOP — rapi, tepercaya, jago. Nada seperti kapster yang mengenal pelanggannya.
LAKUKAN: sebut hasil konkret — potongan sesuai bentuk kepala, cukuran bersih, alat steril, bisa booking jam. Sapakan "boss" atau "kakak".
JANGAN: "solusi gaya rambut", klaim "terbaik", janji berlebihan.
CONTOH BAGUS — tagline: "Pangkas rapi, tinggal chat jadwalnya" | deskripsi layanan: "Dipangkas sesuai bentuk kepala, sisi dan belakang dituntaskan rapi. Alat disterilkan tiap selesai pelanggan."
CONTOH BURUK — tagline: "Kebutuhan penampilan Anda, solusi kami" | deskripsi layanan: "Kami melayani potongan rambut dengan kualitas terbaik." (generik, tidak ada janji konkret)`,
    tagline: "Pangkas rapi, tinggal chat jadwalnya",
    subtitle: "Dipangkas sesuai bentuk kepala, dituntaskan sampai belakang. Chat dulu biar tidak usah nunggu bangku.",
    ctaTitle: "Siap tampil rapi?",
    ctaSubtitle: "Chat kakak, pilih jam yang kosong, datang tinggal duduk.",
    seoDescription: (name) => `${name} — pangkas rapi, bisa booking jam lewat WhatsApp.`,
    badges: ["Alat Steril", "Harga Jelas", "Bisa Booking Jam"],
    catalogTitle: "Layanan Pangkas",
    catalogSubtitle: "Pilih layanannya, chat kakak untuk kunci jamnya.",
    valueProps: [
      { icon: "star", title: "Potongan Rapi", description: "Digunting sesuai bentuk kepala — sisi dan belakang tidak asal potong." },
      { icon: "clock", title: "Bisa Booking Jam", description: "Chat dulu jam yang kosong, datang tepat waktu tanpa antre lama." },
      { icon: "wallet", title: "Harga Jelas", description: "Daftar harga tertera di depan — tidak ada tambahan yang bikin kaget." },
    ],
    faqs: [
      { q: "Bisa booking jam tertentu?", a: "Bisa. Kirim jam yang diinginkan lewat WhatsApp, nanti dibalas slot yang masih kosong." },
      { q: "Alatnya bersih tidak?", a: "Setiap pelanggan selesai, alat dilap dan disterilkan — tidak pindah tangan sebelum bersih." },
    ],
    products: [
      { name: "Cukur Rambut + Cuci", price: 25000, description: "Dipangkas sesuai bentuk kepala, dicuci bersih, dituntaskan sampai belakang." },
      { name: "Cukur + Rapikan Jenggot", price: 35000, description: "Rambut dipangkas, jenggot dirapikan, ditutup kompres hangat. Keluar terasa muda." },
    ],
  },
  laundry: {
    key: "laundry",
    label: "Laundry / Cuci Kiloan",
    voiceGuide: `GAYA LAUNDRY — bersih, rapi, bisa dipercaya.
LAKUKAN: sebut proses konkret — dihitung per kilo, dicuci terpisah, wangi tahan lama, kapan selesai, bisa antar-jemput. Sapakan "kakak".
JANGAN: "solusi kebersihan pakaian Anda", klaim mutlak tanpa proses.
CONTOH BAGUS — tagline: "Cucian wangi, lipat rapi, dua hari jadi" | deskripsi layanan: "Cucian ditimbang dulu di depan, dicuci terpisah satu pelanggan satu mesin. Selesai dua hari, tinggal ambil di rak."
CONTOH BURUK — tagline: "Solusi terbaik untuk kebutuhan laundry Anda" | deskripsi layanan: "Kami memberikan layanan cuci dengan kualitas terbaik." (tidak menjelaskan proses apa pun)`,
    tagline: "Cucian wangi, lipat rapi, dua hari jadi",
    subtitle: "Tinggal titip — dihitung per kilo, dicuci terpisah, dilipat rapi. Ambil tinggal tunjuk rak.",
    ctaTitle: "Tinggal titip cucian?",
    ctaSubtitle: "Chat kakak — bisa dijemput langsung ke rumah.",
    seoDescription: (name) => `${name} — cuci kiloan wangi, lipat rapi, bisa antar-jemput.`,
    badges: ["Dicuci Terpisah", "Wangi Tahan Lama", "Bisa Antar-Jemput"],
    catalogTitle: "Paket Cuci",
    catalogSubtitle: "Pilih paketnya, chat kakak untuk jemput cucian.",
    valueProps: [
      { icon: "shield", title: "Dicuci Terpisah", description: "Satu pelanggan satu mesin — cucian tidak bercampur dengan orang lain." },
      { icon: "truck", title: "Bisa Antar-Jemput", description: "Untuk area sekitar, cucian dijemput dan diantar kembali ke rumah." },
      { icon: "wallet", title: "Harga Per Kilo", description: "Ditimbang di depan kakak, tarif jelas sejak awal." },
    ],
    faqs: [
      { q: "Berapa lama prosesnya?", a: "Reguler dua hari kerja. Kalau butuh cepat, ada layanan kilat — dititip pagi, selesai sore." },
      { q: "Pakaian sensitif aman?", a: "Sebutkan saja saat titip — bahan halus dicuci terpisah dengan air dingin dan deterjen lembut." },
    ],
    products: [
      { name: "Cuci Kering Setrika", price: 7000, description: "Per kilo. Dicuci terpisah, dikeringkan, disetrika rapi — siap diambil dua hari kerja." },
      { name: "Cuci Kilat Same Day", price: 15000, description: "Dititip pagi, selesai sore hari. Penyelamat seragam dan baju acara mendadak." },
    ],
  },
  fashion: {
    key: "fashion",
    label: "Fashion / Pakaian",
    voiceGuide: `GAYA FASHION — jual bahan, potongan, dan kenyamanan; bukan gaya hidup.
LAKUKAN: sebut bahan (adem, tebal, stretch), potongan, ukuran yang ready, cara perawatan. Sapakan "kakak".
JANGAN: "solusi gaya hidup Anda", "fashion terbaik untuk kebutuhan Anda".
CONTOH BAGUS — tagline: "Bahan adem, potongan nyaman seharian" | deskripsi produk: "Katun premium yang adem walau panas, jahitan rapi tidak mudah lepas. Ready size M sampai XXL."
CONTOH BURUK — tagline: "Kebutuhan fashion Anda, solusi kami" | deskripsi produk: "Menyediakan pakaian terlengkap untuk kebutuhan Anda." (tidak menyebut bahan/ukuran apa pun)`,
    tagline: "Bahan adem, potongan nyaman seharian",
    subtitle: "Setiap baju dipilih langsung dari bahan yang adem dan nyaman dipakai seharian. Chat kakak buat tanya stok warna dan ukuran.",
    ctaTitle: "Sudah ada yang cocok?",
    ctaSubtitle: "Chat kakak untuk tanya stok dan ukuran sebelum checkout.",
    seoDescription: (name) => `${name} — baju bahan adem, ready size lengkap, pesan lewat WhatsApp.`,
    badges: ["Bahan Adem", "Size Lengkap", "Bisa Tukar Size"],
    catalogTitle: "Koleksi Terbaru",
    catalogSubtitle: "Tanya stok dulu boleh — klik WhatsApp-nya, dijawab langsung.",
    valueProps: [
      { icon: "star", title: "Bahan Diperiksa Langsung", description: "Baju dipegang satu-satu sebelum dikirim — yang jahitannya kurang rapi tidak jadi dikirim." },
      { icon: "chat", title: "Tanya Stok Dulu Boleh", description: "Sebelum pesan, tanyakan warna dan ukuran lewat chat — dijawab langsung oleh pemiliknya." },
      { icon: "wallet", title: "Harga Langsung Dari Toko", description: "Tanpa perantara, harga sama seperti datang langsung ke toko." },
    ],
    faqs: [
      { q: "Kalau ukurannya tidak pas?", a: "Tenang, bisa tukar ukuran — kabari admin maksimal dua hari setelah paket sampai." },
      { q: "Bahannya adem untuk cuaca panas?", a: "Ya, koleksinya mayoritas katun dan rayon — ringan dan tidak gerah dipakai seharian." },
    ],
    products: [
      { name: "Kemeja Flanel Premium", price: 89000, description: "Flanel tebal yang tetap adem, jahitan rapi. Pas untuk main santai maupun ke kantor." },
      { name: "Gamis Rayon Daily", price: 125000, description: "Rayon premium yang jatuh dan ringan, tidak menerawang. Ready dari size M sampai XL." },
    ],
  },
  bengkel: {
    key: "bengkel",
    label: "Bengkel / Jasa Servis",
    voiceGuide: `GAYA BENGKEL/JASA — jujur, harga wajar, tepat diagnosa.
LAKUKAN: jelaskan alur jujurnya — dicek dulu, kerusakan dijelaskan, harga disepakati baru dikerjakan. Sebut keahlian konkret. Sapakan "kakak" atau "boss".
JANGAN: mengarang kerusakan, "solusi otomotif Anda", harga misterius.
CONTOH BAGUS — tagline: "Cek dulu, baru bilang harga" | deskripsi layanan: "Motor dicek di depan mata, kerusakan dijelaskan satu-satu. Setuju harganya, baru dikerjakan."
CONTOH BURUK — tagline: "Solusi terbaik untuk kendaraan Anda" | deskripsi layanan: "Kami melayani segala jenis perbaikan dengan kualitas terbaik." (tidak ada janji proses)`,
    tagline: "Cek dulu, baru bilang harga",
    subtitle: "Motor dicek di depan mata, kerusakan dijelaskan satu-satu. Setuju harganya, baru dikerjakan.",
    ctaTitle: "Motor mulai rewel?",
    ctaSubtitle: "Chat kakak — dicek dulu, baru dibahas harganya.",
    seoDescription: (name) => `${name} — bengkel jujur: cek dulu, harga sepakat di awal.`,
    badges: ["Diagnosa Terbuka", "Harga Sepakat Awal", "Mekanik Berpengalaman"],
    catalogTitle: "Layanan Servis",
    catalogSubtitle: "Belum tahu perlu servis apa? Chat kakak, dijelaskan dulu tanpa biaya.",
    valueProps: [
      { icon: "shield", title: "Diagnosa Dulu", description: "Kerusakan dicek dan dijelaskan — tidak ada suku cadang diganti tanpa izin." },
      { icon: "wallet", title: "Harga Sepakat Awal", description: "Biaya disebutkan sebelum pengerjaan, tidak ada biaya siluman di akhir." },
      { icon: "tool", title: "Mekanik Berpengalaman", description: "Puluhan motor lewat tangan yang sama tiap hari — umurnya tidak boong." },
    ],
    faqs: [
      { q: "Perlu reservasi dulu?", a: "Untuk servis rutin langsung datang saja. Kalau tune-up besar, chat dulu supaya slotnya disiapkan." },
      { q: "Bisa titip ganti oli saja?", a: "Bisa — sekalian rantai dikencangkan dan rem dicek. Biasanya selesai dalam 30 menit." },
    ],
    products: [
      { name: "Servis Rutin + Ganti Oli", price: 85000, description: "Ganti oli, kencangkan rantai, cek rem dan tekanan ban. Motor balik enteng di pegangan." },
      { name: "Tune Up Lengkap", price: 150000, description: "Karbu dibersihkan, busi diganti, setelan disesuaikan standar. Paling ramai menjelang mudik." },
    ],
  },
  default: {
    key: "default",
    label: "Umum / Lainnya",
    voiceGuide: `GAYA UMUM — hangat, spesifik, seperti pedagang yang mengenal pembelinya.
LAKUKAN: sebut produk/jasa secara konkret, cara pesan yang gampang, dan kebiasaan pelanggan. Sapakan "kakak".
JANGAN: "solusi", "kebutuhan Anda", "terbaik untuk Anda", kalimat brosur tanpa info nyata.
CONTOH BAGUS — tagline: "Pelayanan ramah, harga jelas dari awal" | deskripsi: "Semua pesanan ditangani langsung pemiliknya. Tanya-tanya dulu lewat chat juga boleh, kakak."
CONTOH BURUK — tagline: "Kebutuhan Anda, solusi kami." | deskripsi: "Kami menyediakan layanan terbaik untuk kebutuhan Anda." (generik, bisa jadi bisnis apa pun)`,
    tagline: "Pelayanan ramah, harga jelas dari awal",
    subtitle: "Usaha keluarga yang melayani langsung tanpa perantara. Chat kakak — pesanan ditangani pemiliknya sendiri.",
    ctaTitle: "Siap mulai?",
    ctaSubtitle: "Chat aja kakak — dibalas cepat di jam operasional.",
    seoDescription: (name) => `${name} — pelayanan ramah, pesan mudah lewat WhatsApp.`,
    badges: ["Respon Cepat", "Harga Jelas", "Ditangani Pemilik"],
    catalogTitle: "Pilihan Unggulan",
    catalogSubtitle: "Lihat yang cocok? Klik tombol WhatsApp-nya, langsung nyambung ke admin.",
    valueProps: [
      { icon: "star", title: "Dikerjakan Dengan Teliti", description: "Setiap pesanan ditangani pelan-pelan sampai benar-benar beres." },
      { icon: "chat", title: "Respon Cepat", description: "Chat kakak dibalas secepatnya di jam operasional." },
      { icon: "wallet", title: "Harga Jelas", description: "Biaya disebutkan di awal, tidak ada tambahan yang bikin kaget." },
    ],
    faqs: [
      { q: "Bagaimana cara memesan?", a: "Klik tombol WhatsApp — chat langsung nyambung ke admin. Ceritakan keperluannya, nanti dibantu dari awal sampai beres." },
      { q: "Bisa konsultasi dulu?", a: "Boleh banget. Tanya-tanya lewat chat dulu juga tidak apa-apa, gratis dan dijawab langsung." },
    ],
    products: [
      { name: "Layanan Reguler", price: 50000, description: "Layanan yang paling sering dipesan pelanggan. Hasilnya konsisten dari kunjungan ke kunjungan." },
      { name: "Layanan Lengkap", price: 100000, description: "Paket menyeluruh untuk keperluan yang lebih banyak. Chat dulu kakak, nanti disesuaikan." },
    ],
  },
};

/** Suara kategori — menerima string kategori apa pun (termasuk bebas user), selalu ada jawabannya. */
export function voiceForCategory(category: string): CategoryVoice {
  return VOICES[familyForCategory(category)];
}

/** Potong di batas kata — TIDAK PERNAH di tengah kata, TIDAK PERNAH berakhir "…". */
export function truncateAtWordBoundary(text: string, max: number): string {
  const base = text.replace(/…\s*$/u, "").trimEnd();
  if (base.length <= max) return base;
  const cut = base.lastIndexOf(" ", max);
  return (cut > 0 ? base.slice(0, cut) : base.slice(0, max)).replace(/[\s,;:-]+$/u, "");
}

/** Buang kata konten (≥5 huruf, bukan stopword) yang berulang dalam SATU kalimat — simpan kemunculan pertama. */
export function dedupeWordsInSentence(sentence: string): string {
  const seen = new Set<string>();
  const kept: string[] = [];
  for (const part of sentence.split(/(\s+)/)) {
    if (part === "" || /^\s+$/.test(part)) {
      kept.push(part);
      continue;
    }
    const bare = part.replace(/[^\p{L}\p{N}]/gu, "").toLowerCase();
    if (bare.length >= 5 && !DEDUPE_STOPWORDS.has(bare)) {
      if (seen.has(bare)) continue;
      seen.add(bare);
    }
    kept.push(part);
  }
  return kept
    .join("")
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .trimEnd();
}

/** Bersihkan satu string copy: swap frasa generik → de-dupe per kalimat → rapikan tanda baca. */
function polishCopyText(text: string): string {
  let s = text;
  for (const [re, replacement] of BANNED_SWAPS) s = s.replace(re, replacement);
  const sentences = s.match(/[^.!?]+[.!?]*/g) ?? [s];
  s = sentences.map(dedupeWordsInSentence).join(" ");
  return s
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?;:])/g, "$1")
    .replace(/,\s*\./g, ".")
    .replace(/[\s,;:]+$/u, "")
    .trim();
}

function limitFor(key: string, path: string): number {
  if (path.includes("seo.description")) return COPY_LIMITS.seo_description!;
  return COPY_LIMITS[key] ?? 300;
}

interface PolishCtx {
  voice: CategoryVoice;
  businessName: string;
}

function polishValue(value: string, key: string, path: string, sectionType: string, ctx: PolishCtx): string {
  // "title" memuat identitas usaha & judul section — jangan diutak-atik lint.
  if (key === "title" || !COPY_KEYS.has(key)) return value;

  // Field identitas: copy brosur → ganti utuh dengan default kategori.
  if (path.endsWith("meta.tagline") && IDENTITY_SLOP_RE.test(value)) return ctx.voice.tagline;
  if (path.includes("seo.description") && IDENTITY_SLOP_RE.test(value)) {
    return ctx.voice.seoDescription(ctx.businessName);
  }
  if (key === "subtitle" && sectionType === "hero_storefront" && IDENTITY_SLOP_RE.test(value)) {
    return ctx.voice.subtitle;
  }
  if (key === "subtitle" && sectionType === "cta_banner_full" && IDENTITY_SLOP_RE.test(value)) {
    return ctx.voice.ctaSubtitle;
  }

  return truncateAtWordBoundary(polishCopyText(value), limitFor(key, path));
}

/** Telusuri seluruh config, polaskan setiap string copy; properti non-copy diteruskan apa adanya. */
function mapCopyStrings(node: unknown, key: string, path: string, sectionType: string, ctx: PolishCtx): unknown {
  if (typeof node === "string") return polishValue(node, key, path, sectionType, ctx);
  if (Array.isArray(node)) {
    return node.map((item, i) => mapCopyStrings(item, key, `${path}[${i}]`, sectionType, ctx));
  }
  if (node !== null && typeof node === "object") {
    const obj = node as Record<string, unknown>;
    const nextType = typeof obj.type === "string" ? obj.type : sectionType;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = mapCopyStrings(v, k, `${path}.${k}`, nextType, ctx);
    }
    return out;
  }
  return node;
}

/**
 * lintCopy — post-processor deterministik di ujung pipeline generate (jalur AI
 * maupun template). Menjamin: (1) tidak ada kata brosur berulang dalam satu
 * kalimat, (2) teks panjang terpotong di batas kata tanpa "…", (3) frasa
 * generik "solusi/kebutuhan Anda" di field identitas diganti default kategori.
 * Copy yang sudah bagus lolos tanpa diubah.
 */
export function lintCopy(config: UmkmWebsiteConfig): UmkmWebsiteConfig {
  const ctx: PolishCtx = {
    voice: voiceForCategory(config.meta.business_category),
    businessName: config.meta.business_name,
  };
  return mapCopyStrings(config, "config", "config", "", ctx) as UmkmWebsiteConfig;
}
