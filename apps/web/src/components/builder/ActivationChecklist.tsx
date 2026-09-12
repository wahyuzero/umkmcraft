"use client";

/**
 * ActivationChecklist — kartu "Aktivasi situs kakak" ala Notion di panel
 * pratinjau (slot first-win). Muncul HANYA saat situs masih berisi data
 * demo template (deteksi murni di lib/activation.ts, mirror scanUnfinished)
 * dan menghilang sendiri saat semua item beres + situs terbit.
 *
 * Learn-by-doing (riset onboarding §SPEC): tiap baris adalah aksi nyata —
 * klik → section terpilih di tab Atur (Inspector langsung menampilkan
 * fieldnya), bukan tur/bubble. Progress chip "n/5" (denominator termasuk
 * item terbitkan) supaya progres TIDAK dimulai dari 0 (goal-gradient).
 *
 * Baris yang BARU selesai tampil sesaat 1.6 detik (kotak centang terisi +
 * label dicoret) lalu lenyap — momen check-off kecil. HANYA item belum
 * selesai yang tampil sebagai baris; item `publish` dirender sebagai CTA
 * yang "menekan tombol Terbitkan" lewat requestPublish() — satu jalur
 * publish dengan PublishButton (tick), tanpa duplikasi logika.
 *
 * Dismiss permanen per-site: localStorage `uc-checklist-dismissed:<siteId>`
 * lewat useSyncExternalStore (server snapshot = dismissed → hydration-safe),
 * MIRROR pola first-win strip di BuilderShell. localStorage gagal (mode
 * privat) = dianggap dismissed — kartu yang tak bisa diingat tidak boleh
 * mengganggu tiap kunjungan.
 */
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight, ChevronUp, X } from "lucide-react";
import { useEditor } from "@/lib/editor-store";
import {
  computeActivationItems,
  matchDemoBusinessName,
  SAMPLE_WA,
} from "@/lib/activation";
import type { ActivationItem, ActivationItemId } from "@/lib/activation";

/* ---- Flag dismiss per-site di localStorage (mirror first-win BuilderShell) ----
   Helper module-level + Set listener: penutupan menulis flag lalu memanggil
   listener manual — event `storage` cuma menyapa tab LAIN. Server snapshot =
   dismissed supaya SSR & hidrasi merender null (kartu muncul pasca-hidrasi).
   Helper DIEKSPOR: BuilderShell memakainya untuk menekan first-win strip
   selama kartu ini aktif (dua kartu bimbingan bertumpuk = kebisingan). */
const checklistListeners = new Set<() => void>();

export function dismissChecklist(siteId: string) {
  try {
    window.localStorage.setItem(`uc-checklist-dismissed:${siteId}`, "1");
  } catch {
    // localStorage tertutup — tetap tutup untuk sesi ini.
  }
  checklistListeners.forEach((cb) => cb());
}

export function subscribeChecklistDismissed(cb: () => void): () => void {
  checklistListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    checklistListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

export function readChecklistDismissed(siteId: string): boolean {
  try {
    return window.localStorage.getItem(`uc-checklist-dismissed:${siteId}`) === "1";
  } catch {
    return true;
  }
}

/** Hint per item (microcopy final — Label Press, tanpa emoji). */
function itemHint(item: ActivationItem, demoName: string | null): string {
  switch (item.id) {
    case "wa":
      return `Pembeli bakal menghubungi ${SAMPLE_WA} — nomor contoh.`;
    case "photos":
      return "Foto kosong tampil sebagai contoh, bukan foto usaha kakak.";
    case "business_name":
      return `"${demoName ?? "Nama usaha"}" masih nama contoh template.`;
    case "hours_address":
      return "Pembeli perlu tahu di mana & kapan kakak buka.";
    default:
      return "";
  }
}

/** Durasi momen check-off — cukup terbaca, tak menyisakan beban visual. */
const FLASH_MS = 1600;

export function ActivationChecklist({
  onNavigateTab,
  onOpenCatalog,
}: {
  onNavigateTab: (tab: "susun" | "atur") => void;
  onOpenCatalog: () => void;
}) {
  const siteId = useEditor((s) => s.siteId);
  const config = useEditor((s) => s.config);
  const published = useEditor((s) => s.published);

  const items = useMemo(() => computeActivationItems(config, published), [config, published]);

  const dismissed = useSyncExternalStore(
    subscribeChecklistDismissed,
    () => readChecklistDismissed(siteId),
    () => true,
  );
  const [collapsed, setCollapsed] = useState(false);

  /* ---- Momen check-off: id yang BARU selesai tampil sesaat lalu lenyap.
     Timer per-id (bukan satu timer per-effect) supaya editan beruntun tidak
     saling membatalkan — baris flash tak pernah tertinggal selamanya. ---- */
  const prevDoneRef = useRef(new Map<ActivationItemId, boolean>());
  const flashTimersRef = useRef(new Map<ActivationItemId, ReturnType<typeof setTimeout>>());
  const [flashDone, setFlashDone] = useState<ReadonlySet<ActivationItemId>>(new Set());

  useEffect(() => {
    for (const item of items) {
      if (item.id === "publish") continue; // bukan baris — tidak pernah flash
      const was = prevDoneRef.current.get(item.id);
      prevDoneRef.current.set(item.id, item.done);
      if (was !== false || !item.done) continue;
      const id = item.id;
      setFlashDone((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      const previous = flashTimersRef.current.get(id);
      if (previous) clearTimeout(previous);
      flashTimersRef.current.set(
        id,
        setTimeout(() => {
          flashTimersRef.current.delete(id);
          setFlashDone((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }, FLASH_MS),
      );
    }
  }, [items]);

  // Sapu timer saat unmount (kartu hilang saat semua selesai + terbit).
  useEffect(() => {
    const timers = flashTimersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  // SSR / belum hydrate (store kosong) → jangan render apa pun.
  if (siteId === "") return null;

  const allDone = items.every((i) => i.done);
  // Kartu masih tampil sesaat selama momen check-off terakhir (allDone tapi
  // baris flash belum selesai) — lalu unmount total.
  if (dismissed || (allDone && flashDone.size === 0)) return null;

  const doneCount = items.filter((i) => i.done).length;
  const demoName = matchDemoBusinessName(config.meta.business_name);
  const contentAllDone = items.every((i) => i.id === "publish" || i.done);

  /** Klik baris = aksi nyata di editor, BUKAN toggle done (done turunan
     config — jujur pada keadaan). */
  function handleItemClick(item: ActivationItem) {
    if (item.id === "wa" && item.targetSectionId === null) {
      // Tanpa modul Kontak → buka katalog modul; setelah ditambah, aturan
      // sinkron WA di editor-store menghitung meta → item selesai.
      onOpenCatalog();
      return;
    }
    if (item.id === "business_name") {
      // Input nama di header terlihat di semua tab — fokus + blok teksnya.
      const input = document.getElementById("uc-business-name");
      input?.focus();
      if (input instanceof HTMLInputElement) input.select();
      return;
    }
    if (item.targetSectionId) {
      useEditor.getState().select(item.targetSectionId);
      onNavigateTab("atur"); // Inspector langsung menampilkan field section itu
    }
  }

  return (
    <div
      role="group"
      aria-label="Checklist aktivasi"
      className="mb-4 w-full max-w-[410px] rounded-2xl border border-cutline bg-card p-3.5 shadow-plate"
    >
      {/* Header — cukup baris ini saat dilipat (44px, pangkas beban visual). */}
      <div className="flex min-h-[44px] items-center gap-2">
        <h2 className="min-w-0 flex-1 truncate font-display text-sm font-bold text-ink">
          Aktivasi situs kakak
        </h2>
        <span
          aria-live="polite"
          className="shrink-0 rounded-full border border-cutline bg-paper px-2 py-0.5 text-xs font-bold tabular-nums text-signal"
        >
          {doneCount}/5
        </span>
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Buka daftar aktivasi" : "Lipat daftar aktivasi"}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors duration-200 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {collapsed ? (
            <ChevronUp aria-hidden className="h-4 w-4" />
          ) : (
            <ChevronDown aria-hidden className="h-4 w-4" />
          )}
        </button>
        <button
          type="button"
          onClick={() => dismissChecklist(siteId)}
          aria-label="Sembunyikan daftar aktivasi — tidak muncul lagi untuk situs ini"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors duration-200 hover:bg-paper hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          <X aria-hidden className="h-4 w-4" />
        </button>
      </div>

      {!collapsed ? (
        <>
          <p className="mt-0.5 text-xs leading-snug text-ink-soft">
            Template kakak masih berisi contoh — tinggal ganti dengan isinya sendiri.
          </p>

          {/* HANYA item belum selesai (urutan tetap), plus baris yang sedang
              momen check-off (1.6 detik sebelum lenyap). */}
          <div className="mt-2 flex flex-col gap-0.5 border-t border-cutline/60 pt-2">
            {items.map((item) => {
              if (item.id === "publish") return null;
              const flashing = item.done && flashDone.has(item.id);
              if (item.done && !flashing) return null;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item)}
                  aria-label={`${item.label}, ketuk untuk mengisi`}
                  className="group flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left transition-colors duration-200 ease-out hover:bg-signal-soft/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {/* Kotak centang custom (bukan ikon lucide) — status nyata
                      dibaca dari label; svg hanya dekorasi (aria-hidden). */}
                  <span
                    aria-hidden
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-200 ${
                      flashing
                        ? "border-signal bg-signal"
                        : "border-cutline bg-card group-hover:border-signal"
                    }`}
                  >
                    {flashing ? (
                      <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-card">
                        <path
                          d="m3.5 8.5 3 3 6-7"
                          stroke="currentColor"
                          strokeWidth={2.6}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-semibold transition-colors duration-200 ${
                        flashing ? "text-ink-soft line-through" : "text-ink"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-ink-soft">
                      {itemHint(item, demoName)}
                    </span>
                  </span>
                  <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-soft/60" />
                </button>
              );
            })}
          </div>

          {/* Semua item konten beres & belum terbit → CTA "menekan tombol
              Terbitkan" yang sama (tick), bukan publish sendiri. */}
          {contentAllDone && !published ? (
            <div className="mt-2 border-t border-cutline/60 pt-3">
              <p className="font-display text-sm font-bold text-ink">Situs kakak siap tayang!</p>
              <p className="mt-1 text-xs leading-snug text-ink-soft">
                Terbitkan sekarang — linknya langsung bisa dibagikan.
              </p>
              <button
                type="button"
                onClick={() => useEditor.getState().requestPublish()}
                className="mt-3 flex min-h-[44px] w-full items-center justify-center rounded-xl bg-signal px-3 text-sm font-bold text-card shadow-plate transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Terbitkan Situs
              </button>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
