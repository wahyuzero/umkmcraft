import type { MetadataRoute } from "next";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";

/** sitemap.xml per tenant host (SYSTEM_DESIGN §11). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host);
  if (!snap?.config) return [];
  const base = `https://${host}`;
  return [
    {
      url: base,
      lastModified: new Date(snap.site.updatedAt),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
