import Link from "next/link";

/** Tampilan situs tenant yang ditangguhkan — dipakai halaman /suspended dan renderer. */
export function SuspendedView() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="max-w-md rounded-3xl border border-cutline bg-card p-8 text-center shadow-plate">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-signal-soft">
          <svg viewBox="0 0 24 24" className="h-7 w-7 text-signal" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-bold text-ink">Situs Ditangguhkan</h1>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">
          Website ini sedang ditinjau karena laporan dari pengguna. Bila Anda pemilik usaha,
          hubungi tim kami untuk klarifikasi — review dilakukan dalam 24 jam.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-ink/85"
        >
          Ke UMKM Craft
        </Link>
      </div>
    </main>
  );
}
