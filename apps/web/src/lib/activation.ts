/**
 * Checklist aktivasi — deteksi murni (tanpa React/Zustand) atas data demo
 * yang masih tertinggal di config. Kartu ActivationChecklist merender hasil
 * fungsi ini; test unit memakainya langsung tanpa memasang editor.
 *
 * Deteksi di sini MENG-CERMINKAN scanUnfinished() di PublishPreflight.tsx
 * (gerbang publish) dengan duplikasi kecil & terkontrol — konvensi yang sama
 * dengan SAMPLE_STATS di sana men-duplikat `statsDefaults` renderer.
 * Refactor menyatukan konstanta = kandidat iterasi berikutnya (non-goal,
 * gerbang publish sengaja tidak disentuh).
 */
import type { Section, UmkmWebsiteConfig } from "@umkmcraft/schema";

export type ActivationItemId =
  | "wa"
  | "photos"
  | "business_name"
  | "hours_address"
  | "publish";

export interface ActivationItem {
  id: ActivationItemId;
  /** Microcopy final (Label Press) — lihat ActivationChecklist untuk hint. */
  label: string;
  done: boolean;
  /** Section yang di-select saat item diklik; null = bukan section
   *  (business_name → input nama di header; publish → CTA kartu). */
  targetSectionId: string | null;
}

/** Nomor WhatsApp contoh bawaan template — HARUS identik dengan DEMO_WA
 *  (packages/templates/src/instantiate.ts) dan SAMPLE_WA
 *  (PublishPreflight.tsx). Kalau demo di sana berubah, ubah di sini juga. */
export const SAMPLE_WA = "6280000000000";

/** Sentinel bawaan template-engine saat lokasi kosong — HARUS identik dengan
 *  ADDRESS_SENTINEL di PublishPreflight.tsx. */
export const ADDRESS_SENTINEL = "alamat akan diperbarui oleh pemilik usaha";

/** 8 nama usaha demo bawaan template (sumber:
 *  packages/templates/src/templates/*.ts, field `demo.businessName`).
 *  False-positive mungkin bila usaha kebetulan bernama persis nama demo —
 *  dampaknya cuma kartu menyuruh cek nama, tak berbahaya. */
export const DEMO_BUSINESS_NAMES: ReadonlySet<string> = new Set([
  "Warung Bu Sari",
  "Kala Senja Coffee",
  "Rapih Barbershop",
  "BersihKilat Laundry",
  "Dapur Manis Bu Ratna",
  "Jaya Motor Servis",
  "Larasati Batik",
  "SolusiPrint",
]);

/** Mirror isMissingAddress di PublishPreflight.tsx — alamat kosong ATAU masih
 *  persis sentinel dihitung "belum diisi". */
export function isMissingAddress(address: string): boolean {
  const a = address.trim().toLowerCase();
  return a === "" || a === ADDRESS_SENTINEL;
}

/** Nama demo yang cocok dengan nama usaha (setelah trim) — null bila bukan.
 *  Dipakai komponen untuk hint: "X" masih nama contoh template. */
export function matchDemoBusinessName(name: string): string | null {
  const trimmed = name.trim();
  return DEMO_BUSINESS_NAMES.has(trimmed) ? trimmed : null;
}

/**
 * Hitung 5 item aktivasi dalam urutan tetap (denominator progress = 5,
 * termasuk item `publish` — progress situs template biasanya sudah > 0
 * sejak lahir: jam buka & alamat terisi dari template, goal-gradient).
 * Item `publish` TIDAK pernah dirender sebagai baris — ia jadi CTA kartu.
 */
export function computeActivationItems(
  config: UmkmWebsiteConfig,
  published: boolean,
): ActivationItem[] {
  /* 1. wa — mirror deteksi scanUnfinished: cukup SATU sumber masih demo
   *    (meta fallback global ATAU contact_direct yang dipakai renderer saat
   *    ada). Target = contact_direct pertama (urutan array config). */
  let waDemo = config.meta.whatsapp_number === SAMPLE_WA;
  let contactId: string | null = null;
  for (const s of config.sections) {
    if (s.type !== "contact_direct") continue;
    if (contactId === null) contactId = s.id;
    if (s.props.whatsapp_number === SAMPLE_WA) waDemo = true;
  }
  const wa: ActivationItem = {
    id: "wa",
    label: "Ganti nomor WhatsApp contoh",
    done: !waDemo,
    targetSectionId: contactId,
  };

  /* 2. photos — loop PERSIS scanUnfinished (hero, spotlight, produk katalog,
   *    galeri, avatar tim, post Instagram). Target = section PERTAMA yang
   *    punya ≥1 foto kosong. */
  let emptyPhotos = 0;
  let photoSectionId: string | null = null;
  for (const section of config.sections) {
    let emptyInSection = 0;
    if (section.type === "hero_storefront" || section.type === "product_spotlight") {
      if (!section.props.image_url) emptyInSection = 1;
    } else if (section.type === "product_catalog_wa") {
      emptyInSection = section.props.products.filter((p) => !p.image_url).length;
    } else if (section.type === "gallery_grid") {
      emptyInSection = section.props.items.filter((i) => !i.image_url).length;
    } else if (section.type === "team_members_grid") {
      emptyInSection = section.props.members.filter((m) => !m.avatar_url).length;
    } else if (section.type === "instagram_showcase_grid") {
      emptyInSection = section.props.posts.filter((p) => !p.image_url).length;
    }
    if (emptyInSection > 0 && photoSectionId === null) photoSectionId = section.id;
    emptyPhotos += emptyInSection;
  }
  const photos: ActivationItem = {
    id: "photos",
    // Label spesifik hanya untuk kondisi pending (yang dirender, termasuk
    // saat momen flash check-off); saat done barisnya tak pernah tampil.
    label:
      emptyPhotos === 0
        ? "Foto usaha sudah lengkap"
        : emptyPhotos === 1
          ? "Isi 1 foto yang masih kosong"
          : `Isi ${emptyPhotos} foto yang masih kosong`,
    done: emptyPhotos === 0,
    targetSectionId: photoSectionId,
  };

  /* 3. business_name — nama kosong "" dihitung done (scanUnfinished juga
   *    tidak menagih; kekosongan tercakup di header editor). Bukan section —
   *    target = input nama di header (id "uc-business-name"). */
  const businessName: ActivationItem = {
    id: "business_name",
    label: "Ganti nama usaha contoh",
    done: matchDemoBusinessName(config.meta.business_name) === null,
    targetSectionId: null,
  };

  /* 4. hours_address — mirror scanUnfinished: alamat ditag hanya bila
   *    kosong/sentinel DAN tanpa gmaps_url; jam ditag bila open_hours kosong.
   *    Tidak ada section jam-operasional sama sekali → done. */
  const ohms = config.sections.filter(
    (s): s is Extract<Section, { type: "operating_hours_map" }> =>
      s.type === "operating_hours_map",
  );
  const addressOk = ohms.every(
    (s) => !isMissingAddress(s.props.address) || s.props.gmaps_url !== "",
  );
  const hoursOk = ohms.every((s) => s.props.open_hours.length > 0);
  const hoursAddressLabel =
    !addressOk && !hoursOk
      ? "Lengkapi jam buka & alamat"
      : !addressOk
        ? "Isi alamat usaha"
        : !hoursOk
          ? "Lengkapi jam buka"
          : "Lengkapi jam buka & alamat"; // done — tidak pernah dirender
  const hoursAddress: ActivationItem = {
    id: "hours_address",
    label: hoursAddressLabel,
    done: ohms.length === 0 || (addressOk && hoursOk),
    targetSectionId: ohms[0]?.id ?? null,
  };

  /* 5. publish — status CTA, bukan baris. done ⇔ situs sudah terbit. */
  const publish: ActivationItem = {
    id: "publish",
    label: "Terbitkan Situs",
    done: published,
    targetSectionId: null,
  };

  return [wa, photos, businessName, hoursAddress, publish];
}
