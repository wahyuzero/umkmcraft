/**
 * WhatsApp URL builder — COMPONENTS.md §4 (kontrak binding).
 * Validasi nomor Indonesia (62xxx) + encodeURIComponent penuh.
 */
export function normalizeWaNumber(raw: string): string {
  let digits = raw.replace(/[^0-9]/g, "");
  if (digits.startsWith("0")) digits = `62${digits.slice(1)}`;
  if (digits.startsWith("8")) digits = `62${digits}`;
  return digits;
}

export function isValidWaNumber(phone: string): boolean {
  return /^62\d{8,13}$/.test(phone);
}

export function formatRupiah(amount: number): string {
  // PUEBI: "Rp" menempel tanpa spasi — Intl terkadang menambah spasi/nbsp
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(amount)
    .replace(/[\s\u00A0]/g, "");
}

export function createWhatsAppOrderLink(
  phoneNumber: string,
  productName: string,
  price: number,
  businessName: string,
): string {
  const cleanPhone = normalizeWaNumber(phoneNumber);
  const formattedPrice = formatRupiah(price);

  const message = `Halo ${businessName}! 👋\nSaya mau order *${productName}* (${formattedPrice}).\n\nBisa dibantu proses pesanannya kak? Terima kasih.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/** Link chat WhatsApp umum (bukan order produk tertentu). */
export function createWhatsAppChatLink(phoneNumber: string, prefill = ""): string {
  const cleanPhone = normalizeWaNumber(phoneNumber);
  const base = `https://wa.me/${cleanPhone}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}
