"use client";

/**
 * /start — Conversational Intake (Fase 3, anon-first).
 * Chat WhatsApp-style: user curhat, engine ekstrak slot deterministik,
 * tombol besar "Buat Website Saya" muncul saat slot wajib lengkap.
 * Frame: kolom tunggal max-w-2xl di atas kertas bertekstur; header berisi
 * judul ramah + langkah slot berlabel (jangkar progres).
 */
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, RotateCcw, Send, Sparkles, WifiOff } from "lucide-react";
import { isValidWaNumber, normalizeWaNumber } from "@umkmcraft/utils";
import { ChatMessage, TypingBubble, type Msg } from "@/components/start/ChatMessage";
import { SlotSteps } from "@/components/start/SlotSteps";
import { SlotReceipt, type SlotKey, type ProductEntry } from "@/components/start/SlotReceipt";
import "./start.css";

interface Slots {
  businessName?: string;
  category?: string;
  whatsappNumber?: string;
  location?: string;
  products: Array<{ name: string; price?: number }>;
  promo?: string;
}

const GREETING =
  "Halo kakak! Aku asisten UMKM Craft. Cerita aja soal usahamu — nama usaha apa, jualan apa aja. Nanti aku buatkan website yang bisa langsung dipesan lewat WhatsApp.";

const SUGGESTIONS = [
  "Warung Sambal Ndeso, jualan sambal kemasan di Bandung",
  "Kedai Kopi Pagi hari, coffee shop di Jogja",
  "Barber Senja, barbershop di Bogor",
];

/**
 * Deteksi kasar di klien untuk JANGKAR PROGRES saja (tampilan) — meniru pola
 * deterministik engine (packages/ai/src/slots.ts) versi longgar. Nilai slot
 * tetap milik server; langkah yang sudah menyala tidak pernah mati lagi, jadi
 * request yang gagal tidak memundurkan progres di mata kakak.
 */
function guessSteps(text: string): [boolean, boolean, boolean] {
  const t = text.toLowerCase();
  const name =
    /nama\s*(?:usaha|toko|warung|kedai|bengkel|laundry|cafe|brand|bisnis)/i.test(text) ||
    /^[^,\n]{3,60},\s*(?:yang\s*)?(?:jualan|jual\b|menjual|produk|jasa|layan|servis|service|spesialis|barbershop|barber|coffee\s*shop|kafe|cafe|salon|studio|catering|buka)/i.test(text);
  const category = [
    "kuliner", "makanan", "minuman", "warung", "kedai", "kopi", "coffee", "kafe", "cafe",
    "boba", "barbershop", "barber", "salon", "fashion", "butik", "hijab", "baju",
    "skincare", "bengkel", "servis", "service", "laundry", "cuci", "jasa", "toko",
  ].some((k) => t.includes(k));
  const wa = /(?:\+?62|0)8\d{7,13}/.test(text.replace(/[-.\s()]/g, ""));
  return [name, category, wa];
}

/** Parse teks bebas "nama harga; nama harga" jadi daftar produk. */
function parseProducts(raw: string): ProductEntry[] {
  return raw
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const m = part.match(/^(.*?)[\s-]+(\d[\d.,]*)$/);
      const name = m?.[1]?.trim();
      if (!m || !name) return { name: part };
      return { name, price: Number(m[2]!.replace(/[.,]/g, "")) };
    });
}

export default function StartPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", content: GREETING }]);
  const [slots, setSlots] = useState<Slots>({ products: [] });
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastInput, setLastInput] = useState<string | null>(null);
  // Jangkar progres optimistik (lihat guessSteps): menyala sekali, tak pernah mati.
  const [optimisticSteps, setOptimisticSteps] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ top: el.scrollHeight, behavior: reduce ? "auto" : "smooth" });
  }, [messages, busy, ready]);

  // Pengguna yang kembali: kalau sesi ini punya situs, tawarkan daftarnya —
  // jangan biarkan ia membuat situs baru tanpa sadar.
  const [existingSites, setExistingSites] = useState(0);
  useEffect(() => {
    fetch("/api/sites")
      .then((r) => (r.ok ? r.json() : { sites: [] }))
      .then((d: { sites?: unknown[] }) => setExistingSites(d.sites?.length ?? 0))
      .catch(() => {});
  }, []);

  function autosize() {
    const el = inputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy || generating || ready) return;
    setError(null);
    setLastInput(trimmed);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    const history = [...messages, { role: "user" as const, content: trimmed }];
    setMessages(history);
    const guess = guessSteps(trimmed);
    setOptimisticSteps((prev) => [prev[0] || guess[0], prev[1] || guess[1], prev[2] || guess[2]]);
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
      setLastInput(null);
    } catch {
      // Rollback bubble user: pesannya memang belum terkirim, jadi "Kirim ulang"
      // mengirim TEPAT satu salinan — bukan menduplikasi bubble yang gagal.
      setMessages((m) => m.slice(0, -1));
      setError("Koneksi bermasalah — coba kirim ulang ya, kakak.");
    } finally {
      setBusy(false);
    }
  }

  /**
   * Edit slot dari receipt (P0: pintu keluar kalau ekstraksi salah).
   * Setelah edit tetap `ready` — cukup perbaiki lalu lanjut membuat situs.
   */
  function handleSlotEdit(key: SlotKey, value: string) {
    if (key === "products") {
      setSlots((s) => ({ ...s, products: parseProducts(value) }));
      return;
    }
    const trimmed = value.trim();
    if (!trimmed) return;
    if (key === "whatsappNumber") {
      // Konsisten dengan downstream: state menyimpan digit "62…" (normalizeWaNumber).
      const normalized = normalizeWaNumber(trimmed);
      if (!isValidWaNumber(normalized)) return; // tidak valid → biarkan nilai lama
      setSlots((s) => ({ ...s, whatsappNumber: normalized }));
      return;
    }
    setSlots((s) => ({ ...s, [key]: trimmed }));
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

  // Progres = slot terkonfirmasi server ATAU jangkar optimistik lokal —
  // kegagalan request tidak boleh memundurkan langkah yang sudah terlihat.
  const serverProgress = [
    Boolean(slots.businessName),
    Boolean(slots.category),
    Boolean(slots.whatsappNumber),
  ];
  const progress = serverProgress.map((filled, i) => filled || Boolean(optimisticSteps[i]));

  return (
    <main className="start-paper flex h-dvh flex-col bg-paper">
      {/* Header: logo + judul ramah + langkah slot berlabel */}
      <header className="shrink-0 border-b border-cutline/70 bg-paper">
        <div className="mx-auto max-w-2xl px-5 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
                U
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink">UMKM Craft</span>
            </Link>
            <span className="text-[11px] font-medium text-ink-soft">Gratis · tanpa daftar</span>
          </div>
          <div className="mt-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink sm:text-[1.75rem]">
              Ceritakan usahamu
            </h1>
            <p className="mt-1 text-sm text-ink-soft">
              Ngobrol santai kayak chat — nanti aku rangkai jadi website yang siap dipesan.
            </p>
          </div>
          {existingSites > 0 ? (
            <Link
              href="/situs-saya"
              className="mt-3 flex min-h-[44px] items-center justify-between gap-3 rounded-xl border-[1.5px] border-dashed border-cutline bg-card px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              <span>
                Kakak punya <b>{existingSites}</b> situs di perangkat ini
              </span>
              <span className="shrink-0 text-signal">Lihat daftarnya →</span>
            </Link>
          ) : null}
          <div className="mt-4">
            <SlotSteps progress={progress} />
          </div>
        </div>
      </header>

      {/* Chat — kolom menempel ke bawah biar obrolan pendek tidak menyisakan
          ruang kosong panjang di atas composer; obrolan panjang tetap scroll. */}
      <div ref={scrollRef} role="log" aria-live="polite" aria-label="Obrolan" className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-end gap-3 px-5 pb-6 pt-6">
          {messages.map((m, i) => (
            <ChatMessage key={i} message={m} />
          ))}

          {busy ? <TypingBubble /> : null}

          {error ? (
            <div role="alert" className="flex justify-center">
              <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-signal/50 bg-signal-soft px-5 py-3">
                <span className="flex items-center gap-2 text-center text-[13px] font-medium text-signal">
                  <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
                  {error}
                </span>
                {lastInput && !ready ? (
                  <button
                    type="button"
                    onClick={() => send(lastInput)}
                    className="flex min-h-[44px] items-center gap-2 rounded-full bg-signal px-5 py-2 text-sm font-semibold text-card transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    <RotateCcw className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                    Kirim ulang
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Composer + CTA */}
      <div className="shrink-0 border-t border-cutline/70 bg-paper">
        <div className="mx-auto max-w-2xl px-5 pb-4 pt-3">
          {/* Momen final: stiker ringkasan + CTA besar */}
          {ready && !generating ? (
            <div className="mb-3">
              <SlotReceipt
                businessName={slots.businessName}
                category={slots.category}
                whatsappNumber={slots.whatsappNumber}
                location={slots.location}
                products={slots.products}
                onEdit={handleSlotEdit}
              />
              <button
                onClick={generate}
                className="start-cta-in mt-3 flex min-h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-signal px-6 py-3.5 font-display text-base font-bold text-card transition-transform duration-200 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-live"
              >
                <Sparkles className="h-5 w-5" aria-hidden />
                Buat Website Saya
              </button>
              <p className="mt-2 text-center text-xs text-ink-soft">
                Gratis, tanpa daftar — situs jadi ±30 detik.
              </p>
            </div>
          ) : null}
          {generating ? (
            <div
              className="mb-3 flex items-center justify-center gap-2.5 rounded-2xl border border-cutline bg-card px-4 py-3.5 text-center text-sm font-medium text-ink-soft"
              role="status"
            >
              <LoaderCircle className="motion-safe:animate-spin h-4 w-4 text-signal" strokeWidth={2.2} aria-hidden />
              Merangkai websitemu — katalog, tema warna, tombol pesan…
            </div>
          ) : null}

          {/* Chips saran — cuma sebelum obrolan pertama */}
          {messages.length <= 1 ? (
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  disabled={busy || generating}
                  className="flex min-h-[44px] items-center rounded-full border border-ink/15 bg-card px-4 py-2 text-[13px] font-medium text-ink transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-signal/60 hover:shadow-plate active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:border-ink/15 disabled:hover:shadow-none"
                >
                  {s}
                </button>
              ))}
            </div>
          ) : null}

          {/* Composer: kartu dengan focus ring signal, textarea tumbuh, Enter kirim.
              Saat `ready`, composer dinonaktifkan — satu aksi jelas: tombol besar. */}
          <form
            autoComplete="off"
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-end gap-2.5"
          >
            <div
              className={`flex flex-1 items-end rounded-2xl border border-cutline bg-card px-4 py-3 transition-[border-color,box-shadow] duration-150 focus-within:border-signal focus-within:shadow-[0_0_0_3px_rgb(154_52_18/0.12)] ${
                ready ? "opacity-60" : ""
              }`}
            >
              <label htmlFor="chat-input" className="sr-only">
                Tulis cerita usahamu
              </label>
              <textarea
                id="chat-input"
                ref={inputRef}
                rows={1}
                value={input}
                disabled={ready}
                enterKeyHint="send"
                onChange={(e) => {
                  setInput(e.target.value);
                  autosize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send(input);
                  }
                }}
                placeholder={ready ? "Sudah lengkap — klik tombol besar di atas ya" : "Contoh: warung sambal, WA 0812…"}
                autoComplete="off"
                className="max-h-[120px] w-full resize-none bg-transparent text-[0.95rem] leading-6 text-ink outline-none placeholder:text-ink-soft/70 disabled:cursor-not-allowed"
              />
            </div>
            <button
              type="submit"
              disabled={busy || generating || ready || !input.trim()}
              aria-label="Kirim"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-signal text-card transition-transform duration-150 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-live disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <Send className="h-5 w-5" strokeWidth={2.4} aria-hidden />
            </button>
          </form>
          <p className="mt-2.5 text-center text-[0.7rem] text-ink-soft">
            Tanpa daftar. Data kakak hanya dipakai untuk membuat websitenya.
          </p>
        </div>
      </div>
    </main>
  );
}
