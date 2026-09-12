import { afterAll, describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { Section } from "@umkmcraft/schema";
import { checkSlug } from "@umkmcraft/utils";

/**
 * Uji createSiteFromTemplate — inti POST /api/sites/from-template tanpa HTTP.
 * UMKMCRAFT_DATA_DIR HARUS dipasang SEBELUM import dinamis: store membaca env
 * itu sekali di module load (DATA_DIR terkunci), jadi import statis akan
 * menunjuk .data/ milik dev server (pola store-versions.test.ts:22-25).
 */

// Kunci DATA_DIR sebelum store & create-from-template dimuat.
const dataDir = mkdtempSync(path.join(tmpdir(), "umkm-from-template-"));
process.env.UMKMCRAFT_DATA_DIR = dataDir;
const { store } = await import("../src/lib/server/store");
const { createSiteFromTemplate } = await import("../src/lib/server/create-from-template");
const { parseUmkmConfig } = await import("@umkmcraft/schema");

afterAll(async () => {
  await rm(dataDir, { recursive: true, force: true });
});

type ContactSection = Extract<Section, { type: "contact_direct" }>;

describe("createSiteFromTemplate", () => {
  it("create ok → site DRAFT, versionNumber 1 changeSource MANUAL, ownsSite true", async () => {
    const token = "token-create-ok";
    const result = await createSiteFromTemplate({ templateId: "warung-makan-v1" }, token);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const site = await store.getSite(result.siteId);
    expect(site?.status).toBe("DRAFT");
    expect(site?.businessCategory).toBe("kuliner");

    const versions = await store.getVersions(result.siteId);
    expect(versions).toHaveLength(1);
    expect(versions[0]?.versionNumber).toBe(1);
    expect(versions[0]?.status).toBe("DRAFT");
    expect(versions[0]?.changeSource).toBe("MANUAL");

    expect(await store.ownsSite(token, result.siteId)).toBe(true);
  });

  it("businessName 'Kedai Kopi Enak' → slug meta & site mengikuti nama", async () => {
    const result = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", businessName: "Kedai Kopi Enak" },
      "token-slug",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.slug).toBe("kedai-kopi-enak");

    const site = await store.getSite(result.siteId);
    expect(site?.slug).toBe("kedai-kopi-enak");
    const versions = await store.getVersions(result.siteId);
    expect(versions[0]?.configJson.meta.business_name).toBe("Kedai Kopi Enak");
    expect(versions[0]?.configJson.meta.site_id).toBe("kedai-kopi-enak");
  });

  it("whatsappNumber kustom dinormalisasi masuk meta & contact_direct", async () => {
    const result = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", whatsappNumber: "081234567890" },
      "token-wa",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const config = (await store.getVersions(result.siteId))[0]?.configJson;
    expect(config?.meta.whatsapp_number).toBe("6281234567890");
    const contact = config?.sections.find(
      (s): s is ContactSection => s.type === "contact_direct",
    );
    expect(contact?.props.whatsapp_number).toBe("6281234567890");
  });

  it("templateId 'ngasal' → ok:false reason unknown-template, tak ada site milik token", async () => {
    const result = await createSiteFromTemplate({ templateId: "ngasal" }, "token-ngasal");

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("unknown-template");
    // Tidak ada site baru yang ter-bind ke token pemanggil.
    expect(await store.listSites("token-ngasal")).toHaveLength(0);
  });

  it("dua create berurutan → siteId beda dan slug tidak tabrak", async () => {
    const a = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", businessName: "Warung Kembar" },
      "token-dua-a",
    );
    const b = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", businessName: "Warung Kembar" },
      "token-dua-b",
    );

    expect(a.ok && b.ok).toBe(true);
    if (!a.ok || !b.ok) return;
    expect(a.siteId).not.toBe(b.siteId);
    expect(a.slug).not.toBe(b.slug); // store men-suffix slug yang bentrok
    expect(a.slug).toBe("warung-kembar");
    expect(b.slug).toBe("warung-kembar-2");
  });

  it("config hasil create lolos parseUmkmConfig (kontrak skema penuh)", async () => {
    const result = await createSiteFromTemplate(
      {
        templateId: "warung-makan-v1",
        businessName: "Warung Validasi",
        whatsappNumber: "628123456789",
        city: "Surabaya",
      },
      "token-parse",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const versions = await store.getVersions(result.siteId);
    const parsed = parseUmkmConfig(versions[0]?.configJson);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.config.meta.business_name).toBe("Warung Validasi");
    expect(parsed.config.meta.whatsapp_number).toBe("628123456789");
  });

  it("businessName 'Tokopedia' (reserved) → create sukses, slug di-regenerate bukan 'tokopedia'", async () => {
    // checkSlug di publish/route.ts menolak slug reserved (422) — create dari
    // template WAJIB regenerate slug agar draf tetap bisa terbit.
    const result = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", businessName: "Tokopedia" },
      "token-reserved",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.slug).not.toBe("tokopedia"); // reserved → tak boleh jadi slug tenant
    expect(result.slug).toBe("tokopedia-usaha"); // suffix dari safeSlugFromName
    expect(checkSlug(result.slug).ok).toBe(true); // lolos kontrak publish

    const config = (await store.getVersions(result.siteId))[0]?.configJson;
    // Slug tersimpan = slug hasil create (bukan "tokopedia").
    expect(config?.meta.site_id).toBe(result.slug);
    // Nama tampil tetap milik pengguna — anti-phishing hanya untuk slug tenant.
    expect(config?.meta.business_name).toBe("Tokopedia");
  });

  it("businessName 'ab' (slugify <3 char) → tetap sukses dengan slug valid regex", async () => {
    // Tanpa perlindungan, meta.site_id "ab" gagal regex MetaSchema (min 3
    // char) — parse internal instantiateTemplate melempar → unhandled 500.
    const result = await createSiteFromTemplate(
      { templateId: "warung-makan-v1", businessName: "ab" },
      "token-pendek",
    );

    expect(result.ok).toBe(true); // bukan 500 / throw
    if (!result.ok) return;
    expect(result.slug).not.toBe("ab");
    expect(checkSlug(result.slug).ok).toBe(true);
    expect(result.slug).toBe("ab-usaha"); // nama + " usaha" → slug internal valid

    const config = (await store.getVersions(result.siteId))[0]?.configJson;
    expect(config?.meta.site_id).toBe(result.slug);
    // Site benar-benar terbuat & ter-bind (bukan gagal diam-diam).
    expect((await store.getSite(result.siteId))?.status).toBe("DRAFT");
    expect(await store.ownsSite("token-pendek", result.siteId)).toBe(true);
  });

  it("templateId ber-spasi ' warung-makan-v1 ' → tetap ditemukan (di-trim di lib)", async () => {
    // Route juga men-trim body.templateId sebelum memanggil lib; lib sendiri
    // men-trim lagi supaya pemanggil non-route tak kena 404 palsu.
    const result = await createSiteFromTemplate(
      { templateId: "  warung-makan-v1  " },
      "token-spasi",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(await store.ownsSite("token-spasi", result.siteId)).toBe(true);
  });
});
