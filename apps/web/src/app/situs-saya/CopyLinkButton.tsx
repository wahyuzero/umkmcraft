"use client";

/**
 * CopyLinkButton — salin URL situs ke clipboard dengan konfirmasi inline.
 * Target = persis href tombol "Lihat" (bentuk path /sites/<slug>), diikat ke
 * origin saat ini agar hasilnya URL absolut yang bisa dibagikan.
 * Fallback berlapis: Clipboard API → execCommand → prompt (konteks non-secure
 * seperti http://lvh.me tidak punya navigator.clipboard).
 */
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyLinkButton({ path }: { path: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function markCopied() {
    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 2000);
  }

  async function copy() {
    let url = path;
    try {
      url = new URL(path, window.location.origin).toString();
    } catch {
      /* origin tidak tersedia — salin path apa adanya */
    }

    try {
      await navigator.clipboard.writeText(url);
      markCopied();
      return;
    } catch {
      /* lanjut ke fallback di bawah */
    }

    // Fallback 1: textarea + execCommand (browser lama / non-secure context)
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    if (ok) {
      markCopied();
      return;
    }

    // Fallback 2 (paling akhir): tampilkan URL agar bisa disalin manual
    window.prompt("Salin link situs kakak:", url);
    markCopied();
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-live="polite"
      className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal ${
        copied
          ? "border-live/50 bg-live/5"
          : "border-cutline hover:border-signal/40 hover:bg-signal-soft/40"
      }`}
    >
      {copied ? (
        <Check className="h-4 w-4" aria-hidden />
      ) : (
        <Copy className="h-4 w-4" aria-hidden />
      )}
      {copied ? "Tersalin" : "Salin link"}
    </button>
  );
}
