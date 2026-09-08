/**
 * Modul branch_locations_list — daftar cabang/outlet (TEMPLATE_RESEARCH §4).
 * Referensi pola: ThemeForest Porto store locator, Shopify multi-location info.
 * Tiap cabang: alamat + jam + tombol rute Google Maps + opsional WA per cabang.
 * RSC murni.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { createWhatsAppChatLink } from "@umkmcraft/utils";
import { SectionHeader, SectionShell, WaIcon } from "../primitives";

export type BranchesProps = SectionProps<"branch_locations_list">;

export const branchesDefaults: BranchesProps = {
  section_title: "Cabang Kami",
  section_subtitle: "Kunjungi outlet terdekat dari lokasi Anda.",
  branches: [
    {
      name: "Cabang Pusat",
      address: "Jl. Contoh No. 123, Kota Anda",
      hours: "Setiap hari 09.00–21.00",
      gmaps_url: "",
      whatsapp_number: undefined,
    },
  ],
};

function PinMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2.5a7 7 0 0 1 7 7c0 5-7 12-7 12s-7-7-7-12a7 7 0 0 1 7-7zm0 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
    </svg>
  );
}

function ClockMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="8.8" />
      <path d="M12 7.5V12l3.2 1.9" />
    </svg>
  );
}

export function BranchLocationsList({ id, props, businessName }: { id: string; props: BranchesProps; businessName: string }) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <ul className="grid gap-4 sm:grid-cols-2">
        {props.branches.map((branch, i) => (
          <li
            key={i}
            className="flex flex-col gap-3 rounded-2xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] p-5"
          >
            <h3 className="font-[family-name:var(--uc-font-heading)] text-[1.05rem] font-extrabold text-[var(--uc-ink)]">
              {branch.name}
            </h3>
            {branch.address ? (
              <p className="flex items-start gap-2 text-sm leading-relaxed text-[color-mix(in_oklab,var(--uc-ink)_70%,transparent)]">
                <PinMark className="mt-0.5 h-4 w-4 shrink-0 text-[var(--uc-primary)]" />
                {branch.address}
              </p>
            ) : null}
            {branch.hours ? (
              <p className="flex items-center gap-2 text-sm text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
                <ClockMark className="h-4 w-4 shrink-0 text-[var(--uc-primary)]" />
                {branch.hours}
              </p>
            ) : null}
            <div className="mt-auto flex flex-wrap gap-2 pt-1">
              {branch.gmaps_url ? (
                <a
                  href={branch.gmaps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[color-mix(in_oklab,var(--uc-primary)_30%,transparent)] px-3.5 py-2 text-xs font-bold text-[var(--uc-primary)] transition-colors hover:bg-[color-mix(in_oklab,var(--uc-primary)_8%,transparent)] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                >
                  <PinMark className="h-3.5 w-3.5" />
                  Buka Rute
                </a>
              ) : null}
              {branch.whatsapp_number ? (
                <a
                  href={createWhatsAppChatLink(branch.whatsapp_number, `Halo ${businessName} (${branch.name})! 👋`)}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--uc-primary)] px-3.5 py-2 text-xs font-bold text-[var(--uc-on-primary)] shadow-[0_2px_8px_color-mix(in_oklab,var(--uc-primary)_35%,transparent)] transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)]"
                >
                  <WaIcon className="h-3.5 w-3.5" />
                  Chat Cabang
                </a>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </SectionShell>
  );
}
