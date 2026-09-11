import { describe, expect, it } from "vitest";
import { stripJpegExif } from "../src/lib/server/jpeg-exif";

/**
 * Uji penulis-ulang segmen JPEG (stripJpegExif) — buffer JPEG kecil
 * dibangun manual byte-per-byte: SOI, APP0 JFIF, APP1 Exif (dengan GPS
 * palsu), APP1 XMP, DQT, SOF0, SOS, data entropy (berisi FF00 stuffing),
 * EOI. Kontrak: APP1 hilang, byte lain utuh, fail-open untuk input rusak.
 */

/** Segmen berpayload: FF <marker> <len:2> <payload> — len mencakup 2 byte len. */
function seg(marker: number, payload: Buffer): Buffer {
  const len = payload.length + 2;
  const head = Buffer.from([0xff, marker, (len >> 8) & 0xff, len & 0xff]);
  return Buffer.concat([head, payload]);
}

const SOI = Buffer.from([0xff, 0xd8]);
const EOI = Buffer.from([0xff, 0xd9]);

const JFIF_PAYLOAD = Buffer.concat([
  Buffer.from("JFIF\0", "binary"),
  Buffer.from([0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00]),
]);
const EXIF_PAYLOAD = Buffer.concat([
  Buffer.from("Exif\0\0", "binary"),
  // TIFF header + GPS IFD palsu (koordinat rumah merchant — HARUS hilang)
  Buffer.from([0x4d, 0x4d, 0x00, 0x2a, 0x00, 0x00, 0x00, 0x08]),
  Buffer.from([0x47, 0x50, 0x53, 0x00, 0xde, 0xad, 0xbe, 0xef]),
]);
const XMP_PAYLOAD = Buffer.concat([Buffer.from("http://ns.adobe.com/xap/1.0/\0", "binary"), Buffer.from("<x/>")]);
const DQT_PAYLOAD = Buffer.from(Array.from({ length: 65 }, (_, i) => (i * 7) % 256));
const SOF_PAYLOAD = Buffer.from([
  0x08, 0x00, 0x78, 0x00, 0x78, 0x01, 0x01, 0x00, 0x00, 0x01, 0x11, 0x00,
]);
const SOS_HEAD = seg(0xda, Buffer.from([0x01, 0x01, 0x00, 0x00, 0x3f, 0x00]));
const ENTROPY = Buffer.from([0x12, 0x34, 0xff, 0x00, 0xab, 0x56, 0x78, 0x9a]);

function buildJpeg(...middles: Buffer[]): Buffer {
  return Buffer.concat([SOI, ...middles, SOS_HEAD, ENTROPY, EOI]);
}

const FULL_JPEG = buildJpeg(seg(0xe0, JFIF_PAYLOAD), seg(0xe1, EXIF_PAYLOAD), seg(0xe1, XMP_PAYLOAD), seg(0xdb, DQT_PAYLOAD), seg(0xc0, SOF_PAYLOAD));
const APP1_SEGMENTS = [seg(0xe1, EXIF_PAYLOAD), seg(0xe1, XMP_PAYLOAD)];
const APP1_LEN = APP1_SEGMENTS.reduce((n, s) => n + s.length, 0);

describe("stripJpegExif", () => {
  it("membuang semua APP1 (Exif GPS + XMP), segmen lain utuh byte-per-byte", () => {
    const out = stripJpegExif(FULL_JPEG);

    expect(out.subarray(0, 2).equals(SOI)).toBe(true);
    expect(out.subarray(out.length - 2).equals(EOI)).toBe(true);
    // Exif + GPS + XMP hilang total
    expect(out.includes(Buffer.from("Exif\0\0", "binary"))).toBe(false);
    expect(out.includes(Buffer.from([0x47, 0x50, 0x53]))).toBe(false);
    expect(out.indexOf(Buffer.from([0xff, 0xe1]))).toBe(-1);
    // APP0 JFIF, DQT, SOF0 tetap ada
    expect(out.includes(Buffer.from("JFIF\0", "binary"))).toBe(true);
    expect(out.includes(DQT_PAYLOAD)).toBe(true);
    expect(out.includes(SOF_PAYLOAD)).toBe(true);
    // Data entropy + EOI identik (ekor file disalin verbatim)
    expect(out.subarray(out.length - ENTROPY.length - 2, out.length - 2).equals(ENTROPY)).toBe(true);
    // Panjang persis berkurang sebesar dua segmen APP1
    expect(out.length).toBe(FULL_JPEG.length - APP1_LEN);
  });

  it("JPEG tanpa APP1 lolos tanpa diubah sedikit pun", () => {
    const plain = buildJpeg(seg(0xe0, JFIF_PAYLOAD), seg(0xdb, DQT_PAYLOAD), seg(0xc0, SOF_PAYLOAD));
    expect(stripJpegExif(plain).equals(plain)).toBe(true);
  });

  it("byte pengisi 0xFF ekstra antar segmen dinormalisasi tanpa merusak struktur", () => {
    const padded = Buffer.concat([SOI, Buffer.from([0xff, 0xff]), seg(0xe0, JFIF_PAYLOAD), Buffer.from([0xff, 0xff, 0xff]), SOS_HEAD, ENTROPY, EOI]);
    const out = stripJpegExif(padded);
    expect(out.includes(Buffer.from([0xff, 0xff]))).toBe(false);
    expect(out.includes(Buffer.from("JFIF\0", "binary"))).toBe(true);
    expect(out.subarray(out.length - 2).equals(EOI)).toBe(true);
  });

  it("bukan JPEG (PNG) → dikembalikan apa adanya", () => {
    const png = Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      Buffer.from("palsu tapi bukan urusan kita", "binary"),
    ]);
    expect(stripJpegExif(png)).toBe(png);
  });

  it("fail-open: JPEG terpotong / panjang segmen tak masuk akal → buffer asli", () => {
    const truncatedLen = Buffer.concat([SOI, Buffer.from([0xff, 0xe1, 0x00])]);
    expect(stripJpegExif(truncatedLen).equals(truncatedLen)).toBe(true);

    const overlongLen = Buffer.concat([SOI, Buffer.from([0xff, 0xe1, 0xff, 0xff, 0x45, 0x78]), EOI]);
    expect(stripJpegExif(overlongLen).equals(overlongLen)).toBe(true);

    const badLen = Buffer.concat([SOI, Buffer.from([0xff, 0xe0, 0x00, 0x01, 0xde, 0xad]), EOI]);
    expect(stripJpegExif(badLen).equals(badLen)).toBe(true);

    const noTail = Buffer.concat([SOI, seg(0xe0, JFIF_PAYLOAD)]);
    expect(stripJpegExif(noTail).equals(noTail)).toBe(true);
  });
});
