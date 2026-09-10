"use client";

/**
 * PromoTimer — island hitung mundur promo banner.
 * SSR-safe: sebelum mount render teks statis tanggal target (deterministik via UTC,
 * bukan Intl lokal) supaya server & client menghasilkan markup identik — tanpa
 * hydration mismatch. Setelah mount, interval per detik; sebelum mount tidak ada
 * jam runtime sama sekali.
 * prefers-reduced-motion → tetap teks statis, tanpa update per detik.
 * Setelah mount tampil sebagai chip gelap dd:hh:mm:ss (tabular-nums).
 * Setelah lewat tenggat → render null (hilang sendiri). Interval dibersihkan saat unmount.
 */
import { useEffect, useState } from "react";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

/** Format tanggal target secara deterministik (UTC) — identik di server & client. */
function formatTarget(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${d.getUTCDate()} ${BULAN[d.getUTCMonth()]} ${d.getUTCFullYear()}, ${hh}.${mm}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Chip gelap satu satuan waktu — angka tabular + label mini. */
function TimeChip({ value, unit }: { value: string; unit: string }) {
  return (
    <span className="inline-flex min-w-[2.5rem] flex-col items-center rounded-lg bg-[color-mix(in_oklab,var(--uc-ink)_88%,transparent)] px-1.5 py-1 leading-none">
      <span className="text-sm font-extrabold tabular-nums text-[var(--uc-bg)]">{value}</span>
      <span className="mt-0.5 text-[0.55rem] font-bold uppercase tracking-wide text-[color-mix(in_oklab,var(--uc-bg)_68%,transparent)]">
        {unit}
      </span>
    </span>
  );
}

export function PromoTimer({ endsAt, label }: { endsAt: string; label?: string }) {
  const target = new Date(endsAt).getTime();
  /** null = belum mount (atau reduced motion) → render statis. number = sisa ms. */
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(target)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const tick = () => setRemaining(target - Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;
  if (remaining !== null && remaining <= 0) return null;

  const prefix = label ?? "Berakhir";

  return (
    <span role="timer" className="inline-flex flex-wrap items-center gap-2 text-sm font-semibold text-[color-mix(in_oklab,var(--uc-ink)_68%,transparent)]">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 shrink-0 text-[var(--uc-secondary)]"
        aria-hidden
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 1.8" />
      </svg>
      {remaining === null ? (
        <>
          {prefix} sampai{" "}
          <time dateTime={endsAt} className="font-bold text-[var(--uc-ink)]">
            {formatTarget(endsAt)}
          </time>
        </>
      ) : (
        <>
          <span className="text-[var(--uc-ink)]">{label ? `${label}` : "Berakhir dalam"}</span>
          <span className="inline-flex items-center gap-1">
            <TimeChip value={pad2(Math.floor(remaining / 86_400_000))} unit="hari" />
            <TimeChip value={pad2(Math.floor((remaining % 86_400_000) / 3_600_000))} unit="jam" />
            <TimeChip value={pad2(Math.floor((remaining % 3_600_000) / 60_000))} unit="mnt" />
            <TimeChip value={pad2(Math.floor((remaining % 60_000) / 1000))} unit="dtk" />
          </span>
        </>
      )}
    </span>
  );
}
