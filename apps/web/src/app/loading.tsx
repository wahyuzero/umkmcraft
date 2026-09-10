/**
 * Skeleton landing (builder world) — siluet hero: baris teks + tombol + stamp
 * di kiri, kemasan HP di kanan. Pulse hanya untuk pengguna motion-safe.
 */
export default function LandingLoading() {
  return (
    <main className="min-h-dvh bg-paper" aria-busy="true">
      {/* Nav */}
      <header className="border-b border-cutline/70">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <span className="h-9 w-9 rounded-xl bg-ink/85 motion-safe:animate-pulse" />
            <span className="h-4 w-28 rounded-full bg-ink/10 motion-safe:animate-pulse" />
          </div>
          <span className="h-10 w-40 rounded-xl bg-ink/10 motion-safe:animate-pulse" />
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <span className="mb-6 block h-[5px] w-24 rounded-full bg-cutline motion-safe:animate-pulse" />
          <div className="space-y-3.5">
            <span className="block h-11 w-11/12 rounded-xl bg-ink/10 motion-safe:animate-pulse" />
            <span className="block h-11 w-4/5 rounded-xl bg-ink/10 motion-safe:animate-pulse" />
            <span className="block h-11 w-3/5 rounded-xl bg-ink/10 motion-safe:animate-pulse" />
          </div>
          <div className="mt-6 space-y-2.5">
            <span className="block h-4 w-full max-w-xl rounded-full bg-ink/[0.07] motion-safe:animate-pulse" />
            <span className="block h-4 w-3/4 max-w-md rounded-full bg-ink/[0.07] motion-safe:animate-pulse" />
          </div>
          <div className="mt-8 flex items-center gap-3">
            <span className="h-14 w-52 rounded-2xl bg-ink/10 motion-safe:animate-pulse" />
            <span className="h-7 w-28 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
          </div>
          {/* Strip stamp — tiga kartu die-cut miring */}
          <div className="mt-10 grid max-w-md grid-cols-3 gap-3 sm:gap-4">
            {["-rotate-1", "rotate-[0.5deg]", "-rotate-[0.5deg]"].map((tilt) => (
              <div
                key={tilt}
                className={`uc-cutline rounded-xl bg-card px-2 py-4 shadow-plate ${tilt}`}
              >
                <span className="mx-auto block h-8 w-10 rounded-lg bg-ink/10 motion-safe:animate-pulse" />
                <span className="mx-auto mt-2 block h-3 w-12 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Mock HP — kemasan dengan cincin die-cut di belakang */}
        <div className="relative mx-auto w-full max-w-[340px]">
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-cutline"
          />
          <div
            aria-hidden
            className="absolute left-1/2 top-1/2 -z-10 h-[530px] w-[530px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-cutline/50"
          />
          <div className="rotate-1 rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
            <div className="space-y-3 rounded-[2.1rem] bg-card p-4">
              <span className="block h-36 rounded-2xl bg-paper-deep motion-safe:animate-pulse" />
              <span className="block h-5 w-2/3 rounded-full bg-ink/10 motion-safe:animate-pulse" />
              <span className="block h-3.5 w-1/2 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <span className="h-20 rounded-xl bg-paper-deep motion-safe:animate-pulse" />
                <span className="h-20 rounded-xl bg-paper-deep motion-safe:animate-pulse" />
              </div>
              <span className="block h-12 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
