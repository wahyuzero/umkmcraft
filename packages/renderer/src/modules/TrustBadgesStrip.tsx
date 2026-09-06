/**
 * Modul trust_badges_strip — strip kepercayaan (COMPONENTS.md §L).
 * Tiga kelompok berlabel: Pembayaran, Kurir Pengiriman, Sertifikasi.
 * Setiap item: mark SVG geometris datar (abstrak, BUKAN logo merek asli) + label.
 * Palet per kelompok: bayar slate/indigo, kurir oranye, sertifikasi hijau.
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
/* Mark geometris — flat 1-2 warna, fill currentColor               */
/* ---------------------------------------------------------------- */

function QrisMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10 0h2v2h-2v-2zm4 0h2v2h-2v-2zm-4 4h2v2h-2v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2z" />
    </svg>
  );
}

function BankMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M12 2.6 21.4 8H2.6L12 2.6z" />
      <rect x="4" y="9.8" width="2.5" height="7.2" />
      <rect x="8.5" y="9.8" width="2.5" height="7.2" />
      <rect x="13" y="9.8" width="2.5" height="7.2" />
      <rect x="17.5" y="9.8" width="2.5" height="7.2" />
      <rect x="2.8" y="18.6" width="18.4" height="2.4" rx="0.9" />
    </svg>
  );
}

function CashMark() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      aria-hidden
    >
      <rect x="2.8" y="6.2" width="18.4" height="11.6" rx="2" />
      <circle cx="12" cy="12" r="3.3" />
      <path d="M6.3 9.6h.01M17.7 14.4h.01" strokeWidth={2.4} />
    </svg>
  );
}

function WalletMark({ letter }: { letter: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <text
        x="12"
        y="12.4"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11.5"
        fontWeight="800"
        fill="#ffffff"
      >
        {letter}
      </text>
    </svg>
  );
}

function TruckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
      <path d="M2.5 6.8c0-.72.58-1.3 1.3-1.3h9.4c.72 0 1.3.58 1.3 1.3v8.7H2.5V6.8z" />
      <path d="M15.5 9h2.9c.5 0 .97.24 1.26.65l1.65 2.3c.12.19.19.42.19.65v2.9h-6V9z" />
      <circle cx="6.6" cy="17.1" r="1.9" />
      <circle cx="17" cy="17.1" r="1.9" />
    </svg>
  );
}

function BoxMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M4 7.2 12 3.8l8 3.4v9.4L12 20.2 4 16.6V7.2z" fill="currentColor" />
      <path d="M4.8 7.6 12 10.7l7.2-3.1" fill="none" stroke="#ffffff" strokeWidth={1.5} strokeLinejoin="round" />
      <path d="M12 10.7v8.8" fill="none" stroke="#ffffff" strokeWidth={1.5} />
    </svg>
  );
}

function CheckCircleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9.5" fill="currentColor" />
      <path
        d="m7.6 12.3 3 3 5.8-6.4"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2.2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShieldMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M12 2.8 19.5 5.6v5.5c0 4.8-3.2 8.7-7.5 10-4.3-1.3-7.5-5.2-7.5-10V5.6L12 2.8z" fill="currentColor" />
      <path
        d="m8.8 12 2.3 2.3 4.1-4.5"
        fill="none"
        stroke="#ffffff"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocumentCheckMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path d="M6 2.8h8.2L19 7.6V21H6V2.8z" fill="currentColor" />
      <path d="M14.2 2.8 19 7.6h-4.8V2.8z" fill="#ffffff" opacity="0.4" />
      <path d="M8.8 11h6.4M8.8 14h3.6" fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
      <path
        d="m10.2 17.4 1.6 1.6 2.9-3.1"
        fill="none"
        stroke="#ffffff"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CertificateMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <rect x="3" y="4.4" width="18" height="12.6" rx="1.6" fill="currentColor" />
      <path d="M6.4 8.4h8.2M6.4 11.4h5.2" fill="none" stroke="#ffffff" strokeWidth={1.6} strokeLinecap="round" />
      <circle cx="16.4" cy="16.6" r="2.7" fill="currentColor" stroke="#ffffff" strokeWidth={1.3} />
      <path d="m15.2 18.4-1.2 3 2.4-1.2 2.4 1.2-1.2-3" fill="currentColor" />
    </svg>
  );
}

function PaymentMark({ method }: { method: PaymentMethod }) {
  switch (method) {
    case "qris":
      return <QrisMark />;
    case "bca":
    case "mandiri":
    case "bri":
    case "bni":
      return <BankMark />;
    case "cod":
      return <CashMark />;
    case "gopay":
      return <WalletMark letter="G" />;
    case "ovo":
      return <WalletMark letter="O" />;
    case "dana":
      return <WalletMark letter="D" />;
    case "shopeepay":
      return <WalletMark letter="S" />;
  }
}

function CourierMark({ courier }: { courier: Courier }) {
  return courier === "pos" || courier === "wahana" ? <BoxMark /> : <TruckMark />;
}

function CertificationMark({ cert }: { cert: Certification }) {
  switch (cert) {
    case "halal_mui":
      return <CheckCircleMark />;
    case "bpom":
      return <ShieldMark />;
    case "pirt":
      return <DocumentCheckMark />;
    case "nib":
    case "hki":
      return <CertificateMark />;
  }
}

/* ---------------------------------------------------------------- */
/* Strip                                                             */
/* ---------------------------------------------------------------- */

const CHIP_TONE: Record<"bank" | "wallet" | "courier" | "cert", string> = {
  bank: "bg-slate-100 text-slate-700",
  wallet: "bg-indigo-100 text-indigo-700",
  courier: "bg-orange-100 text-orange-600",
  cert: "bg-green-100 text-green-700",
};

function TrustRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <h3 className="w-full shrink-0 text-[0.7rem] font-extrabold uppercase tracking-[0.14em] text-[color-mix(in_oklab,var(--uc-ink)_55%,transparent)] sm:w-44">
        {label}
      </h3>
      <ul className="flex flex-wrap gap-2.5">{children}</ul>
    </div>
  );
}

function Chip({
  label,
  tone,
  children,
}: {
  label: string;
  tone: string;
  children: ReactNode;
}) {
  return (
    <li className="inline-flex items-center gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--uc-ink)_10%,transparent)] bg-[var(--uc-surface)] py-2 pl-2.5 pr-4">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${tone}`}>
        {children}
      </span>
      <span className="text-sm font-bold text-[var(--uc-ink)]">{label}</span>
    </li>
  );
}

export function TrustBadgesStrip({ id, props }: { id: string; props: TrustBadgesStripProps }) {
  const hasAny =
    props.payment_methods.length > 0 ||
    props.shipping_couriers.length > 0 ||
    props.certifications.length > 0;
  if (!hasAny) return null;

  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} />
      <div className="space-y-5 rounded-3xl border border-[color-mix(in_oklab,var(--uc-ink)_8%,transparent)] bg-[color-mix(in_oklab,var(--uc-surface)_55%,var(--uc-bg))] p-5 sm:p-7">
        {props.payment_methods.length > 0 ? (
          <TrustRow label="Pembayaran">
            {props.payment_methods.map((method) => (
              <Chip
                key={method}
                label={PAYMENT_LABELS[method]}
                tone={method === "gopay" || method === "ovo" || method === "dana" || method === "shopeepay" ? CHIP_TONE.wallet : CHIP_TONE.bank}
              >
                <PaymentMark method={method} />
              </Chip>
            ))}
          </TrustRow>
        ) : null}
        {props.shipping_couriers.length > 0 ? (
          <TrustRow label="Kurir Pengiriman">
            {props.shipping_couriers.map((courier) => (
              <Chip key={courier} label={COURIER_LABELS[courier]} tone={CHIP_TONE.courier}>
                <CourierMark courier={courier} />
              </Chip>
            ))}
          </TrustRow>
        ) : null}
        {props.certifications.length > 0 ? (
          <TrustRow label="Sertifikasi">
            {props.certifications.map((cert) => (
              <Chip key={cert} label={CERTIFICATION_LABELS[cert]} tone={CHIP_TONE.cert}>
                <CertificationMark cert={cert} />
              </Chip>
            ))}
          </TrustRow>
        ) : null}
      </div>
    </SectionShell>
  );
}
