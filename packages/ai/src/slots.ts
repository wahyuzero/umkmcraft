/**
 * Slot extraction deterministik (ADR-3 Fase 1): state machine di server,
 * TIDAK memercayakan teks LLM. Mengurai jawaban santai user jadi slot.
 */
export interface Slots {
  businessName?: string;
  category?: string;
  location?: string;
  whatsappNumber?: string;
  products: Array<{ name: string; price?: number }>;
  promo?: string;
  hours?: string;
  story?: string;
}

export const emptySlots = (): Slots => ({ products: [] });

const CATEGORY_KEYWORDS: Array<[string, string[]]> = [
  ["kuliner", ["makanan", "kuliner", "warung", "resto", "rumah makan", "sambal", "katering", "catering", "bakso", "soto", "nasi", "ayam", "kue", "roti", "snack", "martabak", "pizza", "burger", "seblak", "seblak", "mie", "bakmi", "pecel"]],
  ["coffee", ["kopi", "coffee", "kafe", "cafe", "kedai", "boba", "matcha", "es kopi"]],
  ["barbershop", ["barbershop", "barber", "potong rambut", "kapster", "salon pria", "cukur"]],
  ["fashion", ["fashion", "butik", "hijab", "gamis", "kaos", "baju", "skincare", "kosmetik", "mukena", "sepatu", "tas", "daster"]],
  ["bengkel", ["bengkel", "servis", "service", "motor", "mobil", "ac", "elektronik", "teknisi", "service hp", "service laptop", "tambal ban"]],
  ["laundry", ["laundry", "cuci", "setrika", "dry clean", "cuci sepatu", "cuci mobil"]],
];

export function extractCategory(text: string): string | undefined {
  const t = text.toLowerCase();
  for (const [cat, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => t.includes(k))) return cat;
  }
  return undefined;
}

export function extractWaNumber(text: string): string | undefined {
  const m = text.replace(/[-.\s()]/g, "").match(/(?:\+?62|0)8\d{7,13}/);
  if (!m) return undefined;
  const digits = m[0].replace(/\D/g, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits.startsWith("62") ? digits : `62${digits}`;
}

export function extractPrices(text: string): Array<{ price: number }> {
  const out: Array<{ price: number }> = [];
  // "25rb", "25k", "15.000", "25000" — run digit ≥4 ditangkap utuh
  // (dulu "15000" hanya cocok "500" karena pola \d{1,3} tanpa alternatif panjang).
  const re = /(?<![.,\d])(\d{1,3}(?:[.,]\d{3})+|\d{4,8}|\d{1,3})\s*(rb|ribu|k)?(?=\s|$|[,.;:!?])/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let n = Number(m[1]!.replace(/\./g, "").replace(/,/g, ""));
    if (m[2]) n *= 1000;
    if (n >= 500 && n <= 100_000_000) out.push({ price: n });
  }
  return out;
}

/**
 * Kata yang TIDAK mungkin jadi awal nama usaha (pronomina, kata kerja, pengisi) —
 * diuji di AWAL kandidat, bukan sekadar kemunculan pertama ("Saya punya warung…"
 * tidak boleh lolos hanya karena "warung" ada di dalamnya).
 */
const NOT_A_NAME_START =
  /^(?:saya|aku|kami|kita|gue|gua|punya|ada|yang|itu|ini|namanya|nama|usaha|jualan|jual|menjual|buka|tutup|menu|harga|nomor|alamat|jam|open|kak|halo|oke|siap|terima\s+kasih|di|ke|dari|tapi|karena|biar|supaya|kira|sekitar|tiap|setiap|dan|atau|sama)\b/i;

/** Lead-in pengisi sebelum nama: "saya punya", "aku punya", "punya". */
const NAME_LEADIN = /^(?:(?:saya|aku|kami|gue)\s+)?punya\s+/i;

/** Kata penanda klausa baru — kandidat nama dipotong di situ ("… Slamet buka tiap hari"). */
const NAME_CLAUSE_CUT = /\s+(?:buka|tutup|jualan|jual\b|menjual|menu|harga|nomor|wa\b|whatsapp|alamat|jam)\b.*/i;

/** Rapikan kandidat nama: buang sapaan/pengisi awal, potong klausa ikutan. */
function cleanBusinessName(raw: string, cutAtLocation: boolean): string {
  let name = raw.replace(/\s+/g, " ").trim();
  name = name.replace(/^(?:ya|adalah|itu|namanya|namaname)\s+/i, "");
  name = name.replace(NAME_LEADIN, "");
  // pronomina telanjang sebelum nama proper ("Selamat pagi! Saya Punakawan…")
  // dibuang hanya jika diikuti huruf kapital — "saya punya warung" tetap aman
  name = name.replace(/^(?:saya|aku|kami|gue|ini)\s+(?=[A-Z])/i, "");
  name = name.replace(NAME_CLAUSE_CUT, "");
  // "di <lokasi>" bukan bagian nama ("Warung Sedap di Bandung" → "Warung Sedap")
  if (cutAtLocation) name = name.split(/\s+di\s+/i)[0]!.trim();
  return name.trim();
}

function titleCaseName(s: string): string {
  return s
    .split(" ")
    .map((w) => (w ? w[0]!.toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function extractBusinessName(text: string): string | undefined {
  // Sapaan pembuka + tanda seru/tanya ("Selamat pagi! Saya …") bukan bagian
  // nama — kalau tidak dibuang, kandidat ikut memuat sapaan dan kepanjangan.
  // Hanya sapaan yang dikenal; "Warung Barokah! Buka …" tidak tersentuh.
  text = text.replace(
    /^\s*(?:selamat\s+(?:pagi|siang|sore|malam)|halo|hai|hello|assalam(?:ualaikum)?|om\s+swastiastu)\b[^.!?\n]*[!?]\s*/i,
    "",
  );
  // Urutan = prioritas: pola eksplisit → "namanya X" → pola natural (divalidasi ketat).
  const patterns: Array<{ re: RegExp; cutAtLocation: boolean; maxWords?: number; recoverCase?: boolean }> = [
    // pola eksplisit: "nama usahaku X", "toko saya: X"
    {
      re: /(?:nama\s*(?:usaha|toko|warung|kedai|bengkel|laundry|cafe|brand|bisnis)(?:nya|ku|aku|saya)?|usaha\s*(?:saya|aku|kami|gue)|toko\s*(?:saya|aku|kami)|warung\s*(?:saya|aku|kami)|kedai\s*(?:saya|aku|kami)|brand\s*(?:saya|aku|kami)|bisnis(?:nya|ku)?)\s*(?::|adalah|itu|namanya)?\s*([^\n.,!?]{2,60})/i,
      cutAtLocation: false,
    },
    // pola natural: "… namanya X" — eksplisit, menang atas pola generik
    { re: /\bnamanya\s+([^,.\n]{2,60})/i, cutAtLocation: true, recoverCase: true },
    // pola natural: "Warung X, jualan Y ..." — ambil teks sebelum koma
    {
      re: /^\s*([^,\n]{3,60}?)\s*,\s*(?:yang\s*)?(?:jualan|jual\b|menjual|produk(?:nya)?|jasa|layan(?:an)?|servis|service|paket|spesialis|barbershop|barber(?:shop)?|coffee\s*shop|kafe|cafe|salon|studio|catering|buka|alamat|nomor|open)/i,
      cutAtLocation: true,
      maxWords: 6,
    },
    // pola natural: "Warung X di Kota" — nama kapital sebelum "di <lokasi>"
    {
      re: /(?:^|,\s*|\.\s+|!\s+|\?\s+)([A-Z][^,\n]{2,60}?)\s+\bdi\b\s+([A-Z][^\n.,!?]{2,80})/,
      cutAtLocation: true,
      maxWords: 6,
    },
  ];
  for (const p of patterns) {
    const m = text.match(p.re);
    if (!m?.[1]) continue;
    const name = cleanBusinessName(m[1], p.cutAtLocation);
    const words = name.split(" ").filter(Boolean);
    // pola generik mudah salah tangkap: batasi panjang + tolak awalan stopword
    if (name.length < 2 || (p.maxWords !== undefined && words.length > p.maxWords)) continue;
    if (NOT_A_NAME_START.test(name)) continue;
    // "namanya soto pak slamet" (huruf kecil semua) → pulihkan kapitalisasi
    const final = p.recoverCase && name === name.toLowerCase() ? titleCaseName(name) : name;
    return final;
  }
  return undefined;
}

/**
 * Kata penyambung klausa baru — lokasi berhenti di situ, jangan menelan
 * kalimat berikutnya ("di Bandung namanya Soto Pak Slamet" → "Bandung").
 */
const LOCATION_STOP = new Set([
  "namanya", "nama", "buka", "tutup", "jualan", "jual", "menu", "harga", "nomor", "wa", "whatsapp",
  "yang", "dan", "atau", "tapi", "karena", "biar", "kira", "tiap", "setiap", "saya", "aku", "kami",
]);

export function extractLocation(text: string): string | undefined {
  // Coba setiap kandidat "di …" / "lokasi …" / "alamat …" — ambil yang pertama
  // menghasilkan token lokasi valid. Kapitalisasi menandai nama tempat; klausa
  // lanjutan (huruf kecil, tanpa tanda baca) menghentikan penangkapan.
  const re = /(?:\bdi\b|\blokasi(?:nya)?|\balamat(?:nya)?)\s+([^\n]{2,100})/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const out: string[] = [];
    let caps = 0;
    for (const tok of m[1]!.split(/\s+/)) {
      // singkirkan tanda baca ekor, kecuali titik singkatan "Jl." / "No."
      const abbrev = /^(?:jln|jl|gg|no)\.$/i.test(tok);
      const clean = abbrev ? tok : tok.replace(/[.,;:!?]+$/, "");
      if (!clean) break;
      if (LOCATION_STOP.has(clean.toLowerCase())) break;
      // "No" menghubungkan ke nomor alamat ("Jalan Melati No. 12") —
      // jangan dihitung token nama tempat, jangan menghentikan.
      if (/^no\.?$/i.test(clean)) {
        out.push(abbrev ? clean : clean + ".");
        continue;
      }
      if (/^\d/.test(clean)) {
        out.push(clean); // nomor alamat: "Jalan Merdeka 10"
        continue;
      }
      if (/^[A-Z]/.test(clean)) {
        out.push(clean);
        caps += 1;
        if (caps >= 3) break; // cukup 1-3 token nama tempat
        continue;
      }
      break; // kata kecil → klausa baru dimulai ("di Bandung dekat stasiun")
    }
    const loc = out.join(" ").trim();
    if (loc.length >= 3) return loc;
  }
  return undefined;
}

/** Nama yang jelas BUKAN produk (mulai dengan pengisi atau klausa jam/nomor). */
const NOT_A_PRODUCT =
  /^(?:buka|tutup|jam|nomor|wa\b|whatsapp|alamat|hubungi|kontak|kak|halo|oke|siap|yang|dan|atau|tiap|setiap|gratis|ongkir)\b/i;

/** Harga di ekor item: "15000", "15.000", "20rb", "25k". */
const TRAILING_PRICE = /^(.*?)[\s\-]+(\d{1,3}(?:[.,]\d{3})+|\d{4,8}|\d{1,3}\s*(?:rb|ribu|k))\.?\s*$/i;

function parseTrailingPrice(raw: string): number {
  const s = raw.replace(/\s+/g, "").toLowerCase();
  const n = Number(s.replace(/[.,]/g, "").replace(/(?:rb|ribu|k)$/, ""));
  return /(?:rb|ribu|k)$/.test(s) ? n * 1000 : n;
}

/**
 * Produk dari kalimat santai: "menu: a 15000, b 18000" / "jual X 20rb, Y 25k".
 * Setelah label "menu:"-semacamnya item tanpa harga pun diizinkan; pola "jual"
 * tanpa harga dianggap cerita biasa (bukan daftar menu) → kosong.
 */
export function extractProducts(text: string): Array<{ name: string; price?: number }> {
  const colon = text.match(/\b(?:menu|daftar\s*harga|pricelist|produk(?:nya)?)\s*:\s*([^\n]+)/i);
  const jual = colon ? undefined : text.match(/\b(?:jualan|menjual|jual)\b\s*:?\s*([^\n]+)/i);
  const segment = colon?.[1] ?? jual?.[1];
  if (!segment) return [];
  const allowNoPrice = Boolean(colon);
  const out: Array<{ name: string; price?: number }> = [];
  for (const raw of segment.split(/\s*(?:,|;|\bdan\b)\s*/i)) {
    const item = raw
      .replace(/^[\s\-–—•*·]+/, "") // bullet/hyphen leding
      .replace(/[.!?]+$/, "")
      .trim();
    if (!item) continue;
    let name = item;
    let price: number | undefined;
    const pm = item.match(TRAILING_PRICE);
    if (pm?.[1]?.trim()) {
      name = pm[1]!.trim();
      price = parseTrailingPrice(pm[2]!);
      if (price < 500 || price > 100_000_000) continue; // angka lain (jumlah, jam) — bukan harga
    } else if (!allowNoPrice) {
      continue;
    }
    name = name.replace(/\s+/g, " ");
    const words = name.split(" ").filter(Boolean);
    if (words.length < 1 || words.length > 5) continue;
    if (NOT_A_PRODUCT.test(name)) continue;
    out.push(price !== undefined ? { name, price } : { name });
  }
  return out;
}

/** Jam buka apa adanya: "buka tiap hari 7 pagi sampai 3 sore" → "tiap hari 7 pagi sampai 3 sore". */
export function extractHours(text: string): string | undefined {
  const m = text.match(
    /buka\s+(?:tiap\s+hari\s+|setiap\s+hari\s+|setiap\s+)?(.*?(?:pagi|siang|sore|malam|jam\s*\d{1,2}|\d{1,2}[.:]\d{2}).*?)(?=[.,;\n]|$)/i,
  );
  const hours = m?.[0]?.replace(/^buka\s+/i, "").replace(/\s+/g, " ").trim();
  // "buka pagi" → "pagi": terlalu tipis untuk ditampilkan — wajib ada angka ATAU >1 kata.
  if (!hours || (!/\d/.test(hours) && !hours.includes(" "))) return undefined;
  return hours;
}

/** Tandai progress slot — dipakai intake engine untuk tahu kapan generate. */
export function slotsProgress(slots: Slots): { filled: number; missing: string[]; complete: boolean } {
  const missing: string[] = [];
  if (!slots.businessName) missing.push("businessName");
  if (!slots.category) missing.push("category");
  if (!slots.whatsappNumber) missing.push("whatsappNumber");
  return { filled: 3 - missing.length, missing, complete: missing.length === 0 };
}

/** Gabungkan hasil ekstraksi pesan user ke slot yang sudah ada. */
export function mergeSlots(prev: Slots, userMessage: string): Slots {
  const next: Slots = { ...prev, products: [...prev.products] };
  const name = extractBusinessName(userMessage);
  if (name && !next.businessName) next.businessName = name.replace(/\s+/g, " ").trim();
  const cat = extractCategory(userMessage);
  if (cat && !next.category) next.category = cat;
  const wa = extractWaNumber(userMessage);
  if (wa && !next.whatsappNumber) next.whatsappNumber = wa;
  const loc = extractLocation(userMessage);
  if (loc && !next.location) next.location = loc;
  const hours = extractHours(userMessage);
  if (hours && !next.hours) next.hours = hours;
  // Daftar menu: gabung + dedupe berdasarkan nama ternormalisasi.
  for (const p of extractProducts(userMessage)) {
    const norm = p.name.trim().toLowerCase();
    if (next.products.some((q) => q.name.trim().toLowerCase() === norm)) continue;
    next.products.push(p);
  }
  return next;
}
