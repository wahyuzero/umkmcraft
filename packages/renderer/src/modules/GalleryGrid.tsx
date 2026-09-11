/**
 * Modul gallery_grid — galeri foto produk/kegiatan (COMPONENTS.md §J turunan).
 * Grid thumbnail persegi + lightbox (island GalleryLightbox). RSC murni —
 * seluruh interaksi zoom/prev/next hidup di island klien.
 */
import type { SectionProps } from "@umkmcraft/schema";
import { SectionHeader, SectionShell } from "../primitives";
import { GalleryLightbox } from "../client/GalleryLightbox";

export type GalleryGridProps = SectionProps<"gallery_grid">;

export const galleryDefaults: GalleryGridProps = {
  section_title: "Galeri",
  section_subtitle: "Intip hasil kerja tangan kami dari dekat.",
  layout: "grid_3_col",
  items: [],
};

const LAYOUT_GRID: Record<GalleryGridProps["layout"], string> = {
  grid_2_col: "grid-cols-2",
  grid_3_col: "grid-cols-2 sm:grid-cols-3",
  grid_4_col: "grid-cols-2 sm:grid-cols-4",
};

export function GalleryGrid({ id, props, category = "" }: { id: string; props: GalleryGridProps; category?: string }) {
  return (
    <SectionShell id={id} tone="surface">
      <SectionHeader title={props.section_title} subtitle={props.section_subtitle} />
      <GalleryLightbox
        items={props.items}
        gridClassName={LAYOUT_GRID[props.layout]}
        ariaLabel={props.section_title || "Galeri foto"}
        category={category}
      />
    </SectionShell>
  );
}
