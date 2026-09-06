import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import { store } from "@/lib/server/store";
import { BuilderShell } from "@/components/builder/BuilderShell";

export const metadata = { title: "Editor" };
// Route auth per-sesi (cookies) — blocking dynamic, sesuai cacheComponents
export const instant = false;

export default async function EditorPage({ params }: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await params;
  const jar = await cookies();
  const sessionToken = jar.get("uc_session")?.value;
  if (!sessionToken || !(await store.ownsSite(sessionToken, siteId))) redirect("/start");

  const site = await store.getSite(siteId);
  if (!site) notFound();
  const versions = await store.getVersions(siteId);
  const latest = versions.at(-1);
  if (!latest) notFound();

  return (
    <BuilderShell
      siteId={siteId}
      slug={site.slug}
      initialConfig={latest.configJson}
      published={site.status === "PUBLISHED"}
    />
  );
}
