"use client";

/**
 * BuilderShell — rak alat utama editor.
 * World "Label Press": kiri lembar stiker section, tengah kemasan HP,
 * kanan inspector label. Grid lock 4px; satu sinyal amber = state aktif.
 *
 * Mobile (<lg): preview-first + toolbar bawah 3 tab (Susun/Pratinjau/Atur)
 * yang menukar panel full-width dengan slide/fade. Desktop (lg+): 3 kolom
 * persis seperti semula. State panel = useState lokal, tanpa store.
 */
import { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Check, CloudOff, CloudUpload, LayoutList, LoaderCircle, Plus, SlidersHorizontal, Smartphone, X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { computeActivationItems } from "@/lib/activation";
import { useEditor } from "@/lib/editor-store";
import type { SaveState } from "@/lib/editor-store";
import { SectionList } from "./SectionList";
import { ModuleCatalog } from "./ModuleCatalog";
import { Inspector } from "./Inspector";
import { PhonePreview } from "./PhonePreview";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { PublishButton } from "./PublishButton";
import { ActivationChecklist, readChecklistDismissed, subscribeChecklistDismissed } from "./ActivationChecklist";
import { AnalyticsCard } from "./AnalyticsCard";
import { VersionHistory } from "./VersionHistory";

type MobileTab = "susun" | "pratinjau" | "atur";

/* ---- First-win strip: flag "sudah ditutup" di localStorage ----
   Dibaca lewat useSyncExternalStore supaya aman hidrasi (snapshot server =
   sudah ditutup → SSR merender null) tanpa setState di effect. Penutupan
   menulis flag lalu memanggil listener manual — event `storage` cuma
   menyapa tab LAIN. localStorage gagal (mode privat) = dianggap ditutup,
   supaya strip yang tak bisa diingat tidak mengganggu tiap kunjungan. */
const firstWinListeners = new Set<() => void>();

function dismissFirstWin() {
  try {
    window.localStorage.setItem("uc-firstwin-dismissed", "1");
  } catch {
    // localStorage tertutup — tetap tutup untuk sesi ini.
  }
  firstWinListeners.forEach((cb) => cb());
}

function subscribeFirstWin(cb: () => void): () => void {
  firstWinListeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    firstWinListeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

const TABS: Array<{ id: MobileTab; label: string; icon: LucideIcon; panelId: string }> = [
  { id: "susun", label: "Susun", icon: LayoutList, panelId: "panel-susun" },
  { id: "pratinjau", label: "Pratinjau", icon: Smartphone, panelId: "panel-pratinjau" },
  { id: "atur", label: "Atur", icon: SlidersHorizontal, panelId: "panel-atur" },
];

export function BuilderShell({
  siteId,
  slug,
  initialConfig,
  published,
  staleInitially,
}: {
  siteId: string;
  slug: string;
  initialConfig: UmkmWebsiteConfig;
  published: boolean;
  /** Kebenaran server saat load: draft sudah lebih baru dari versi terbit? */
  staleInitially: boolean;
}) {
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("pratinjau");

  // Hydrate store tepat sekali sebelum interaksi (initialConfig serializable dari server).
  // Lazy useState initializer = jalan sekali, tanpa akses ref saat render.
  useState(() => {
    useEditor.setState({ siteId, slug, config: initialConfig, published, selectedId: initialConfig.sections[0]?.id ?? null, saveState: "idle" });
    return true;
  });

  const config = useEditor((s) => s.config);
  const saveState = useEditor((s) => s.saveState);
  const lastSavedAt = useEditor((s) => s.lastSavedAt);
  // Status terbit LIVE dari store (prop `published` hanya kebenaran awal
  // server) — strip first-win hilang seketika setelah kakak menerbitkan.
  const isPublished = useEditor((s) => s.published);
  const businessName = config.meta.business_name;

  // Nama usaha panjang ("Warung Sambal Ndeso Bu Sri") di layar 390px gak muat
  // utuh — header cuma menyisakan ~51px untuk input karena chip autosave +
  // tombol terbit memeras flex-1. Saat fokus, input naik jadi overlay
  // selebar header (elemen lain tertutup sesaat, tanpa pindah posisi) supaya
  // dapat lebar nyata; saat blur, kembali inline terpotong rapi dengan ellipsis.
  const [nameFocused, setNameFocused] = useState(false);

  // First-win strip: hilang permanen setelah ditutup (lihat helper di atas).
  const firstWinDismissed = useSyncExternalStore(
    subscribeFirstWin,
    () => {
      try {
        return window.localStorage.getItem("uc-firstwin-dismissed") === "1";
      } catch {
        return true;
      }
    },
    () => true,
  );

  // Kartu checklist aktivasi: aktif hanya bila situs masih berisi data demo
  // template (ada item pending — deteksi murni lib/activation.ts) dan belum
  // di-dismiss untuk situs ini. Saat aktif, first-win strip DITEKAN — dua
  // kartu bimbingan bertumpuk cuma menambah kebisingan. Dismiss per-site
  // lewat localStorage (pola first-win di atas; server snapshot = dismissed,
  // aman hidrasi).
  const checklistDismissed = useSyncExternalStore(
    subscribeChecklistDismissed,
    () => readChecklistDismissed(siteId),
    () => true,
  );
  const checklistActive =
    siteId !== "" &&
    !checklistDismissed &&
    !computeActivationItems(config, isPublished).every((i) => i.done);

  // Pagar beforeunload: perubahan belum tersimpan (atau simpanan terakhir
  // gagal — datanya mungkin masih belum masuk) → minta konfirmasi browser
  // sebelum tab ditutup. Asuransi murah anti hilang editan.
  useEffect(() => {
    if (saveState !== "dirty" && saveState !== "error") return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [saveState]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      {/* ===== Header rak alat (kompak di mobile) ===== */}
      <header className="relative flex h-16 shrink-0 items-center justify-between gap-2 border-b border-cutline/80 bg-paper px-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper sm:h-11 sm:w-11" aria-label="Beranda UMKM Craft">
            U
          </Link>
          <div className="min-w-0 flex-1">
            {/* Target sentuh ≥44px (dulu 30px — satu-satunya sub-44 di app).
                Fokus = overlay inset-x-3 selebar header (≥330px di layar 390px,
                nama panjang terlihat utuh sambil mengetik); blur = inline
                truncate dengan ellipsis. */}
            {/* id "uc-business-name" = target fokus+select baris "nama usaha"
                di Checklist Aktivasi (header terlihat di semua tab). */}
            <input
              id="uc-business-name"
              value={businessName}
              onChange={(e) => useEditor.getState().setBusinessName(e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
              className={`min-h-[44px] rounded-lg px-1.5 font-display text-base font-bold text-ink focus:outline-none sm:text-lg ${
                nameFocused
                  ? "absolute inset-x-3 top-1/2 z-50 -translate-y-1/2 rounded-xl border-[1.5px] border-signal bg-paper px-3"
                  : "w-full min-w-0 truncate border border-transparent hover:border-cutline sm:max-w-[280px]"
              }`}
              aria-label="Nama usaha"
            />
            <p className="hidden px-1.5 text-[0.7rem] text-ink-soft sm:block">
              {slug}.lvh.me
              {published ? <span className="ml-2 font-semibold text-live">● live</span> : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {/* Chip autosave selalu terlihat (kritik ronde 3: semalam ia hilang
              di ponsel) — ikon saja <md, ikon+teks ≥md (label ditahan di
              komponennya), jadi ruang nama usaha tetap terjaga. */}
          <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
          {/* Di ponsel tema pindah ke tab Atur — header 390px tak muat memuatnya */}
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          <PublishButton staleInitially={staleInitially} />
        </div>
      </header>

      {/* ===== Body: mobile sheet tunggal / desktop 3 kolom ===== */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Lembar stiker — mobile: sheet tab "Susun" */}
        <aside
          id="panel-susun"
          role="tabpanel"
          aria-labelledby="tab-susun"
          className={`min-h-0 flex-1 flex-col overflow-y-auto border-b border-cutline/80 lg:w-[300px] lg:flex-none lg:shrink-0 lg:border-b-0 lg:border-r ${
            mobileTab === "susun" ? "flex uc-stick-in" : "hidden lg:flex"
          }`}
        >
          <div className="flex shrink-0 items-center justify-between px-4 pb-2 pt-4">
            <h2 className="font-display text-sm font-bold text-ink">
              Susunan Halaman
            </h2>
            <span className="text-[0.7rem] tabular-nums text-ink-soft/70">
              {config.sections.length} blok
            </span>
          </div>
          <SectionList onAdd={() => setCatalogOpen(true)} />
          <div className="shrink-0 p-4 pt-1">
            <button
              onClick={() => setCatalogOpen(true)}
              className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cutline px-4 py-2.5 text-sm font-bold text-ink-soft transition-colors duration-150 ease-out hover:border-signal hover:bg-signal-soft/40 hover:text-signal"
            >
              <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden />
              Tambah Modul
            </button>
          </div>
          <AnalyticsCard />
          <VersionHistory />
        </aside>

        {/* Kemasan HP — mobile: sheet tab "Pratinjau" (default) */}
        <main
          id="panel-pratinjau"
          role="tabpanel"
          aria-labelledby="tab-pratinjau"
          className={`min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto bg-paper-deep/60 px-4 py-6 ${
            mobileTab === "pratinjau" ? "flex uc-stick-in" : "hidden lg:flex"
          }`}
        >
          {/* Slot bimbingan (satu saja): kartu checklist aktivasi selagi
              situs masih berisi data demo template; kalau tidak, first-win
              strip lama. Keduanya hilang setelah situs terbit / ditutup. */}
          {checklistActive ? (
            <ActivationChecklist onNavigateTab={setMobileTab} onOpenCatalog={() => setCatalogOpen(true)} />
          ) : firstWinDismissed === false && !isPublished ? (
            <div className="mb-4 flex w-full max-w-[410px] items-center gap-1 rounded-xl border border-cutline bg-card py-1 pl-3 pr-1">
              <p className="min-w-0 flex-1 text-xs leading-snug text-ink-soft">
                Situs kakak sudah jadi. Ketuk bagian mana pun di pratinjau untuk mengubahnya, atau langsung terbitkan.
              </p>
              <button
                type="button"
                aria-label="Tutup tips ini"
                onClick={dismissFirstWin}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-ink-soft transition-colors duration-150 ease-out hover:bg-signal-soft/60 hover:text-signal"
              >
                <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              </button>
            </div>
          ) : null}
          <PhonePreview />
        </main>

        {/* Inspector — mobile: sheet tab "Atur" */}
        <aside
          id="panel-atur"
          role="tabpanel"
          aria-labelledby="tab-atur"
          className={`min-h-0 flex-1 overflow-y-auto border-t border-cutline/80 lg:w-[340px] lg:flex-none lg:shrink-0 lg:border-l lg:border-t-0 ${
            mobileTab === "atur" ? "block uc-stick-in" : "hidden lg:block"
          }`}
        >
          {/* Tema pindah ke tab Atur di ponsel (di header hanya ≥sm) */}
          <div className="border-b border-cutline/80 bg-card px-4 py-4 lg:hidden">
            <p className="mb-2.5 font-display text-sm font-bold text-ink">Tema warna</p>
            <ThemeSwitcher />
          </div>
          <Inspector />
        </aside>
      </div>

      {/* ===== Toolbar bawah (mobile saja) — safe-area padded ===== */}
      <nav
        role="tablist"
        aria-label="Panel editor"
        className="flex shrink-0 items-stretch gap-1 border-t border-cutline/80 bg-card px-2 pt-1.5 pb-[calc(env(safe-area-inset-bottom)+8px)] lg:hidden"
      >
        {TABS.map((tab) => {
          const active = mobileTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={active}
              aria-controls={tab.panelId}
              onClick={() => setMobileTab(tab.id)}
              className={`flex min-h-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 transition-colors duration-200 ease-out ${
                active ? "bg-signal-soft text-signal" : "text-ink-soft hover:text-ink"
              }`}
            >
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              <span className="text-[0.7rem] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </nav>

      {catalogOpen ? <ModuleCatalog onClose={() => setCatalogOpen(false)} /> : null}
    </div>
  );
}

const TIME_FMT = new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" });

/**
 * Chip status autosave — di layar sempit ikon saja secara VISUAL, tapi teks
 * status selalu mengalir ke pembaca layar lewat sr-only (dulu display:none
 * membuat ponsel buta status). Saat simpan gagal, chip berubah jadi tombol
 * sungguhan "Coba simpan" (flushSave) — bukan cuma cerita tanpa aksi.
 */
function SaveIndicator({ state, lastSavedAt }: { state: SaveState; lastSavedAt: number | null }) {
  let Icon = CloudUpload;
  let label = "Tersimpan otomatis";
  let spinning = false;
  if (state === "dirty") {
    label = "Perubahan belum disimpan";
  } else if (state === "saving") {
    Icon = LoaderCircle;
    label = "Menyimpan...";
    spinning = true;
  } else if (state === "saved") {
    Icon = Check;
    label = lastSavedAt ? `Tersimpan ${TIME_FMT.format(lastSavedAt)}` : "Tersimpan otomatis";
  }

  return (
    <span aria-live="polite" className="flex shrink-0">
      {state === "error" ? (
        <button
          type="button"
          onClick={() => void useEditor.getState().flushSave()}
          aria-label="Coba simpan"
          title="Gagal menyimpan — coba simpan lagi"
          className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full border border-signal/40 bg-card px-3 text-xs font-bold text-signal transition-colors duration-150 ease-out hover:bg-signal-soft/60"
        >
          <CloudOff className="h-3.5 w-3.5 shrink-0" strokeWidth={2.2} aria-hidden />
          <span aria-hidden className="hidden truncate md:inline">Coba simpan</span>
          <span className="sr-only">Gagal — coba simpan lagi</span>
        </button>
      ) : (
        <span
          title={label}
          className="flex items-center gap-1.5 rounded-full border border-cutline/80 bg-card px-2 py-1 text-xs font-medium text-ink-soft"
        >
          <Icon
            className={`h-3.5 w-3.5 shrink-0 ${spinning ? "motion-safe:animate-spin" : ""}`}
            strokeWidth={2.2}
            aria-hidden
          />
          <span aria-hidden className="hidden max-w-[10rem] truncate md:inline">{label}</span>
          <span className="sr-only">{label}</span>
        </span>
      )}
    </span>
  );
}
