import { NextRequest, NextResponse } from "next/server";
import { intakeTurn, emptySlots, type Slots, type IntakeTurnResult } from "@umkmcraft/ai";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


interface IntakeBody {
  history: Array<{ role: "user" | "assistant"; content: string }>;
  slots?: Slots;
}

/** Klien minta stream? (header Accept ndjson ATAU ?stream=1) */
function wantsStream(req: NextRequest): boolean {
  if (req.nextUrl.searchParams.get("stream") === "1") return true;
  return (req.headers.get("accept") ?? "").includes("application/x-ndjson");
}

/**
 * Potong balasan jadi kelompok 3-5 kata — meniru laju token LLM supaya UX
 * streaming konsisten dengan atau tanpa API key (balasan deterministik pun
 * "mengalir", bukan muncul sekaligus). Token `\S+\s*` menyimpan spasi asli,
 * jadi gabungan chunk = teks persis asli (termasuk newline).
 */
function chunkReply(text: string): string[] {
  const words = text.match(/\S+\s*/g) ?? (text ? [text] : []);
  const chunks: string[] = [];
  let i = 0;
  while (i < words.length) {
    const take = 3 + Math.floor(Math.random() * 3); // 3-5 kata
    chunks.push(words.slice(i, i + take).join(""));
    i += take;
  }
  return chunks;
}

/** Balas NDJSON: tiap baris satu event — {"t":"text","v":delta} lalu {"t":"done",…}. */
function streamResponse(result: IntakeTurnResult, signal: AbortSignal): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const push = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        for (const chunk of chunkReply(result.reply)) {
          if (signal.aborted) break;
          push({ t: "text", v: chunk });
          await new Promise((r) => setTimeout(r, 30 + Math.random() * 30)); // 30-60ms per delta
        }
        push({ t: "done", slots: result.slots, ready: result.nextAction === "ready" });
        controller.close();
      } catch {
        // Klien putus koneksi di tengah stream — biarkan saja.
        try {
          controller.close();
        } catch {
          /* sudah tertutup */
        }
      }
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`intake:${clientIp(req)}`, 30, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Terlalu banyak pesan. Coba lagi nanti ya kak." },
      { status: 429 },
    );
  }

  let body: IntakeBody;
  try {
    body = (await req.json()) as IntakeBody;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const history = (body.history ?? [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.length < 4000)
    .slice(-20);

  const prevSlots = body.slots ? { ...emptySlots(), ...body.slots } : emptySlots();
  const result = await intakeTurn(history, prevSlots);

  // Stream untuk klien baru (halaman /start); JSON utuh untuk pemanggil lama.
  if (wantsStream(req)) return streamResponse(result, req.signal);
  return NextResponse.json(result);
}
