/**
 * Registry template — daftar tunggal 8 template referensi (riset 04:
 * 1 template per kategori, 0 varian, anti gallery-paralysis).
 * Urutan di sini = urutan tampil galeri /template.
 */
import type { TemplateDefinition } from "./types";
import { warungMakanTemplate } from "./templates/warung-makan";
import { kedaiKopiTemplate } from "./templates/kedai-kopi";
import { barbershopTemplate } from "./templates/barbershop";
import { laundryTemplate } from "./templates/laundry";
import { tokoKueTemplate } from "./templates/toko-kue";
import { bengkelTemplate } from "./templates/bengkel";
import { fashionTemplate } from "./templates/fashion";
import { jasaTemplate } from "./templates/jasa";

export const TEMPLATES: TemplateDefinition[] = [
  warungMakanTemplate,
  kedaiKopiTemplate,
  barbershopTemplate,
  laundryTemplate,
  tokoKueTemplate,
  bengkelTemplate,
  fashionTemplate,
  jasaTemplate,
];
