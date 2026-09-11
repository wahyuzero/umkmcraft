"use client";

/**
 * PublishButton — moderasi otomatis → snapshot → pointer swap → revalidate.
 * State paling terang disimpan untuk momen live (raise: cyclorama).
 *
 * State: draft (tombol sinyal) → publishing (spinner "Menyegel...") →
 * live (pill hijau = status pasif; tombol "Perbarui situs" hanya muncul
 * saat draft menyimpang dari versi terbit) + "Lihat situs". Selama
 * autosave jalan (dirty/saving) tombol dikunci dengan bantuan singkat.
 * Toast piringan di bawah-tengah: CheckCircle2 (sukses) / AlertTriangle + "Coba lagi".
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/lib/editor-store";
import { AlertTriangle, CheckCircle2, ExternalLink, Globe, Loader2, RefreshCw } from "lucide-react";

interface ToastData {
  kind: "ok" | "err";
  text: string;
  url?: string;
}

export function PublishButton({ staleInitially = false }: { staleInitially?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const published = useEditor((s) => s.published);
  const slug = useEditor((s) => s.slug);
  const saveState = useEditor((s) => s.saveState);
  const markPublished = useEditor((s) => s.markPublished);

  const saving = saveState === "dirty" || saveState === "saving";
  const siteUrl = slug ? `/sites/${slug}` : "/";

  // Draft menyimpang dari versi terbit? Nilai awal datang dari SERVER
  // (staleInitially — perbandingan versi draft vs publishedVersionId di
  // editor page), bukan dari memori yang selalu mulai bersih tiap sesi.
  // Setelah itu setiap mutasi menandai saveState "dirty" — dengarkan
  // transisi ke dirty via subscribe (bukan effect body) agar jejaknya
  // tetap hidup setelah autosave selesai (state kembali "saved").
  const [changedSincePublish, setChangedSincePublish] = useState(staleInitially);
  useEffect(() => {
    return useEditor.subscribe((state, prev) => {
      if (state.saveState === "dirty" && prev.saveState !== "dirty") {
        setChangedSincePublish(true);
      }
    });
  }, []);
  const stale = published && changedSincePublish;

  function showToast(data: ToastData) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(data);
  }

  async function publish() {
    // kunci tombol sejak awal agar tak bisa dobel-klik saat flush autosave
    setBusy(true);
    setToast(null);
    try {
      // Tunggu autosave benar-benar selesai (debounce dipeles, PATCH in-flight
      // ditunggu) — snapshot publish tidak boleh duluan dari simpanan.
      await useEditor.getState().flushSave();
      if (useEditor.getState().saveState === "error") {
        showToast({ kind: "err", text: "Simpanan gagal — coba lagi, kak" });
        return;
      }
      const res = await fetch(`/api/sites/${useEditor.getState().siteId}/publish`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string; pathUrl?: string };
      if (!res.ok || !data.ok) {
        showToast({ kind: "err", text: data.error ?? "Publish gagal" });
        return;
      }
      markPublished();
      setChangedSincePublish(false);
      showToast({ kind: "ok", text: "Situs kakak sudah live", url: data.pathUrl ?? siteUrl });
      router.refresh();
    } catch {
      showToast({ kind: "err", text: "Koneksi bermasalah" });
    } finally {
      setBusy(false);
      // auto-dismiss 6s — timer diganti tiap toast baru, tidak saling makan
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 6000);
    }
  }

  const btnBase =
    "flex min-h-11 items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0";

  return (
    <div className="relative flex items-center gap-1.5">
      {published ? (
        <>
          {/* Pill hijau murni status (bukan tombol) — satu-satunya pemakaian hijau.
              Di layar sempit ikon saja (title tetap membacakan "Live"). */}
          <span
            role="status"
            aria-label="Live"
            title="Situs kakak sedang live"
            className="flex items-center gap-1.5 rounded-full bg-live px-3 py-1.5 text-xs font-extrabold text-card"
          >
            <Globe aria-hidden className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Live</span>
          </span>
          {stale ? (
            <button
              onClick={publish}
              disabled={busy || saving}
              title={saving ? "Simpan dulu — perubahan kakak masih disimpan otomatis" : "Ada perubahan yang belum tampil di situs live"}
              aria-label="Perbarui situs"
              className={`${btnBase} bg-signal px-3.5 text-card shadow-plate sm:px-5`}
            >
              {busy ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
                  Menyegel…
                </>
              ) : (
                <>
                  <RefreshCw aria-hidden className="h-4 w-4" />
                  <span className="hidden sm:inline">Perbarui situs</span>
                </>
              )}
            </button>
          ) : null}
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-2xl border-2 border-live/40 px-3.5 py-2 text-sm font-bold text-live transition-colors duration-200 hover:bg-live/10"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            <span className="hidden sm:inline">Lihat situs</span>
          </a>
        </>
      ) : (
        <button
          onClick={publish}
          disabled={busy || saving}
          title={saving ? "Simpan dulu — perubahan kakak masih disimpan otomatis" : undefined}
          className={`${btnBase} bg-signal text-card shadow-plate`}
        >
          {busy ? (
            <>
              <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
              Menyegel…
            </>
          ) : (
            "Terbitkan Situs"
          )}
        </button>
      )}

      {/* Bantuan saat autosave masih jalan — absolut agar header tak bergeser */}
      {saving && !busy ? (
        <p className="absolute right-0 top-full z-40 mt-1.5 max-w-56 rounded-lg border border-cutline/60 bg-card px-2.5 py-1 text-right text-[0.65rem] font-medium leading-snug text-ink-soft shadow-plate">
          Simpan dulu — perubahan kakak masih disimpan otomatis
        </p>
      ) : null}

      {/* Toast piringan bawah-tengah */}
      {toast ? (
        <div
          role="status"
          className="uc-stick-in fixed bottom-4 left-1/2 z-50 w-[min(20rem,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl bg-ink px-4 py-3 text-paper shadow-kemasan"
        >
          {toast.kind === "ok" ? (
            <div className="flex items-start gap-2.5">
              <CheckCircle2 aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-live" />
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-xs font-bold">
                  {toast.text}
                  <span aria-hidden className="motion-safe:uc-pulse-dot h-1.5 w-1.5 shrink-0 rounded-full bg-live" />
                </p>
                <a
                  href={toast.url ?? siteUrl}
                  className="mt-1 inline-block text-xs font-bold text-signal-soft underline underline-offset-2 transition-opacity duration-200 hover:opacity-80"
                >
                  Buka situs →
                </a>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5">
              <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-signal-soft" />
              <div className="min-w-0">
                <p className="text-xs font-bold">{toast.text}</p>
                <button
                  type="button"
                  onClick={() => void publish()}
                  className="mt-1 text-xs font-bold text-signal-soft underline underline-offset-2 transition-opacity duration-200 hover:opacity-80"
                >
                  Coba lagi
                </button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
