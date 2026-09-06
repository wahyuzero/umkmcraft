/**
 * Moderasi konten publish (SYSTEM_DESIGN §9.2) — lapis deterministik.
 * Dengan AI key, klasifikasi Gemini bisa ditambahkan di atas lapis ini;
 * MVP: deterministic-first, threshold konservatif → flag untuk review manusia.
 */
const BANNED_CONTENT_PATTERNS: Array<[RegExp, string]> = [
  [/\b(saldo|deposit|penarikan|withdraw)\b.{0,30}\b(cair|bonus|gratis|dapat)\b/i, "indikasi skema penipuan keuangan"],
  [/\b(verification|verify|verifikasi)\b.{0,24}\b(account|akun|rekening)\b/i, "pola phishing verifikasi akun"],
  [/\b(kode otp|otp code|masukkan otp)\b/i, "permintaan OTP — pola phishing"],
  [ /\b(hadiah)\b.{0,24}\b(bca|bri|mandiri|gopay|ovo|dana|qris)\b/i, "impersonasi hadiah bank" ],
  [/\b(click\s*the\s*link|klik\s*tautan).{0,24}(klaim|hadiah|bonus)/i, "bait tautan klaim"],
];

export interface ModerationResult {
  ok: boolean;
  flags: string[];
}

export function moderateText(...texts: string[]): ModerationResult {
  const flags: string[] = [];
  const joined = texts.filter(Boolean).join(" \n ");
  for (const [re, reason] of BANNED_CONTENT_PATTERNS) {
    if (re.test(joined)) flags.push(reason);
  }
  return { ok: flags.length === 0, flags };
}
