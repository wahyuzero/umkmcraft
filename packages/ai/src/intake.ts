/**
 * Intake engine (ADR-3 Fase 1) — chat streaming + slot extraction deterministik.
 * Tanpa API key: engine socratic deterministik memandu wawancara tetap jalan.
 * Dengan key: streamText (AI SDK 6) + slot extraction server-side tetap deterministik.
 */
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { INTAKE_SYSTEM_PROMPT } from "./prompts";
import { mergeSlots, slotsProgress, emptySlots, type Slots } from "./slots";
import type { IntakeSlots } from "./template-engine";

function aiAvailable(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

/** Slot wajib yang DITANYA engine, dalam urutan wawancara. */
type AskableSlot = "businessName" | "category" | "whatsappNumber";
const ASK_ORDER: readonly AskableSlot[] = ["businessName", "category", "whatsappNumber"];

/** Target pertanyaan giliran ini: slot wajib pertama yang masih kosong. */
function nextAskTarget(slots: Slots): AskableSlot | undefined {
  return ASK_ORDER.find((key) => !slots[key]);
}

/** Label pendek slot untuk kalimat pengakuan ("Siip, jam buka dan lokasi tercatat."). */
const SLOT_LABELS: Record<string, string> = {
  businessName: "nama usaha",
  category: "jenis usaha",
  hours: "jam buka",
  location: "lokasi",
  whatsappNumber: "nomor WA",
  promo: "promo",
};

/** Slot yang BARU tertangkap dari pesan terakhir (diff prev vs next), urutan kalimat stabil. */
export function newlyCapturedKeys(prev: Slots, next: Slots): string[] {
  const captured: string[] = [];
  if (!prev.businessName && next.businessName) captured.push("businessName");
  if (!prev.category && next.category) captured.push("category");
  if (next.products.length > prev.products.length) captured.push("products");
  if (!prev.hours && next.hours) captured.push("hours");
  if (!prev.location && next.location) captured.push("location");
  if (!prev.whatsappNumber && next.whatsappNumber) captured.push("whatsappNumber");
  if (!prev.promo && next.promo) captured.push("promo");
  return captured;
}

/**
 * Kalimat pengakuan slot yang baru tertangkap — kosong jika tidak ada yang baru.
 * Produk dengan harga dibaca dua label ("menu dan harga") biar pengakuan terasa spesifik.
 */
function acknowledgmentFor(capturedKeys: string[], slots: Slots): string {
  if (capturedKeys.length === 0) return "";
  const labels: string[] = [];
  for (const key of capturedKeys) {
    if (key === "products") {
      labels.push("menu");
      if (slots.products.some((p) => p.price !== undefined)) labels.push("harga");
      continue;
    }
    labels.push(SLOT_LABELS[key] ?? key);
  }
  const list =
    labels.length === 1 ? labels[0]! : `${labels.slice(0, -1).join(", ")} dan ${labels[labels.length - 1]!}`;
  return `Siip, ${list} tercatat.`;
}

/**
 * Balasan AI sudah mengakui fakta yang baru tertangkap? Dua tanda diakui:
 * menyebut "tercatat/dicatat" (varian "kecatat" ikut tersaring) ATAU dibuka
 * sapaan setuju khas intake (siip/siap/oke/noted/mantap/baik). Pemeriksaan
 * case-insensitive — AI bisa menulis "Tercatat!" dengan kapital.
 */
function replyAcknowledgesNewInfo(reply: string): boolean {
  const lower = reply.trim().toLowerCase();
  return /tercatat|dicatat|kecatat/.test(lower) || /^(siip|siap|oke|noted|mantap|baik)\b/.test(lower);
}

/**
 * Varian pertanyaan per slot wajib — index 0 adalah copy pertanyaan PERTAMA
 * (dipertahankan). Saat slot di-ask ulang, varian berikutnya diputar supaya
 * balasan yang persis sama dua kali (efek echo copy-paste) tidak terjadi.
 */
const QUESTION_VARIANTS: Record<AskableSlot, Array<(slots: Slots) => string>> = {
  businessName: [
    () =>
      `Siap, kakak! Cerita dulu dong: **nama usahanya apa** dan jualan apa aja? Contoh: "Warung Sambal Ndeso, jualan sambal kemasan."`,
    () =>
      `Coba ceritakan lagi ya, kakak: **nama usahanya apa**? Sekalian jualan apa aja — misalnya "Warung Sambal Ndeso, jualan sambal kemasan."`,
  ],
  category: [
    (s) =>
      `Keren, ${s.businessName}! Itu masuk kategori apa, kakak? (kuliner, coffee shop, barbershop, fashion, bengkel/jasa, laundry, atau lainnya)`,
    (s) =>
      `Satu pertanyaan lagi, kakak: ${s.businessName} itu masuk kategori apa? (kuliner, coffee shop, barbershop, fashion, bengkel/jasa, laundry, atau lainnya)`,
  ],
  whatsappNumber: [
    () =>
      `Oke dicatat! Sekarang yang paling penting: **nomor WhatsApp** untuk menerima pesanan pembeli, kakak? (contoh: 0812-3456-7890)`,
    () =>
      `Sekarang yang paling penting: **nomor WhatsApp** kakak untuk terima pesanan, kak. Contoh: 0812-3456-7890.`,
    () =>
      `Tinggal satu, kakak: **nomor WhatsApp** kakak — tulis di sini, contoh 0812-3456-7890.`,
  ],
};

/** Pilih varian berdasarkan berapa kali slot ini sudah pernah ditanya (0 = pertama). */
function questionFor(slot: AskableSlot, askCount: number, slots: Slots): string {
  const variants = QUESTION_VARIANTS[slot];
  const index = askCount === 0 ? 0 : 1 + ((askCount - 1) % (variants.length - 1));
  return variants[index]!(slots);
}

/**
 * Susun balasan deterministik: saat meng-ask ULANG slot yang sudah pernah
 * ditanya, akui dulu slot baru yang barusan tertangkap, lalu tanya dengan
 * varian kalimat berbeda — user yang barusan memberi info tidak menerima
 * echo kalimat yang sama persis. Pertanyaan pertama memakai copy lama.
 */
export function composeIntakeReply(
  slots: Slots,
  askedCounts: Readonly<Record<string, number>> = {},
  prevSlots?: Slots,
): string {
  const target = nextAskTarget(slots);
  if (!target) {
    // Semua slot wajib terisi — composer terkunci saat ready, jadi jangan menjanjikan
    // "tulis di sini": arahkan langsung ke tombol besar.
    return "Mantap, kakak! Data lengkap! Tombol **Buat Website Saya** di bawah sudah siap — klik aja, situsnya langsung kami rangkai.";
  }
  const askCount = askedCounts[target] ?? 0;
  const acknowledgment =
    askCount > 0 && prevSlots ? acknowledgmentFor(newlyCapturedKeys(prevSlots, slots), slots) : "";
  const question = questionFor(target, askCount, slots);
  return acknowledgment ? `${acknowledgment} ${question}` : question;
}

/** Prompt socratic deterministik — dipakai saat AI tidak tersedia. */
export function deterministicIntakeReply(slots: Slots): string {
  return composeIntakeReply(slots);
}

/**
 * Slot yang sudah pernah DITANYA engine + berapa kali — direkonstruksi dari
 * riwayat dengan memutar ulang ekstraksi deterministik atas tiap pesan user
 * KECUALI yang terakhir (balasan giliran itu justru sedang disusun sekarang).
 * Nilai slot tetap dihitung server-side; riwayat cuma dipakai memilih varian.
 */
export function replayAskedCounts(history: Array<{ role: "user" | "assistant"; content: string }>): Record<string, number> {
  const counts: Record<string, number> = {};
  let replayed = emptySlots();
  const userMessages = history.filter((m) => m.role === "user");
  for (let i = 0; i < userMessages.length - 1; i++) {
    replayed = mergeSlots(replayed, userMessages[i]!.content);
    const target = nextAskTarget(replayed);
    if (target) counts[target] = (counts[target] ?? 0) + 1;
  }
  return counts;
}

export interface IntakeTurnResult {
  reply: string;
  slots: Slots;
  nextAction: "ask" | "ready";
}

/** Satu giliran intake: update slot dari pesan user, hasilkan balasan. */
export async function intakeTurn(history: Array<{ role: "user" | "assistant"; content: string }>, prevSlots: Slots): Promise<IntakeTurnResult> {
  const lastUser = [...history].reverse().find((m) => m.role === "user");
  const slots = lastUser ? mergeSlots(prevSlots, lastUser.content) : prevSlots;

  if (aiAvailable()) {
    try {
      const conversation = history
        .map((m) => `${m.role === "user" ? "Pemilik" : "Asisten"}: ${m.content}`)
        .join("\n");
      const { textStream } = await streamText({
        model: google(process.env.AI_MODEL_PRIMARY || "gemini-2.5-flash-lite"),
        system: `${INTAKE_SYSTEM_PROMPT}\n\nSlot yang sudah terkumpul (jangan tanya ulang): ${JSON.stringify(slots, null, 0)}`,
        prompt: conversation,
        maxOutputTokens: 300,
        abortSignal: AbortSignal.timeout(15_000),
      });
      let reply = "";
      for await (const delta of textStream) reply += delta;
      // Hardening deterministik: AI yang lupa mengakui fakta barusan tetap
      // mendapat awalan pengakuan yang sama dengan jalur deterministik —
      // user yang barusan memberi info jangan bertanya "dengerin gak sih?".
      const captured = newlyCapturedKeys(prevSlots, slots);
      if (captured.length > 0 && !replyAcknowledgesNewInfo(reply)) {
        reply = `${acknowledgmentFor(captured, slots)} ${reply}`;
      }
      const { complete } = slotsProgress(slots);
      return { reply, slots, nextAction: complete ? "ready" : "ask" };
    } catch {
      // AI gagal → jatuh ke deterministic engine tanpa mematahkan UX
    }
  }

  // Re-ask butuh tahu slot mana yang sudah pernah ditanya — direkonstruksi dari riwayat.
  const askedCounts = replayAskedCounts(history);
  const reply = composeIntakeReply(slots, askedCounts, prevSlots);
  const { complete } = slotsProgress(slots);
  return { reply, slots, nextAction: complete ? "ready" : "ask" };
}

/** Susun ringkasan percakapan untuk prompt generation. */
export function summarizeSlots(slots: Slots): { conversationSummary: string; intakeSlots: IntakeSlots } {
  const parts: string[] = [];
  if (slots.businessName) parts.push(`Nama usaha: ${slots.businessName}`);
  if (slots.category) parts.push(`Kategori: ${slots.category}`);
  if (slots.location) parts.push(`Lokasi: ${slots.location}`);
  if (slots.whatsappNumber) parts.push(`Nomor WhatsApp: ${slots.whatsappNumber}`);
  if (slots.products?.length) {
    parts.push(`Produk: ${slots.products.map((p) => `${p.name}${p.price ? ` (Rp${p.price})` : ""}`).join(", ")}`);
  }
  if (slots.promo) parts.push(`Promo: ${slots.promo}`);
  if (slots.hours) parts.push(`Jam buka: ${slots.hours}`);
  return { conversationSummary: parts.join("\n"), intakeSlots: slots as IntakeSlots };
}
