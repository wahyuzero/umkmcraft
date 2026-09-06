import { headers } from "next/headers";
import { cacheTag } from "next/cache";
import { store, type SiteRecord } from "@/lib/server/store";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";

/**
 * Data snapshot tenant (ADR-2) — 'use cache' per host, di-revalidate saat
 * publish via revalidateTag. Page tetap dynamic (baca headers), data cached.
 */
export async function getTenantSnapshot(
  host: string,
  slugFromPath?: string,
): Promise<{ site: SiteRecord; config: UmkmWebsiteConfig | null } | null> {
  "use cache";
  const site = slugFromPath && slugFromPath !== "index"
    ? await store.getSiteBySlug(slugFromPath)
    : await store.getSiteByHost(host);

  if (!site || site.status === "DELETED") return null;

  let config: UmkmWebsiteConfig | null;
  if (site.status === "PUBLISHED" && site.publishedVersionId) {
    config = await store.getPublishedConfig(site.id);
  } else {
    // Draft TIDAK pernah bocor ke publik — hanya owner lihat via editor.
    return site.status === "SUSPENDED" ? { site, config: null } : null;
  }
  if (!config) return null;

  // Tag invalidasi
  cacheTag(`site:${site.id}`, `host:${site.slug}`);
  return { site, config };
}

export async function currentTenantHost(): Promise<string> {
  const h = await headers();
  return (h.get("x-tenant-host") ?? h.get("host") ?? "").toLowerCase().split(":")[0] ?? "";
}
