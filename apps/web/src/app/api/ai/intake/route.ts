import { NextRequest, NextResponse } from "next/server";
import { intakeTurn, emptySlots, type Slots } from "@umkmcraft/ai";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


interface IntakeBody {
  history: Array<{ role: "user" | "assistant"; content: string }>;
  slots?: Slots;
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
  return NextResponse.json(result);
}
