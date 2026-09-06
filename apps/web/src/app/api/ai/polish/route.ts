import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import { store } from "@/lib/server/store";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


/**
 * AI Copywriting Magic Button (ROADMAP Fase 3) — poles deskripsi produk
 * jadi kalimat jualan. Tanpa key: kembalikan teks asli + saran template.
 */
export async function POST(req: NextRequest) {
  const sessionToken = req.cookies.get("uc_session")?.value ?? "";
  const body = (await req.json().catch(() => ({}))) as {
    siteId?: string;
    text?: string;
    context?: string;
  };
  const text = (body.text ?? "").slice(0, 600);
  const context = (body.context ?? "").slice(0, 200);
  if (!text) return NextResponse.json({ error: "Teks kosong" }, { status: 400 });

  const rl = rateLimit(`polish:${clientIp(req)}:${sessionToken}`, 50, 24 * 60 * 60 * 1000);
  if (!rl.ok) return NextResponse.json({ error: "Kuota polish habis hari ini" }, { status: 429 });

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    // Fallback deterministik: bungkus dengan struktur jualan sederhana
    const polished = `${text.trim().replace(/\.$/, "")} — kualitas terbaik, harga bersahabat! Cocok buat stok harian & hampers. Chat kakak sekarang, stok terbatas ya! 😊`;
    return NextResponse.json({ text: polished.slice(0, 600), engine: "template" });
  }

  if (body.siteId && !(await store.ownsSite(sessionToken, body.siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }

  try {
    const { text: result } = await generateText({
      model: google(process.env.AI_MODEL_PRIMARY || "gemini-2.5-flash-lite"),
      system:
        "Kamu copywriter UMKM Indonesia. Polos deskripsi produk jadi 1-2 kalimat jualan yang menggugah selera, bahasa santai pakai 'kak', tanpa mengarang klaim palsu (halal/BPOM hanya bila disebut user), tanpa emoji berlebihan (maks 1).",
      prompt: `Konteks usaha: ${context}\nDeskripsi saat ini: ${text}`,
      maxOutputTokens: 200,
      abortSignal: AbortSignal.timeout(12_000),
    });
    return NextResponse.json({ text: result.slice(0, 600), engine: "ai" });
  } catch {
    return NextResponse.json({ error: "AI sedang sibuk, coba lagi sebentar" }, { status: 503 });
  }
}
