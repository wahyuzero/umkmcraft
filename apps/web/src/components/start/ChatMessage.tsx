"use client";

/**
 * Bubble chat /start — AI: kartu + avatar bot; user: signal amber, rata kanan.
 * Parsing **bold** mini deterministik (reply engine memakai konvensi itu).
 * Saat streaming, teks bisa berhenti di tengah pasangan ** — parser menutup
 * dangling ** secara anggun saat render (tanpa state tambahan).
 */
import { Bot } from "lucide-react";

export interface Msg {
  role: "user" | "assistant";
  content: string;
  /** Sisa balasan yang terputus mid-stream — diganti utuh saat "Kirim ulang". */
  partial?: boolean;
}

/** Avatar bot — lucide Bot dalam lingkaran wash signal (bukan emoji). */
function BotAvatar() {
  return (
    <span
      aria-hidden
      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-signal-soft text-signal ring-1 ring-signal/25"
    >
      <Bot className="h-4 w-4" strokeWidth={2.2} />
    </span>
  );
}

function RichText({ content }: { content: string }) {
  return (
    <>
      {content.split("\n").map((line, i) => {
        const parts = line.split("**");
        // Jumlah ** ganjil = dibuka tapi belum ditutup (stream parsial):
        // segmen terakhir dirender sebagai teks biasa, bukan bold-ngawur.
        const dangling = parts.length % 2 === 0;
        return (
          <p key={i} className={i > 0 ? "mt-2" : ""}>
            {parts.map((part, j) =>
              j % 2 === 1 && !(dangling && j === parts.length - 1) ? (
                <strong key={j} className="font-bold">
                  {part}
                </strong>
              ) : (
                <span key={j}>{part}</span>
              ),
            )}
          </p>
        );
      })}
    </>
  );
}

export function ChatMessage({
  message,
  streaming = false,
}: {
  message: Msg;
  /** true saat teks masih mengalir — aria-busy menahan pengumuman screen reader. */
  streaming?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <div className={`uc-stick-in flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser ? <BotAvatar /> : null}
      <div
        aria-busy={streaming ? true : undefined}
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[0.95rem] leading-relaxed shadow-plate ${
          isUser
            ? "rounded-br-md bg-signal text-card" /* text-card di atas #9a3412 = kontras ±7:1, lolos AA */
            : "rounded-bl-md border border-cutline/60 bg-card text-ink"
        }`}
      >
        <RichText content={message.content} />
      </div>
    </div>
  );
}

/** Indikator mengetik — 3 dot berjeda di dalam bubble AI (motion-safe). */
export function TypingBubble() {
  return (
    <div className="uc-stick-in flex items-end gap-2" aria-label="Asisten mengetik">
      <BotAvatar />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-cutline/60 bg-card px-4 py-3.5 shadow-plate">
        {[0, 1, 2].map((d) => (
          <span
            key={d}
            className="uc-pulse-dot h-2 w-2 rounded-full bg-ink-soft/45"
            style={{ animationDelay: `${d * 0.18}s` }}
          />
        ))}
      </div>
    </div>
  );
}
