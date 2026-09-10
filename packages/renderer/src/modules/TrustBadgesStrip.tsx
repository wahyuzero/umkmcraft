/**
 * Modul trust_badges_strip — strip kepercayaan (COMPONENTS.md §L).
 * Tiga kelompok berlabel fungsional: Pembayaran, Kurir Pengiriman, Sertifikasi.
 * Setiap item = chip ber-outline dengan glyph SVG stroke kecil (geometris,
 * BUKAN logo merek asli). Label kelompok = caption mini ink-60 di atas chip.
 * Semua warna mengalir dari token tema — tanpa palet hardcoded.
 */
import type { ReactNode } from "react";
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";

export type TrustBadgesStripProps = SectionProps<"trust_badges_strip">;

export const trustDefaults: TrustBadgesStripProps = {
  section_title: "Metode Pembayaran & Pengiriman",
  payment_methods: [],
  shipping_couriers: [],
  certifications: [],
};

type PaymentMethod = TrustBadgesStripProps["payment_methods"][number];
type Courier = TrustBadgesStripProps["shipping_couriers"][number];
type Certification = TrustBadgesStripProps["certifications"][number];

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  qris: "QRIS",
  bca: "BCA",
  mandiri: "Mandiri",
  bri: "BRI",
  bni: "BNI",
  cod: "COD",
  gopay: "GoPay",
  ovo: "OVO",
  dana: "DANA",
  shopeepay: "ShopeePay",
};

const COURIER_LABELS: Record<Courier, string> = {
  jne: "JNE",
  jnt: "J&T",
  sicepat: "SiCepat",
  paxel: "Paxel",
  gosend: "GoSend",
  antaraja: "AnterAja",
  pos: "POS",
  wahana: "Wahana",
  instant: "Instant",
};

const CERTIFICATION_LABELS: Record<Certification, string> = {
  halal_mui: "Halal MUI",
  bpom: "BPOM",
  pirt: "P-IRT",
  nib: "NIB",
  hki: "HKI",
};

/* ---------------------------------------------------------------- */
/* Glyph stroke 16px — currentColor murni, digambar bukan gambar     */
/* ---------------------------------------------------------------- */

const GLYPH_CLS = "h-4 w-4 shrink-0";

function QrGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" aria-hidden>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.2" />
      <path d="M13.5 13.5h3v3h-3zM17.5 17.5h3v3h-3z" />
    </svg>
  );
}

function BankGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="m12 3 9 5H3l9-5z" />
      <path d="M5.5 11v6M10 11v6M14 11v6M18.5 11v6" />
      <path d="M3.5 20.5h17" />
    </svg>
  );
}

function CashGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="2" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M6.2 9.5h.01M17.8 14.5h.01" strokeWidth={2.4} />
    </svg>
  );
}

function WalletGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="6.5" width="18" height="13" rx="2.2" />
      <path d="M3 10.5h18" />
      <path d="M16.4 15h1.6" strokeWidth={2.2} />
    </svg>
  );
}

function TruckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 7.5h11V16H3z" />
      <path d="M14 10h3.6l2.4 3v3h-6" />
      <circle cx="7.2" cy="17.8" r="1.9" />
      <circle cx="17" cy="17.8" r="1.9" />
    </svg>
  );
}

function ShieldCheckGlyph() {
  return (
    <svg viewBox="0 0 24 24" className={GLYPH_CLS} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M12 3 19 5.6v5.2c0 4.6-3 8.4-7 9.7-4-1.3-7-5.1-7-9.7V5.6L12 3z" />
      <path d="m8.9 11.8 2.2 2.2 4-4.4" />
    </svg>
  );
}

function PaymentGlyph({ method }: { method: PaymentMethod }) {
  switch (method) {
    case "qris":
      return <QrGlyph />;
    case "bca":
    case "mandiri":
    case "bri":
    case "bni":
      return <BankGlyph />;
    case "cod":
      return <CashGlyph />;
    case "gopay":
    case "ovo":
    case "dana":
    case "shopeepay":
      return <WalletGlyph />;
  }
}

/* ---------------------------------------------------------------- */
/* Strip — kelompok caption mini + chip outline, wrap horizontal     */
/* ---------------------------------------------------------------- */

function TrustGroup({ label, items }: { label: string; items: Array<{ key: string; text: string; glyph: ReactNode }> }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[color-mix(in_oklab,var(--uc-ink)_60%,transparent)]">
        {label}
      </h3>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li
            key={item.key}
            className="inline-flex min-h-[36px] items-center gap-2 rounded-full border border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] bg-[var(--uc-surface)] py-1.5 pl-3 pr-3.5"
          >
            <span className="text-[var(--uc-primary)]">{item.glyph}</span>
            <span className="text-sm font-bold text-[var(--uc-ink)]">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

type ReactNodeLike = import("react").ReactNode;

export function TrustBadgesStrip({ id, props }: { id: string; props: TrustBadgesStripProps }) {
  const hasAny =
    props.payment_methods.length > 0 ||
    props.shipping_couriers.length > 0 ||
    props.certifications.length > 0;
  if (!hasAny) return null;

  return (
    <SectionShell id={id} tone="wash">
      <SectionHeader title={props.section_title} />
      <div className="flex flex-col gap-6 sm:gap-7">
        {props.payment_methods.length > 0 ? (
          <TrustGroup
            label="Pembayaran"
            items={props.payment_methods.map((method) => ({
              key: method,
              text: PAYMENT_LABELS[method],
              glyph: <PaymentGlyph method={method} />,
            }))}
          />
        ) : null}
        {props.shipping_couriers.length > 0 ? (
          <TrustGroup
            label="Kurir Pengiriman"
            items={props.shipping_couriers.map((courier) => ({
              key: courier,
              text: COURIER_LABELS[courier],
              glyph: <TruckGlyph />,
            }))}
          />
        ) : null}
        {props.certifications.length > 0 ? (
          <TrustGroup
            label="Sertifikasi"
            items={props.certifications.map((cert) => ({
              key: cert,
              text: CERTIFICATION_LABELS[cert],
              glyph: <ShieldCheckGlyph />,
            }))}
          />
        ) : null}
      </div>
    </SectionShell>
  );
}
