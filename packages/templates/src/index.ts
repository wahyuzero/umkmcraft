/**
 * @umkmcraft/templates — fondasi sistem template siap pakai.
 * - listTemplates(): katalog urut galeri (kartu /template).
 * - getTemplateById(id): pratinjau & API from-template.
 * - instantiateTemplate(id, input): config final + asersi skema fail-loud.
 */
import { TEMPLATES } from "./registry";
import type { TemplateDefinition } from "./types";

export { instantiateTemplate } from "./instantiate";
export type { TemplateDefinition, TemplateInput, InstantiateResult } from "./types";

/** Katalog template, urut: warung → kopi → barbershop → laundry → kue → bengkel → fashion → jasa. */
export function listTemplates(): TemplateDefinition[] {
  return [...TEMPLATES];
}

/** Ambil satu template by id; tidak ada → null (jangan throw, route menampilkan pesan). */
export function getTemplateById(id: string): TemplateDefinition | null {
  return TEMPLATES.find((t) => t.id === id) ?? null;
}
