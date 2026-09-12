import { describe, expect, it } from "vitest";
import type { UmkmWebsiteConfig } from "@umkmcraft/schema";
import { UmkmWebsiteConfigSchema } from "@umkmcraft/schema";
import {
  ADDRESS_SENTINEL,
  computeActivationItems,
  isMissingAddress,
  matchDemoBusinessName,
} from "../src/lib/activation";
import { useEditor } from "../src/lib/editor-store";

/**
 * Uji computeActivationItems — deteksi checklist aktivasi (mirror
 * scanUnfinished di PublishPreflight) + aturan sinkron WA dan tick publish
 * di editor-store. Config dibangun lewat UmkmWebsiteConfigSchema agar
 * bentuk data realistis (default skema ikut terisi).
 */

const DEMO_WA = "6280000000000";
const REAL_WA = "628123456789";

function cfg(whatsapp: string, sections: unknown[], businessName = "Usaha Uji Aktivasi"): UmkmWebsiteConfig {
  return UmkmWebsiteConfigSchema.parse({
    meta: {
      site_id: "activation-test",
      business_name: businessName,
      business_category: "kuliner",
      tagline: "Rasa rumahan buat dagang online",
      schema_version: 1,
      theme: {
        preset: "spicy_amber",
        primary_color: "#d97706",
        secondary_color: "#991b1b",
        background_color: "#fffbeb",
        font_heading: "Plus Jakarta Sans",
        font_body: "Plus Jakarta Sans",
      },
      whatsapp_number: whatsapp,
      seo: { title: "", description: "", keywords: [] },
    },
    sections,
  });
}

const contactDemo = { id: "kontak", type: "contact_direct", props: { whatsapp_number: DEMO_WA } };
const contactReal = { id: "kontak", type: "contact_direct", props: { whatsapp_number: REAL_WA } };
const contactReal2 = { id: "kontak-2", type: "contact_direct", props: { whatsapp_number: REAL_WA } };

// image_url default skema = "" → hero segar PASTI punya 1 foto kosong.
const hero = { id: "hero", type: "hero_storefront", props: { title: "Sate Klak", cta_primary: {} } };
const heroFilled = { ...hero, props: { ...hero.props, image_url: "/hero.png" } };

// Katalog 2 produk: 1 kosong + 1 terisi (untuk hitungan lintas modul).
const catalog = {
  id: "katalog",
  type: "product_catalog_wa",
  props: {
    products: [
      { id: "p1", name: "Es Teh", price: 5000 },
      { id: "p2", name: "Kopi Tubruk", price: 8000, image_url: "/kopi.png" },
    ],
  },
};
const catalogFilled = {
  ...catalog,
  props: {
    products: [
      { id: "p1", name: "Es Teh", price: 5000, image_url: "/es-teh.png" },
      { id: "p2", name: "Kopi Tubruk", price: 8000, image_url: "/kopi.png" },
    ],
  },
};

// Galeri 2 item: 1 kosong + 1 terisi.
const gallery = {
  id: "galeri",
  type: "gallery_grid",
  props: { items: [{ title: "A", image_url: "" }, { title: "B", image_url: "/b.png" }] },
};
const galleryFilled = {
  ...gallery,
  props: { items: [{ title: "A", image_url: "/a.png" }, { title: "B", image_url: "/b.png" }] },
};

// Jam & alamat terisi (kondisi situs template — alamat bukan sentinel).
const ohm = {
  id: "jam",
  type: "operating_hours_map",
  props: {
    address: "Jl. Kenanga No. 9, Bandung",
    open_hours: [{ day_of_week: 1, open: "08:00", close: "17:00" }],
  },
};
const ohmNoAddress = { ...ohm, id: "jam-kosong", props: { ...ohm.props, address: "" } };

function item(items: ReturnType<typeof computeActivationItems>, id: string) {
  const found = items.find((i) => i.id === id);
  expect(found, `item ${id} harus ada`).toBeDefined();
  return found!;
}

describe("computeActivationItems — situs template segar", () => {
  it("wa/photos/business_name pending, hours_address done, publish pending; tetap 5 item", () => {
    const fresh = cfg(DEMO_WA, [hero, catalog, gallery, ohm, contactDemo], "Warung Bu Sari");
    const items = computeActivationItems(fresh, false);

    expect(items).toHaveLength(5);
    expect(item(items, "wa").done).toBe(false);
    expect(item(items, "photos").done).toBe(false);
    expect(item(items, "business_name").done).toBe(false);
    expect(item(items, "hours_address").done).toBe(true); // alamat + jam diisi template
    expect(item(items, "publish").done).toBe(false);
    // Progress tidak dimulai dari 0 (goal-gradient): 2 selesai sejak lahir.
    expect(item(items, "photos").label).toContain("3"); // hero 1 + katalog 1 + galeri 1
  });
});

describe("computeActivationItems — deteksi WA (mirror scanUnfinished)", () => {
  it("WA asli di meta DAN contact → wa done", () => {
    const items = computeActivationItems(cfg(REAL_WA, [contactReal]), false);
    expect(item(items, "wa").done).toBe(true);
  });

  it("kedua sumber dicek: meta demo + contact asli → pending; meta asli + contact demo → pending", () => {
    // Sama dengan scanUnfinished: cukup salah satu sumber masih demo.
    const metaDemo = computeActivationItems(cfg(DEMO_WA, [contactReal]), false);
    expect(item(metaDemo, "wa").done).toBe(false);

    const contactOnly = computeActivationItems(cfg(REAL_WA, [contactDemo]), false);
    expect(item(contactOnly, "wa").done).toBe(false);
  });
});

describe("computeActivationItems — hitungan foto lintas modul", () => {
  it("hero 1 + katalog 2 + galeri 1 = label '4'", () => {
    const config = cfg(REAL_WA, [
      hero,
      { ...catalog, props: { products: [{ id: "p1", name: "A", price: 1000 }, { id: "p2", name: "B", price: 2000 }] } },
      gallery,
    ]);
    const items = computeActivationItems(config, false);
    expect(item(items, "photos").label).toContain("4");
    expect(item(items, "photos").done).toBe(false);
  });

  it("semua foto terisi (termasuk avatar tim & post Instagram) → done", () => {
    const config = cfg(REAL_WA, [
      heroFilled,
      catalogFilled,
      galleryFilled,
      { id: "tim", type: "team_members_grid", props: { members: [{ name: "Bu Sari", avatar_url: "/sari.png" }] } },
      { id: "ig", type: "instagram_showcase_grid", props: { posts: [{ image_url: "/post.png", caption: "x" }] } },
    ]);
    const items = computeActivationItems(config, false);
    expect(item(items, "photos").done).toBe(true);
    expect(item(items, "photos").label).not.toMatch(/\d/); // tanpa angka saat done
  });
});

describe("computeActivationItems — nama usaha demo", () => {
  it("nama demo (wakil + varian spasi/trim) → pending", () => {
    for (const name of ["Warung Bu Sari", "Kala Senja Coffee", "SolusiPrint", "  Warung Bu Sari  "]) {
      const items = computeActivationItems(cfg(REAL_WA, [heroFilled], name), false);
      expect(item(items, "business_name").done, name).toBe(false);
    }
    // Nama demo yang cocok disisipkan ke hint komponen lewat helper ini.
    expect(matchDemoBusinessName("  Kala Senja Coffee ")).toBe("Kala Senja Coffee");
    expect(matchDemoBusinessName("Warung Sambal Ndeso")).toBeNull();
  });

  it("nama sendiri / nama kosong → done", () => {
    const own = computeActivationItems(cfg(REAL_WA, [heroFilled], "Warung Sambal Ndeso"), false);
    expect(item(own, "business_name").done).toBe(true);

    // "" dihitung done (scanUnfinished juga tidak menagih) — config dibangun
    // langsung tanpa parse karena skema meta menuntut min(1).
    const empty = { ...cfg(REAL_WA, [heroFilled]), meta: { ...cfg(REAL_WA, [heroFilled]).meta, business_name: "" } };
    expect(item(computeActivationItems(empty, false), "business_name").done).toBe(true);
  });
});

describe("computeActivationItems — jam & alamat", () => {
  it("alamat kosong tanpa gmaps → pending, label alamat", () => {
    const items = computeActivationItems(cfg(REAL_WA, [{ ...ohm, props: { ...ohm.props, address: "" } }]), false);
    expect(item(items, "hours_address").done).toBe(false);
    expect(item(items, "hours_address").label).toBe("Isi alamat usaha");
  });

  it("alamat masih sentinel → pending", () => {
    expect(isMissingAddress(ADDRESS_SENTINEL)).toBe(true);
    const items = computeActivationItems(
      cfg(REAL_WA, [{ ...ohm, props: { ...ohm.props, address: ADDRESS_SENTINEL } }]),
      false,
    );
    expect(item(items, "hours_address").done).toBe(false);
  });

  it("alamat kosong tapi gmaps_url terisi → addressOk (mirror preflight)", () => {
    const items = computeActivationItems(
      cfg(REAL_WA, [{ ...ohm, props: { ...ohm.props, address: "", gmaps_url: "https://maps.google.com/x" } }]),
      false,
    );
    expect(item(items, "hours_address").done).toBe(true);
  });

  it("open_hours kosong → pending, label jam", () => {
    const items = computeActivationItems(
      cfg(REAL_WA, [{ ...ohm, props: { ...ohm.props, open_hours: [] } }]),
      false,
    );
    expect(item(items, "hours_address").done).toBe(false);
    expect(item(items, "hours_address").label).toBe("Lengkapi jam buka");
  });

  it("tanpa section jam-operasional → done", () => {
    const items = computeActivationItems(cfg(REAL_WA, [heroFilled]), false);
    expect(item(items, "hours_address").done).toBe(true);
  });
});

describe("computeActivationItems — publish & targetSectionId", () => {
  it("published=true → publish done; semua item done saat config juga bersih", () => {
    const clean = cfg(REAL_WA, [heroFilled, catalogFilled, galleryFilled, ohm, contactReal], "Warung Sambal Ndeso");
    expect(item(computeActivationItems(clean, false), "publish").done).toBe(false);
    const all = computeActivationItems(clean, true);
    expect(all.every((i) => i.done)).toBe(true); // kartu akan unmount — fungsi tetap murni
  });

  it("targetSectionId: photos → section array-pertama ber-foto kosong; wa → contact pertama; tanpa contact → null", () => {
    const order = computeActivationItems(cfg(REAL_WA, [gallery, heroFilled, catalog]), false);
    expect(item(order, "photos").targetSectionId).toBe("galeri");

    const order2 = computeActivationItems(cfg(REAL_WA, [heroFilled, catalog, gallery]), false);
    expect(item(order2, "photos").targetSectionId).toBe("katalog");

    const wa = computeActivationItems(cfg(REAL_WA, [contactDemo, contactReal2]), false);
    expect(item(wa, "wa").targetSectionId).toBe("kontak"); // contact_direct pertama

    const noContact = computeActivationItems(cfg(DEMO_WA, [heroFilled]), false);
    expect(item(noContact, "wa").done).toBe(false);
    expect(item(noContact, "wa").targetSectionId).toBeNull();

    const hours = computeActivationItems(cfg(REAL_WA, [ohm, ohmNoAddress]), false);
    expect(item(hours, "hours_address").targetSectionId).toBe("jam");
  });
});

describe("editor-store — sinkron WA di updateSectionProps", () => {
  it("contact_direct whatsapp_number valid → meta ikut berubah dalam set() yang sama", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", REAL_WA);
    const config = useEditor.getState().config;
    expect(config.meta.whatsapp_number).toBe(REAL_WA);
    expect(config.sections[0]!.props.whatsapp_number).toBe(REAL_WA);
    // Item `wa` langsung selesai — sinkron menutup bug renderer yang memakai meta.
    expect(item(computeActivationItems(config, false), "wa").done).toBe(true);
  });

  it("input ber-prefiks 0 dinormalisasi dulu → meta menerima bentuk 62… yang sah (§4a)", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "08123456789");
    expect(useEditor.getState().config.meta.whatsapp_number).toBe(REAL_WA);
  });

  it("input invalid ('abc') → meta TIDAK disentuh (jangan pecahkan PATCH Zod)", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo]), saveState: "idle" });
    useEditor.getState().updateSectionProps("kontak", "whatsapp_number", "abc");
    expect(useEditor.getState().config.meta.whatsapp_number).toBe(DEMO_WA);
  });

  it("bukan whatsapp_number / bukan contact_direct → meta tak tersentuh", () => {
    useEditor.setState({ config: cfg(DEMO_WA, [contactDemo, heroFilled]), saveState: "idle" });
    useEditor.getState().updateSectionProps("hero", "image_url", "/lain.png");
    expect(useEditor.getState().config.meta.whatsapp_number).toBe(DEMO_WA);
    useEditor.getState().updateSectionProps("kontak", "address", "Jl. Baru No. 2");
    expect(useEditor.getState().config.meta.whatsapp_number).toBe(DEMO_WA);
  });
});

describe("editor-store — jembatan CTA terbitkan", () => {
  it("requestPublish menaikkan publishRequestTick (publish sendiri dijalankan PublishButton)", () => {
    const before = useEditor.getState().publishRequestTick;
    useEditor.getState().requestPublish();
    expect(useEditor.getState().publishRequestTick).toBe(before + 1);
    useEditor.getState().requestPublish();
    expect(useEditor.getState().publishRequestTick).toBe(before + 2);
  });
});
