"use client";

/**
 * PublishButton — moderasi otomatis → snapshot → pointer swap → revalidate.
 * State paling terang disimpan untuk momen live (raise: cyclorama).
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor } from "@/lib/editor-store";

export function PublishButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const published = useEditor((s) => s.published);
  const markPublished = useEditor((s) => s.markPublished);

  async function publish() {
    // simpan dulu perubahan yang belum ter-debounce
    useEditor.getState().scheduleSave();
    await new Promise((r) => setTimeout(r, 900));
    setBusy(true);
    setToast(null);
    try {
      const res = await fetch(`/api/sites/${useEditor.getState().siteId}/publish`, { method: "POST" });
      const data = (await res.json()) as { ok?: boolean; error?: string; pathUrl?: string };
      if (!res.ok || !data.ok) {
        setToast(data.error ?? "Publish gagal");
        return;
      }
      markPublished();
      setToast(`Live! Buka ${data.pathUrl}`);
      router.refresh();
    } catch {
      setToast("Koneksi bermasalah — coba lagi");
    } finally {
      setBusy(false);
      setTimeout(() => setToast(null), 6000);
    }
  }

  return (
    <div className="relative">
      <button
        onClick={publish}
        disabled={busy}
        className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold transition-all duration-200 ease-out hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 ${
          published
            ? "border-2 border-live bg-live/10 text-live"
            : "bg-signal text-white shadow-[0_4px_14px_rgb(154_52_18/0.4)]"
        }`}
      >
        {busy ? (
          <>
            <span className="motion-safe:uc-pulse-dot h-2 w-2 rounded-full bg-current" aria-hidden />
            Menerbitkan…
          </>
        ) : published ? (
          <>
            <span className="h-2 w-2 rounded-full bg-live" aria-hidden />
            Perbarui Situs
          </>
        ) : (
          "Terbitkan Situs"
        )}
      </button>
      {toast ? (
        <p role="status" className="absolute right-0 top-full z-50 mt-2 w-64 rounded-xl bg-ink px-4 py-2.5 text-xs font-medium leading-relaxed text-paper shadow-kemasan">
          {toast}
          {toast.startsWith("Live!") ? (
            <a href={toast.slice(6).trim()} className="mt-1 block font-bold text-signal-soft underline underline-offset-2">
              Buka sekarang →
            </a>
          ) : null}
        </p>
      ) : null}
    </div>
  );
}
