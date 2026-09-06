"use client";

/**
 * AnalyticsCard — statistik ringkas tenant di editor (SYSTEM_DESIGN §8):
 * pageview harian, klik WhatsApp, produk paling populer.
 */
import { useEffect, useState } from "react";
import { useEditor } from "@/lib/editor-store";

interface Stats {
  pageviews: number;
  waClicks: number;
  topProducts: Array<{ productId: string; clicks: number }>;
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

  if (!published) return null;

  return (
    <div className="mx-4 mb-4 rounded-2xl border border-cutline bg-card p-3.5">
      <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.06em] text-ink-soft">Statistik 30 Hari</h3>
      {stats ? (
        <>
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-paper px-3 py-2">
              <p className="font-display text-xl font-extrabold tabular-nums text-ink">{stats.pageviews}</p>
              <p className="text-[0.65rem] font-medium text-ink-soft">kunjungan</p>
            </div>
            <div className="rounded-xl bg-paper px-3 py-2">
              <p className="font-display text-xl font-extrabold tabular-nums text-live">{stats.waClicks}</p>
              <p className="text-[0.65rem] font-medium text-ink-soft">klik WhatsApp</p>
            </div>
          </div>
          {stats.topProducts.length > 0 ? (
            <ul className="mt-2.5 space-y-1">
              {stats.topProducts.slice(0, 3).map((p) => (
                <li key={p.productId} className="flex items-center justify-between text-[0.7rem] text-ink-soft">
                  <span className="truncate">{p.productId}</span>
                  <span className="font-bold tabular-nums text-ink">{p.clicks}×</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-[0.65rem] leading-relaxed text-ink-soft/70">
              Belum ada klik — bagikan link situsmu ke Status WA 📲
            </p>
          )}
        </>
      ) : (
        <p className="mt-2 text-[0.65rem] text-ink-soft/70">Memuat…</p>
      )}
    </div>
  );
}
