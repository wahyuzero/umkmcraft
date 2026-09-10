/**
 * Modul channel_marketplace — COMPONENTS.md §2.
 * Grid kartu kanal jualan (2 kolom mobile, 3 sm): marka platform geometris sederhana
 * (bentuk + warna, BUKAN tiruan logo resmi), label, hint "Buka" muncul saat hover.
 * Kanal WhatsApp jadi aksi default — kartu primary penuh; kanal lain outline.
 * Link keluar target=_blank rel=noopener noreferrer. RSC murni — 0 JS client.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell, WaIcon } from "../primitives";

export type ChannelMarketplaceProps = SectionProps<"channel_marketplace">;

export const channelsDefaults: ChannelMarketplaceProps = {
  section_title: "Temukan Kami di",
  channels: [],
};

type ChannelItem = ChannelMarketplaceProps["channels"][number];
type Platform = ChannelItem["platform"];

/** Warna khas platform untuk marka + tint tile. website memakai warna tema. */
const PLATFORM_COLOR: Record<Platform, string> = {
  shopee: "#ee4d2d",
  tokopedia: "#03ac0e",
  gofood: "#ee2737",
  grabfood: "#00b14f",
  tiktok_shop: "#111827",
  lazada: "#0f146d",
  instagram: "#e1306c",
  facebook: "#1877f2",
  whatsapp: "#25d366",
  website: "var(--uc-primary)",
};

/* ---------------------------------------------------------------- */
/* Marka platform — geometris flat 2–3 bentuk, dikenali dari warna+bentuk */
/* filled: varian di atas kartu primary (ikon ikut on-primary)        */
/* ---------------------------------------------------------------- */

function PlatformMark({ platform, filled = false }: { platform: Platform; filled?: boolean }) {
  switch (platform) {
    case "shopee":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <path fill="none" stroke="#ee4d2d" strokeWidth="1.9" strokeLinecap="round" d="M8.6 8.6V7a3.4 3.4 0 0 1 6.8 0v1.6" />
          <path fill="#ee4d2d" d="M5.4 8h13.2l1.05 11.1a2 2 0 0 1-1.99 2.19H6.34a2 2 0 0 1-1.99-2.19L5.4 8z" />
        </svg>
      );
    case "tokopedia":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <path fill="#03ac0e" d="M4.6 8.3 12 4.4l7.4 3.9v1.2H4.6V8.3z" />
          <rect x="4.6" y="11" width="14.8" height="9" rx="2.2" fill="#03ac0e" opacity="0.82" />
          <rect x="11.1" y="11" width="1.8" height="9" fill="#fff" opacity="0.7" />
        </svg>
      );
    case "gofood":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#ee2737" />
          <path
            fill="none"
            stroke="#fff"
            strokeWidth="1.9"
            strokeLinecap="round"
            d="M12 10.6V19M9.2 5v3.4a2.8 2.8 0 0 0 5.6 0V5M12 5v3"
          />
        </svg>
      );
    case "grabfood":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <rect x="2.5" y="6.5" width="19" height="9" rx="3.5" fill="#00b14f" />
          <rect x="8.5" y="9" width="7" height="3.4" rx="1.4" fill="#fff" opacity="0.85" />
          <circle cx="8" cy="17.8" r="2.3" fill="#00b14f" />
          <circle cx="16" cy="17.8" r="2.3" fill="#00b14f" />
        </svg>
      );
    case "tiktok_shop":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <path
            fill="#111827"
            d="M16.6 3c.35 1.87 1.53 3.32 3.9 3.47v2.98c-1.44.14-2.79-.32-3.9-1.05v5.85c0 3.62-2.6 6.25-6.05 6.25A5.93 5.93 0 0 1 4.5 14.55c0-3.5 2.87-6.09 6.53-5.9v3.06c-.3-.05-.6-.08-.9-.06-1.63.1-2.72 1.24-2.72 2.9a2.94 2.94 0 0 0 2.95 2.95c1.75 0 2.95-1.25 2.95-3.1V3h3.3z"
          />
        </svg>
      );
    case "lazada":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <path fill="#0f146d" d="M5.8 6.5h12.4l1.2 12a2.2 2.2 0 0 1-2.19 2.4H6.79a2.2 2.2 0 0 1-2.19-2.4l1.2-12z" />
          <circle cx="12" cy="13.5" r="2.1" fill="#fff" opacity="0.92" />
        </svg>
      );
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <defs>
            <linearGradient id="uc-ig-grad" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0" stopColor="#f9ce34" />
              <stop offset="0.5" stopColor="#ee2a7b" />
              <stop offset="1" stopColor="#6228d7" />
            </linearGradient>
          </defs>
          <rect x="3" y="3" width="18" height="18" rx="5.5" fill="url(#uc-ig-grad)" />
          <circle cx="12" cy="12" r="4.2" fill="none" stroke="#fff" strokeWidth="1.8" />
          <circle cx="16.9" cy="7.1" r="1.2" fill="#fff" />
        </svg>
      );
    case "facebook":
      return (
        <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
          <circle cx="12" cy="12" r="10" fill="#1877f2" />
          <path
            fill="#fff"
            d="M15.54 15.4l.44-2.86h-2.75v-1.86c0-.78.38-1.54 1.61-1.54h1.25V6.78s-1.13-.19-2.2-.19c-2.26 0-3.73 1.37-3.73 3.84v2.11H7.63v2.86h2.53V22.3a10.1 10.1 0 0 0 3.07 0v-6.9h2.31z"
          />
        </svg>
      );
    case "whatsapp":
      return <WaIcon className={`h-7 w-7 ${filled ? "text-[var(--uc-on-primary)]" : "text-[#25d366]"}`} />;
    case "website":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.9"
          strokeLinecap="round"
          className={`h-7 w-7 ${filled ? "text-[var(--uc-on-primary)]" : "text-[var(--uc-primary)]"}`}
          aria-hidden
        >
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.6 2.3 2.6 14.7 0 17-2.6-2.3-2.6-14.7 0-17z" />
        </svg>
      );
  }
}

function ArrowIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M4 12h15" />
      <path d="M13 5.5 19.5 12 13 18.5" />
    </svg>
  );
}

/* ---------------------------------------------------------------- */
/* Modul                                                             */
/* ---------------------------------------------------------------- */

export function ChannelMarketplace({ id, props }: { id: string; props: ChannelMarketplaceProps }) {
  return (
    <SectionShell id={id}>
      <SectionHeader title={props.section_title} />
      <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
        {props.channels.map((channel) => {
          const filled = channel.platform === "whatsapp";
          const tileColor = filled
            ? "color-mix(in oklab, var(--uc-on-primary) 16%, transparent)"
            : `color-mix(in oklab, ${PLATFORM_COLOR[channel.platform]} 10%, var(--uc-surface))`;
          return (
            <li key={`${channel.platform}-${channel.label}`}>
              <a
                href={channel.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex h-full min-h-[44px] flex-col gap-3 rounded-2xl border p-4 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${
                  filled
                    ? "border-transparent bg-[var(--uc-primary)] text-[var(--uc-on-primary)] shadow-[0_4px_16px_color-mix(in_oklab,var(--uc-primary)_38%,transparent)] hover:shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--uc-primary)_55%,transparent)]"
                    : "border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[var(--uc-surface)] shadow-[0_1px_3px_color-mix(in_oklab,var(--uc-ink)_6%,transparent)] hover:shadow-[0_14px_30px_-12px_color-mix(in_oklab,var(--uc-primary)_40%,transparent)]"
                }`}
              >
                <span
                  aria-hidden
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: tileColor }}
                >
                  <PlatformMark platform={channel.platform} filled={filled} />
                </span>
                <span className="font-[family-name:var(--uc-font-heading)] text-sm font-bold leading-snug">
                  {channel.label}
                </span>
                <span
                  className={`mt-auto inline-flex items-center gap-1 text-xs font-semibold transition-colors duration-200 ease-out ${
                    filled
                      ? "text-[color-mix(in_oklab,var(--uc-on-primary)_85%,transparent)]"
                      : "text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)] group-hover:text-[var(--uc-primary)]"
                  }`}
                >
                  Buka
                  <ArrowIcon className="h-3.5 w-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </SectionShell>
  );
}
