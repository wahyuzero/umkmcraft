import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";

/** Tampilan akses ditolak editor — render inline (redirect() di PPR tidak reliable). */
export function AccessDenied() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <span className="uc-cutline mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-card text-signal" aria-hidden>
          <LockKeyhole className="h-9 w-9" strokeWidth={1.8} />
        </span>
        <h1 className="mt-6 font-display text-2xl font-bold text-ink">Akses ditolak</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Waduh kak, sesi editor ini bukan milik kakak — atau sudah kedaluwarsa.
          Tenang, draf tetap tersimpan kalau kakak buka lagi dari sesi yang sama.
        </p>
        <Link
          href="/start"
          className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-white transition-transform duration-150 ease-out hover:-translate-y-0.5"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.4} aria-hidden />
          Kembali ke Mulai
        </Link>
      </div>
    </main>
  );
}
