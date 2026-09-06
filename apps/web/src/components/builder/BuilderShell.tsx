"use client";

/**
 * BuilderShell — rak alat utama editor.
 * World "Label Press": kiri lembar stiker section, tengah kemasan HP,
 * kanan inspector label. Grid lock 4px; satu sinyal amber = state aktif.
 */
import { useRef, useState } from "react";
import Link from "next/link";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { useEditor } from "@/lib/editor-store";
import { SectionList } from "./SectionList";
import { ModuleCatalog } from "./ModuleCatalog";
import { Inspector } from "./Inspector";
import { PhonePreview } from "./PhonePreview";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { PublishButton } from "./PublishButton";
import { AnalyticsCard } from "./AnalyticsCard";

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

  // Hydrate store tepat sekali sebelum interaksi (initialConfig serializable dari server)
  const hydratedRef = useRef(false);
  if (!hydratedRef.current) {
    useEditor.setState({ siteId, slug, config: initialConfig, published, selectedId: initialConfig.sections[0]?.id ?? null, saveState: "idle" });
    hydratedRef.current = true;
  }

  const config = useEditor((s) => s.config);
  const saveState = useEditor((s) => s.saveState);
  const businessName = config.meta.business_name;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-paper">
      {/* ===== Header rak alat ===== */}
      <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-cutline/80 bg-paper px-3 sm:gap-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link href="/" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper" aria-label="Beranda UMKM Craft">
            U
          </Link>
          <div className="min-w-0">
            <input
              value={businessName}
              onChange={(e) => useEditor.getState().setBusinessName(e.target.value)}
              className="w-full max-w-[120px] truncate rounded-lg border border-transparent bg-transparent px-1.5 py-0.5 font-display text-base font-bold text-ink hover:border-cutline focus:border-signal focus:outline-none sm:max-w-[280px] sm:text-lg"
              aria-label="Nama usaha"
            />
            <p className="hidden px-1.5 text-[0.7rem] text-ink-soft sm:block">
              {slug}.lvh.me
              {published ? <span className="ml-2 font-semibold text-live">● live</span> : null}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <SaveIndicator state={saveState} />
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>
          <PublishButton />
        </div>
      </header>

      {/* Tema di mobile: baris sendiri agar header tak meluber */}
      <div className="shrink-0 border-b border-cutline/60 bg-paper px-3 py-2 sm:hidden">
        <ThemeSwitcher />
      </div>

      {/* ===== Body 3 kolom ===== */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Kiri: lembar stiker */}
        <aside className="flex min-h-0 shrink-0 flex-col border-b border-cutline/80 lg:w-[300px] lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between px-4 pb-2 pt-4">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.06em] text-ink-soft">
              Susunan Halaman
            </h2>
            <span className="text-[0.7rem] tabular-nums text-ink-soft/70">
              {config.sections.length} blok
            </span>
          </div>
          <SectionList />
          <div className="p-4 pt-1">
            <button
              onClick={() => setCatalogOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-cutline px-4 py-3.5 text-sm font-bold text-ink-soft transition-colors hover:border-signal hover:bg-signal-soft/40 hover:text-signal"
            >
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M10 4v12M4 10h12" strokeLinecap="round" />
              </svg>
              Tambah Seksi
            </button>
          </div>
          <AnalyticsCard />
        </aside>

        {/* Tengah: kemasan HP */}
        <main className="flex min-h-0 min-w-0 flex-1 flex-col items-center overflow-y-auto bg-paper-deep/60 px-4 py-6">
          <PhonePreview />
        </main>

        {/* Kanan: inspector */}
        <aside className="min-h-0 shrink-0 overflow-y-auto border-t border-cutline/80 lg:w-[340px] lg:border-l lg:border-t-0">
          <Inspector />
        </aside>
      </div>

      {catalogOpen ? <ModuleCatalog onClose={() => setCatalogOpen(false)} /> : null}
    </div>
  );
}

function SaveIndicator({ state }: { state: string }) {
  const label =
    state === "saving" ? "Menyimpan…" :
    state === "saved" ? "Tersimpan ✓" :
    state === "error" ? "Gagal simpan!" :
    state === "dirty" ? "Ada perubahan…" : "";
  return (
    <span aria-live="polite" className={`hidden text-xs font-medium sm:block ${state === "error" ? "text-signal" : "text-ink-soft"}`}>
      {label}
    </span>
  );
}
