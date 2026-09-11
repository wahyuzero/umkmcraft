/**
 * Template Engine deterministik — graceful degradation (SYSTEM_DESIGN §7.2 tahap 3):
 * bila AI gagal/absen, config tetap dihasilkan dari slot + template kategori.
 * Juga dipakai untuk demo & test. Output SELALU lolos UmkmWebsiteConfigSchema.
 * Semua input user di-clamp (Oracle #12c) supaya parse pasca-generate tak pernah gagal.
 *
 * Copy default berasal dari copy-voice.ts (satu sumber suara per kategori):
 * tagline ≤ 8 kata, produk-spesifik, gaya pedagang — bukan bahasa brosur.
 * Jalur route tetap menambahkan lintCopy() sebagai jaring pengaman terakhir.
 */
import {
  guessPresetForCategory,
  type SectionProps,
  type UmkmWebsiteConfig,
} from "@umkmcraft/schema";
import { slugify } from "@umkmcraft/utils";
import { voiceForCategory, truncateAtWordBoundary } from "./copy-voice";

export interface IntakeSlots {
  businessName: string;
  category: string;
  location?: string;
  whatsappNumber: string;
  products?: Array<{ name: string; price?: number; description?: string }>;
  promo?: string;
  hours?: string;
  story?: string;
}

/* ---------------------------------------------------------------- */
/* hoursToOpenHours — jam alami → open_hours terstruktur             */
/* ---------------------------------------------------------------- */

type OpenHoursRange = SectionProps<"operating_hours_map">["open_hours"][number];

/* Indeks = Date.getDay(): 0 = Minggu (kontrak HourRangeSchema + OpenNowBadge). */
const DAY_TOKENS: Record<string, number> = {
  minggu: 0,
  ahad: 0,
  sunday: 0,
  senin: 1,
  monday: 1,
  selasa: 2,
  tuesday: 2,
  rabu: 3,
  wednesday: 3,
  kamis: 4,
  thursday: 4,
  jumat: 5,
  "jum'at": 5,
  friday: 5,
  sabtu: 6,
  saturday: 6,
};

const DAY_RE =
  /\b(?:minggu|ahad|sunday|senin|monday|selasa|tuesday|rabu|wednesday|kamis|thursday|jum'?at|friday|sabtu|saturday)\b/g;

/* Celah antar dua nama hari yang berarti RENTANG (bukan sekadar berdampingan
 * seperti "sabtu minggu"). Gap harus KECILAGAN berisi pemisah — sisanya list. */
const DAY_GAP_RE = /^\s*(?:sampai|hingga|s[\s./]*d\.?|[-\u2013\u2014])\s*$/;

/* Token jam, urutan alternasi = prioritas (spesifik → umum) supaya "07.00"
 * tak terbaca ulang sebagai angka "07" dan "7 pagi" tak terbelah. */
const TIME_RE =
  /tengah\s?malam|midnight|tengah\s?hari|(\d{1,2})\s?[.:]\s?(\d{2})(?!\d)|(\d{1,2})\s?(pagi|siang|sore|malam)|\b(\d{1,2})(?![\d.,:])/g;

function clockText(totalMinutes: number): string {
  const m = ((totalMinutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => Number.parseInt(v, 10));
  return (h ?? 0) * 60 + (m ?? 0);
}

/** Satu token waktu → menit sejak tengah malam; null = tak valid (skip). */
function timeTokenToMinutes(match: RegExpExecArray): number | null {
  if (/tengah\s?malam|midnight/.test(match[0])) return 0;
  if (/tengah\s?hari/.test(match[0])) return 12 * 60;
  if (match[1] !== undefined) {
    const h = Number(match[1]);
    const min = Number(match[2]);
    if (h > 23 || min > 59) return null;
    return h * 60 + min;
  }
  if (match[3] !== undefined) {
    let h = Number(match[3]);
    const qualifier = match[4];
    // "3 sore" = 15.00; "12 malam"/"12 pagi" = tengah malam; "12 siang" = siang.
    if (qualifier === "siang" || qualifier === "sore" || qualifier === "malam") {
      if (h === 12) return qualifier === "malam" ? 0 : h * 60;
      if (h < 12) h += 12;
    } else if (qualifier === "pagi" && h === 12) {
      return 0;
    }
    if (h > 23) return null;
    return h * 60;
  }
  if (match[5] !== undefined) {
    const h = Number(match[5]);
    if (h > 23) return null;
    return h * 60;
  }
  return null;
}

/** Semua token waktu dalam urutan kemunculan; token tak valid dilewati. */
function extractTimeTokens(text: string): number[] {
  const out: number[] = [];
  TIME_RE.lastIndex = 0;
  for (let m = TIME_RE.exec(text); m !== null; m = TIME_RE.exec(text)) {
    const minutes = timeTokenToMinutes(m);
    if (minutes !== null) out.push(minutes);
  }
  return out;
}

/** Semua nama hari yang disebut teks, berurutan + posisinya (token tanpa indeks map dibuang). */
function dayMatches(text: string): Array<{ day: number; start: number; end: number }> {
  const out: Array<{ day: number; start: number; end: number }> = [];
  for (const m of text.matchAll(DAY_RE)) {
    const day = DAY_TOKENS[m[0]];
    if (day === undefined || m.index === undefined) continue;
    out.push({ day, start: m.index, end: m.index + m[0].length });
  }
  return out;
}

function pushDayRange(out: number[], from: number, to: number): void {
  if (from === to) {
    out.push(from);
    return;
  }
  if (to > from) {
    for (let d = from; d <= to; d++) out.push(d);
    return;
  }
  // Wrap lintas minggu: "sabtu sampai senin" → 6, 0, 1.
  for (let d = from; d <= 6; d++) out.push(d);
  for (let d = 0; d <= to; d++) out.push(d);
}

/** Hari buka dari teks; tanpa petunjuk hari apa pun → semua hari (umum di UMKM). */
function parseDays(text: string): number[] {
  const all = [0, 1, 2, 3, 4, 5, 6];
  let days: number[];
  if (/\b(?:tiap|setiap)\s+hari\b|\bevery\s?day\b/.test(text)) {
    days = all;
  } else if (/hari\s+kerja|weekdays?/.test(text)) {
    days = [1, 2, 3, 4, 5];
  } else {
    const found = dayMatches(text);
    if (found.length === 0) {
      days = all;
    } else {
      days = [];
      // pending = nama hari yang menunggu diputuskan (sendiri atau ujung rentang).
      let pending: { day: number; end: number; emitted: boolean } | null = null;
      for (const cur of found) {
        if (pending !== null && !pending.emitted) days.push(pending.day);
        if (pending !== null && DAY_GAP_RE.test(text.slice(pending.end, cur.start))) {
          pushDayRange(days, pending.day, cur.day);
          pending = { day: cur.day, end: cur.end, emitted: true }; // sudah tercakup rentang
        } else {
          pending = { day: cur.day, end: cur.end, emitted: false };
        }
      }
      if (pending !== null && !pending.emitted) days.push(pending.day);
    }
  }
  // "tiap hari kecuali minggu" → hari yang disebut SETELAH "kecuali" dibuang.
  const exceptAt = text.indexOf("kecuali");
  if (exceptAt >= 0) {
    const excluded = new Set(dayMatches(text.slice(exceptAt)).map((m) => m.day));
    days = days.filter((d) => !excluded.has(d));
  }
  return days;
}

/**
 * Parse jam buka alami dari intake chat ("buka tiap hari 7 pagi sampai 3 sore")
 * menjadi open_hours terstruktur untuk island OpenNowBadge (status Buka/Tutup).
 * Best-effort dan TIDAK PERNAH mengarang: teks tanpa satu pun jam terurai →
 * [] (badge memang tidak tampil, schedule teks tetap menampilkan apa adanya).
 * Pasangan waktu berurutan = satu rentang ("7-11, 13-17" → dua rentang);
 * waktu tunggal → tutup = buka + 8 jam (close wajib di HourRangeSchema).
 */
export function hoursToOpenHours(hoursText?: string): OpenHoursRange[] {
  const text = (hoursText ?? "").toLowerCase();
  if (!text.trim()) return [];
  const times = extractTimeTokens(text);
  if (times.length === 0) return [];

  const ranges: Array<[number, number]> = [];
  for (let i = 0; i < times.length; i += 2) {
    const open = times[i];
    if (open === undefined) continue;
    const next = times[i + 1];
    const close = next !== undefined ? next : (open + 480) % 1440;
    ranges.push([open, close]);
  }

  const seen = new Set<string>();
  const out: OpenHoursRange[] = [];
  for (const day of parseDays(text)) {
    for (const [open, close] of ranges) {
      const entry: OpenHoursRange = {
        day_of_week: day,
        open: clockText(open),
        close: clockText(close),
      };
      const key = `${entry.day_of_week} ${entry.open} ${entry.close}`;
      if (seen.has(key)) continue;
      seen.add(key);
      out.push(entry);
    }
  }
  out.sort((a, b) => a.day_of_week - b.day_of_week || toMinutes(a.open) - toMinutes(b.open));
  return out.slice(0, 21); // batas skema: open_hours.max(21)
}

export function generateTemplateConfig(slots: IntakeSlots): UmkmWebsiteConfig {
  const category = (slots.category || "lainnya").slice(0, 40);
  const preset = guessPresetForCategory(category);
  const voice = voiceForCategory(category);
  const baseSlug = slugify(slots.businessName) || "usaha-baru";
  const name = slots.businessName.slice(0, 80);
  const story = truncateAtWordBoundary((slots.story || "").slice(0, 400), 220);
  const location = (slots.location || "").slice(0, 200);
  const products = (slots.products?.length ? slots.products : voice.products)
    .slice(0, 5)
    .map((p) => ({
      name: p.name.slice(0, 80),
      price: Math.max(0, Math.min(Number(p.price) || 0, 1_000_000_000)),
      description: truncateAtWordBoundary((p.description || "").slice(0, 600), 300),
    }));

  const sections: UmkmWebsiteConfig["sections"] = [
    {
      id: "sec-hero-1",
      type: "hero_storefront",
      props: {
        badge: slots.promo ? "Promo Spesial" : "",
        title: name,
        subtitle: story || voice.subtitle,
        image_url: "",
        image_position: "right",
        cta_primary: {
          label: "Pesan via WhatsApp",
          action: "whatsapp_direct",
          prefill_message: `Halo ${name}! 👋 Saya dapat nomor dari website, mau tanya-tanya kak.`,
          url: "",
        },
        badges: voice.badges,
      },
    },
    {
      id: "sec-catalog-1",
      type: "product_catalog_wa",
      props: {
        section_title: voice.catalogTitle,
        section_subtitle: voice.catalogSubtitle,
        categories: ["Semua"],
        products: products.map((p, i) => ({
          id: `prod-${i + 1}`,
          name: p.name,
          price: p.price,
          category: "Umum",
          description: p.description,
          image_url: "",
          is_bestseller: i === 0,
        })),
      },
    },
    {
      id: "sec-valueprops-1",
      type: "value_props_grid",
      props: {
        section_title: "Kenapa Pilih Kami?",
        section_subtitle: "",
        items: voice.valueProps,
      },
    },
    {
      id: "sec-hours-1",
      type: "operating_hours_map",
      props: {
        section_title: "Lokasi & Jam Buka",
        address: location || "Alamat akan diperbarui oleh pemilik usaha",
        gmaps_url: "",
        waze_url: "",
        schedule: [{ day: "Setiap Hari", hours: (slots.hours || "09:00 - 17:00 WIB").slice(0, 60) }],
        // Badge Buka/Tutup butuh open_hours terstruktur — diurai dari teks jam
        // alami; tanpa jam terurai tetap [] (tanpa badge, tanpa mengarang).
        open_hours: hoursToOpenHours(slots.hours),
        delivery_note: "",
      },
    },
    {
      id: "sec-faq-1",
      type: "faq_accordion",
      props: {
        section_title: "Pertanyaan yang Sering Diajukan",
        items: voice.faqs,
      },
    },
    {
      id: "sec-contact-1",
      type: "contact_direct",
      props: {
        section_title: "Hubungi Kami",
        address: location,
        phone: "",
        whatsapp_number: slots.whatsappNumber,
        whatsapp_label: "Chat Admin",
        email: "",
        gmaps_url: "",
        prefill_message: `Halo ${name}! 👋`,
      },
    },
    {
      id: "sec-ctabanner-1",
      type: "cta_banner_full",
      props: {
        title: voice.ctaTitle,
        subtitle: voice.ctaSubtitle,
        button_label: "Chat WhatsApp Sekarang",
        prefill_message: `Halo ${name}! 👋 Saya mau order kak.`,
        secondary_label: "",
        secondary_url: "",
      },
    },
  ];

  return {
    meta: {
      site_id: baseSlug,
      business_name: name,
      business_category: category,
      tagline: truncateAtWordBoundary(story, 140) || voice.tagline,
      schema_version: 1,
      theme: {
        preset: preset.id,
        primary_color: preset.primary,
        secondary_color: preset.secondary,
        background_color: preset.background,
        font_heading: preset.font_heading,
        font_body: preset.font_body,
      },
      whatsapp_number: slots.whatsappNumber,
      seo: {
        title: `${name} — ${category.charAt(0).toUpperCase() + category.slice(1)}`.slice(0, 80),
        description: story ? truncateAtWordBoundary(story, 200) : voice.seoDescription(name),
        keywords: [name.toLowerCase().slice(0, 40), category].slice(0, 12),
      },
    },
    sections,
  };
}
