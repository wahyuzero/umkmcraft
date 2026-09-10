"use client";

/**
 * CopyCoupon — island salin kode promo ke clipboard.
 * Tampilan "tiket": border putus-putus + kode tabular. Warna sukses memakai
 * var tema (ink/bg) — tanpa hex hardcode.
 * navigator.clipboard dulu, fallback textarea + document.execCommand("copy").
 * Status "Tersalin!" (ikon SVG centang, tanpa emoji) selama 2 detik,
 * diumumkan ke pembaca layar lewat aria-live="polite".
 */
import { useEffect, useRef, useState } from "react";

async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* lanjut ke fallback di bawah */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function CopyIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <rect x="9" y="9" width="11" height="11" rx="2.5" />
      <path d="M5 15h-.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M4.5 12.5 10 18 19.5 6.5" />
    </svg>
  );
}

export function CopyCoupon({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, []);

  const onCopy = async () => {
    const ok = await copyText(code);
    if (!ok) return;
    setCopied(true);
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    /* Kupon bergaya "tiket": border putus-putus, kode tabular lebar jarak huruf */
    <span className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-[color-mix(in_oklab,var(--uc-primary)_45%,transparent)] bg-[color-mix(in_oklab,var(--uc-primary)_7%,var(--uc-surface))] py-1 pl-1 pr-1">
      <span aria-live="polite" className="sr-only">
        {copied ? `Kode ${code} berhasil disalin ke papan klip` : ""}
      </span>
      <code className="pl-3 text-sm font-bold tabular-nums tracking-[0.18em] text-[var(--uc-primary)]">{code}</code>
      <button
        type="button"
        onClick={onCopy}
        aria-label={`Salin kode promo ${code}`}
        className={`inline-flex min-h-[44px] items-center gap-1 rounded-lg px-3.5 text-xs font-bold transition-[background-color,color,transform] duration-200 ease-out active:scale-95 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${
          copied
            ? "bg-[var(--uc-ink)] text-[var(--uc-bg)]"
            : "bg-[var(--uc-primary)] text-[var(--uc-on-primary)] hover:brightness-105"
        }`}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? "Tersalin!" : "Salin"}</span>
      </button>
    </span>
  );
}
