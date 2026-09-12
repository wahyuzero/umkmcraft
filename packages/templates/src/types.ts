/**
 * Kontrak publik @umkmcraft/templates.
 * TemplateDefinition adalah SUMBER DATA statis — instantiateTemplate bekerja
 * di atas structuredClone sehingga definisi TIDAK PERNAH termutasi.
 */
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

/** Satu template referensi siap pakai (config sudah lolos UmkmWebsiteConfigSchema). */
export interface TemplateDefinition {
  /** ID stabil, format "<kategori>-v<N>" — dipakai di URL /template/[id] dan API. */
  id: string;
  /** Kategori bisnis (juga ditulis ke meta.business_category saat instantiate). */
  category: string;
  /** Nama tampil di galeri template, mis. "Warung Makan". */
  label: string;
  /** Deskripsi satu kalimat untuk kartu galeri — maksimal 140 karakter. */
  description: string;
  /** Data demo yang dipakai bila pemilik belum mengisi input. */
  demo: { businessName: string; city: string };
  /** Config lengkap siap render (theme preset ikut terdefinisi di sini). */
  config: UmkmWebsiteConfig;
}

/** Input opsional pemilik saat "Pakai Template" — semua boleh kosong. */
export interface TemplateInput {
  businessName?: string;
  whatsappNumber?: string;
  city?: string;
}

export type InstantiateResult =
  | { ok: true; config: UmkmWebsiteConfig }
  | { ok: false; reason: "unknown-template" };
