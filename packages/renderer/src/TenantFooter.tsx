/**
 * Footer situs tenant — branding halus + tombol Laporkan situs (wajib).
 */
import { ReportButton } from "./client/ReportButton";
import { PageviewBeacon } from "./client/PageviewBeacon";

export function TenantFooter({ siteId, businessName }: { siteId: string; businessName: string }) {
  return (
    <footer className="border-t border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-bg)] px-5 py-8 sm:px-8">
      <div className="mx-auto flex w-full max-w-3xl flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
        <div>
          <p className="text-sm font-bold text-[var(--uc-ink)]">{businessName}</p>
          <p className="mt-0.5 text-xs text-[color-mix(in_oklab,var(--uc-ink)_45%,transparent)]">
            Dibuat gratis dengan{" "}
            <a
              href="/"
              className="font-semibold text-[var(--uc-primary)] underline-offset-4 hover:underline"
            >
              UMKM Craft
            </a>
          </p>
        </div>
        <ReportButton siteId={siteId} />
      </div>
      <PageviewBeacon siteId={siteId} path="/" />
    </footer>
  );
}
