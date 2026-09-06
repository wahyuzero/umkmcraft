import { UmkmWebsiteConfigSchema, type UmkmWebsiteConfig } from "./v1/config";
import { THEME_PRESETS, getPreset, guessPresetForCategory, DEFAULT_PRESET, type ThemePreset } from "./v1/presets";
import { migrate, readConfigVersion, LATEST_CONFIG_VERSION } from "./v1/migrate";

export * from "./v1/config";
export { THEME_PRESETS, getPreset, guessPresetForCategory, DEFAULT_PRESET };
export type { ThemePreset };
export { migrate, readConfigVersion, LATEST_CONFIG_VERSION };

/**
 * Parse + migrasi + validasi satu pintu. Gagal → kembalikan error terstruktur
 * (issues Zod) supaya AI repair loop dan UI bisa menampilkan pesan jelas.
 */
export function parseUmkmConfig(raw: unknown):
  | { ok: true; config: UmkmWebsiteConfig }
  | { ok: false; issues: Array<{ path: string; message: string }> } {
  const migrated = migrate(raw, readConfigVersion(raw));
  const result = UmkmWebsiteConfigSchema.safeParse(migrated);
  if (result.success) return { ok: true, config: result.data };
  return {
    ok: false,
    issues: result.error.issues.map((i) => ({
      path: i.path.map(String).join(".") || "(root)",
      message: i.message,
    })),
  };
}
