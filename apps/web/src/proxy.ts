import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts — pengganti middleware di Next 16, runtime Node.js (ADR-1).
 * Host-based routing: host builder → jalur normal; host tenant → rewrite
 * ke renderer /sites. Sekalian menerbitkan cookie sesi anonim (onboarding
 * anon-first, SYSTEM_DESIGN §5.1).
 */
const BUILDER_HOSTS = new Set([
  "umkmcraft.id",
  "www.umkmcraft.id",
  "app.umkmcraft.id",
  "dashboard.umkmcraft.id",
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
]);

function isBuilderHost(host: string): boolean {
  if (BUILDER_HOSTS.has(host)) return true;
  // preview Vercel & subdomain localhost dev (xxx.localhost / *.vercel.app)
  if (host.endsWith(".vercel.app") || host.endsWith(".localhost")) return true;
  // lvh.me & subdomainnya mengarah ke 127.0.0.1 — root lvh.me = builder
  if (host === "lvh.me") return true;
  return false;
}

const SESSION_COOKIE = "uc_session";

export function proxy(request: NextRequest) {
  const host = (request.headers.get("host") ?? "").toLowerCase().split(":")[0] ?? "";

  // Sesuikan sesi anonim untuk semua jalur builder
  const ensureSession = (res: NextResponse): NextResponse => {
    if (!request.cookies.get(SESSION_COOKIE)?.value) {
      res.cookies.set(SESSION_COOKIE, crypto.randomUUID(), {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 90,
        path: "/",
      });
    }
    return res;
  };

  if (isBuilderHost(host)) {
    return ensureSession(NextResponse.next());
  }

  // Tenant host → rewrite ke renderer
  const url = request.nextUrl.clone();
  url.pathname = `/sites${url.pathname === "/" ? "/index" : url.pathname}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("x-tenant-host", host);
  return res;
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|robots.txt|sitemap.xml|api/t).*)"],
};
