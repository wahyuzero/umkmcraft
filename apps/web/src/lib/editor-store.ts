"use client";

/**
 * Editor store (Zustand) — sumber kebenaran draft.
 * Autosave debounce 800ms → PATCH /api/sites/:id (versi DRAFT baru,
 * immutable snapshot — ADR-2).
 */
import { create } from "zustand";
import type { Section, SectionType, UmkmWebsiteConfig } from "@umkmcraft/schema";
import { getPreset } from "@umkmcraft/schema";
import { isValidWaNumber, normalizeWaNumber } from "@umkmcraft/utils";

export type SaveState = "idle" | "dirty" | "saving" | "saved" | "error";

interface EditorState {
  siteId: string;
  slug: string;
  config: UmkmWebsiteConfig;
  selectedId: string | null;
  saveState: SaveState;
  lastSavedAt: number | null;
  saveVersion: number | null;
  published: boolean;
  /** Section terakhir yang dihapus + posisinya — untuk toast "Urungkan". */
  lastRemoved: { section: Section; index: number } | null;
  /** Naik tiap kartu Checklist Aktivasi minta terbit — PublishButton yang
   *  mendengarkan menjalankan jalur publish yang sudah teruji (scan
   *  preflight → flushSave → POST publish). Satu pintu, tanpa duplikasi. */
  publishRequestTick: number;
  requestPublish: () => void;
  select: (id: string | null) => void;
  updateSectionProps: (sectionId: string, key: string, value: unknown) => void;
  updateProduct: (sectionId: string, productId: string, key: string, value: unknown) => void;
  addSection: (type: SectionType, defaultProps: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  undoRemoveSection: () => void;
  dismissLastRemoved: () => void;
  moveSection: (from: number, to: number) => void;
  applyPreset: (presetId: string) => void;
  setBusinessName: (name: string) => void;
  markPublished: () => void;
  scheduleSave: () => void;
  /** Paksa simpanan tertunda/in-flight selesai SEKARANG (dipakai publish). */
  flushSave: () => Promise<void>;
  markSaved: (version: number) => void;
  setSaveState: (s: SaveState) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
/** Rantai eksekusi PATCH — simpanan berikutnya menunggu yang sebelumnya. */
let saveQueue: Promise<void> = Promise.resolve();

type EditorGet = () => EditorState;
type EditorSet = (partial: Partial<EditorState>) => void;

/** Badan PATCH autosave — dipecat lewat queue agar tidak saling tabrak. */
function runSave(get: EditorGet, set: EditorSet): Promise<void> {
  const { siteId, config } = get();
  set({ saveState: "saving" });
  return (async () => {
    try {
      const res = await fetch(`/api/sites/${siteId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ config }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as { versionNumber: number };
      set({ saveState: "saved", lastSavedAt: Date.now(), saveVersion: data.versionNumber });
    } catch {
      set({ saveState: "error" });
    }
  })();
}

function enqueueSave(get: EditorGet, set: EditorSet): Promise<void> {
  const p = saveQueue.then(() => runSave(get, set));
  saveQueue = p;
  return p;
}

/** Config kosong TAPI VALID — selector tidak pernah crash sebelum hydrate. */
const INITIAL_CONFIG: UmkmWebsiteConfig = {
  meta: {
    site_id: "",
    business_name: "",
    business_category: "",
    tagline: "",
    schema_version: 1,
    theme: {
      preset: "spicy_amber",
      primary_color: "#d97706",
      secondary_color: "#991b1b",
      background_color: "#fffbeb",
      font_heading: "Plus Jakarta Sans",
      font_body: "Plus Jakarta Sans",
    },
    whatsapp_number: "6280000000000",
    seo: { title: "", description: "", keywords: [] },
  },
  sections: [],
};

function newSectionId(type: SectionType, config: UmkmWebsiteConfig): string {
  const count = config.sections.filter((s) => s.type === type).length + 1;
  let id = `sec-${type}-${count}`;
  const taken = new Set(config.sections.map((s) => s.id));
  let n = count;
  while (taken.has(id)) id = `sec-${type}-${++n}`;
  return id;
}

/** Cast terkontrol: union Zod infer sulit dipertahankan lewat spread —
 *  validasi nyata terjadi di API (PATCH) dengan Zod. */
function withSections(config: UmkmWebsiteConfig, sections: unknown): UmkmWebsiteConfig {
  return { ...config, sections } as unknown as UmkmWebsiteConfig;
}

export const useEditor = create<EditorState>((set, get) => ({
  siteId: "",
  slug: "",
  config: INITIAL_CONFIG,
  selectedId: null,
  saveState: "idle",
  lastSavedAt: null,
  saveVersion: null,
  published: false,
  lastRemoved: null,
  publishRequestTick: 0,

  select: (id) => set({ selectedId: id }),

  requestPublish: () => set({ publishRequestTick: get().publishRequestTick + 1 }),

  updateSectionProps: (sectionId, key, value) => {
    const { config } = get();
    // Sinkron WA (bug aktivasi): renderer (registry.tsx) memakai
    // meta.whatsapp_number untuk SEMUA tombol pesan — hero, katalog,
    // spotlight, CTA, StickyOrderBar — BUKAN nomor contact_direct. Tanpa
    // sinkron ini, mengganti WA di contact_direct tetap meninggalkan nomor
    // demo di tombol lain dan gerbang publish terus menagih. Normalisasi
    // dulu (0/8-prefiks → 62): bila nilainya SAH setelah normalisasi
    // (WaNumberSchema strict /^62\d{8,13}$/), props DAN meta sama-sama
    // menerima bentuk kanonik — bukan raw — supaya PATCH autosave tidak
    // gagal Zod di salah satu sisi ("08…" lolos meta tapi kandas di props).
    // Bila INVALID setelah normalisasi, perilaku lama: props menerima nilai
    // asli (biar user tetap bisa mengetik), meta tak tersentuh.
    let normalized: string | null = null;
    if (key === "whatsapp_number" && typeof value === "string") {
      const target = config.sections.find((s) => s.id === sectionId);
      if (target?.type === "contact_direct") {
        const candidate = normalizeWaNumber(value);
        if (isValidWaNumber(candidate)) normalized = candidate;
      }
    }
    const propsValue = normalized ?? value;
    const sections = config.sections.map((s) =>
      s.id === sectionId ? ({ ...s, props: { ...s.props, [key]: propsValue } } as Section) : s,
    );
    let nextConfig = withSections(config, sections);
    if (normalized !== null) {
      nextConfig = {
        ...nextConfig,
        meta: { ...nextConfig.meta, whatsapp_number: normalized },
      };
    }
    set({ saveState: "dirty", config: nextConfig });
    get().scheduleSave();
  },

  updateProduct: (sectionId, productId, key, value) => {
    const { config } = get();
    set({
      saveState: "dirty",
      config: withSections(
        config,
        config.sections.map((s) => {
          if (s.id !== sectionId || s.type !== "product_catalog_wa") return s;
          return {
            ...s,
            props: {
              ...s.props,
              products: (s.props.products as Array<Record<string, unknown>>).map((p) =>
                p.id === productId ? { ...p, [key]: value } : p,
              ),
            },
          };
        }),
      ),
    });
    get().scheduleSave();
  },

  addSection: (type, defaultProps) => {
    const { config, selectedId } = get();
    const section = { id: newSectionId(type, config), type, props: defaultProps } as unknown as Section;
    const idx = selectedId ? config.sections.findIndex((s) => s.id === selectedId) + 1 : config.sections.length;
    const sections = [...config.sections];
    sections.splice(idx, 0, section);
    set({ config: withSections(config, sections), selectedId: section.id, saveState: "dirty" });
    get().scheduleSave();
  },

  removeSection: (id) => {
    const { config } = get();
    if (config.sections.length <= 1) return;
    const index = config.sections.findIndex((s) => s.id === id);
    if (index < 0) return;
    set({
      config: withSections(config, config.sections.filter((s) => s.id !== id)),
      selectedId: null,
      lastRemoved: { section: config.sections[index]!, index },
      saveState: "dirty",
    });
    get().scheduleSave();
  },

  /** Urungkan hapus terakhir: sisipkan kembali di indeks semula. */
  undoRemoveSection: () => {
    const { config, lastRemoved } = get();
    if (!lastRemoved) return;
    const sections = [...config.sections];
    const idx = Math.min(lastRemoved.index, sections.length);
    sections.splice(idx, 0, lastRemoved.section);
    set({ config: withSections(config, sections), lastRemoved: null, saveState: "dirty" });
    get().scheduleSave();
  },

  dismissLastRemoved: () => set({ lastRemoved: null }),

  moveSection: (from, to) => {
    const { config } = get();
    if (from === to || from < 0 || to < 0 || from >= config.sections.length || to >= config.sections.length) return;
    const sections = [...config.sections];
    const [moved] = sections.splice(from, 1);
    sections.splice(to, 0, moved!);
    set({ config: withSections(config, sections), saveState: "dirty" });
    get().scheduleSave();
  },

  applyPreset: (presetId) => {
    const { config } = get();
    const preset = getPreset(presetId);
    set({
      saveState: "dirty",
      config: {
        ...config,
        meta: {
          ...config.meta,
          theme: {
            ...config.meta.theme,
            preset: preset.id,
            primary_color: preset.primary,
            secondary_color: preset.secondary,
            background_color: preset.background,
          },
        },
      } as unknown as UmkmWebsiteConfig,
    });
    get().scheduleSave();
  },

  setBusinessName: (name) => {
    const { config } = get();
    set({ saveState: "dirty", config: { ...config, meta: { ...config.meta, business_name: name } } as unknown as UmkmWebsiteConfig });
    get().scheduleSave();
  },

  markPublished: () => set({ published: true }),

  scheduleSave: () => {
    if (saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      saveTimer = null;
      void enqueueSave(get, set);
    }, 800);
  },

  /**
   * Selesaikan simpanan yang tertunda (debounce menggantung) atau sedang
   * jalan, lalu tunggu sampai benar-benar selesai. Publish memakai ini —
   * bukan sleep tebak-tebakan — supaya snapshot tidak duluan dari PATCH.
   */
  flushSave: async () => {
    const state = get().saveState;
    if (saveTimer) {
      clearTimeout(saveTimer);
      saveTimer = null;
      void enqueueSave(get, set);
    } else if (state === "dirty" || state === "error") {
      // dirty tanpa timer (harusnya tak terjadi) / gagal sebelumnya → coba lagi.
      void enqueueSave(get, set);
    }
    await saveQueue;
  },

  markSaved: (version) => set({ saveState: "saved", saveVersion: version, lastSavedAt: Date.now() }),
  setSaveState: (s) => set({ saveState: s }),
}));
