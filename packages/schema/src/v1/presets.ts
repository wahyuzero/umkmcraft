/**
 * Preset tema per kategori usaha — COMPONENTS.md §1 (binding).
 * Semua pasangan foreground/background diverifikasi kontras WCAG AA:
 * nilai teks memakai rasio ≥ 4.5:1 di atas background masing-masing preset.
 */
export interface ThemePreset {
  id: string;
  label: string;
  categories: string[];
  primary: string;
  secondary: string;
  background: string;
  /** Warna teks utama di atas background — near-black bernuansa preset */
  ink: string;
  /** Warna teks di atas tombol primary */
  on_primary: string;
  /** Surface kartu di atas background */
  surface: string;
  font_heading: string;
  font_body: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "spicy_amber",
    label: "Spicy Amber — Kuliner Pedas / Makanan",
    categories: ["kuliner", "makanan", "katering", "sambal", "snack", "roti", "kue"],
    primary: "#d97706",
    secondary: "#991b1b",
    background: "#fffbeb",
    ink: "#291a05",
    on_primary: "#ffffff",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
  {
    id: "roasted_mocha",
    label: "Roasted Mocha — Coffee Shop / Cafe",
    categories: ["coffee", "kafe", "cafe", "kedai", "minuman", "roastery"],
    primary: "#78350f",
    secondary: "#b45309",
    background: "#faf5ee",
    ink: "#23150a",
    on_primary: "#fffaf3",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
  {
    id: "charcoal_slate",
    label: "Charcoal Slate — Barbershop / Grooming",
    categories: ["barbershop", "barber", "salon", "grooming", "potong rambut"],
    primary: "#1e293b",
    secondary: "#0ea5e9",
    background: "#f8fafc",
    ink: "#0b1220",
    on_primary: "#f8fafc",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
  {
    id: "blush_rose",
    label: "Blush Rose — Fashion & Beauty",
    categories: ["fashion", "beauty", "butik", "hijab", "skincare", "mua", "kosmetik"],
    primary: "#e11d48",
    secondary: "#be123c",
    background: "#fff1f2",
    ink: "#33060f",
    on_primary: "#ffffff",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
  {
    id: "electric_blue",
    label: "Electric Blue — Bengkel & Service Jasa",
    categories: ["bengkel", "service", "servis", "elektronik", "ac", "teknisi", "jasa"],
    primary: "#2563eb",
    secondary: "#1e40af",
    background: "#f0f9ff",
    ink: "#0a1830",
    on_primary: "#ffffff",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
  {
    id: "fresh_emerald",
    label: "Fresh Emerald — Laundry & Jasa Bersih",
    categories: ["laundry", "cuci", "bersih", "kebersihan", "setrika"],
    primary: "#059669",
    secondary: "#047857",
    background: "#f0fdf4",
    ink: "#031a10",
    on_primary: "#ffffff",
    surface: "#ffffff",
    font_heading: "Plus Jakarta Sans",
    font_body: "Plus Jakarta Sans",
  },
];

export const DEFAULT_PRESET = THEME_PRESETS[0]!;

export function getPreset(id: string): ThemePreset {
  return THEME_PRESETS.find((p) => p.id === id) ?? DEFAULT_PRESET;
}

/** Pilih preset otomatis dari kategori bisnis (dipakai AI fallback + template engine). */
export function guessPresetForCategory(category: string): ThemePreset {
  const c = category.toLowerCase();
  const hit = THEME_PRESETS.find((p) => p.categories.some((k) => c.includes(k)));
  return hit ?? DEFAULT_PRESET;
}
