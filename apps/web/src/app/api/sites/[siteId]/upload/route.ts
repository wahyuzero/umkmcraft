import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { store } from "@/lib/server/store";
import { stripJpegExif } from "@/lib/server/jpeg-exif";

/**
 * Upload foto merchant (multipart/form-data, field "file").
 * File disimpan di .data/uploads/<siteId>/<uuid>-<timestamp>.<ext> dan
 * dilayani kembali via route /uploads/[...path]. Nama file asli dari
 * pengguna TIDAK dipakai sama sekali — path murni dari UUID (Oracle #4).
 * Root mengikuti konvensi store.ts (UMKMCRAFT_DATA_DIR / cwd/.data).
 */
const DATA_DIR = process.env.UMKMCRAFT_DATA_DIR
  ? path.resolve(process.env.UMKMCRAFT_DATA_DIR)
  : path.resolve(process.cwd(), ".data");
const UPLOADS_ROOT = path.join(DATA_DIR, "uploads");

/** 5 MB — cukup untuk foto katalog, menahan unggahan raksasa. */
const MAX_BYTES = 5 * 1024 * 1024;

/** Ekstensi disimpulkan dari content-type, bukan nama file asli. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ siteId: string }> }) {
  const { siteId } = await ctx.params;
  // Kepemilikan: pola persis PATCH /api/sites/[siteId]
  const sessionToken = req.cookies.get("uc_session")?.value;
  if (!sessionToken || !(await store.ownsSite(sessionToken, siteId))) {
    return NextResponse.json({ error: "Tidak diizinkan" }, { status: 403 });
  }
  const site = await store.getSite(siteId);
  if (!site) return NextResponse.json({ error: "Situs tidak ditemukan" }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Data yang dikirim tidak valid" }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Foto tidak ditemukan — pilih fotonya dulu ya, Kak" }, { status: 400 });
  }
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Format foto harus JPG, PNG, atau WebP" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Foto terlalu besar (maks 5 MB)" }, { status: 400 });
  }

  const name = `${randomUUID()}-${Date.now()}${ext}`;
  const dir = path.join(UPLOADS_ROOT, siteId);
  await fs.mkdir(dir, { recursive: true });
  // Privasi: JPEG ponsel membawa APP1 Exif (termasuk koordinat GPS rumah
  // merchant) — dibuang sebelum file dilayani di URL publik /uploads/...
  // Fail-open di dalam stripper: bila parsing gagal, file asli tetap disimpan.
  // PNG/WebP lewat apa adanya (EXIF di format itu jarang; mekanisme chunk-nya
  // berbeda dari marker JPEG — lihat jpeg-exif.ts).
  const raw = Buffer.from(await file.arrayBuffer());
  const bytes = ext === ".jpg" ? stripJpegExif(raw) : raw;
  await fs.writeFile(path.join(dir, name), bytes);

  return NextResponse.json({ url: `/uploads/${siteId}/${name}` });
}
