import { describe, expect, it } from "vitest";
import {
  createWhatsAppOrderLink,
  createWhatsAppChatLink,
  normalizeWaNumber,
  isValidWaNumber,
  formatRupiah,
} from "../src/whatsapp";
import { slugify, checkSlug, safeSlugFromName } from "../src/slug";
import { clampString, sanitizeUrl, sanitizeColor, dedupeSectionIds } from "../src/sanitize";

describe("whatsapp", () => {
  it("order link persis kontrak COMPONENTS.md §4", () => {
    const link = createWhatsAppOrderLink("6281234567890", "Sambal Original", 35000, "Sambal Juara");
    expect(link.startsWith("https://wa.me/6281234567890?text=")).toBe(true);
    const decoded = decodeURIComponent(link.split("text=")[1]!);
    expect(decoded).toContain("Halo Sambal Juara! 👋");
    expect(decoded).toContain("*Sambal Original*");
    expect(decoded).toContain("Rp35.000");
  });

  it("emoji & karakter unicode aman di-encode", () => {
    const link = createWhatsAppOrderLink("628123", "Sambal 🌶️ pedes", 1000, "Toko");
    expect(link).toMatch(/^https:\/\/wa\.me\/628123\?text=[A-Za-z0-9%._~!$'()*+,;:@/?-]+$/);
  });

  it("normalize 08xx dan 8xx → 62xx", () => {
    expect(normalizeWaNumber("0812-3456-7890")).toBe("6281234567890");
    expect(normalizeWaNumber("81234567890")).toBe("6281234567890");
    expect(isValidWaNumber("6281234567890")).toBe(true);
    expect(isValidWaNumber("081234567890")).toBe(false);
  });

  it("formatRupiah id-ID", () => {
    expect(formatRupiah(35000)).toBe("Rp35.000");
  });

  it("chat link tanpa prefill", () => {
    expect(createWhatsAppChatLink("6281234567890")).toBe("https://wa.me/6281234567890");
  });
});

describe("slug (anti-phishing ADR-4)", () => {
  it("slugify bersih", () => {
    expect(slugify("Sambal Cumi Asap Juara!")).toBe("sambal-cumi-asap-juara");
  });
  it("menolak slug reserved bank/marketplace", () => {
    expect(checkSlug("bca").ok).toBe(false);
    expect(checkSlug("shopee").ok).toBe(false);
    expect(checkSlug("login").ok).toBe(false);
  });
  it("menolak pola phishing", () => {
    expect(checkSlug("verifikasi-akun").ok).toBe(false);
  });
  it("menolak format invalid", () => {
    expect(checkSlug("ab").ok).toBe(false);
    expect(checkSlug("-invalid-").ok).toBe(false);
  });
  it("safeSlugFromName fallback suffix", () => {
    const r = safeSlugFromName("BCA", "usaha");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.slug).toContain("usaha");
  });
});

describe("sanitize (SYSTEM_DESIGN §7.3)", () => {
  it("blokir javascript: & data:", () => {
    expect(sanitizeUrl("javascript:alert(1)")).toBe("");
    expect(sanitizeUrl("data:text/html,<script>")).toBe("");
    expect(sanitizeUrl("https://amankak.com/a")).toBe("https://amankak.com/a");
    expect(sanitizeUrl("ftp://x")).toBe("");
  });
  it("blokir kredensial inline URL", () => {
    expect(sanitizeUrl("https://user:pass@evil.com/x")).toBe("");
  });
  it("clampString dengan ellipsis", () => {
    expect(clampString("a".repeat(200), 80)).toHaveLength(80);
    expect(clampString("pendek", 80)).toBe("pendek");
  });
  it("sanitizeColor", () => {
    expect(sanitizeColor("#D97706")).toBe("#d97706");
    expect(sanitizeColor("merah")).toBe("");
  });
  it("dedupeSectionIds", () => {
    const sections = [{ id: "sec-hero-1" }, { id: "sec-hero-1" }, { id: "BAD ID!" }];
    dedupeSectionIds(sections);
    expect(sections[0]!.id).toBe("sec-hero-1");
    expect(sections[1]!.id).toBe("sec-hero-1-2");
    expect(sections[2]!.id).toBe("sec");
  });
});
