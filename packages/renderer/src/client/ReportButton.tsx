"use client";

import { useState } from "react";

/** Tombol "Laporkan situs" (SYSTEM_DESIGN §9.2) — wajib di footer tenant. */
export function ReportButton({ siteId }: { siteId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("PHISHING");
  const [detail, setDetail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ siteId, reason, detail }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      setSent(data.message ?? data.error ?? "Terima kasih.");
      if (res.ok) {
        setDetail("");
        setTimeout(() => setOpen(false), 2500);
      }
    } catch {
      setSent("Gagal mengirim — coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      {/* Hit area ≥44px via padding + margin negatif — ukuran visual teks tetap */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="-my-3 inline-flex min-h-[44px] items-center px-3 text-xs font-medium text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)] underline decoration-dotted underline-offset-4 transition-colors hover:text-[var(--uc-ink)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
      >
        Laporkan situs
      </button>
      {open ? (
        <div
          role="dialog"
          aria-label="Laporkan situs"
          className="absolute bottom-8 right-0 z-50 w-72 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] bg-[var(--uc-surface)] p-4 text-left text-[var(--uc-ink)] shadow-[0_18px_50px_-12px_color-mix(in_oklab,var(--uc-ink)_35%,transparent)]"
        >
          <p className="text-sm font-bold">Laporkan situs ini</p>
          {sent ? (
            <p className="mt-2 text-xs leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_65%,transparent)]" role="status">{sent}</p>
          ) : (
            <>
              <label className="mt-2 block text-xs font-medium" htmlFor="uc-report-reason">
                Alasan
              </label>
              <select
                id="uc-report-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="mt-1 w-full rounded-lg border border-[color-mix(in_oklab,var(--uc-ink)_18%,transparent)] bg-[var(--uc-bg)] px-2.5 py-2 text-xs text-[var(--uc-ink)] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-[var(--uc-primary)]"
              >
                <option value="PHISHING">Phishing / penipuan</option>
                <option value="IMPERSONATION">Meniru merek lain</option>
                <option value="SCAM">Scam / penipuan jual-beli</option>
                <option value="ILLEGAL">Konten ilegal</option>
                <option value="OTHER">Lainnya</option>
              </select>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Jelaskan singkat (opsional)"
                rows={2}
                className="mt-2 w-full resize-none rounded-lg border border-[color-mix(in_oklab,var(--uc-ink)_18%,transparent)] bg-[var(--uc-bg)] px-2.5 py-2 text-xs text-[var(--uc-ink)] placeholder:text-[color-mix(in_oklab,var(--uc-ink)_50%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-[var(--uc-primary)]"
              />
              <button
                onClick={submit}
                disabled={busy}
                className="mt-2 min-h-[44px] w-full rounded-lg bg-[var(--uc-ink)] px-3 py-2 text-xs font-semibold text-[var(--uc-bg)] transition-[filter] duration-200 hover:brightness-125 disabled:opacity-50"
              >
                {busy ? "Mengirim…" : "Kirim Laporan"}
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
