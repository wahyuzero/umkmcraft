"use client";

/**
 * Error boundary global (builder world) — error runtime di route app.
 * Nada: tenang dan berpihak pada pengguna ("bukan salah kakak"),
 * tombol Coba Lagi memicu re-render route via reset().
 */
import Link from "next/link";
import { CloudOff, RotateCcw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="uc-cutline w-full max-w-md rounded-3xl bg-card px-8 py-10 text-center shadow-plate">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-signal-soft ring-1 ring-signal/25">
          <CloudOff className="h-7 w-7 text-signal" strokeWidth={2.2} aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">
          Waduh, ada yang error
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Ada yang nggak beres di sisi kami — bukan salah kakak, dan datamu tetap aman.
          Coba lagi dulu; kalau masih error, tunggu sebentar lalu buka ulang ya, kak.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            <RotateCcw className="h-4 w-4" strokeWidth={2.4} aria-hidden />
            Coba Lagi
          </button>
          <Link
            href="/"
            className="text-xs font-medium text-ink-soft underline decoration-dotted underline-offset-4 transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            atau kembali ke halaman utama
          </Link>
        </div>
        {error.digest ? (
          <p className="mt-5 text-[0.68rem] text-ink-soft/70">Kode error: {error.digest}</p>
        ) : null}
      </div>
    </main>
  );
}
