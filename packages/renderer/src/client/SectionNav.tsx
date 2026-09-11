"use client";

/**
 * SectionNav — island navigasi chip horizontal untuk halaman tenant panjang
 * (polish UI/UX: situs barbershop punya 13 section, pengunjung butuh lompatan
 * cepat). Dirender server HANYA saat section > 6; menempel di bawah hero
 * (sticky top-0, z-30 — jauh dari StickyOrderBar z-40 yang fixed di bawah).
 * Kontras: chip aktif --uc-primary + --uc-on-primary-text (turunan AA dari
 * theme.ts); chip pasif surface + garis tipis. TANPA backdrop-blur (kontrak
 * dunia tenant). Chip aktif dihitung dari posisi scroll — garis baca di bawah
 * tinggi nav, di-throttle rAF. Gulir halus hanya saat reduced-motion
 * mengizinkan. SSR-safe: semua akses DOM di dalam useEffect/handler.
 */
import { useEffect, useRef, useState } from "react";

export interface SectionNavItem {
  /** id section = anchor DOM (#id) — dirender SectionShell/modul. */
  id: string;
  /** Label pendek chip (peta type → label dibangun di server page). */
  label: string;
}

export function SectionNav({ items }: { items: SectionNavItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const navRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const chipRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    const targets = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => el !== null);
    const first = targets[0];
    if (!first) return;

    // Section aktif = TERAKHIR yang tepi atasnya sudah melewati "garis baca"
    // (sedikit di bawah nav sticky). Dihitung dari posisi scroll LANGSUNG
    // (rAF-throttled) — IntersectionObserver tidak cukup: langkah terakhir
    // smooth-scroll sering tidak melintasi batas observasi apa pun sehingga
    // chip nyangkut di section sebelumnya. Section tinggi pun aman: garis
    // baca hanya dilintasi satu section.
    const readLine = () => (navRef.current?.offsetHeight ?? 64) + 24;
    let raf = 0;
    const update = () => {
      raf = 0;
      let current = first;
      for (const t of targets) {
        if (t.getBoundingClientRect().top <= readLine()) current = t;
        else break;
      }
      // Mentok dasar halaman (footer pendek) → chip terakhir aktif.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
        current = targets[targets.length - 1] || first;
      }
      setActiveId((prev) => (prev === current.id ? prev : current.id));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  // Jaga chip aktif selalu terlihat di dalam lintasan nav (horizontal saja —
  // jangan scrollIntoView penuh, bisa menggoyang halaman). Scroller-nya adalah
  // div lintasan di dalam <nav>, BUKAN nav-nya (tanpa overflow → scrollTo
  // no-op). offsetLeft chip terukur thd nav (position:sticky = offsetParent);
  // padding kiri track (px-4) dikoreksi agar chip pas di tengah.
  useEffect(() => {
    const track = trackRef.current;
    const chip = activeId ? chipRefs.current.get(activeId) : undefined;
    if (!track || !chip) return;
    const left = chip.offsetLeft - 16 - track.clientWidth / 2 + chip.clientWidth / 2;
    track.scrollTo({ left: Math.max(left, 0) });
  }, [activeId]);

  function go(e: React.MouseEvent<HTMLAnchorElement>, id: string) {
    const el = document.getElementById(id);
    if (!el) return; // biarkan perilaku anchor bawaan
    e.preventDefault();
    const smooth =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
    // Offset manual setinggi nav: scroll-mt section (16px) tidak cukup saat
    // nav menempel di atas — target harus muncul TEPAT di bawah chip.
    const navH = navRef.current?.offsetHeight ?? 0;
    const top = el.getBoundingClientRect().top + window.scrollY - navH - 8;
    window.scrollTo({ top: Math.max(top, 0), behavior: smooth ? "smooth" : "auto" });
    history.replaceState(null, "", `#${id}`);
  }

  return (
    <nav
      ref={navRef}
      aria-label="Navigasi bagian"
      className="sticky top-0 z-30 border-b border-[color-mix(in_oklab,var(--uc-ink)_10%,transparent)] bg-[var(--uc-bg)]/95"
    >
      <div
        ref={trackRef}
        className="mx-auto flex w-full max-w-3xl snap-x snap-mandatory gap-2 overflow-x-auto px-4 py-2.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:px-8 lg:max-w-5xl"
      >
        {items.map((it) => {
          const active = it.id === activeId;
          return (
            <a
              key={it.id}
              ref={(el) => {
                if (el) chipRefs.current.set(it.id, el);
                else chipRefs.current.delete(it.id);
              }}
              href={`#${it.id}`}
              aria-current={active ? "true" : undefined}
              onClick={(e) => go(e, it.id)}
              className={`inline-flex min-h-[44px] shrink-0 snap-start items-center whitespace-nowrap rounded-full border px-4 text-sm font-semibold transition-colors duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-[var(--uc-primary)] ${
                active
                  ? "border-transparent bg-[var(--uc-primary)] text-[var(--uc-on-primary-text)]"
                  : "border-[color-mix(in_oklab,var(--uc-ink)_12%,transparent)] bg-[var(--uc-surface)] text-[var(--uc-ink)]"
              }`}
            >
              {it.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
