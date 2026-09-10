/**
 * Skeleton editor (builder world) — rak tiga kolom seperti BuilderShell:
 * lembar stiker (kiri) | kemasan HP (tengah) | inspector label (kanan).
 * Motion-safe pulse saja.
 */
export default function EditorLoading() {
  return (
    <div className="flex h-dvh flex-col bg-paper" aria-busy="true">
      {/* Bar atas: nama usaha + tombol Publish */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-cutline/80 bg-paper px-4">
        <div className="flex items-center gap-2.5">
          <span className="h-8 w-8 rounded-lg bg-ink/85 motion-safe:animate-pulse" />
          <span className="h-4 w-8 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
          <span className="h-5 w-44 rounded-lg bg-ink/10 motion-safe:animate-pulse" />
        </div>
        <span className="h-9 w-28 rounded-xl bg-signal-soft motion-safe:animate-pulse" />
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Kiri: lembar stiker section */}
        <aside className="flex shrink-0 flex-col gap-2.5 overflow-hidden border-b border-cutline/80 p-3 lg:w-[300px] lg:border-b-0 lg:border-r">
          {["w-10/12", "w-9/12", "w-11/12", "w-8/12", "w-10/12", "w-9/12"].map((w, i) => (
            <div
              key={i}
              className="uc-cutline flex items-center gap-3 rounded-xl bg-card p-3 shadow-plate"
            >
              <span className="h-9 w-9 shrink-0 rounded-lg bg-signal-soft motion-safe:animate-pulse" />
              <span className={`h-3.5 rounded-full bg-ink/10 ${w} motion-safe:animate-pulse`} />
            </div>
          ))}
        </aside>

        {/* Tengah: kemasan HP dengan penguasa kalibrasi */}
        <div className="flex min-h-0 flex-1 items-start justify-center overflow-hidden bg-paper p-6">
          <div className="w-full max-w-[340px]">
            <div className="uc-ruler mb-3 h-[5px] w-full" aria-hidden />
            <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
              <div className="space-y-3 rounded-[2.1rem] bg-card p-4">
                <span className="block h-32 rounded-2xl bg-paper-deep motion-safe:animate-pulse" />
                <span className="block h-5 w-2/3 rounded-full bg-ink/10 motion-safe:animate-pulse" />
                <span className="block h-3.5 w-1/2 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-cutline/60 p-2.5">
                    <span className="h-12 w-12 shrink-0 rounded-lg bg-paper-deep motion-safe:animate-pulse" />
                    <span className="flex-1 space-y-1.5">
                      <span className="block h-3 w-9/12 rounded-full bg-ink/10 motion-safe:animate-pulse" />
                      <span className="block h-3 w-5/12 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
                    </span>
                  </div>
                ))}
                <span className="block h-11 rounded-full bg-cutline/70 motion-safe:animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        {/* Kanan: inspector label (form) */}
        <aside className="flex shrink-0 flex-col gap-4 overflow-hidden border-t border-cutline/80 p-4 lg:w-[340px] lg:border-l lg:border-t-0">
          <span className="h-4 w-24 rounded-full bg-ink/10 motion-safe:animate-pulse" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-1.5">
              <span className="block h-3 w-20 rounded-full bg-cutline/80 motion-safe:animate-pulse" />
              <span className="block h-10 w-full rounded-xl border border-cutline bg-card motion-safe:animate-pulse" />
            </div>
          ))}
          <div className="space-y-1.5">
            <span className="block h-3 w-24 rounded-full bg-cutline/80 motion-safe:animate-pulse" />
            <span className="block h-20 w-full rounded-xl border border-cutline bg-card motion-safe:animate-pulse" />
          </div>
          <span className="h-10 w-full rounded-xl bg-ink/10 motion-safe:animate-pulse" />
        </aside>
      </div>
    </div>
  );
}
