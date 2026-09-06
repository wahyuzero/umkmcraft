"use client";

import { useEffect } from "react";

/** Kirim PAGEVIEW beacon sekali per mount (SYSTEM_DESIGN §8). */
export function PageviewBeacon({ siteId, path }: { siteId: string; path: string }) {
  useEffect(() => {
    const key = `uc-pv-${siteId}-${path}`;
    // dedupe refresh 30 detik (sessionStorage, tanpa identitas)
    try {
      const last = Number(sessionStorage.getItem(key) ?? 0);
      if (Date.now() - last < 30_000) return;
      sessionStorage.setItem(key, String(Date.now()));
    } catch {
      /* storage penuh/blocked — kirim saja */
    }
    const payload = JSON.stringify({ t: "pageview", r: document.referrer || "" });
    const url = `/api/t?site=${encodeURIComponent(siteId)}`;
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, payload);
    }
  }, [siteId, path]);
  return null;
}
