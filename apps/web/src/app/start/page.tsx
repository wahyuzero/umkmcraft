"use client";

/**
 * /start — Conversational Intake (Fase 3, anon-first).
 * Chat WhatsApp-style: user curhat, engine ekstrak slot deterministik,
 * tombol besar "Buat Website Saya" muncul saat slot wajib lengkap.
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

interface Slots {
  businessName?: string;
  category?: string;
  whatsappNumber?: string;
  location?: string;
  products: Array<{ name: string; price?: number }>;
  promo?: string;
}

const GREETING =
  "Halo kak! 👋 Aku asisten UMKM Craft. Cerita aja soal usahamu — nama usaha apa, jualan apa aja. Nanti aku buatkan website yang bisa langsung dipesan lewat WhatsApp.";

const SUGGESTIONS = [
  "Warung Sambal Ndeso, jualan sambal kemasan di Bandung",
  "Kedai Kopi Pagi hari, coffee shop di Jogja",
  "Barber Senja, barbershop di Bogor",
];

export default function StartPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [slots, setSlots] = useState<Slots>({ products: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    setInput("");
    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    setBusy(true);
    try {
      const res = await fetch("/api/ai/intake", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ history: history.slice(1), slots }),
      });
      if (!res.ok) throw new Error("Server sibuk");
      const data = (await res.json()) as { reply: string; slots: Slots; nextAction: string };
      setSlots(data.slots);
      setReady(data.nextAction === "ready");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Koneksi bermasalah — coba kirim ulang ya.");
    } finally {
      setBusy(false);
    }
  }

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slots }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Gagal membuat website");
      }
      const data = (await res.json()) as { siteId: string };
      router.push(`/editor/${data.siteId}`);
    } catch (e) {
      setError((e as Error).message);
      setGenerating(false);
    }
  }

  const progress = [Boolean(slots.businessName), Boolean(slots.category), Boolean(slots.whatsappNumber)];

  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      {/* Header */}
      <header className="border-b border-cutline/70 bg-paper/90 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">U</span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">UMKM Craft</span>
          </Link>
          {/* Progress slot — depth-as-state, bukan border tambahan */}
          <div className="flex items-center gap-1.5" aria-label="Kelengkapan data usaha">
            {["Nama", "Kategori", "WhatsApp"].map((label, i) => (
              <span
                key={label}
                title={label}
                className={`flex h-2.5 w-2.5 rounded-full transition-colors duration-300 ${progress[i] ? "bg-live" : "bg-cutline"}`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Chat */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-5 py-8 pb-40">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`uc-stick-in max-w-[85%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-plate ${
                  m.role === "user"
                    ? "rounded-br-md bg-signal text-white"
                    : "rounded-bl-md border border-cutline/60 bg-card text-ink"
                }`}
              >
                {m.content.split("\n").map((line, j) => (
                  <p key={j} className={j > 0 ? "mt-2" : ""}>
                    {line.split("**").map((part, k) =>
                      k % 2 === 1 ? (
                        <strong key={k} className="font-bold">{part}</strong>
                      ) : (
                        <span key={k}>{part}</span>
                      ),
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {busy ? (
            <div className="flex justify-start">
              <div className="flex gap-1.5 rounded-2xl rounded-bl-md border border-cutline/60 bg-card px-4 py-3.5" aria-label="Asisten mengetik">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="motion-safe:uc-pulse-dot h-2 w-2 rounded-full bg-cutline" style={{ animationDelay: `${d * 0.18}s` }} />
                ))}
              </div>
            </div>
          ) : null}

          {error ? (
            <p role="alert" className="rounded-xl bg-signal-soft px-4 py-3 text-center text-sm font-medium text-signal">
              {error}
            </p>
          ) : null}
        </div>
      </div>

      {/* Composer + CTA */}
      <div className="sticky bottom-0 border-t border-cutline/70 bg-paper/95 backdrop-blur-sm">
        <div className="mx-auto max-w-2xl px-5 py-4">
          {ready && !generating ? (
            <button
              onClick={generate}
              className="uc-live-glow mb-3 flex w-full items-center justify-center gap-2.5 rounded-2xl bg-signal px-6 py-4 text-base font-bold text-white shadow-[0_6px_22px_rgb(154_52_18/0.45)] outline-live hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgb(154_52_18/0.5)]"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M13.5 3 17 6.5 8 15.5l-4.5 1 1-4.5L13.5 3Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Buat Website Saya
            </button>
          ) : null}
          {generating ? (
            <div className="mb-3 flex items-center justify-center gap-2.5 rounded-2xl border border-cutline bg-card px-4 py-3.5 text-center text-sm font-medium text-ink-soft" role="status">
              <svg viewBox="0 0 20 20" className="motion-safe:animate-spin h-4 w-4 text-signal" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="M10 3a7 7 0 1 1-6.6 4.6" strokeLinecap="round" />
              </svg>
              Merangkai websitemu — katalog, tema warna, tombol pesan…
            </div>
          ) : null}

          {messages.length <= 1 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-cutline bg-card px-3.5 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-signal hover:text-signal"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2.5"
          >
            <label htmlFor="chat-input" className="sr-only">
              Tulis cerita usahamu
            </label>
            <input
              id="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Contoh: warung sambal kemasan, nomor WA 0812…"
              autoComplete="off"
              className="h-12 flex-1 rounded-2xl border border-cutline bg-card px-4 text-[0.95rem] text-ink placeholder:text-ink-soft/70 focus:border-signal focus:outline-none focus-visible:outline-3 focus-visible:outline-signal"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-label="Kirim"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-signal text-white transition-transform duration-150 hover:-translate-y-0.5 disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M3 10h13m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          <p className="mt-2.5 text-center text-[0.7rem] text-ink-soft">
            Tanpa daftar. Data kamu hanya dipakai untuk membuat websitemu.
          </p>
        </div>
      </div>
    </main>
  );
}
