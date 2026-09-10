"use client";

/**
 * AnalyticsCard — statistik ringkas tenant di editor (SYSTEM_DESIGN §8):
 * pageview harian, klik WhatsApp, produk paling populer.
 * Belum live → teaser; live → ubin angka stamp + baris produk teratas.
 */
import { useEffect, useState } from "react";
import { useEditor } from "@/lib/editor-store";
import { BarChart3, Eye, MessageCircle, TrendingUp, type LucideIcon } from "lucide-react";

interface Stats {
  pageviews: number;
  waClicks: number;
  topProducts: Array<{ productId: string; clicks: number }>;
}

function Tile({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-paper px-3 py-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-xl font-extrabold tabular-nums text-ink">{value}</p>
        <span aria-hidden className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-signal-soft/70 text-signal">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-0.5 text-[0.65rem] font-medium text-ink-soft">{label}</p>
    </div>
  );
}

export function AnalyticsCard() {
  const published = useEditor((s) => s.published);
  const siteId = useEditor((s) => s.siteId);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    if (!published || !siteId) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}/analytics`);
        if (!res.ok) return;
        const data = (await res.json()) as Stats;
        if (alive) setStats(data);
      } catch {
        /* analitik tidak pernah mematahkan editor */
      }
    };
    void load();
    const t = setInterval(load, 30_000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, [published, siteId]);

  if (!published) {
    return (
      <div className="mx-4 mb-4 rounded-2xl border border-cutline bg-card p-3.5 shadow-plate">
        <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-soft">Statistik</h3>
        <div className="mt-2.5 flex items-center gap-3">
          <span aria-hidden className="uc-cutline grid h-11 w-11 shrink-0 place-items-center rounded-full text-signal">
            <BarChart3 className="h-5 w-5" />
          </span>
          <p className="text-xs leading-relaxed text-ink-soft">
            Terbitkan situs untuk mulai memantau kunjungan kakak.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-cutline bg-card p-3.5 shadow-plate">
      <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-soft">Statistik 30 Hari</h3>
      {stats ? (
        <>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <Tile icon={Eye} value={stats.pageviews} label="kunjungan" />
            <Tile icon={MessageCircle} value={stats.waClicks} label="klik WhatsApp" />
          </div>
          {stats.topProducts.length > 0 ? (
            <div className="mt-3">
              <p className="flex items-center gap-1.5 text-[0.65rem] font-bold uppercase tracking-wide text-ink-soft/70">
                <TrendingUp aria-hidden className="h-3.5 w-3.5" />
                Produk Teratas
              </p>
              <ul className="mt-1.5 space-y-1">
                {stats.topProducts.slice(0, 3).map((p, i) => (
                  <li key={p.productId} className="flex items-center gap-2 text-[0.7rem] text-ink-soft">
                    <span
                      aria-hidden
                      className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-signal-soft font-display text-[0.65rem] font-bold text-signal"
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{p.productId}</span>
                    <span className="font-bold tabular-nums text-ink">{p.clicks}×</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="mt-2.5 text-[0.65rem] leading-relaxed text-ink-soft/70">
              Belum ada klik — bagikan link situs kakak ke Status WA.
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-[0.65rem] text-ink-soft/70">Memuat…</p>
      )}
    </div>
  );
}
