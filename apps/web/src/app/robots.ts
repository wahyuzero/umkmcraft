import type { MetadataRoute } from "next";

/** robots.txt sederhana untuk builder host. Tenant punya generateMetadata masing-masing. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/start"],
        disallow: ["/api/", "/editor/", "/sites/"],
      },
    ],
  };
}
