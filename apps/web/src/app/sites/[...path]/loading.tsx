/**
 * Skeleton situs tenant (route /sites) — saat snapshot dimuat, tampilkan
 * siluet kemasan HP di tengah lembar kerja (render terjadi di luar wrapper
 * .uc-site, jadi memakai palet builder paper/cutline).
 */
export default function SitesLoading() {
  return (
    <main
      className="flex min-h-dvh items-center justify-center bg-paper px-5"
      aria-busy="true"
    >
      <div className="w-full max-w-[400px]">
        <div className="uc-cutline rounded-[2rem] bg-card p-3 shadow-plate">
          <div className="space-y-3 rounded-[1.6rem] border border-cutline/50 p-4">
            {/* Hero band */}
            <span className="block h-36 rounded-2xl bg-paper-deep motion-safe:animate-pulse" />
            {/* Nama + kategori */}
            <div className="space-y-2 pt-1">
              <span className="block h-5 w-2/3 rounded-full bg-ink/10 motion-safe:animate-pulse" />
              <span className="block h-3 w-1/3 rounded-full bg-cutline/80 motion-safe:animate-pulse" />
            </div>
            {/* Baris produk */}
            {[0, 1].map((i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-cutline/60 p-2.5">
                <span className="h-14 w-14 shrink-0 rounded-lg bg-paper-deep motion-safe:animate-pulse" />
                <span className="flex-1 space-y-1.5">
                  <span className="block h-3 w-9/12 rounded-full bg-ink/10 motion-safe:animate-pulse" />
                  <span className="block h-3 w-5/12 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
                </span>
                <span className="h-8 w-8 shrink-0 rounded-full bg-signal-soft motion-safe:animate-pulse" />
              </div>
            ))}
            {/* CTA WhatsApp */}
            <span className="block h-12 rounded-full bg-signal-soft motion-safe:animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-center text-xs text-ink-soft">Memuat situs kakak…</p>
        <span className="sr-only">Memuat halaman</span>
      </div>
    </main>
  );
}
