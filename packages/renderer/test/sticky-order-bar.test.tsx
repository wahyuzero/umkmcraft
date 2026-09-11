/**
 * Smoke test StickyOrderBar — island CTA sticky (P1 audit UI/UX).
 * Environment test = node (tanpa jsdom), jadi yang bisa diverifikasi adalah
 * output SSR: label, link wa.me, state awal tersembunyi (menunggu
 * IntersectionObserver pasca-hidrasi), spacer cadangan, dan target sentuh.
 * Efek observer/reduced-motion diperiksa manual di browser (dev server).
 */
import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { StickyOrderBar } from "../src/client/StickyOrderBar";

describe("StickyOrderBar — output SSR", () => {
  const html = renderToStaticMarkup(createElement(StickyOrderBar, { whatsapp: "6281234567890" }));

  it("merender label, link wa.me, dan glyph SVG inline (bukan lucide)", () => {
    expect(html).toContain("Pesan via WhatsApp");
    expect(html).toContain("https://wa.me/6281234567890");
    expect(html).toContain("<svg");
    expect(html.toLowerCase()).not.toContain("lucide");
  });

  it("state awal tersembunyi + spacer 64px + konvensi visual WaButton", () => {
    expect(html).toContain("invisible"); /* tak fokusabel sebelum hero lewat */
    expect(html).toContain("h-16"); /* spacer anti-clip konten */
    expect(html).toContain("min-h-[52px]");
    expect(html).toContain("safe-area-inset-bottom");
    expect(html).toContain("cubic-bezier(0.16,1,0.3,1)"); /* ease-out-expo */
    expect(html).toContain("var(--uc-primary)"); /* theming tenant */
  });

  it("label kustom dapat ditimpa via prop", () => {
    const custom = renderToStaticMarkup(
      createElement(StickyOrderBar, { whatsapp: "6281234567890", label: "Order Sekarang" }),
    );
    expect(custom).toContain("Order Sekarang");
    expect(custom).not.toContain("Pesan via WhatsApp");
  });
});
