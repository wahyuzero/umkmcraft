import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";


/** Daftar situs milik sesi ini (dashboard ringkas). */
export async function GET(req: NextRequest) {
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken) return NextResponse.json({ sites: [] });
  const sites = await store.listSites(sessionToken);
  const withDrafts = await Promise.all(
    sites.map(async (s) => {
      const versions = await store.getVersions(s.id);
      const latest = versions.at(-1);
      return {
        id: s.id,
        slug: s.slug,
        businessCategory: s.businessCategory,
        status: s.status,
        updatedAt: s.updatedAt,
        businessName: latest?.configJson.meta.business_name ?? s.slug,
      };
    }),
  );
  return NextResponse.json({ sites: withDrafts });
}
