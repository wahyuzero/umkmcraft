/**
 * File-backed repository (MVP) — mengimplementasikan kontrak data
 * SYSTEM_DESIGN §4 dengan penyimpanan JSON di bawah .data/.
 * Kontrak database produksi (Postgres + Prisma 7) tersedia di
 * apps/web/prisma/schema.prisma — interface di file ini sengaja dibuat
 * 1:1 supaya swap ke Prisma hanya menyentuh file ini.
 *
 * Immutable snapshot (ADR-2): draft dan published dipisah total.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

const DATA_DIR = process.env.UMKMCRAFT_DATA_DIR
  ? path.resolve(process.env.UMKMCRAFT_DATA_DIR)
  : path.resolve(process.cwd(), ".data");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

async function readJson<T>(file: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(file, "utf8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(file: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(file));
  await fs.writeFile(file, JSON.stringify(data, null, 2), "utf8");
}

/* ------------------------------------------------------------------ */
/* Tipe domain (mirror Prisma §4.1)                                    */
/* ------------------------------------------------------------------ */

export type SiteStatus = "DRAFT" | "PUBLISHED" | "SUSPENDED" | "DELETED";
export type VersionStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";
export type ChangeSource = "AI_GENERATION" | "MANUAL" | "AI_EDIT";

export interface SiteRecord {
  id: string;
  ownerId: string;
  slug: string;
  businessCategory: string;
  status: SiteStatus;
  publishedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SiteVersionRecord {
  id: string;
  siteId: string;
  versionNumber: number;
  configVersion: number;
  configJson: UmkmWebsiteConfig;
  status: VersionStatus;
  changeSource: ChangeSource;
  publishedAt: string | null;
  createdAt: string;
}

export interface AnalyticsEventRecord {
  id: string;
  siteId: string;
  type: "PAGEVIEW" | "WA_CLICK" | "WA_PRODUCT_CLICK" | "OUTBOUND";
  productId?: string;
  path?: string;
  ref?: string;
  ts: string;
}

export interface AbuseReportRecord {
  id: string;
  siteId: string;
  reason: "PHISHING" | "IMPERSONATION" | "SCAM" | "ILLEGAL" | "OTHER";
  detail?: string;
  status: "OPEN" | "REVIEWING" | "ACTIONED" | "DISMISSED";
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Repository                                                          */
/* ------------------------------------------------------------------ */

const sitesFile = () => path.join(DATA_DIR, "sites.json");
const versionsFile = () => path.join(DATA_DIR, "site_versions.json");
const eventsFile = (siteId: string) => path.join(DATA_DIR, "events", `${siteId}.jsonl`);
const reportsFile = () => path.join(DATA_DIR, "abuse_reports.json");

/**
 * Batas riwayat draf per situs (ADR-2: immutable versions, pruned). Setiap
 * autosave PATCH membuat satu snapshot DRAFT, dan tidak ada fitur yang membaca
 * histori draf lama — tanpa batas, draf menumpuk tanpa guna. Yang disisakan:
 * MAX_DRAFT_VERSIONS draf terbaru; versi PUBLISHED/ARCHIVED tidak pernah ikut
 * dihapus oleh pemangkasan ini.
 */
const MAX_DRAFT_VERSIONS = 10;

export const store = {
  /* ---- sites ---- */
  async listSites(ownerId: string): Promise<SiteRecord[]> {
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    return sites.filter((s) => s.ownerId === ownerId && s.status !== "DELETED");
  },

  async getSite(id: string): Promise<SiteRecord | null> {
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    return sites.find((s) => s.id === id) ?? null;
  },

  async getSiteBySlug(slug: string): Promise<SiteRecord | null> {
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    return sites.find((s) => s.slug === slug && s.status !== "DELETED") ?? null;
  },

  async getSiteByHost(host: string): Promise<SiteRecord | null> {
    const slug = host.split(".")[0]?.toLowerCase();
    if (!slug) return null;
    const bySlug = await this.getSiteBySlug(slug);
    if (bySlug && bySlug.status !== "DRAFT") return bySlug;
    // custom domain: cari hostname exact
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    const domains = await readJson<Array<{ hostname: string; siteId: string }>>(path.join(DATA_DIR, "domains.json"), []);
    const d = domains.find((x) => x.hostname === host.toLowerCase());
    if (d) return sites.find((s) => s.id === d.siteId && s.status !== "DELETED") ?? null;
    return bySlug;
  },

  async createSite(input: {
    ownerId: string;
    slug: string;
    businessCategory: string;
    config: UmkmWebsiteConfig;
    changeSource?: ChangeSource;
  }): Promise<{ site: SiteRecord; version: SiteVersionRecord }> {
    const now = new Date().toISOString();
    // Unikkan slug (Oracle #3): bentrok → suffix pendek deterministic
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    let slug = input.slug;
    let n = 2;
    while (sites.some((s) => s.slug === slug && s.status !== "DELETED")) {
      slug = `${input.slug}-${n}`.slice(0, 62);
      n += 1;
    }
    const site: SiteRecord = {
      id: randomUUID(),
      ownerId: input.ownerId,
      slug,
      businessCategory: input.businessCategory,
      status: "DRAFT",
      publishedVersionId: null,
      createdAt: now,
      updatedAt: now,
    };
    const version: SiteVersionRecord = {
      id: randomUUID(),
      siteId: site.id,
      versionNumber: 1,
      configVersion: input.config.meta.schema_version ?? 1,
      configJson: input.config,
      status: "DRAFT",
      changeSource: input.changeSource ?? "MANUAL",
      publishedAt: null,
      createdAt: now,
    };
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    versions.push(version);
    await writeJson(versionsFile(), versions);
    sites.push(site);
    await writeJson(sitesFile(), sites);
    return { site, version };
  },

  /* ---- versions ---- */
  async getVersions(siteId: string): Promise<SiteVersionRecord[]> {
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    return versions.filter((v) => v.siteId === siteId);
  },

  async getVersion(id: string): Promise<SiteVersionRecord | null> {
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    return versions.find((v) => v.id === id) ?? null;
  },

  /**
   * Versi TERBARU sebuah situs (draf maupun published) — dipakai halaman yang
   * hanya butuh snapshot terkini (nama usaha, status draf) supaya tidak perlu
   * memuat configJson seluruh histori versi.
   */
  async getLatestVersion(siteId: string): Promise<SiteVersionRecord | null> {
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    return versions.reduce<SiteVersionRecord | null>(
      (latest, v) =>
        v.siteId === siteId && (!latest || v.versionNumber > latest.versionNumber) ? v : latest,
      null,
    );
  },

  /** Autosave draft: selalu buat versi DRAFT baru dari config terbaru. */
  async saveDraft(
    siteId: string,
    config: UmkmWebsiteConfig,
    changeSource: ChangeSource = "MANUAL",
  ): Promise<SiteVersionRecord> {
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    const siteVersions = versions.filter((v) => v.siteId === siteId);
    const nextNumber = siteVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0) + 1;
    const version: SiteVersionRecord = {
      id: randomUUID(),
      siteId,
      versionNumber: nextNumber,
      configVersion: config.meta.schema_version ?? 1,
      configJson: config,
      status: "DRAFT",
      changeSource,
      publishedAt: null,
      createdAt: new Date().toISOString(),
    };
    versions.push(version);
    // Cap draf (ADR-2, immutable versions + pruned drafts): autosave membuat
    // satu snapshot per PATCH — sisakan MAX_DRAFT_VERSIONS draf terbaru per
    // situs dan hapus sisanya. Versi PUBLISHED/ARCHIVED tidak pernah disentuh.
    const drafts = versions
      .filter((v) => v.siteId === siteId && v.status === "DRAFT")
      .sort((a, b) => a.versionNumber - b.versionNumber);
    let persisted = versions;
    if (drafts.length > MAX_DRAFT_VERSIONS) {
      const stale = new Set(
        drafts.slice(0, drafts.length - MAX_DRAFT_VERSIONS).map((v) => v.id),
      );
      persisted = versions.filter((v) => !stale.has(v.id));
    }
    await writeJson(versionsFile(), persisted);

    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      site.updatedAt = new Date().toISOString();
      await writeJson(sitesFile(), sites);
    }
    return version;
  },

  /**
   * Publish = transaksi atomik konseptual (ADR-2): tandai versi PUBLISHED,
   * arsipkan versi published lama, pindahkan pointer tunggal.
   * Sebelum publish dipanggil, versi draft harus sudah disimpan.
   */
  async publish(siteId: string, versionId: string): Promise<SiteRecord | null> {
    const versions = await readJson<SiteVersionRecord[]>(versionsFile(), []);
    const target = versions.find((v) => v.id === versionId && v.siteId === siteId);
    if (!target) return null;
    const now = new Date().toISOString();
    for (const v of versions) {
      if (v.siteId !== siteId) continue;
      if (v.id === versionId) {
        v.status = "PUBLISHED";
        v.publishedAt = now;
      } else if (v.status === "PUBLISHED") {
        v.status = "ARCHIVED";
      }
    }
    await writeJson(versionsFile(), versions);

    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    const site = sites.find((s) => s.id === siteId);
    if (!site) return null;
    site.publishedVersionId = versionId;
    site.status = "PUBLISHED";
    site.updatedAt = now;
    await writeJson(sitesFile(), sites);
    return site;
  },

  async setSiteStatus(siteId: string, status: SiteStatus): Promise<void> {
    const sites = await readJson<SiteRecord[]>(sitesFile(), []);
    const site = sites.find((s) => s.id === siteId);
    if (site) {
      site.status = status;
      site.updatedAt = new Date().toISOString();
      await writeJson(sitesFile(), sites);
    }
  },

  /** Ambil config yang sedang LIVE (published snapshot). */
  async getPublishedConfig(siteId: string): Promise<UmkmWebsiteConfig | null> {
    const site = await this.getSite(siteId);
    if (!site?.publishedVersionId) return null;
    const version = await this.getVersion(site.publishedVersionId);
    return version?.configJson ?? null;
  },

  /* ---- analytics ---- */
  async appendEvent(event: AnalyticsEventRecord): Promise<void> {
    // siteId dipakai sebagai nama file — validasi ketat anti path-traversal (Oracle #4)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(event.siteId)) return;
    const file = eventsFile(event.siteId);
    await ensureDir(path.dirname(file));
    await fs.appendFile(file, `${JSON.stringify(event)}\n`, "utf8");
  },

  async readEvents(siteId: string, limit = 5000): Promise<AnalyticsEventRecord[]> {
    try {
      const raw = await fs.readFile(eventsFile(siteId), "utf8");
      const lines = raw.trim().split("\n").filter(Boolean);
      return lines.slice(-limit).map((l) => JSON.parse(l) as AnalyticsEventRecord);
    } catch {
      return [];
    }
  },

  /* ---- abuse reports ---- */
  async addAbuseReport(report: AbuseReportRecord): Promise<void> {
    const reports = await readJson<AbuseReportRecord[]>(reportsFile(), []);
    reports.push(report);
    await writeJson(reportsFile(), reports);
  },

  /* ---- anonymous ownership (MVP; Auth.js v5 di Fase produksi) ---- */
  async bindOwner(sessionToken: string, siteId: string): Promise<void> {
    const file = path.join(DATA_DIR, "sessions.json");
    const map = await readJson<Record<string, string[]>>(file, {});
    const list = map[sessionToken] ?? [];
    if (!list.includes(siteId)) list.push(siteId);
    map[sessionToken] = list;
    await writeJson(file, map);
  },

  async ownsSite(sessionToken: string, siteId: string): Promise<boolean> {
    const map = await readJson<Record<string, string[]>>(path.join(DATA_DIR, "sessions.json"), {});
    return (map[sessionToken] ?? []).includes(siteId);
  },
};
