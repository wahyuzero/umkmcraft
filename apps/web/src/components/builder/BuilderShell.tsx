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
import { useState } from "react";
import Link from "next/link";
import {
  Check, CloudOff, CloudUpload, LayoutList, LoaderCircle, Plus, SlidersHorizontal, Smartphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";
import type { SaveState } from "@/lib/editor-store";
import { SectionList } from "./SectionList";
import { ModuleCatalog } from "./ModuleCatalog";
import { Inspector } from "./Inspector";
import { PhonePreview } from "./PhonePreview";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { PublishButton } from "./PublishButton";
import { AnalyticsCard } from "./AnalyticsCard";

type MobileTab = "susun" | "pratinjau" | "atur";

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
}: {
  siteId: string;
  slug: string;
  initialConfig: UmkmWebsiteConfig;
  published: boolean;
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
  const businessName = config.meta.business_name;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      {/* ===== Header rak alat (kompak di mobile) ===== */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-cutline/80 bg-paper px-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <Link href="/" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper" aria-label="Beranda UMKM Craft">
            U
          </Link>
          <div className="min-w-0 flex-1">
            <input
              value={businessName}
              onChange={(e) => useEditor.getState().setBusinessName(e.target.value)}
              className="w-full min-w-0 truncate rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-display text-base font-bold text-ink hover:border-cutline focus:border-signal focus:outline-none sm:max-w-[280px] sm:text-lg"
              aria-label="Nama usaha"
            />
            <p className="hidden px-1.5 text-[0.7rem] text-ink-soft sm:block">
              {slug}.lvh.me
              {published ? <span className="ml-2 font-semibold text-live">● live</span> : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <SaveIndicator state={saveState} lastSavedAt={lastSavedAt} />
          <ThemeSwitcher />
          <PublishButton />
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
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em] text-ink-soft">
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

/** Chip status autosave — ikon + teks; di layar sempit ikon saja. */
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
  } else if (state === "error") {
    Icon = CloudOff;
    label = "Gagal — coba simpan lagi";
  }
  const error = state === "error";
  return (
    <span
      aria-live="polite"
      title={label}
      className={`flex items-center gap-1.5 rounded-full border bg-card px-2 py-1 text-xs font-medium ${
        error ? "border-signal/40 text-signal" : "border-cutline/80 text-ink-soft"
      }`}
    >
      <Icon
        className={`h-3.5 w-3.5 shrink-0 ${spinning ? "motion-safe:animate-spin" : ""}`}
        strokeWidth={2.2}
        aria-hidden
      />
      <span className="hidden max-w-[10rem] truncate md:inline">{label}</span>
    </span>
  );
}
