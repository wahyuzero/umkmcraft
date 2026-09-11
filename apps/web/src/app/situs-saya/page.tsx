import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ExternalLink, Eye, PenLine, Sticker } from "lucide-react";
import { store } from "@/lib/server/store";
import { CopyLinkButton } from "./CopyLinkButton";

export const metadata: Metadata = {
  title: "Situs Saya — UMKM Craft",
  description: "Daftar situs usaha yang kakak rakit dengan UMKM Craft.",
  // Halaman dasbor pribadi sesi (anonim hanya melihat empty state HTTP-200)
  // → tanpa indeks, isinya bukan konten publik.
  robots: { index: false },
};

function formatTime(ts: string | number | Date): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(ts));
}

export default async function SitusSayaPage() {
  const sessionToken = (await cookies()).get("uc_session")?.value;
  const sites = sessionToken ? await store.listSites(sessionToken) : [];
  // Nama usaha & status draf cukup dibaca dari versi TERBARU (sumber kebenaran
  // yang sama dengan dashboard API GET /api/sites) — tidak perlu memuat
  // configJson seluruh histori versi per situs.
  const rows = await Promise.all(
    sites.map(async (s) => {
      const latest = await store.getLatestVersion(s.id);
      return {
        id: s.id,
        slug: s.slug,
        status: s.status,
        updatedAt: s.updatedAt,
        name: latest?.configJson.meta.business_name ?? s.slug,
        // Mirror logika /sites/<slug>: pratinjau draf hanya relevan bila versi
        // TERBARU masih DRAFT. Situs PUBLISHED yang versi terakhirnya sudah
        // tersalip (id = publishedVersionId) tidak punya draf baru lagi.
        hasNewerDraft: s.status === "PUBLISHED" && latest?.status === "DRAFT",
      };
    }),
  );
  // Baru disunting paling atas — informasi utama daftar ini adalah "yang
  // kemarin kakak kerjakan".
  rows.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  return (
    <main className="min-h-dvh bg-paper">
      <header className="border-b border-cutline/70 bg-paper">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink font-display text-lg font-extrabold text-paper">
              U
            </span>
            <span className="font-display text-lg font-bold tracking-tight text-ink">UMKM Craft</span>
          </Link>
          <Link
            href="/start"
            className="inline-flex items-center rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-card shadow-[0_2px_10px_rgb(154_52_18/0.35)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Buat Baru
          </Link>
        </div>
      </header>

      <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="font-display text-3xl font-extrabold tracking-[-0.03em] text-ink sm:text-4xl">
          Situs kakak
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Semua situs yang pernah kakak rakit di perangkat ini — tinggal lanjutkan suntingan atau lihat hasilnya.
        </p>

        {rows.length === 0 ? (
          <div className="uc-cutline mt-8 flex flex-col items-center gap-4 rounded-3xl bg-card px-6 py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-signal-soft/60 text-signal">
              <Sticker className="h-7 w-7" aria-hidden />
            </span>
            <p className="font-display text-xl font-bold text-ink">Belum ada situs, kak</p>
            <p className="max-w-xs text-sm leading-relaxed text-ink-soft">
              Ceritakan usahamu lewat obrolan santai — situsnya jadi dalam hitungan menit.
            </p>
            <Link
              href="/start"
              className="mt-1 inline-flex min-h-[48px] items-center rounded-xl bg-signal px-5 py-3 text-sm font-bold text-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            >
              Mulai dari Chat
            </Link>
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-3">
            {rows.map((r) => {
              const live = r.status === "PUBLISHED";
              return (
                <li
                  key={r.id}
                  className="flex flex-col gap-4 rounded-2xl border border-cutline/80 bg-card p-4 shadow-plate sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:p-5"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-display text-lg font-bold tracking-tight text-ink">{r.name}</p>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide ${
                          live ? "bg-live text-card" : "border border-cutline bg-paper text-ink-soft"
                        }`}
                      >
                        {live ? "Live" : "Draf"}
                      </span>
                      {r.hasNewerDraft ? (
                        // Live + draf lebih baru sekaligus: hijau = versi terbit,
                        // chip putus-putus = ada draf yang belum tampil publik.
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-cutline bg-paper px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-wide text-ink">
                          Ada draf baru
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate font-ui text-xs text-ink-soft">
                      {/* Bentuk path (selalu jalan tanpa DNS vhost) — bukan
                          slug.umkmcraft.id. Tombol Lihat menambah ?v=published:
                          owner tetap melihat versi TERBIT meski ada draf lebih
                          baru (draf lewat tombol Pratinjau). Tanpa prefix
                          /sites/ supaya timestamp tak terpotong di ponsel. */}
                      {r.slug} · disunting {formatTime(r.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {live ? (
                      // ?v=published: tanpa ini "Lihat" dan "Pratinjau" adalah
                      // URL sama — saat ada draf lebih baru keduanya merender
                      // draf, versi terbit jadi tak terjangkau (label palsu).
                      // Server /sites/<slug> hanya menghormati param ini untuk
                      // pemilik situs; orang luar mengabaikannya (dapat terbit).
                      <a
                        href={`/sites/${r.slug}?v=published`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-cutline bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        Lihat
                      </a>
                    ) : null}
                    {live ? (
                      // Salinan untuk DIBAGIKAN: path bersih tanpa param —
                      // orang luar selalu menerima versi terbit, ?v=published
                      // hanya berarti sesuatu bagi pemilik situs.
                      <CopyLinkButton path={`/sites/${r.slug}`} />
                    ) : null}
                    {r.status === "DRAFT" || r.hasNewerDraft ? (
                      // Pratinjau draf — jalur khusus owner (uc_session
                      // diverifikasi di server /sites/<slug>); orang luar
                      // tetap melihat 404, makanya "Salin link" hanya untuk
                      // situs live. Berlaku juga untuk situs live yang punya
                      // draf lebih baru (draf dirender dengan banner).
                      <Link
                        href={`/sites/${r.slug}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-cutline bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                        Pratinjau
                      </Link>
                    ) : null}
                    <Link
                      href={`/editor/${r.id}`}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-signal px-4 py-2.5 text-sm font-bold text-card transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                    >
                      <PenLine className="h-4 w-4" aria-hidden />
                      Sunting
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
