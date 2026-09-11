import { afterAll, describe, expect, it } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";

/**
 * Uji sapuan file upload yatim (store.sweepUploads) — DATA_DIR ditangkap
 * store.ts saat modul dimuat, jadi UMKMCRAFT_DATA_DIR HARUS di-set ke direktori
 * sementara SEBELUM import() dinamis di bawah (vitest berjalan dari root repo;
 * tanpa ini sapuan akan menunjuk .data/ milik dev server).
 */

const SITE_ID = "11111111-2222-3333-4444-555555555555";
const DUA_HARI = 48 * 60 * 60 * 1000;

const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), "umkmcraft-gc-"));
process.env.UMKMCRAFT_DATA_DIR = dataDir;

// Import dinamis — di sinilah DATA_DIR modul store terkunci ke env di atas
const { store } = await import("../src/lib/server/store");

/** Seed site_versions.json: satu versi PUBLISHED yang merujuk `uploads`. */
async function seedVersions(uploads: string[]) {
  const record = {
    id: "version-1",
    siteId: SITE_ID,
    versionNumber: 1,
    configVersion: 1,
    configJson: {
      meta: { business_name: "Warung Uji" },
      sections: uploads.map((u) => ({ type: "hero", props: { image_url: u } })),
    },
    status: "PUBLISHED",
    changeSource: "MANUAL",
    publishedAt: null,
    createdAt: new Date().toISOString(),
  };
  await fs.writeFile(path.join(dataDir, "site_versions.json"), JSON.stringify([record]), "utf8");
}

const uploadsDir = () => path.join(dataDir, "uploads", SITE_ID);
const ada = async (name: string) => fs.access(path.join(uploadsDir(), name)).then(() => true, () => false);

afterAll(async () => {
  await fs.rm(dataDir, { recursive: true, force: true });
});

describe("store.sweepUploads", () => {
  it("hapus yatim tua, sisakan yang dirujuk (walau tua) dan yatim segar (grace)", async () => {
    await fs.mkdir(uploadsDir(), { recursive: true });
    for (const name of ["keep.png", "orphan-old.png", "orphan-fresh.png"]) {
      await fs.writeFile(path.join(uploadsDir(), name), name);
    }
    // Backdate dua file ke 48 jam lalu — melewati grace default 24 jam
    const stale = new Date(Date.now() - DUA_HARI);
    await fs.utimes(path.join(uploadsDir(), "keep.png"), stale, stale);
    await fs.utimes(path.join(uploadsDir(), "orphan-old.png"), stale, stale);
    await seedVersions([`/uploads/${SITE_ID}/keep.png`]);

    const deleted = await store.sweepUploads();

    expect(deleted).toBe(1);
    // Dirujuk oleh config → selamat meski mtime sudah tua
    expect(await ada("keep.png")).toBe(true);
    // Yatim tapi masih dalam masa tenggang → selamat
    expect(await ada("orphan-fresh.png")).toBe(true);
    // Yatim dan sudah lewat grace → terhapus
    expect(await ada("orphan-old.png")).toBe(false);
  });

  it("graceMs = 0: yatim segar pun terhapus, yang dirujuk tetap utuh", async () => {
    const deleted = await store.sweepUploads(0);

    expect(deleted).toBe(1);
    expect(await ada("keep.png")).toBe(true);
    expect(await ada("orphan-fresh.png")).toBe(false);
  });
});
