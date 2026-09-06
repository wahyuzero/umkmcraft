import { cookies } from "next/headers";
import { store } from "@/lib/server/store";
import { BuilderShell } from "@/components/builder/BuilderShell";
import { AccessDenied } from "@/components/builder/AccessDenied";

export const metadata = { title: "Editor" };
// Route auth per-sesi (cookies) — blocking dynamic, sesuai cacheComponents
export const instant = false;

export default async function EditorPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const jar = await cookies();
  const sessionToken = jar.get("uc_session")?.value;
  const authorized = Boolean(sessionToken && (await store.ownsSite(sessionToken, siteId)));

  const site = authorized ? await store.getSite(siteId) : null;
  if (!authorized || !site) return <AccessDenied />;

  const versions = await store.getVersions(siteId);
  const latest = versions.at(-1);
  if (!latest) return <AccessDenied />;

  return (
    <BuilderShell
      siteId={siteId}
      slug={site.slug}
      initialConfig={latest.configJson}
      published={site.status === "PUBLISHED"}
    />
  );
}
