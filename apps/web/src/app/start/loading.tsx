/**
 * Skeleton /start (builder world) — obrolan WhatsApp-style: header + langkah
 * slot, gelembung bot/user, dan composer di bawah. Motion-safe pulse saja.
 */
export default function StartLoading() {
  return (
    <main className="flex h-dvh flex-col bg-paper" aria-busy="true">
      {/* Header: logo + judul + langkah slot */}
      <header className="shrink-0 border-b border-cutline/70 bg-paper">
        <div className="mx-auto max-w-2xl px-5 pb-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="h-9 w-9 rounded-xl bg-ink/85 motion-safe:animate-pulse" />
              <span className="h-4 w-28 rounded-full bg-ink/10 motion-safe:animate-pulse" />
            </div>
            <span className="h-3.5 w-24 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
          </div>
          <div className="mt-4 space-y-2">
            <span className="block h-7 w-52 rounded-lg bg-ink/10 motion-safe:animate-pulse" />
            <span className="block h-3.5 w-80 max-w-full rounded-full bg-cutline/70 motion-safe:animate-pulse" />
          </div>
          {/* Langkah slot — tiga titik dengan garis jangkar */}
          <div className="mt-4 flex items-center gap-2" aria-hidden>
            {[0, 1, 2].map((i) => (
              <span key={i} className="flex flex-1 items-center gap-2">
                <span className="h-6 w-6 shrink-0 rounded-full bg-cutline/80 motion-safe:animate-pulse" />
                <span className="h-1.5 flex-1 rounded-full bg-cutline/50" />
              </span>
            ))}
          </div>
        </div>
      </header>

      {/* Obrolan */}
      <div className="min-h-0 flex-1 overflow-hidden">
        <div className="mx-auto flex max-w-2xl flex-col gap-3 px-5 pt-6">
          {/* Bot */}
          <div className="flex items-end gap-2">
            <span className="h-7 w-7 shrink-0 rounded-full bg-signal-soft ring-1 ring-signal/25" />
            <div className="w-3/4 space-y-2 rounded-2xl rounded-bl-md border border-cutline/60 bg-card px-4 py-3.5 shadow-plate">
              <span className="block h-3.5 w-11/12 rounded-full bg-ink/10 motion-safe:animate-pulse" />
              <span className="block h-3.5 w-2/3 rounded-full bg-ink/10 motion-safe:animate-pulse" />
            </div>
          </div>
          {/* User */}
          <div className="flex items-end justify-end">
            <div className="w-1/2 space-y-2 rounded-2xl rounded-br-md bg-signal-soft px-4 py-3.5">
              <span className="block h-3.5 w-10/12 rounded-full bg-signal/25 motion-safe:animate-pulse" />
              <span className="block h-3.5 w-1/2 rounded-full bg-signal/25 motion-safe:animate-pulse" />
            </div>
          </div>
          {/* Bot */}
          <div className="flex items-end gap-2">
            <span className="h-7 w-7 shrink-0 rounded-full bg-signal-soft ring-1 ring-signal/25" />
            <div className="w-2/3 space-y-2 rounded-2xl rounded-bl-md border border-cutline/60 bg-card px-4 py-3.5 shadow-plate">
              <span className="block h-3.5 w-9/12 rounded-full bg-ink/10 motion-safe:animate-pulse" />
              <span className="block h-3.5 w-1/2 rounded-full bg-ink/10 motion-safe:animate-pulse" />
            </div>
          </div>
          {/* Sedang mengetik — 3 dot berjeda (reuse uc-pulse-dot, reduce-safe) */}
          <div className="flex items-end gap-2">
            <span className="h-7 w-7 shrink-0 rounded-full bg-signal-soft ring-1 ring-signal/25" />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-cutline/60 bg-card px-4 py-3.5 shadow-plate">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="uc-pulse-dot h-2 w-2 rounded-full bg-ink-soft/45"
                  style={{ animationDelay: `${d * 0.18}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Composer */}
      <div className="shrink-0 border-t border-cutline/70 bg-paper">
        <div className="mx-auto max-w-2xl px-5 pb-4 pt-3">
          <div className="flex items-end gap-2.5">
            <span className="h-[52px] flex-1 rounded-2xl border border-cutline bg-card motion-safe:animate-pulse" />
            <span className="h-11 w-11 rounded-full bg-cutline/80 motion-safe:animate-pulse" />
          </div>
        </div>
      </div>
    </main>
  );
}
