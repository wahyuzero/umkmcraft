import Link from "next/link";
import { LayoutTemplate } from "lucide-react";
import UseTemplateButton from "./UseTemplateButton";

/**
 * TemplatePreviewBanner — pita fixed-bottom untuk /template/[id], pola sama
 * dengan DraftPreviewBanner di sites/[...path]/page.tsx (fixed inset-x-0
 * bottom-0, z-30, bg-ink agar terbaca di tema tenant mana pun). Halaman
 * pratinjau TIDAK merender TenantFooter/StickyOrderBar/ReportButton —
 * banner ini satu-satunya lapisan builder di atas situs demo.
 *
 * Berbeda dari pratinjau draf (yang punya "Sunting"), pintu keluarnya:
 * pakai templatenya (UseTemplateButton → /editor/[siteId]) atau kembali
 * ke galeri. errorClassName terang karena banner di atas latar gelap.
 */
export default function TemplatePreviewBanner({ templateId }: { templateId: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 bg-ink px-4 py-2.5 text-card">
      <div className="mx-auto flex min-h-[44px] max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <LayoutTemplate aria-hidden className="h-4 w-4 shrink-0 text-signal-soft" />
          <p className="text-sm font-bold">
            Ini contoh template — masih pakai data demo. Pakai untuk bisnismu, kakak?
          </p>
        </div>
        <div className="flex items-center gap-2">
          <UseTemplateButton templateId={templateId} errorClassName="text-signal-soft" />
          <Link
            href="/template"
            className="inline-flex min-h-[44px] items-center rounded-xl border border-card/40 px-3.5 py-2 text-xs font-bold text-card transition-colors duration-200 hover:bg-card/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-card"
          >
            Kembali ke galeri
          </Link>
        </div>
      </div>
    </div>
  );
}
