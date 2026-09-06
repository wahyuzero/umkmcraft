import Link from "next/link";
import { renderSections, themeStyle } from "@umkmcraft/renderer";
import { parseUmkmConfig } from "@umkmcraft/schema";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Landing UMKM Craft (Persuade).
 * "Prove, don't claim": hero memuat mock HP yang merender fixture kuliner
 * dengan engine renderer ASLI — bukan gambar mockup palsu.
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

const STEPS = [
  {
    n: "1",
    title: "Ceritakan usahamu",
    body: "Chat santai seperti balas WhatsApp. Nama, produk, harga, lokasi — asal sebut, kami rangkum sendiri.",
  },
  {
    n: "2",
    title: "Situs jadi dalam 30 detik",
    body: "AI menyusun katalog, jam buka, dan tombol pesan otomatis. Semua blok bisa kamu geser dan ganti tanpa coding.",
  },
  {
    n: "3",
    title: "Pembeli langsung chat kamu",
    body: "Setiap tombol produk membuka WhatsApp dengan format pesanan rapi. Nego, konfirmasi, deal — gaya Indonesia.",
  },
];

const MODULES = [
  { name: "Katalog + Tombol WA", desc: "Harga coret, badge Best Seller, pesanan 1-klik" },
  { name: "Jam Buka Otomatis", desc: "Badge Buka/Tutup real-time + rute Google Maps & Waze" },
  { name: "Hub Marketplace", desc: "Shopee, Tokopedia, GoFood, GrabFood, TikTok Shop" },
  { name: "Badge Legalitas", desc: "Halal MUI, BPOM, P-IRT — kepercayaan sejak detik pertama" },
  { name: "Promo & Kupon", desc: "Banner flash sale dengan timer + kode kupon 1-klik salin" },
  { name: "Galeri & Pricelist", desc: "Portofolio hasil karya dan paket layanan berjenjang" },
];

export default function LandingPage() {
  const demo = loadFixture("kuliner-sambal");
  const hero = demo?.sections.find((s) => s.type === "hero_storefront");
  const catalog = demo?.sections.find((s) => s.type === "product_catalog_wa");
  const demoSections = [hero, catalog].filter((s): s is NonNullable<typeof s> => Boolean(s));

  return (
    <main className="min-h-dvh bg-paper">
      {/* ============================ NAV ============================ */}
      <header className="sticky top-0 z-40 border-b border-cutline/70 bg-paper/85 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
              U
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">
              UMKM Craft
            </span>
          </Link>
          <nav className="flex items-center gap-2 sm:gap-4">
            <a href="#cara" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block">
              Cara Kerja
            </a>
            <a href="#modul" className="hidden rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:text-ink sm:block">
              Modul
            </a>
            <Link
              href="/start"
              className="rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-white shadow-[0_2px_10px_rgb(154_52_18/0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_8px_22px_rgb(154_52_18/0.4)]"
            >
              Buat Website Gratis
            </Link>
          </nav>
        </div>
      </header>

      {/* ============================ HERO =========================== */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-40 -top-40 h-[540px] w-[540px] rounded-full"
          style={{ background: "radial-gradient(circle, rgb(154 52 18 / 0.09), transparent 65%)" }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-24">
          <div>
            <p className="uc-ruler mb-6 inline-block h-[5px] w-24" aria-hidden />
            <h1 className="font-display text-[2.6rem] font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-6xl">
              Website usaha siap menerima pesanan,{" "}
              <span className="text-signal">secepat bikin status WA</span>.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-soft">
              Ceritakan usahamu lewat obrolan santai. UMKM Craft merangkai katalog produk,
              jam buka, dan tombol pesan WhatsApp otomatis — rapi di HP pembeli, tanpa coding,
              gratis.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/start"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-signal px-7 py-4 text-base font-bold text-white shadow-[0_4px_16px_rgb(154_52_18/0.4)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgb(154_52_18/0.45)]"
              >
                Mulai dari Chat
                <svg viewBox="0 0 20 20" className="h-4.5 w-4.5 transition-transform duration-200 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                  <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <p className="text-sm font-medium text-ink-soft">
                Tanpa daftar · Langsung pratinjau
              </p>
            </div>

            {/* Bukti, bukan klaim: angka fitur konkret */}
            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-cutline pt-7">
              {[
                ["13", "modul blok siap pakai"],
                ["< 30 dtk", "dari curhat ke situs"],
                ["6", "tema warna kategori"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="font-display text-2xl font-extrabold tabular-nums text-ink">{v}</dd>
                  <dd className="mt-1 text-xs leading-snug text-ink-soft">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Mock HP — merender engine ASLI dengan fixture nyata */}
          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="uc-starburst absolute -right-4 -top-7 z-10 flex h-24 w-24 rotate-12 items-center justify-center bg-live text-center font-display text-[0.6rem] font-extrabold leading-tight text-white sm:-right-7">
              CONTOH
              <br />
              ASLI
            </div>
            <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
              <div className="overflow-hidden rounded-[2.1rem] bg-white">
                <div className="flex items-center justify-between bg-ink px-5 pb-2 pt-2.5">
                  <span className="h-1.5 w-16 rounded-full bg-paper/30" aria-hidden />
                  <span className="h-2 w-2 rounded-full bg-paper/30" aria-hidden />
                </div>
                {demo && demoSections.length > 0 ? (
                  <div
                    style={themeStyle(demo.meta)}
                    className="uc-site max-h-[560px] overflow-hidden [mask-image:linear-gradient(to_bottom,black_82%,transparent)]"
                    aria-label="Contoh website yang dibuat UMKM Craft"
                  >
                    {renderSections(demo.meta, demoSections)}
                  </div>
                ) : null}
              </div>
            </div>
            <p className="mt-4 text-center text-xs text-ink-soft">
              Dirender oleh engine yang sama dengan yang akan kamu pakai — bukan gambar.
            </p>
          </div>
        </div>
      </section>

      {/* ========================= CARA KERJA ======================== */}
      <section id="cara" className="border-y border-cutline/70 bg-card">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
          <h2 className="font-display text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
            Tiga langkah, nol drama teknis.
          </h2>
          <div className="mt-4 h-1.5 w-14 rounded-full bg-signal" aria-hidden />
          <ol className="mt-12 grid gap-10 md:grid-cols-3">
            {STEPS.map((s) => (
              <li key={s.n} className="relative">
                <span className="font-display text-5xl font-extrabold tabular-nums text-signal/25" aria-hidden>
                  {s.n}
                </span>
                <h3 className="mt-2 font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-2.5 leading-relaxed text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ============================ MODUL ========================== */}
      <section id="modul" className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
              Blok-blok siap tempel, kayak stiker.
            </h2>
            <p className="mt-3 max-w-2xl leading-relaxed text-ink-soft">
              Setiap modul adalah komponen teruji — mustahil rusak karena salah ketik.
              Tambah, geser, ganti warna, semua lewat sentuhan.
            </p>
            <div className="mt-4 h-1.5 w-14 rounded-full bg-signal" aria-hidden />
          </div>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {MODULES.map((m, i) => (
            <li
              key={m.name}
              className="uc-cutline group rounded-2xl bg-card p-5 shadow-plate transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_16px_36px_-14px_rgb(35_28_16/0.28)]"
            >
              <span className="uc-starburst inline-flex h-8 w-8 items-center justify-center bg-signal-soft font-display text-xs font-extrabold tabular-nums text-signal" aria-hidden>
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-bold text-ink">{m.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{m.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ============================= CTA =========================== */}
      <section className="border-t border-cutline/70 bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-5 py-20 text-center sm:px-8">
          <h2 className="max-w-2xl font-display text-3xl font-extrabold tracking-[-0.025em] text-paper sm:text-5xl">
            64 juta UMKM sudah online. Giliran usahamu.
          </h2>
          <Link
            href="/start"
            className="inline-flex items-center gap-2.5 rounded-2xl bg-paper px-8 py-4 text-base font-bold text-ink transition-[transform] duration-200 ease-out hover:-translate-y-0.5"
          >
            Bikin Website Sekarang — Gratis
            <svg viewBox="0 0 20 20" className="h-4.5 w-4.5" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
              <path d="M4 10h12m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
          <p className="text-sm text-paper/60">
            Tanpa kartu kredit. Tanpa istilah Inggris. Cukup cerita.
          </p>
        </div>
      </section>

      <footer className="border-t border-ink/10 bg-ink">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-xs text-paper/50 sm:flex-row sm:px-8">
          <p>© 2026 UMKM Craft — dibuat untuk kemajuan UMKM Indonesia.</p>
          <p>
            Dibuat dengan ❤️ oleh Wahyu ·{" "}
            <Link href="/api/health" className="underline decoration-dotted underline-offset-4">
              status sistem
            </Link>
          </p>
        </div>
      </footer>
    </main>
  );
}
