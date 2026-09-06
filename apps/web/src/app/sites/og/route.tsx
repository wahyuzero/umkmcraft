import { ImageResponse } from "next/og";
import { currentTenantHost, getTenantSnapshot } from "@/lib/server/site-data";

export const size = { width: 1200, height: 630 };

/**
 * OG image dinamis per tenant (SYSTEM_DESIGN §11) — prioritas tinggi:
 * link UMKM dibagikan lewat WhatsApp Group, preview kartu menarik = saluran
 * akuisisi organik gratis.
 */
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get("slug") ?? undefined;
  const host = await currentTenantHost();
  const snap = await getTenantSnapshot(host, slug);
  if (!snap || !snap.config) {
    return new ImageResponse(
      (
        <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f6f1e7", color: "#231c10", fontSize: 64, fontWeight: 700 }}>
          UMKM Craft
        </div>
      ),
      size,
    );
  }

  const { config } = snap;
  const { primary_color, background_color, secondary_color } = config.meta.theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: background_color,
          color: "#1f1503",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 20,
              background: primary_color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 40,
              fontWeight: 800,
            }}
          >
            {config.meta.business_name.charAt(0).toUpperCase()}
          </div>
          <div style={{ fontSize: 30, color: secondary_color, fontWeight: 600 }}>
            {config.meta.business_category.toUpperCase()}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>
            {config.meta.business_name}
          </div>
          <div style={{ fontSize: 38, opacity: 0.78, maxWidth: 900 }}>
            {config.meta.tagline || "Pesan mudah via WhatsApp"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 30, fontWeight: 600 }}>
          <div
            style={{
              padding: "14px 34px",
              borderRadius: 999,
              background: primary_color,
              color: "#fff",
              display: "flex",
              alignItems: "center",
            }}
          >
            💬 Pesan via WhatsApp
          </div>
          <div style={{ opacity: 0.6 }}>{host}</div>
        </div>
      </div>
    ),
    size,
  );
}
