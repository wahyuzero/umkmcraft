import type { MetadataRoute } from "next";

/**
 * Web app manifest (route metadata Next) — dilayani di /manifest.webmanifest.
 * Warna mengikuti dunia builder: kertas hangat sebagai latar, tinta pekat
 * sebagai tema bilah sistem. Ikon memakai apps/web/src/app/icon.svg yang
 * sudah ada (lettermark U, tajam di ukuran kecil) — SVG dapat diskalakan
 * sehingga satu sumber untuk slot any maupun maskable (Android adaptif).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UMKM Craft",
    short_name: "UMKM",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f1e7",
    theme_color: "#231c10",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon.svg", sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}
