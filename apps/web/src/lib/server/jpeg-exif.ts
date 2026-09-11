/**
 * stripJpegExif — penulis-ulang segmen JPEG minimalis (tanpa dependensi).
 *
 * Latar: foto JPEG ponsel membawa segmen APP1 Exif yang hampir selalu
 * memuat koordinat GPS rumah merchant. File disajikan di URL publik
 * /uploads/... → metadata itu ikut bocor ke siapa pun. Solusi: parsing
 * marker JPEG, buang segmen APP1 (Exif, XMP, Extended XMP — GPS tinggal
 * di sini), segmen lain (SOI/APP0 JFIF/APP2 ICC/DQT/SOF/DHT/SOS/EOI)
 * disalin byte-per-byte, lalu di-emit ulang.
 *
 * Batasan yang disengaja (jujur, bukan parser JPEG penuh):
 * - Hanya APP1 yang dibuang. ICC profile memang di APP2 dan aman; IPTC di
 *   APP13 sangat jarang pada JPEG ponsel dan tidak disentuh.
 * - Parsing berhenti di FFDA (SOS): setelah titik itu data entropy-coded
 *   (berisi 0xFF00 stuffing, 0xFFFF padding) dan TIDAK boleh disentuh —
 *   seluruh ekor file disalin verbatim dalam satu subarray.
 * - Fail-open: struktur tak lazim / terpotong / marker janggal → buffer
 *   asli dikembalikan apa adanya. Unggahan merchant TIDAK PERNAH gagal
 *   gara-gara metadata; kegagalan parsing bukan kondisi error.
 */
export function stripJpegExif(input: Buffer): Buffer {
  try {
    // Bukan JPEG (PNG 0x89PNG, WebP RIFF, dll): lewat apa adanya — EXIF di
    // format itu jarang dan letaknya beda mekanisme (chunk/box, bukan marker).
    if (input.length < 4 || input.readUInt8(0) !== 0xff || input.readUInt8(1) !== 0xd8) {
      return input;
    }

    const chunks: Buffer[] = [input.subarray(0, 2)]; // SOI
    let pos = 2;
    for (;;) {
      if (pos >= input.length) return input; // habis sebelum SOS/EOI — fail-open
      if (input.readUInt8(pos) !== 0xff) return input; // marker wajib diawali FF

      // Lewati byte pengisi 0xFF (0xFFFF padding antar segmen itu sah).
      let p = pos;
      while (p < input.length && input.readUInt8(p) === 0xff) p++;
      if (p >= input.length) return input; // terpotong — fail-open
      const marker = input.readUInt8(p);
      if (marker === 0x00 || marker === 0xff) return input; // marker tak valid
      const segStart = p - 1; // salin tepat satu FF sebelum marker

      if (marker === 0xd8) return input; // SOI kedua? struktur tak lazim — fail-open
      if (marker === 0xd9) {
        // EOI — akhir file yang sah.
        chunks.push(input.subarray(segStart, p + 1));
        return Buffer.concat(chunks);
      }
      if (marker === 0xda) {
        // SOS — kepala segmen + seluruh data entropy + EOI disalin verbatim.
        chunks.push(input.subarray(segStart));
        return Buffer.concat(chunks);
      }
      // Marker tunggal tanpa payload panjang: TEM, RST0–RST7.
      if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
        chunks.push(input.subarray(segStart, p + 1));
        pos = p + 1;
        continue;
      }

      // Segmen berpayload: 2 byte panjang big-endian (mencakup dirinya sendiri,
      // tidak termasuk marker FFxx).
      const lenOff = p + 1;
      if (lenOff + 2 > input.length) return input; // terpotong — fail-open
      const segLen = input.readUInt16BE(lenOff);
      if (segLen < 2) return input; // panjang tak masuk akal — fail-open
      const segEnd = lenOff + segLen;
      if (segEnd > input.length) return input; // terpotong — fail-open

      // APP1 (FFE1) = Exif/XMP → dibuang; segmen lain → utuh.
      if (marker !== 0xe1) chunks.push(input.subarray(segStart, segEnd));
      pos = segEnd;
    }
  } catch {
    // Bila punnya pun meledak (buffer rusak dsb.) — fail-open, simpan apa adanya.
    return input;
  }
}
