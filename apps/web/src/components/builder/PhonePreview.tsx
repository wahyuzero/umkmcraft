"use client";

/**
 * PhonePreview — kemasan HP dengan penguasa kalibrasi (raise: oscilloscope).
 * Merender config via registry ASLI — apa yang dilihat = yang di-publish.
 * Konten diportal ke <iframe> selebar chassis: breakpoint responsif (md:/lg:)
 * merespons lebar ponsel, bukan lebar jendela editor, sehingga pratinjau
 * menampilkan layout mobile yang sama dengan pengunjung sungguhan.
 * React root kedua dipasang di dalam iframe agar event (lightbox, timer)
 * tetap hidup — event tidak menyeberang antar-dokumen.
 * Chassis: frame tinta, notch, hint tombol samping, bayangan berdiri di kertas.
 */
import { useEffect, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { orderedSections, renderSections, themeStyle } from "@umkmcraft/renderer";
import { useEditor } from "@/lib/editor-store";

/** Isi dokumen pratinjau — hidup di dalam iframe, langganan store yang sama. */
function PreviewDocument() {
  const config = useEditor((s) => s.config);
  const selectedId = useEditor((s) => s.selectedId);
  const rootRef = useRef<HTMLDivElement>(null);

  // Urutan node renderSections 1:1 dengan orderedSections (sumber kebenaran
  // yang sama) — zip keduanya supaya tiap section bisa diklik di pratinjau.
  const ordered = orderedSections(config.sections);
  let nodes: React.ReactNode[] | null;
  try {
    nodes = renderSections(config.meta, config.sections);
  } catch {
    nodes = null;
  }

  // Sinkronisasi scroll: section yang dipilih di daftar kiri dicari di preview.
  // Run pertama (mount) dilewati: selectedId awal dari hydrate memicu
  // scrollIntoView yang menggeser panel pratinjau melewati strip first-win
  // di atas kemasan HP — padahal hero memang sudah di paling atas.
  const prevSelectedRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const prev = prevSelectedRef.current;
    prevSelectedRef.current = selectedId;
    if (prev === undefined || prev === selectedId) return;
    if (!selectedId || !rootRef.current) return;
    const el = rootRef.current.querySelector(`[data-preview-section="${selectedId}"]`);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [selectedId]);

  if (!nodes) {
    return (
      <div style={{ padding: 32, textAlign: "center", fontSize: 14 }}>
        Pratinjau tidak dapat dirender — periksa data section.
      </div>
    );
  }

  const handleHitClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Jangan curi klik dari interaksi asli situs (tombol WA, FAQ, lightbox).
    if (target.closest("a,button,input,textarea,select,summary,label,dialog")) return;
    const hit = target.closest("[data-preview-section]");
    if (!hit) return;
    useEditor.getState().select(hit.getAttribute("data-preview-section"));
  };

  return (
    <div ref={rootRef} style={themeStyle(config.meta)} className="uc-site" onClick={handleHitClick}>
      {nodes.map((node, i) => {
        const section = ordered[i];
        if (!section) return node;
        const isSel = section.id === selectedId;
        return (
          <div
            key={section.id}
            data-preview-section={section.id}
            className={`relative cursor-pointer outline-offset-[-2px] hover:outline hover:outline-2 hover:outline-dashed hover:outline-[var(--uc-primary)] motion-safe:transition-[outline-color] motion-safe:duration-150 ${
              isSel ? "outline outline-2 outline-dashed outline-[var(--uc-primary)]" : ""
            }`}
          >
            {node}
          </div>
        );
      })}
    </div>
  );
}

export function PhonePreview() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedId = useEditor((s) => s.selectedId);

  // Satu frame untuk skeleton "kemasan disusun" — pulse motion-safe.
  const [assembled, setAssembled] = useState(false);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    // about:blank same-origin → contentDocument tersedia sinkron. Salin CSS dan
    // variabel font (kelas next/font ada di <body> induk) supaya pratinjau
    // memakai stylesheet yang sama dengan situs asli.
    const head = doc.head;
    head.textContent = "";
    for (const el of document.head.querySelectorAll<HTMLLinkElement | HTMLStyleElement>(
      'link[rel="stylesheet"], style',
    )) {
      head.appendChild(el.cloneNode(true));
    }
    doc.documentElement.className = document.documentElement.className;

    const reset = doc.createElement("style");
    reset.textContent =
      "html{scrollbar-width:none}::-webkit-scrollbar{display:none}body{margin:0;min-height:100vh}";
    head.appendChild(reset);

    const mount = doc.createElement("div");
    mount.style.visibility = "hidden"; // sampai stylesheet iframe siap
    doc.body.appendChild(mount);

    const root: Root = createRoot(mount);
    root.render(<PreviewDocument />);

    const reveal = () => {
      mount.style.visibility = "visible";
      requestAnimationFrame(() => setAssembled(true));
    };
    // Unmount ditunda ke microtask: StrictMode memasang-ulang effect saat
    // React masih merender root lama, dan unmount sinkron memicu race warning.
    const teardown = () => {
      mount.remove();
      queueMicrotask(() => root.unmount());
    };
    if (doc.readyState === "complete") {
      const raf = requestAnimationFrame(reveal);
      return () => {
        cancelAnimationFrame(raf);
        teardown();
      };
    }
    iframe.addEventListener("load", reveal, { once: true });
    return () => {
      iframe.removeEventListener("load", reveal);
      teardown();
    };
  }, []);

  return (
    // Permukaan render = 410px - 2×10px chassis = tepat 390px (janji penguasa kalibrasi)
    <div className="w-full max-w-[410px]">
      {/* Penguasa kalibrasi — 390px dijamin hanya saat chassis penuh (lg) */}
      <div className="mb-3 flex items-center gap-3 px-1">
        <div className="uc-ruler h-[5px] flex-1" aria-hidden />
        <span className="font-display text-[0.65rem] font-bold tabular-nums uppercase tracking-wider text-ink-soft">
          <span className="hidden lg:inline">Pratinjau 390px</span>
          <span className="lg:hidden">Pratinjau ponsel</span>
        </span>
        <div className="uc-ruler h-[5px] flex-1" aria-hidden />
      </div>

      <div className="relative">
        {/* Hint tombol samping kemasan */}
        <div className="absolute -left-[3px] top-24 h-8 w-[3px] rounded-l-full bg-ink/60" aria-hidden />
        <div className="absolute -left-[3px] top-36 h-12 w-[3px] rounded-l-full bg-ink/60" aria-hidden />
        <div className="absolute -right-[3px] top-28 h-14 w-[3px] rounded-r-full bg-ink/60" aria-hidden />

        <div className="rounded-[2.6rem] bg-ink p-2.5 shadow-kemasan">
          <div className="relative overflow-hidden rounded-[2.1rem] bg-card">
            {/* Notch */}
            <div className="absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-ink/90" aria-hidden />
            <div className="relative h-[min(640px,72dvh)] overflow-hidden bg-card lg:h-[640px]">
              <iframe
                ref={iframeRef}
                title="Pratinjau situs"
                src="about:blank"
                className="h-full w-full border-0"
              />
              {!assembled && (
                /* Skeleton kemasan — blok pulse motion-safe */
                <div
                  className="motion-safe:animate-pulse absolute inset-0 space-y-4 overflow-y-auto p-5 pt-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  aria-hidden
                >
                  <div className="h-24 rounded-2xl bg-paper-deep" />
                  <div className="h-4 w-2/3 rounded-full bg-paper-deep" />
                  <div className="h-4 w-1/2 rounded-full bg-paper-deep" />
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                    <div className="h-28 rounded-2xl bg-paper-deep" />
                  </div>
                  <div className="h-11 rounded-full bg-paper-deep" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Kemasan berdiri di kertas — bayangan elips (paper-deep backdrop stand) */}
        <div
          className="mx-auto mt-1 h-4 w-[82%] rounded-[100%] bg-[radial-gradient(ellipse_at_center,rgb(35_28_16/0.28),transparent_68%)]"
          aria-hidden
        />
      </div>

      <p className="mt-3 text-center text-xs leading-relaxed text-ink-soft">
        <span className="hidden lg:inline">
          {selectedId
            ? "Section terpilih disorot di daftar kiri — edit isinya di panel kanan."
            : "Pilih section di kiri untuk mulai mengedit."}
        </span>
        <span className="lg:hidden">
          {selectedId
            ? "Buka tab Atur untuk mengisi section yang dipilih."
            : "Buka tab Susun untuk memilih section, kak."}
        </span>
      </p>
    </div>
  );
}
