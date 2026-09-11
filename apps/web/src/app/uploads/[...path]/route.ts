import { promises as fs } from "node:fs";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

/**
 * File server foto hasil upload merchant — membaca dari .data/uploads/
 * SAJA. Path di luar root (termasuk "..", "%2e%2e", separator) ditolak
 * dengan 404, bukan 400/500 — jangan bocorkan bentuk filesystem.
 * Nama file selalu <uuid>-<timestamp>.<ext> → immutable, jadi cache
 * setahun aman.
 */

const DATA_DIR = process.env.UMKMCRAFT_DATA_DIR
  ? path.resolve(process.env.UMKMCRAFT_DATA_DIR)
  : path.resolve(process.cwd(), ".data");
const UPLOADS_ROOT = path.join(DATA_DIR, "uploads");

const CONTENT_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

function notFound() {
  return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 404 });
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await ctx.params;
  if (!segments || segments.length === 0) return notFound();

  // Next sudah men-decode %XX di params — validasi hasil decode.
  for (const seg of segments) {
    if (!seg || seg === "." || seg.includes("..") || seg.includes("/") || seg.includes("\\")) {
      return notFound();
    }
  }

  const resolved = path.resolve(UPLOADS_ROOT, ...segments);
  // Jaminan terakhir: hasil resolve tetap persis di dalam root uploads
  // (startsWith telanjang bisa lolos lewat sibling seperti "uploads-evil").
  if (!resolved.startsWith(UPLOADS_ROOT + path.sep)) return notFound();

  const type = CONTENT_TYPES[path.extname(resolved).toLowerCase()];
  if (!type) return notFound();

  try {
    const data = await fs.readFile(resolved);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "content-type": type,
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return notFound();
  }
}
