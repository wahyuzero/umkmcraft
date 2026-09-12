"use client";

/**
 * UseTemplateButton — satu-satunya jalan "Pakai Template Ini": POST ke
 * /api/sites/from-template lalu pindah ke /editor/[siteId]. Tanpa form,
 * tanpa input (keputusan planner: 0 input — nama/WA demo diganti di editor).
 *
 * Anti layout-shift saat loading: lebar tombol dijangkar oleh label
 * istirahat yang SELALU dirender (tak terlihat saat busy), teks
 * "Menyiapkan situs…" digambar di layer absolut di atasnya — lebar tombol
 * tidak pernah berubah di tengah request.
 *
 * Gagal → pesan inline di dekat tombol (bukan alert()), tombol aktif lagi
 * supaya kakak tinggal klik ulang.
 */
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";

interface UseTemplateButtonProps {
  templateId: string;
  /** Label tombol — default "Pakai Template Ini". */
  label?: string;
  /** Kelas layout untuk pembungkus (mis. "flex-1" di footer kartu galeri). */
  className?: string;
  /**
   * Kelas warna pesan error — konteks gelap (banner pratinjau di atas
   * bg-ink) butuh warna terang, konteks kertas (galeri) memakai default.
   */
  errorClassName?: string;
}

export default function UseTemplateButton({
  templateId,
  label = "Pakai Template Ini",
  className = "",
  errorClassName = "text-signal",
}: UseTemplateButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleUse() {
    if (busy) return;
    setBusy(true);
    setFailed(false);
    try {
      const res = await fetch("/api/sites/from-template", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ templateId }),
      });
      if (!res.ok) throw new Error("gagal menyiapkan situs");
      const data = (await res.json()) as { siteId?: string };
      if (!data.siteId) throw new Error("respons tidak memuat siteId");
      // Sukses: pindah ke editor situs baru. `busy` sengaja tidak di-reset —
      // navigasi sedang berjalan, tombol tetap terkunci sampai pindah halaman.
      router.push(`/editor/${data.siteId}`);
    } catch {
      setFailed(true);
      setBusy(false);
    }
  }

  return (
    <span className={`inline-flex flex-col items-stretch ${className}`}>
      <button
        type="button"
        onClick={handleUse}
        disabled={busy}
        aria-busy={busy}
        className="relative inline-flex min-h-[44px] min-w-[8.5rem] w-full items-center justify-center rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-card shadow-[0_2px_10px_rgb(154_52_18/0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:shadow-[0_1px_6px_rgb(154_52_18/0.4)] active:translate-y-[1px] active:shadow-[0_0_2px_rgb(154_52_18/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal disabled:cursor-wait"
      >
        {/*
          Jangkar lebar: label istirahat selalu ada di DOM. Saat busy ia jadi
          `invisible` (tetap memakan ruang, tak dibaca screen reader) sehingga
          lebar tombol konstan; status loading digambar di layer absolut.
        */}
        <span className={busy ? "invisible" : "inline-flex items-center"}>{label}</span>
        {busy ? (
          <span className="absolute inset-0 flex items-center justify-center gap-1.5 whitespace-nowrap">
            <LoaderCircle className="motion-safe:animate-spin h-4 w-4" strokeWidth={2.2} aria-hidden />
            Menyiapkan situs…
          </span>
        ) : null}
      </button>
      {failed ? (
        <p role="alert" className={`mt-1.5 text-center text-xs font-semibold ${errorClassName}`}>
          Gagal menyiapkan situs — coba lagi ya
        </p>
      ) : null}
    </span>
  );
}
