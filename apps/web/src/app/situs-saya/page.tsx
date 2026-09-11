import Link from "next/link";
import { cookies } from "next/headers";
import type { Metadata } from "next";
import { ExternalLink, PenLine, Sticker } from "lucide-react";
import { store } from "@/lib/server/store";
import { CopyLinkButton } from "./CopyLinkButton";

export const metadata: Metadata = {
  title: "Situs Saya — UMKM Craft",
  description: "Daftar situs usaha yang kakak rakit dengan UMKM Craft.",
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
  // Nama usaha diambil dari konfigurasi versi terbaru (sumber kebenaran yang sama
  // dengan dashboard API GET /api/sites).
  const rows = await Promise.all(
    sites.map(async (s) => {
      const versions = await store.getVersions(s.id);
      const latest = versions.at(-1);
      return {
        id: s.id,
        slug: s.slug,
        status: s.status,
        updatedAt: s.updatedAt,
        name: latest?.configJson.meta.business_name ?? s.slug,
      };
    }),
  );

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
              Ceritakan usahamu lewat obrolan santai — situsnya jadi dalam ±30 detik.
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
                    </div>
                    <p className="mt-1 truncate font-ui text-xs text-ink-soft">
                      {/* URL tampil = persis target tombol Lihat (bentuk path,
                          selalu jalan tanpa DNS vhost) — bukan slug.umkmcraft.id */}
                      /sites/{r.slug} · disunting {formatTime(r.updatedAt)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {live ? (
                      <a
                        href={`/sites/${r.slug}`}
                        className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-cutline bg-paper px-3.5 py-2.5 text-sm font-semibold text-ink transition-colors duration-200 hover:border-signal/40 hover:bg-signal-soft/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                      >
                        <ExternalLink className="h-4 w-4" aria-hidden />
                        Lihat
                      </a>
                    ) : null}
                    {live ? (
                      // Target salinan = href persis tombol Lihat di atas
                      <CopyLinkButton path={`/sites/${r.slug}`} />
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
