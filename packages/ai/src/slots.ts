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
  // "25rb", "25k", "25.000", "25000"
  const re = /(\d{1,3}(?:[.,]\d{3})+|\d{1,3})\s*(rb|ribu|k)?(?=\s|$|,)/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    let n = Number(m[1]!.replace(/\./g, "").replace(/,/g, ""));
    if (m[2]) n *= 1000;
    if (n >= 500 && n <= 100_000_000) out.push({ price: n });
  }
  return out;
}

export function extractBusinessName(text: string): string | undefined {
  const patterns = [
    // pola eksplisit: "nama usahaku X", "toko saya: X"
    /(?:nama\s*(?:usaha|toko|warung|kedai|bengkel|laundry|cafe|brand|bisnis)(?:nya|ku|aku|saya)?|usaha\s*(?:saya|aku|kami|gue)|toko\s*(?:saya|aku|kami)|warung\s*(?:saya|aku|kami)|kedai\s*(?:saya|aku|kami)|brand\s*(?:saya|aku|kami)|bisnis(?:nya|ku)?)\s*(?::|adalah|itu|namanya)?\s*([^\n.,!?]{2,60})/i,
    // pola natural: "Warung X, jualan Y ..." — ambil teks sebelum koma
    /^\s*([^,\n]{3,60}?)\s*,\s*(?:yang\s*)?(?:jualan|jual\b|menjual|produk(?:nya)?|jasa|layan(?:an)?|servis|service|paket|spesialis|buka|alamat|nomor|open)/i,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/^(ya|adalah|itu|namanya|namaname)\s+/i, "");
      if (name.length >= 2) return name.replace(/\s+/g, " ").trim();
    }
  }
  return undefined;
}

export function extractLocation(text: string): string | undefined {
  const m = text.match(/(?:di|lokasi(?:nya)?|alamat(?:nya)?|ada di)\s+((?:jln|jl\.?|jalan|gang|gg\.?)?\s*[A-Z][^\n.,!?,;]{2,80})/);
  return m?.[1]?.trim() || undefined;
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
  return next;
}
