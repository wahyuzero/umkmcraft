"use client";

/**
 * PublishButton — moderasi otomatis → snapshot → pointer swap → revalidate.
 * State paling terang disimpan untuk momen live (raise: cyclorama).
 *
 * State: draft (tombol sinyal) → publishing (spinner "Menyegel...") →
 * live (pill hijau = status pasif; tombol "Perbarui situs" hanya muncul
 * saat draft menyimpang dari versi terbit) + "Lihat situs". Selama
 * autosave jalan (dirty/saving) tombol dikunci dengan bantuan singkat.
 * Pra-publish: config discan penanda "belum selesai" (PublishPreflight) —
 * ketemu → kartu peringatan inline dulu, kakak bisa memilih terbit saja
 * (keputusan diingat selama penanda tak berubah). Toast piringan di
 * bawah-tengah: CheckCircle2 (sukses) / AlertTriangle + "Coba lagi".
 */
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/lib/editor-store";
import { PreflightCard, scanUnfinished } from "./PublishPreflight";
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

  // Jembatan CTA kartu Checklist Aktivasi: kartu "menekan tombol" ini lewat
  // requestPublish() (tick di store, naik tiap permintaan) — jalur publish
  // TETAP satu di sini: scan preflight, kartu "Perbaiki dulu / Terbitkan
  // saja", flushSave, toast. initialTick menahan nilai pasca-hidrasi supaya
  // permintaan HANYA dipicu tick yang muncul setelah komponen terpasang.
  const publishTick = useEditor((s) => s.publishRequestTick);
  const initialTick = useRef(publishTick);
  useEffect(() => {
    if (publishTick !== initialTick.current) requestPublish();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- jalankan requestPublish TERBARU saat tick berubah; hanya tick yang jadi pemicu
  }, [publishTick]);

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

  // Gerbang pra-publish: penanda "belum selesai" yang sedang tampil sebagai
  // kartu (null = tertutup). Kunci keputusan "terbitkan saja" = hasil scan —
  // selama penandanya tak berubah, publish berikutnya tidak dinag ulang;
  // memperbaiki salah satu penanda mengganti kunci sehingga kartu boleh
  // muncul lagi (editan lain yang tak menyentuh penanda tetap tak menag).
  const [preflightIssues, setPreflightIssues] = useState<string[] | null>(null);
  const proceedKey = useRef<string | null>(null);

  function showToast(data: ToastData) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(data);
  }

  /** Klik publish dari tombol: scan dulu, tunjukkan kartu bila ada penanda
   *  dan keputusan "terbitkan saja" untuk penanda itu belum pernah dipilih. */
  function requestPublish() {
    const issues = scanUnfinished(useEditor.getState().config);
    const key = issues.join("\n");
    if (issues.length > 0 && proceedKey.current !== key) {
      setPreflightIssues(issues);
      return;
    }
    void publish();
  }

  /** "Terbitkan saja" — ingat keputusan untuk penanda ini, lalu lanjut. */
  function publishAnyway() {
    proceedKey.current = preflightIssues ? preflightIssues.join("\n") : null;
    setPreflightIssues(null);
    void publish();
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

  // px TIDAK termasuk base — override padding bernilai lebih kecil kalah di
  // urutan kaskade Tailwind (px-5 selalu menang atas px-2.5), jadi tiap
  // pemakaian memasang px-nya sendiri.
  const btnBase =
    "flex min-h-11 items-center justify-center gap-2 rounded-2xl py-2.5 text-sm font-bold transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 disabled:hover:translate-y-0";

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
              onClick={requestPublish}
              disabled={busy || saving}
              title={saving ? "Simpan dulu — perubahan kakak masih disimpan otomatis" : "Ada perubahan yang belum tampil di situs live"}
              aria-label="Perbarui situs"
              className={`${btnBase} bg-signal px-2.5 text-card shadow-plate sm:px-5`}
            >
              {busy ? (
                <>
                  <Loader2 aria-hidden className="h-4 w-4 motion-safe:animate-spin" />
                  Menyegel…
                </>
              ) : (
                <>
                  <RefreshCw aria-hidden className="h-4 w-4" />
                  {/* Label selalu tampil (aksi paling penting tak boleh ikon
                      saja). Di layar sempit teksnya dipendekkan agar nama
                      usaha di header tak tergencet — nama akses penuh tetap
                      "Perbarui situs" (aria-label). */}
                  <span aria-hidden className="whitespace-nowrap text-xs sm:hidden">
                    Perbarui
                  </span>
                  <span className="hidden whitespace-nowrap text-sm sm:inline">Perbarui situs</span>
                </>
              )}
            </button>
          ) : null}
          <a
            href={siteUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Lihat situs"
            className="flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-2xl border-2 border-live/40 px-2 py-2 text-xs font-bold text-live transition-colors duration-200 hover:bg-live/10 sm:px-3.5 sm:text-sm"
          >
            <ExternalLink aria-hidden className="h-4 w-4" />
            <span aria-hidden className="sm:hidden">Lihat</span>
            <span className="hidden sm:inline">Lihat situs</span>
          </a>
        </>
      ) : (
        <button
          onClick={requestPublish}
          disabled={busy || saving}
          title={saving ? "Simpan dulu — perubahan kakak masih disimpan otomatis" : undefined}
          className={`${btnBase} bg-signal px-5 text-card shadow-plate`}
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

      {/* Gerbang pra-publish: kartu peringatan inline di bawah tombol —
          "Perbaiki dulu" menutup tanpa menerbitkan, "Terbitkan saja" lanjut. */}
      {preflightIssues ? (
        <PreflightCard
          issues={preflightIssues}
          onFixFirst={() => setPreflightIssues(null)}
          onPublishAnyway={publishAnyway}
          onDismiss={() => setPreflightIssues(null)}
        />
      ) : null}

      {/* Bantuan saat autosave masih jalan — absolut agar header tak bergeser
          (disembunyikan saat kartu preflight terbuka agar tak bertumpuk) */}
      {saving && !busy && !preflightIssues ? (
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
