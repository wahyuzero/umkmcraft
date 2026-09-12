import Link from "next/link";
import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  Eye,
  Mail,
  MessageCircle,
  MousePointerClick,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { renderSections, themeStyle } from "@umkmcraft/renderer";
import { parseUmkmConfig } from "@umkmcraft/schema";
import { listTemplates } from "@umkmcraft/templates";
import { readFileSync } from "node:fs";
import path from "node:path";
import SiteProofRail from "./SiteProofRail";

/* Katalog template siap pakai — jumlahnya mengikuti sumber tunggal agar copy
   strip tidak melenceng ketika katalog bertambah. */
const TEMPLATE_COUNT = listTemplates().length;

/**
 * Landing UMKM Craft (Persuade).
 * "Prove, don't claim": hero memuat mock HP yang merender fixture kuliner
 * dengan engine renderer ASLI — bukan gambar mockup palsu.
 * Dunia: label press / lembar stiker die-cut (lihat DESIGN.md).
 */
function loadFixture(name: string) {
  try {
    const file = path.join(process.cwd(), "../../tooling/fixtures", `${name}.json`);
    const raw = JSON.parse(readFileSync(file, "utf8")) as unknown;
    const parsed = parseUmkmConfig(raw);
    return parsed.ok ? parsed.config : null;
  } catch {
    return null;
  }
}

const STEPS: { n: string; icon: LucideIcon; title: string; body: string }[] = [
  {
    n: "1",
    icon: MessageCircle,
    title: "Ceritakan usahamu",
    body: "Chat santai seperti balas WhatsApp. Nama, produk, harga, lokasi — asal sebut, kami rangkum sendiri.",
  },
  {
    n: "2",
    icon: Zap,
    title: "Situs jadi sebelum air kopimu dingin",
    body: "AI menyusun katalog, jam buka, dan tombol pesan otomatis. Semua blok bisa kamu geser dan ganti tanpa coding.",
  },
  {
    n: "3",
    icon: ShoppingBag,
    title: "Pembeli langsung chat kamu",
    body: "Setiap tombol produk membuka WhatsApp dengan format pesanan rapi. Nego, konfirmasi, deal — gaya Indonesia.",
  },
];

/* Motif mini per modul — geometri garis 1.8, satu keluarga dengan lucide */
const MODULES: { name: string; desc: string; core: boolean; motif: ReactElement }[] = [
  {
    name: "Katalog + Tombol WA",
    desc: "Harga coret, badge Best Seller, pesanan 1-klik",
    core: true,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <path d="M20.6 13.3 13.3 20.6a1.9 1.9 0 0 1-2.7 0L3.4 13.4V3.4h10l7.2 7.2a1.9 1.9 0 0 1 0 2.7Z" />
        <circle cx="8" cy="8" r="1.4" />
      </svg>
    ),
  },
  {
    name: "Jam Buka Otomatis",
    desc: "Badge Buka/Tutup real-time + rute Google Maps & Waze",
    core: true,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <circle cx="12" cy="12" r="8.5" />
        <path d="M12 7.5V12l3 2" />
      </svg>
    ),
  },
  {
    name: "Hub Marketplace",
    desc: "Shopee, Tokopedia, GoFood, GrabFood, TikTok Shop",
    core: true,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <circle cx="12" cy="12" r="3" />
        <circle cx="5" cy="5.5" r="2.2" />
        <circle cx="19" cy="5.5" r="2.2" />
        <circle cx="12" cy="19.5" r="2.2" />
        <path d="M9.9 9.8 6.7 7.4M14.1 9.8l3.2-2.4M12 15v2.3" />
      </svg>
    ),
  },
  {
    name: "Badge Legalitas",
    desc: "Halal MUI, BPOM, P-IRT — kepercayaan sejak detik pertama",
    core: false,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <path d="M12 3.5 5 6v5.2c0 4.4 3 7.6 7 9.3 4-1.7 7-4.9 7-9.3V6l-7-2.5Z" />
        <path d="m9 11.8 2.2 2.2 4-4.2" />
      </svg>
    ),
  },
  {
    name: "Promo & Kupon",
    desc: "Banner flash sale dengan timer + kode kupon 1-klik salin",
    core: true,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <rect x="3.5" y="6.5" width="17" height="11" rx="2" />
        <path d="M9 6.5v11" strokeDasharray="2 2.4" />
        <path d="m14.2 14.3 3.2-4.6" />
        <circle cx="14.4" cy="10" r="0.5" />
        <circle cx="17.2" cy="14" r="0.5" />
      </svg>
    ),
  },
  {
    name: "Galeri & Pricelist",
    desc: "Portofolio hasil karya dan paket layanan berjenjang",
    core: false,
    motif: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="h-6 w-6">
        <rect x="3.5" y="5" width="11" height="9.5" rx="1.6" />
        <circle cx="7" cy="8.4" r="1" />
        <path d="m4.6 13.1 3.1-2.9 3.6 3.4" />
        <path d="M17.5 7.5h3M17.5 11h3M17.5 14.5h3" />
      </svg>
    ),
  },
];

/* Label stiker: hasil nyata untuk pemilik usaha (bukan istilah internal) */
const STAMPS = [
  { label: "Hitungan menit situs jadi", tilt: "-rotate-1" },
  { label: "Gratis, tanpa kartu kredit", tilt: "rotate-[0.5deg]" },
  { label: "Pesan masuk ke WhatsApp kakak", tilt: "-rotate-[0.5deg]" },
];

const MICROPROOFS: { icon: LucideIcon; label: string }[] = [
  { icon: CreditCard, label: "Tanpa kartu kredit" },
  { icon: Eye, label: "Langsung pratinjau" },
  { icon: MousePointerClick, label: "Tanpa coding" },
];

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function LandingPage() {
  const demo = loadFixture("kuliner-sambal");
  const hero = demo?.sections.find((s) => s.type === "hero_storefront");
  const catalog = demo?.sections.find((s) => s.type === "product_catalog_wa");
  const demoSections = [hero, catalog].filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <main className="min-h-dvh bg-paper">
      {/* ============================ NAV ============================ */}
      <header className="sticky top-0 z-40 border-b border-cutline/70 bg-paper">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-8">
          <Link href="/" className="flex min-h-[44px] items-center gap-2 sm:gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
              U
            </span>
            <span className="whitespace-nowrap font-display text-base font-bold tracking-tight text-ink sm:text-lg">
              UMKM Craft
            </span>
          </Link>
          <nav className="flex items-center gap-1 sm:gap-2">
            <a href="#cara" className="hidden items-center rounded-lg px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex">
              Cara Kerja
            </a>
            <a href="#modul" className="hidden items-center rounded-lg px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex">
              Modul
            </a>
            <Link
              href="/template"
              className="hidden items-center rounded-lg px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex"
            >
              Template
            </Link>
            <Link
              href="/situs-saya"
              className="hidden items-center rounded-lg px-3 py-3 text-sm font-medium text-ink-soft transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:flex"
            >
              Situs Saya
            </Link>
            <Link
              href="/start"
              className="ml-1.5 inline-flex items-center whitespace-nowrap rounded-xl bg-signal px-3 py-3 text-[0.8125rem] font-bold text-card shadow-[0_2px_10px_rgb(154_52_18/0.35)] transition-[transform,box-shadow] duration-150 ease-out hover:shadow-[0_1px_6px_rgb(154_52_18/0.4)] active:translate-y-[1px] active:shadow-[0_0_2px_rgb(154_52_18/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal sm:ml-2 sm:px-4 sm:text-sm"
            >
              Buat Website Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ============================ HERO =========================== */}
      <section className="relative overflow-hidden">
        {/* Tekstur titik kertas — memudar ke arah kanan atas */}
        <div
          aria-hidden
          className="lc-dots pointer-events-none absolute inset-0 [mask-image:radial-gradient(55%_65%_at_78%_28%,black,transparent_72%)]"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28">
          <div>
            <p className="uc-ruler uc-stick-in mb-6 inline-block h-[5px] w-24" aria-hidden />
            <h1 className="uc-stick-in text-balance font-display text-5xl font-extrabold leading-[1.03] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl [animation-delay:70ms]">
              Website usaha siap menerima pesanan,{" "}
              <span className="text-signal">secepat cerita kamu</span>.
            </h1>
            <p className="uc-stick-in mt-6 max-w-xl text-lg leading-relaxed text-pretty text-ink-soft [animation-delay:140ms]">
              Ceritakan usahamu lewat obrolan santai. UMKM Craft merangkai katalog produk,
              jam buka, dan tombol pesan WhatsApp otomatis — rapi di HP pembeli, tanpa coding,
              gratis.
            </p>
            <div className="uc-stick-in mt-8 [animation-delay:210ms]">
              <Link
                href="/start"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-signal px-7 py-4 text-base font-bold text-card shadow-[0_4px_16px_rgb(154_52_18/0.4)] transition-[transform,box-shadow] duration-150 ease-out hover:shadow-[0_2px_10px_rgb(154_52_18/0.45)] active:translate-y-[1px] active:shadow-[0_0_2px_rgb(154_52_18/0.5)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Mulai dari Chat
                <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
              {/* Microproof: bukti kecil, bukan klaim */}
              <ul className="mt-5 flex flex-wrap items-center gap-2">
                {MICROPROOFS.map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-1.5 rounded-full bg-paper-deep px-3 py-1.5 text-xs font-semibold text-ink-soft"
                  >
                    <Icon className="h-3.5 w-3.5 text-signal" aria-hidden />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Strip stamp: angka konkret dengan tepi die-cut */}
            <dl className="uc-stick-in mt-10 grid max-w-md grid-cols-3 gap-3 [animation-delay:280ms] sm:gap-4">
              {STAMPS.map((s) => (
                <div key={s.label} className={`uc-cutline flex items-center justify-center rounded-xl bg-card px-2 py-4 text-center shadow-plate ${s.tilt}`}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-xs font-semibold leading-snug text-pretty text-ink">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock HP — merender engine ASLI dengan fixture nyata */}
          <div className="relative z-0 mx-auto w-full max-w-[340px]">
            {/* Lembar die-cut di belakang kemasan */}
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -z-10 h-[430px] w-[430px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-cutline"
            />
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 -z-10 h-[530px] w-[530px] -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] border-dashed border-cutline/50"
            />
            <div className="uc-stick-in relative [animation-delay:160ms]">
              <div className="uc-starburst absolute -right-4 -top-7 z-10 flex h-24 w-24 rotate-12 items-center justify-center bg-signal text-center font-display text-[0.6rem] font-extrabold leading-tight text-card sm:-right-7">
                CONTOH
                <br />
                ASLI
              </div>
              <div className="rotate-1 rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan transition-transform duration-300 ease-out hover:rotate-0">
                <div className="overflow-hidden rounded-[2.1rem] bg-card">
                  <div className="flex items-center justify-between bg-ink px-5 pb-2 pt-2.5">
                    <span className="h-1.5 w-16 rounded-full bg-paper/30" aria-hidden />
                    <span className="h-2 w-2 rounded-full bg-paper/30" aria-hidden />
                  </div>
                  {demo && demoSections.length > 0 ? (
                    <div
                      style={themeStyle(demo.meta)}
                      // Audit P1: CTA demo di dalam mock (Pesan via WhatsApp,
                      // tombol sekunder, kartu katalog) dijamin >= 44px tanpa
                      // menyentuh packages/renderer — varian ter-scope hanya
                      // MENAIKKAN anchor < 44px (tidak mengubah padding/kisi).
                      className="uc-site max-h-[728px] overflow-hidden [&_a]:min-h-[44px] [&_a]:items-center [mask-image:linear-gradient(to_bottom,black_87%,transparent_99%)]"
                      // Mock demo bersifat dekoratif: inert mengeluarkan seluruh isi
                      // (h1, tombol WA, filter katalog) dari pohon aksesibilitas dan
                      // urutan tab — halaman landing punya tepat satu h1 yang bisa
                      // diakses dan fokus keyboard tidak masuk ke mock terpotong.
                      inert
                      aria-hidden="true"
                    >
                      {renderSections(demo.meta, demoSections)}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-pretty text-ink-soft">
              Contoh tampilan situs — lihat situs aslinya lewat tombol di bawah.
            </p>
            <div className="mt-3 flex justify-center">
              <Link
                href="/sites/warung-sambal-ndeso"
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl border-[1.5px] border-dashed border-cutline bg-card px-5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/50 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                Lihat contoh situs
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================= CARA KERJA ======================== */}
      <section id="cara" className="scroll-mt-20 border-y border-cutline/70 bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
            Tiga langkah, nol drama teknis.
          </h2>
          <div className="mt-4 h-1.5 w-14 rounded-full bg-signal" aria-hidden />
          <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-0">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.n} className="lc-reveal relative md:pr-10 md:last:pr-0">
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-16 right-0 top-7 hidden border-t-[1.5px] border-dashed border-cutline md:block"
                    />
                  )}
                  <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-[1.5px] border-dashed border-signal/45 bg-card font-display text-xl font-extrabold tabular-nums text-signal shadow-plate">
                    {s.n}
                  </span>
                  <h3 className="mt-5 flex items-start gap-2.5 font-display text-xl font-bold leading-snug text-ink md:min-h-[3.5rem]">
                    <Icon className="mt-0.5 h-5 w-5 shrink-0 text-signal" aria-hidden />
                    {s.title}
                  </h3>
                  <p className="mt-2.5 leading-relaxed text-pretty text-ink-soft">{s.body}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============================ MODUL ========================== */}
      <section id="modul" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
        <div className="lc-reveal flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="text-balance font-display text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Blok-blok siap tempel, kayak stiker.
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-pretty text-ink-soft">
              Setiap modul adalah komponen teruji — mustahil rusak karena salah ketik.
              Tambah, geser, ganti warna, semua lewat sentuhan.
            </p>
            <div className="mt-4 h-1.5 w-14 rounded-full bg-signal" aria-hidden />
          </div>
        </div>
        <ul className="lc-reveal mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m) => (
            <li
              key={m.name}
              className="group relative rounded-2xl border-[1.5px] border-dashed border-cutline bg-card p-5 shadow-plate transition-[transform,box-shadow,border-color] duration-200 ease-out hover:-translate-y-1 hover:border-signal/50 hover:shadow-[0_16px_36px_-14px_rgb(35_28_16/0.28)]"
            >
              {/* Penanda stiker opsional — sudut starburst kecil */}
              {!m.core && (
                <span aria-hidden className="uc-starburst absolute -right-2 -top-2 h-5 w-5 rotate-12 bg-signal" />
              )}
              <div className="flex items-start justify-between gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-signal-soft text-signal">
                  {m.motif}
                </span>
                <span
                  className={`inline-block rounded-full px-2.5 py-1 text-[0.6rem] font-extrabold ${
                    m.core ? "bg-ink text-paper" : "bg-signal-soft text-signal"
                  }`}
                >
                  {m.core ? "Modul inti" : "Modul opsional"}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">{m.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-pretty text-ink-soft">{m.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ======================= STRIP TEMPLATE ====================== */}
      {/* Jembatan tipis MODUL → bukti situs nyata: tawaran lewat contoh,
          bukan kanvas kosong. Satu baris, satu tombol — bukan galeri. */}
      <section className="border-y border-dashed border-cutline bg-card">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="max-w-xl text-balance font-display text-xl font-bold leading-snug tracking-[-0.01em] text-ink sm:text-2xl">
            Mau lihat dulu? Mulai dari contoh, bukan kanvas kosong.
          </p>
          <Link
            href="/template"
            className="group inline-flex min-h-[44px] shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-signal px-5 text-sm font-bold text-card shadow-[0_2px_10px_rgb(154_52_18/0.35)] transition-[transform,box-shadow] duration-150 ease-out hover:shadow-[0_1px_6px_rgb(154_52_18/0.4)] active:translate-y-[1px] active:shadow-[0_0_2px_rgb(154_52_18/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Lihat {TEMPLATE_COUNT} template siap pakai
            <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </section>

      {/* ===================== BUKTI SITUS NYATA ===================== */}
      {/* Rel situs tenant yang benar-benar terbit — merender snapshot
          published dengan engine ASLI (SiteProofRail). Nol situs terbit →
          komponen merender null, halaman berubah tanpa keadaan kosong. */}
      <SiteProofRail />

      {/* ============================= CTA =========================== */}
      <section className="relative overflow-hidden bg-ink">
        <div
          aria-hidden
          className="lc-dots lc-dots-dark absolute inset-0 [mask-image:radial-gradient(90%_130%_at_50%_0%,black_15%,transparent_78%)]"
        />
        <div className="lc-reveal relative mx-auto flex max-w-6xl flex-col items-center gap-9 px-5 pb-16 pt-20 text-center sm:px-8 sm:pb-20 sm:pt-28">
          <h2 className="max-w-3xl text-balance font-display text-4xl font-extrabold leading-[1.05] tracking-[-0.025em] text-paper sm:text-5xl lg:text-6xl">
            64 juta UMKM di Indonesia.{" "}
            <span className="underline decoration-dashed decoration-signal-soft/70 underline-offset-8">
              Giliran usahamu.
            </span>
          </h2>
          <Link
            href="/start"
            className="group inline-flex items-center gap-2.5 whitespace-nowrap rounded-2xl bg-card px-6 py-4 text-base font-bold text-ink shadow-plate transition-[transform,box-shadow] duration-150 ease-out hover:shadow-[0_1px_2px_rgb(35_28_16/0.08),0_4px_12px_-8px_rgb(35_28_16/0.22)] active:translate-y-[1px] active:shadow-[0_1px_2px_rgb(35_28_16/0.1),0_2px_6px_-6px_rgb(35_28_16/0.25)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-soft sm:px-8"
          >
            Bikin Website Gratis
            <ArrowRight className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
          <p className="text-sm font-medium text-paper/60">
            Gratis karena kami masih membangun — tanpa kartu kredit, tanpa iklan.
          </p>
        </div>
      </section>

      {/* =========================== FOOTER ========================== */}
      <footer className="border-t-[1.5px] border-dashed border-cutline bg-paper">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.3fr_1fr_1.3fr]">
          {/* Zona 1: merek + tagline */}
          <div>
            <Link href="/" className="flex min-h-[44px] items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
                U
              </span>
              <span className="font-display text-lg font-bold tracking-tight text-ink">UMKM Craft</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-pretty text-ink-soft">
              Website usaha untuk UMKM Indonesia — dari chat santai jadi situs yang siap jualan.
            </p>
          </div>

          {/* Zona 2: navigasi mini */}
          <nav aria-label="Footer">
            <p className="font-display text-sm font-bold text-ink">Jelajah</p>
            <ul className="mt-3">
              {[
                { href: "#cara", label: "Cara Kerja" },
                { href: "#modul", label: "Modul" },
                { href: "/situs-saya", label: "Situs Saya" },
                { href: "/start", label: "Buat Website Gratis" },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="flex min-h-11 items-center text-sm font-medium text-ink-soft transition-colors hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Zona 3: kredit + kontak */}
          <div className="md:justify-self-end">
            <p className="font-display text-sm font-bold text-ink">
              Dibuat oleh Wahyu — untuk UMKM Indonesia.
            </p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="mailto:halo@umkmcraft.id"
                aria-label="Email UMKM Craft"
                className="flex h-11 w-11 items-center justify-center rounded-xl border-[1.5px] border-dashed border-cutline text-ink-soft transition-[color,border-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-signal/50 hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <Mail className="h-4.5 w-4.5" aria-hidden />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-cutline/70">
          <p className="mx-auto max-w-6xl px-5 py-5 text-xs text-ink-soft sm:px-8">
            © 2026 UMKM Craft — dibuat untuk kemajuan UMKM Indonesia.
          </p>
        </div>
      </footer>
    </main>
  );
}
