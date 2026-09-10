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

/** Prompt socratic deterministik — dipakai saat AI tidak tersedia. */
export function deterministicIntakeReply(slots: Slots): string {
  const { missing } = slotsProgress(slots);
  if (missing.length === 0) {
    return "Mantap kak, data lengkap! 😊 Tombol **Buat Website Saya** di bawah sudah siap — klik aja, situsnya langsung kami rangkai.";
  }
  if (!slots.businessName) {
    return "Siap kak! 😄 Cerita dulu dong: **nama usahanya apa** dan jualan apa aja? Contoh: \"Warung Sambal Ndeso, jualan sambal kemasan.\"";
  }
  if (!slots.category) {
    return "Keren, " + slots.businessName + "! 😊 Itu masuk kategori apa kak? (kuliner, coffee shop, barbershop, fashion, bengkel/jasa, laundry, atau lainnya)";
  }
  if (!slots.whatsappNumber) {
    return "Oke dicatat! 📝 Sekarang yang paling penting: **nomor WhatsApp** untuk menerima pesanan pembeli kak? (contoh: 0812-3456-7890)";
  }
  // Semua slot wajib terisi — tanya opsional ringan lalu selesai.
  return "Sip, semua data utama lengkap! 🙌 Kalau ada **produk unggulan + harga kira-kira** atau **promo yang lagi jalan**, tulis saja di sini — biar websitenya makin menjual. Kalau mau langsung jadi, klik tombol **Buat Website Saya** ya kak!";
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
      const { complete } = slotsProgress(slots);
      return { reply, slots, nextAction: complete ? "ready" : "ask" };
    } catch {
      // AI gagal → jatuh ke deterministic engine tanpa mematahkan UX
    }
  }

  const reply = deterministicIntakeReply(slots);
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
