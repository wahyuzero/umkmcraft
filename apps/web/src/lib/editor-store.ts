"use client";

/**
 * Editor store (Zustand) — sumber kebenaran draft.
 * Autosave debounce 800ms → PATCH /api/sites/:id (versi DRAFT baru,
 * immutable snapshot — ADR-2).
 */
import { create } from "zustand";
import type { Section, SectionType, UmkmWebsiteConfig } from "@umkmcraft/schema";
import { getPreset } from "@umkmcraft/schema";

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
  select: (id: string | null) => void;
  updateSectionProps: (sectionId: string, key: string, value: unknown) => void;
  updateProduct: (sectionId: string, productId: string, key: string, value: unknown) => void;
  addSection: (type: SectionType, defaultProps: Record<string, unknown>) => void;
  removeSection: (id: string) => void;
  moveSection: (from: number, to: number) => void;
  applyPreset: (presetId: string) => void;
  setBusinessName: (name: string) => void;
  markPublished: () => void;
  scheduleSave: () => void;
  markSaved: (version: number) => void;
  setSaveState: (s: SaveState) => void;
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;

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

  select: (id) => set({ selectedId: id }),

  updateSectionProps: (sectionId, key, value) => {
    const { config } = get();
    set({
      saveState: "dirty",
      config: withSections(
        config,
        config.sections.map((s) =>
          s.id === sectionId ? ({ ...s, props: { ...s.props, [key]: value } } as Section) : s,
        ),
      ),
    });
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
    set({
      config: withSections(config, config.sections.filter((s) => s.id !== id)),
      selectedId: null,
      saveState: "dirty",
    });
    get().scheduleSave();
  },

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
    saveTimer = setTimeout(async () => {
      const { siteId, config } = get();
      set({ saveState: "saving" });
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
    }, 800);
  },

  markSaved: (version) => set({ saveState: "saved", saveVersion: version, lastSavedAt: Date.now() }),
  setSaveState: (s) => set({ saveState: s }),
}));
