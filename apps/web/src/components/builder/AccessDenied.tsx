import Link from "next/link";

/** Tampilan akses ditolak editor — render inline (redirect() di PPR tidak reliable). */
export function AccessDenied() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold text-ink">Akses ditolak</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Situs ini bukan milik sesi kamu, atau sesinya sudah kedaluwarsa. Mulai lagi dari
          percakapan — draf kamu tetap tersimpan kalau sesinya sama.
        </p>
        <Link
          href="/start"
          className="mt-6 inline-flex rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Kembali ke Mulai
        </Link>
      </div>
    </main>
  );
}
