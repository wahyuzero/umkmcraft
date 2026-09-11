import { afterAll, describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

/**
 * Uji repository versi (riwayat draf) — store file-backed di bawah DATA_DIR
 * sementara (mkdtemp). UMKMCRAFT_DATA_DIR HARUS dipasang SEBELUM import
 * dinamis: store membaca env itu sekali di module load (DATA_DIR terkunci),
 * jadi import statis akan menunjuk .data/ milik dev server.
 *
 * Kontrak (ADR-2, immutable versions + pruned drafts):
 * - saveDraft selalu DRAFT baru dengan versionNumber max+1 per situs;
 * - DRAFT dipangkas ke 10 terbaru; PUBLISHED/ARCHIVED tidak pernah ikut;
 * - getLatestVersion = versionNumber tertinggi;
 * - pulihkan versi lama == saveDraft(configJson lama) → DRAFT baru, config
 *   identik, draf lama tetap ada (non-destruktif).
 */

// Kunci DATA_DIR sebelum store dimuat — urutan ini adalah inti dari file uji ini.
const dataDir = await mkdtemp(path.join(tmpdir(), "umkm-store-versions-"));
process.env.UMKMCRAFT_DATA_DIR = dataDir;
const { store } = await import("../src/lib/server/store");

// Sapu direktori sementara setelah semua uji selesai (mirror uploads-gc.test.ts).
afterAll(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

/** Config sah minimal (mirror INITIAL_CONFIG editor-store) dengan nama beda. */
function cfg(businessName: string): UmkmWebsiteConfig {
  return {
    meta: {
      site_id: "store-versions-test",
      business_name: businessName,
      business_category: "kuliner",
      tagline: "Rasa rumahan buat dagang online",
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
}

/** id situs dari uji pemangkasan — dipakai uji getLatestVersion (uji berjalan serial). */
let sitePrune = "";

describe("store — riwayat versi (site_versions.json)", () => {
  it("saveDraft menaikkan versionNumber berurutan per situs", async () => {
    const siteId = randomUUID();
    const v1 = await store.saveDraft(siteId, cfg("Warung Pertama"));
    const v2 = await store.saveDraft(siteId, cfg("Warung Revisi"));

    expect(v1.versionNumber).toBe(1);
    expect(v1.status).toBe("DRAFT");
    expect(v2.versionNumber).toBe(2);
    expect(v2.status).toBe("DRAFT");
    // Situs lain tidak ikut terangkat nomornya.
    const other = await store.saveDraft(randomUUID(), cfg("Warung Sebelah"));
    expect(other.versionNumber).toBe(1);
  });

  it("saveDraft memangkas DRAFT ke 10; PUBLISHED/ARCHIVED tidak tersentuh", async () => {
    const { site, version } = await store.createSite({
      ownerId: "owner-prune",
      slug: `prune-${randomUUID().slice(0, 8)}`,
      businessCategory: "kuliner",
      config: cfg("Dagang Prune"),
    });
    sitePrune = site.id;
    // v1 terbit, lalu draf v2 terbit juga → v1 otomatis menjadi ARCHIVED.
    await store.publish(site.id, version.id);
    const v2 = await store.saveDraft(site.id, cfg("Dagang Prune — draf terbit"));
    await store.publish(site.id, v2.id);

    // 11 autosave setelahnya → 11 DRAFT (v3..v13), hanya 10 terbaru yang selamat.
    for (let i = 0; i < 11; i++) {
      await store.saveDraft(site.id, cfg(`Dagang Prune — draf ${i + 1}`));
    }

    const versions = await store.getVersions(site.id);
    const drafts = versions.filter((v) => v.status === "DRAFT");
    expect(drafts).toHaveLength(10);
    expect(versions.filter((v) => v.status === "PUBLISHED")).toHaveLength(1);
    expect(versions.filter((v) => v.status === "ARCHIVED")).toHaveLength(1);
    // Draft tertua (v3) yang terpangkas; v13 termuda masih ada.
    expect(drafts.some((v) => v.versionNumber === 3)).toBe(false);
    expect(drafts.some((v) => v.versionNumber === 13)).toBe(true);
  });

  it("getLatestVersion mengembalikan versionNumber tertinggi", async () => {
    const latest = await store.getLatestVersion(sitePrune);
    expect(latest?.versionNumber).toBe(13);
    expect(latest?.status).toBe("DRAFT");
    // Versi terbit yang lebih lama bukan "terbaru" walau statusnya PUBLISHED.
    expect(latest?.configJson.meta.business_name).toBe("Dagang Prune — draf 11");
  });

  it("semantik pulihkan: saveDraft(config lama) → DRAFT baru ber-config identik", async () => {
    const { site, version } = await store.createSite({
      ownerId: "owner-restore",
      slug: `restore-${randomUUID().slice(0, 8)}`,
      businessCategory: "kuliner",
      config: cfg("Kue Bu Sri"),
    });
    await store.saveDraft(site.id, cfg("Kue Bu Sri — eksperimen gagal"));

    const oldConfig = version.configJson; // config v1 yang mau dipulihkan
    const restored = await store.saveDraft(site.id, oldConfig, "MANUAL");

    expect(restored.status).toBe("DRAFT");
    expect(restored.versionNumber).toBe(3);
    expect(restored.configJson).toEqual(oldConfig);
    // Non-destruktif: v1 masih tercatat di riwayat.
    const versions = await store.getVersions(site.id);
    expect(versions).toHaveLength(3);
    expect(versions.some((v) => v.versionNumber === 1 && v.configJson.meta.business_name === "Kue Bu Sri")).toBe(true);
  });
});
