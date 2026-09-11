import Link from "next/link";

/**
 * 404 host tenant — dirender di LUAR wrapper .uc-site (di luar tema tenant),
 * jadi dirancang self-sufficient: palet builder paper/ink/cutline dengan
 * aksen die-cut, bukan warna tema tenant.
 * Dipakai dua arah: route not-found.tsx DAN render inline dari page.tsx
 * (notFound() + route loading skeleton tidak komposibel di Next 16 —
 * kerangka loading bisa tetap tampil selamanya di beberapa environment).
 * homeHref: beranda tenant (bukan landing builder) — di-resolve penelepon:
 * path-based → /sites/<slug>, host-based → "/". Fallback "/" hanya bila
 * penelepon tidak punya konteks tenant (not-found.tsx).
 */
export function TenantNotFound({ homeHref = "/" }: { homeHref?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center overflow-hidden bg-paper px-6">
      <div className="relative z-0 w-full max-w-md">
        {/* Cincin die-cut di belakang kartu — satu keluarga dengan hero landing */}
        <div
          aria-hidden
          className="absolute left-1/2 top-1/2 -z-10 h-[560px] w-[560px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-cutline"
        />
        <div className="uc-cutline rounded-3xl bg-card px-8 py-10 text-center shadow-plate">
          <p className="uc-ruler mx-auto mb-6 h-[5px] w-16" aria-hidden />
          <p className="font-display text-8xl font-extrabold leading-none tracking-[-0.04em] text-ink tabular-nums">
            404
          </p>
          <h1 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
            Halaman nggak ketemu
          </h1>
          <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-ink-soft">
            Halaman yang kakak cari tidak ditemukan atau sudah dipindah.
          </p>
          <Link
            href={homeHref}
            className="mt-7 inline-flex min-h-[44px] items-center rounded-xl bg-signal px-5 py-2.5 text-sm font-bold text-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Kembali ke Halaman Utama
          </Link>
          <p className="mt-4 text-xs text-ink-soft">
            Keliru alamat? Coba periksa lagi tautannya, kak.
          </p>
        </div>
      </div>
    </main>
  );
}
