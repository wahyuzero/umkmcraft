/** Skeleton /situs-saya — stempel kartu situs yang belum menempel. */
export default function SitusSayaLoading() {
  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-cutline/70 bg-paper">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-paper-deep" />
            <div className="h-4 w-24 rounded-full bg-paper-deep" />
          </div>
          <div className="h-10 w-24 rounded-xl bg-paper-deep" />
        </div>
      </header>
      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="h-4 w-20 rounded-full bg-paper-deep" />
        <div className="mt-4 h-9 w-48 rounded-xl bg-paper-deep motion-safe:animate-pulse" />
        <div className="mt-3 h-4 w-72 max-w-full rounded-full bg-paper-deep" />
        <ul className="mt-8 flex flex-col gap-3" aria-label="Memuat daftar situs">
          {[0, 1].map((i) => (
            <li
              key={i}
              className="flex items-center justify-between gap-6 rounded-2xl border border-cutline/80 bg-card p-5 motion-safe:animate-pulse"
              style={{ animationDelay: `${i * 120}ms` }}
            >
              <div className="min-w-0 flex-1">
                <div className="h-5 w-40 rounded-full bg-paper-deep" />
                <div className="mt-2 h-3 w-56 max-w-full rounded-full bg-paper-deep/70" />
              </div>
              <div className="h-11 w-24 rounded-xl bg-paper-deep" />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
