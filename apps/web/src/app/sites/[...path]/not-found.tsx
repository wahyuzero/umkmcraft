import Link from "next/link";

export default function SitesNotFound() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="max-w-md text-center">
        <p className="font-display text-7xl font-extrabold tabular-nums text-cutline">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-ink">Situs tidak ditemukan</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Alamat yang kamu buka belum terdaftar di UMKM Craft — atau situsnya belum diterbitkan.
        </p>
        <Link
          href="/start"
          className="mt-6 inline-flex rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
        >
          Buat websitemu sendiri — gratis
        </Link>
      </div>
    </main>
  );
}
