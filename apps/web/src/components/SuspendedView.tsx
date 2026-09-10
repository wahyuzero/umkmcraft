import Link from "next/link";
import { ShieldAlert } from "lucide-react";

/**
 * Papan situs tenant yang ditangguhkan — dipakai halaman /suspended dan
 * renderer (di luar wrapper .uc-site), jadi memakai palet builder.
 * Nada: serius tapi baik — moderasi berjalan, pemilik punya jalur klarifikasi.
 */
export function SuspendedView() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-paper px-6">
      <div className="uc-cutline w-full max-w-md rounded-3xl bg-card px-8 py-10 text-center shadow-plate">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-signal-soft ring-1 ring-signal/25">
          <ShieldAlert className="h-7 w-7 text-signal" strokeWidth={2.2} aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink">Situs Ditangguhkan</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-soft">
          Website ini sedang ditinjau tim moderasi kami mengikuti laporan penyalahgunaan.
          Bila kakak pemilik usaha, hubungi kami untuk klarifikasi — peninjauan selesai
          dalam 24 jam dan situs aktif kembali begitu dinyatakan aman.
        </p>
        <div className="mt-7 flex flex-col items-center gap-3">
          <Link
            href="/"
            className="inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors duration-200 hover:bg-ink/85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Ke UMKM Craft
          </Link>
          <a
            href="mailto:halo@umkmcraft.id?subject=Klarifikasi%20situs%20ditangguhkan"
            className="text-xs font-medium text-ink-soft underline decoration-dotted underline-offset-4 transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Laporkan atau klarifikasi lewat email
          </a>
        </div>
      </div>
    </main>
  );
}
