/**
 * Migrasi config antar versi (SYSTEM_DESIGN §4.3).
 * Saat load: migrate(configJson, configVersion) → selalu hasilkan versi terbaru
 * sebelum render/edit. Migrasi murni + wajib punya test golden round-trip.
 */
import type { UmkmWebsiteConfig } from "./config";

export const LATEST_CONFIG_VERSION = 1;

type AnyRecord = Record<string, unknown>;

/** Tidak ada versi selain v1 — fungsi identitas sebagai template pola v1→v2. */
export function migrateV1toV1(config: unknown): UmkmWebsiteConfig {
  return config as UmkmWebsiteConfig;
}

const MIGRATIONS: Record<number, (c: unknown) => unknown> = {
  1: (c) => c,
};

export function migrate(raw: unknown, fromVersion: number): UmkmWebsiteConfig {
  let config = raw;
  let v = fromVersion;
  while (v < LATEST_CONFIG_VERSION) {
    const step = MIGRATIONS[v];
    if (!step) throw new Error(`Tidak ada jalur migrasi dari config_version ${v}`);
    config = step(config);
    v += 1;
  }
  if (v > LATEST_CONFIG_VERSION) {
    throw new Error(`config_version ${v} lebih baru dari engine (latest ${LATEST_CONFIG_VERSION})`);
  }
  return config as UmkmWebsiteConfig;
}

/** Ambil config_version dari payload mentah dengan aman. */
export function readConfigVersion(raw: unknown): number {
  if (raw && typeof raw === "object" && "meta" in (raw as AnyRecord)) {
    const meta = (raw as AnyRecord).meta;
    if (meta && typeof meta === "object" && "schema_version" in (meta as AnyRecord)) {
      const v = (meta as AnyRecord).schema_version;
      if (typeof v === "number") return v;
    }
  }
  return 1;
}
