import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";

/** robots.txt per tenant host (SYSTEM_DESIGN §11) — route handler eksplisit. */
export async function GET() {
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host);
  const base = `https://${host}`;
  const sitemapLine = snap?.config ? `Sitemap: ${base}/sitemap.xml` : "";
  const body = ["User-Agent: *", "Allow: /", sitemapLine].filter(Boolean).join("\n");
  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
