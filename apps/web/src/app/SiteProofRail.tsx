import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { renderSections, themeStyle } from "@umkmcraft/renderer";
import { parseUmkmConfig, type Section, type UmkmMeta } from "@umkmcraft/schema";
import { store, type SiteRecord } from "@/lib/server/store";

/**
 * Rel bukti situs nyata (landing) — "prove, don't claim" versi penuh:
 * mock HP di hero merender fixture, rel ini merender situs tenant yang
 * BENAR-BENAR TERBIT (snapshot published) dengan engine yang sama.
 *
 * Kartu = chassis tinta seperti mock HP hero; di dalamnya HANYA section hero
 * yang dirender pada lebar 390px lalu discale turun (teknik inert-SSR yang
 * sama — lihat komentar mock di page.tsx). Kartu dekoratif (inert), tautan
 * stretched-anchor di atasnya yang nyata menuju /sites/<slug>.
 *
 * Data: store.listSites() terikat ownerId (daftar "situs saya") — tidak ada
 * API enumerasi publik. Enumerasi read-only membaca sites.json langsung
 * (resolusi DATA_DIR dicerminkan dari store.ts), sementara snapshot config
 * tetap diambil lewat repository (store.getVersion) dan divalidasi ulang
 * dengan parseUmkmConfig — config rusak/semi-valid dilewati, tidak pernah
 * dirender mentah.
 */

const DATA_DIR = process.env.UMKMCRAFT_DATA_DIR
  ? path.resolve(process.env.UMKMCRAFT_DATA_DIR)
  : path.resolve(process.cwd(), ".data");

/** Frame kartu: viewport mini 390px yang discale ke 260px (rasio layar HP). */
const FRAME_W = 260;
const RENDER_W = 390;
const FRAME_H = 420;
const MAX_CARDS = 3;

interface ProofSite {
  slug: string;
  name: string;
  meta: UmkmMeta;
  hero: Section;
}

async function loadProofSites(): Promise<ProofSite[]> {
  let sites: SiteRecord[];
  try {
    sites = JSON.parse(await readFile(path.join(DATA_DIR, "sites.json"), "utf8")) as SiteRecord[];
  } catch {
    return [];
  }
  const published = sites
    .filter((s) => s.status === "PUBLISHED" && s.publishedVersionId !== null)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, MAX_CARDS);

  const proofs: ProofSite[] = [];
  for (const site of published) {
    const version = site.publishedVersionId ? await store.getVersion(site.publishedVersionId) : null;
    if (!version || version.status !== "PUBLISHED") continue;
    const parsed = parseUmkmConfig(version.configJson);
    if (!parsed.ok) continue;
    const hero = parsed.config.sections.find((s) => s.type === "hero_storefront");
    if (!hero) continue;
    proofs.push({
      slug: site.slug,
      name: parsed.config.meta.business_name,
      meta: parsed.config.meta,
      hero,
    });
  }
  return proofs;
}

export default async function SiteProofRail() {
  const sites = await loadProofSites();
  // Nol situs terbit → jangan tambah keramaian kosong; hero mock tetap berdiri sendiri.
  if (sites.length === 0) return null;

  return (
    <section className="border-y border-cutline/70 bg-card">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="lc-reveal">
          <h2 className="text-balance font-display text-3xl font-extrabold tracking-[-0.025em] text-ink sm:text-4xl">
            Situs yang baru lahir dari chat kakak-kakak lain
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-pretty text-ink-soft">
            Bukan gambar — ini situs aslinya, langsung buka.
          </p>
          <div className="mt-4 h-1.5 w-14 rounded-full bg-signal" aria-hidden />
        </div>

        <ul className="lc-reveal mt-12 flex snap-x gap-5 overflow-x-auto py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sites.map((site) => (
            <li
              key={site.slug}
              className="group/proof relative shrink-0 snap-start transition-transform duration-200 ease-out hover:-translate-y-1"
            >
              {/* Kemasan tinta — chassis yang sama dengan mock HP hero */}
              <div className="rounded-3xl bg-ink p-[7px] shadow-plate">
                <div className="relative h-[420px] w-[260px] overflow-hidden rounded-[17px] bg-card [mask-image:linear-gradient(to_bottom,black_87%,transparent_99%)]">
                  <div
                    style={{
                      ...themeStyle(site.meta),
                      width: RENDER_W,
                      transform: `scale(${FRAME_W / RENDER_W})`,
                      transformOrigin: "top left",
                    }}
                    className="uc-site pointer-events-none absolute left-0 top-0 select-none"
                    // Render hero tenant bersifat dekoratif: inert mengeluarkan
                    // h1/tombol WA milik situs lain dari pohon aksesibilitas dan
                    // urutan tab — landing tetap punya tepat satu h1 yang bisa
                    // diakses dan fokus keyboard tidak tercekat di mock.
                    inert
                    aria-hidden="true"
                  >
                    {renderSections(site.meta, [site.hero])}
                  </div>
                </div>
              </div>
              {/* Tautan nyata di atas kartu dekoratif — stretched-anchor.
                  Link (bukan <a> mentah): navigasi soft ala halaman ini —
                  hard nav memicu @view-transition cross-document yang di
                  sebagian browser di-abort (pageerror jelek di konsol). */}
              <Link
                href={`/sites/${site.slug}`}
                aria-label={`Buka situs ${site.name}`}
                className="absolute inset-0 z-10 flex min-h-[44px] rounded-3xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                <span className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-ink px-3.5 py-2 text-xs font-bold text-paper shadow-plate transition-colors duration-200 group-hover/proof:bg-signal">
                  Buka
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
