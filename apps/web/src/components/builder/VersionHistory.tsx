"use client";

/**
 * VersionHistory — riwayat draf (ADR-2: immutable versions) di panel Susun.
 * Daftar versi terbaru (maks 8) dengan aksi "Pulihkan": memulihkan = membuat
 * DRAFT BARU dari config versi lama, non-destruktif — draf sekarang tetap
 * tercatat di riwayat.
 */
import { useEffect, useState } from "react";
import { History, LoaderCircle, RotateCcw } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

interface VersionRow {
  id: string;
  versionNumber: number;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  changeSource: string;
  createdAt: string;
}

const TIME_FMT = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** Batas tampilan: panel Susun ringkas, sisanya masih aman di penyimpanan. */
const MAX_ROWS = 8;

const STATUS_LABEL: Record<VersionRow["status"], string> = {
  DRAFT: "Draf",
  PUBLISHED: "Terbit",
  ARCHIVED: "Arsip",
};

function formatTime(ts: string): string {
  return TIME_FMT.format(new Date(ts));
}

export function VersionHistory() {
  const siteId = useEditor((s) => s.siteId);
  const [versions, setVersions] = useState<VersionRow[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  // Naikkan untuk muat ulang daftar (tombol "Coba lagi" / selesai pulihkan).
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    if (!siteId) return;
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(`/api/sites/${siteId}`);
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { versions: VersionRow[] };
        // Terbaru dulu — histori dibaca dari atas ke bawah.
        const rows = [...data.versions].sort((a, b) => b.versionNumber - a.versionNumber).slice(0, MAX_ROWS);
        if (alive) {
          setVersions(rows);
          setLoadError(false);
        }
      } catch {
        if (alive) setLoadError(true);
      }
    };
    void load();
    return () => {
      alive = false;
    };
  }, [siteId, refreshTick]);

  /** Pulihkan: flush autosave → POST (draf baru dari versi lama) → hydrate ulang. */
  const restore = async (versionId: string) => {
    setRestoringId(versionId);
    setRestoreError(null);
    try {
      await useEditor.getState().flushSave();
      const res = await fetch(`/api/sites/${siteId}/versions/${versionId}`, { method: "POST" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { versionNumber: number; config: UmkmWebsiteConfig };
      // Hydrate persis seperti BuilderShell — config pulihan adalah kebenaran baru.
      useEditor.setState({
        config: data.config,
        selectedId: data.config.sections[0]?.id ?? null,
      });
      // markSaved: "saved" + saveVersion + lastSavedAt — satu pintu dengan autosave.
      useEditor.getState().markSaved(data.versionNumber);
      setRefreshTick((t) => t + 1); // daftar dimuat ulang: versi pulihan jadi "Sekarang"
    } catch {
      setRestoreError(versionId);
    } finally {
      setRestoringId(null);
    }
  };

  const busy = restoringId !== null;

  return (
    <div className="mx-4 mb-4 shrink-0 rounded-2xl border border-cutline/80 bg-card p-3.5 shadow-plate">
      <h3 className="flex items-center gap-1.5 font-display text-sm font-bold text-ink">
        <History className="h-4 w-4 text-ink-soft" strokeWidth={2.2} aria-hidden />
        Riwayat draf
      </h3>

      {versions === null ? (
        loadError ? (
          <div className="mt-2">
            <p className="text-xs text-signal">Riwayat gagal dimuat, kak.</p>
            <button
              onClick={() => setRefreshTick((t) => t + 1)}
              className="mt-1 inline-flex min-h-[44px] items-center rounded-xl border border-cutline bg-paper px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Coba lagi
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-ink-soft">Memuat riwayat…</p>
        )
      ) : versions.length === 0 ? (
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          Belum ada riwayat, kak — tiap simpanan otomatis akan tercatat di sini.
        </p>
      ) : (
        <ul className="mt-1.5 divide-y divide-cutline/60">
          {versions.map((v, i) => {
            const newest = i === 0;
            const restoring = restoringId === v.id;
            return (
              <li key={v.id} className="flex items-center gap-3 py-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-ink">Versi {v.versionNumber}</p>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${
                        v.status === "PUBLISHED"
                          ? "bg-live text-card"
                          : newest
                            ? "border border-cutline bg-paper text-ink"
                            : "border border-cutline bg-paper text-ink-soft"
                      }`}
                    >
                      {newest ? "Sekarang" : STATUS_LABEL[v.status]}
                    </span>
                  </div>
                  <p className="mt-0.5 font-ui text-[0.7rem] text-ink-soft">{formatTime(v.createdAt)}</p>
                  {restoreError === v.id ? (
                    <p className="mt-0.5 text-[0.7rem] text-signal">Gagal dipulihkan — coba lagi, kak.</p>
                  ) : null}
                </div>
                {newest ? null : (
                  <button
                    onClick={() => void restore(v.id)}
                    disabled={busy}
                    className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl border border-cutline bg-paper px-3.5 py-2 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    {restoring ? (
                      <LoaderCircle className="h-4 w-4 motion-safe:animate-spin" aria-hidden />
                    ) : (
                      <RotateCcw className="h-4 w-4" aria-hidden />
                    )}
                    {restoring ? "Memulihkan..." : "Pulihkan"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
