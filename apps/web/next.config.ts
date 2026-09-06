import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next 16: cacheComponents (top-level, bukan experimental) — 'use cache' + cacheTag
  cacheComponents: true,
  // Workspace packages diekspor sebagai source TS → wajib transpile
  transpilePackages: ["@umkmcraft/schema", "@umkmcraft/utils", "@umkmcraft/renderer", "@umkmcraft/ai"],
};

export default nextConfig;
