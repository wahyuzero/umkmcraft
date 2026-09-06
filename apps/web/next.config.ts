import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16: cacheComponents (top-level, bukan experimental) — 'use cache' + cacheTag
  cacheComponents: true,
  // Workspace packages diekspor sebagai source TS → wajib transpile
  transpilePackages: ["@umkmcraft/schema", "@umkmcraft/utils", "@umkmcraft/renderer", "@umkmcraft/ai"],
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
