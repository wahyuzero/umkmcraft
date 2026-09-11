import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16: cacheComponents (top-level, bukan experimental) — 'use cache' + cacheTag
  cacheComponents: true,
  // Workspace packages diekspor sebagai source TS → wajib transpile
  transpilePackages: ["@umkmcraft/schema", "@umkmcraft/utils", "@umkmcraft/renderer", "@umkmcraft/ai"],
  // Dev server Next 16 memblokir asset & websocket HMR dari host yang tidak
  // dipercaya — tanpa ini, vhost tenant demo (*.lvh.me) dimuat tanpa hidrasi:
  // semua client island (lightbox, timer, sticky bar) mati di URL produksi.
  allowedDevOrigins: ["lvh.me", "*.lvh.me"],
  // Badge dev Next memenuhi sudut layar saat screen-share demo — matikan
  // (skema Next 16: `false | { position }`; `false` menghapus indikator penuh).
  devIndicators: false,
  async headers() {
    return [
      {
        // Situs tenant: hardening dasar (SYSTEM_DESIGN §9.2).
        // CSP nonce-based penuh ditunda ke produksi (butuh wiring middleware);
        // frame-ancestors + nosniff + referrer policy aman diterapkan sekarang.
        source: "/sites/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;
