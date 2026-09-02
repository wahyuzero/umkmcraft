# UMKM Craft — Component Design System & Color Presets

> **Dokumen Panduan Visual & Desain Komponen Modular**  
> **Status:** Canonical Design Guide v1.0

---

## 1. Preset Tema & Palet Warna Sesuai Kategori Bisnis

Setiap jenis UMKM memiliki psikologi warna yang unik. UMKM Craft menyediakan preset warna siap pakai yang ramah mata dan lolos uji kontras WCAG AA:

| Kategori Usaha | Nama Preset | Primary (Tombol / Aksen) | Background | Secondary | Karakter |
|---|---|---|---|---|---|
| 🍲 **Kuliner Pedas / Makanan** | `spicy_amber` | `#d97706` (Warm Amber) | `#fffbeb` (Ivory Rice) | `#991b1b` (Chili Red) | Menggugah selera, hangat |
| ☕ **Coffee Shop / Cafe** | `roasted_mocha` | `#78350f` (Mocha Coffee) | `#faf5ee` (Linen Cream) | `#b45309` (Caramel) | Estetik, tenang, santai |
| 💈 **Barbershop / Men Grooming**| `charcoal_slate`| `#1e293b` (Slate Navy) | `#f8fafc` (Clean White) | `#0ea5e9` (Sky Blue) | Maskulin, tegas, modern |
| 👗 **Fashion & Beauty** | `blush_rose` | `#e11d48` (Rose Gold) | `#fff1f2` (Soft Blush) | `#be123c` (Ruby) | Anggun, feminin, mewah |
| 🔧 **Bengkel & Service Jasa** | `electric_blue` | `#2563eb` (Royal Blue) | `#f0f9ff` (Ice Light) | `#1e40af` (Navy Trust)| Profesional, terpercaya |
| 🧺 **Laundry & Jasa Bersih** | `fresh_emerald` | `#059669` (Fresh Emerald)| `#f0fdf4` (Clean Mint) | `#047857` (Forest) | Bersih, higienis, segar |

---

---

## 2. Blueprint Modul LEGO Inti (Core Universal)

### A. Modul `hero_storefront`
* **Elemen:** Badge promo/keunggulan, Judul Usaha (H1), Tagline persuasif, Foto hero, Tombol CTA Pesan via WhatsApp, dan 3 pill badges (misal: *100% Halal, Ready Stock, Pengiriman Cepat*).
* **Interaksi:** Tombol WhatsApp memiliki efek hover glow dan getar lembut (*subtle bounce*).

### B. Modul `product_catalog_wa`
* **Elemen:** Filter tab kategori (misal: *Semua / Makanan / Minuman / Paket Hemat*), kartu produk bento dengan harga coret (*original price*) dan badge *Best Seller*.
* **Interaksi:** Setiap produk memiliki tombol `[ 🛒 Pesan via WA ]`. Saat diklik, tombol langsung mengenerate link WhatsApp dengan prefilled text pesanan.

### C. Modul `promo_banner`
* **Elemen:** Bar pengumuman eye-catching, kupon diskon dengan tombol copy kode 1-klik, dan timer hitung mundur jika ada flash sale.

### D. Modul `operating_hours_map`
* **Elemen:** Kartu info jam operasional dengan badge status otomatis:
  * 🟢 **Buka Sekarang** (jika waktu lokal sesuai jadwal).
  * 🔴 **Tutup — Buka Besok Jam 09.00**.
* **Navigasi:** Tombol 1-klik menuju **Google Maps** dan **Waze** dengan rute langsung.

### E. Modul `social_proof_reviews`
* **Elemen:** Ulasan tangkapan layar chat WhatsApp, rating bintang 5, dan testimoni pelanggan setia dengan avatar pembeli.

### F. Modul `channel_marketplace`
* **Elemen:** Grid tombol logo resmi marketplace (Shopee, Tokopedia, GoFood, GrabFood, TikTok Shop, Lazada).
* **Fungsi:** Mengarahkan pembeli yang lebih nyaman bertransaksi via marketplace resmi.

### G. Modul `faq_accordion`
* **Elemen:** Daftar pertanyaan umum yang dapat di-expand/collapse (animasi akordeon mulus).

### H. Modul `contact_direct`
* **Elemen:** Alamat lengkap, nomor telepon admin, tombol direct WA, dan embed peta ringkas.

### I. Modul `rich_text_block` (Escape Hatch)
* **Elemen:** Judul seksi, formatting markdown terbatas (bold/list/italic), dan gambar pendukung opsional dengan pilihan posisi (kiri/kanan/tengah).

---

## 3. Blueprint Modul Extended & Opsional (On-Demand)

### J. Modul `gallery_grid`
* **Target Bisnis:** Barbershop, MUA/Salon, Bengkel Modifikasi, Kerajinan Tangan, Kuliner Instagramable.
* **Elemen:** Grid foto responsif (pilihan 2, 3, atau 4 kolom) dengan lightbox modal saat foto diklik untuk memperbesar gambar dan melihat caption hasil karya.

### K. Modul `service_pricing_table`
* **Target Bisnis:** Laundry, Cuci Kendaraan, Bimbel, Service Elektronik/AC.
* **Elemen:** Kartu paket layanan berjenjang, badge *Paling Populer*, durasi pengerjaan, daftar fitur/benefit checklist, dan tombol `[ Pesan Paket Ini ]` via WhatsApp.

### L. Modul `trust_badges_strip`
* **Target Bisnis:** Toko online, produk herbal/makanan kemasan, pengiriman luar pulau.
* **Elemen:** Strip horizontal elegan berisi logo-logo metode bayar (QRIS, BCA, BRI, COD), ekspedisi (JNE, J&T, SiCepat, Paxel), dan sertifikasi resmi (Halal MUI, BPOM, P-IRT).

### M. Modul `step_how_to_order`
* **Target Bisnis:** Toko pre-order, custom souvenir/seragam, jasa katering.
* **Elemen:** Timeline infografis 3-4 langkah bertahap dengan nomor urut visual dan ilustrasi ringkas alur pemesanan.

---

## 4. WhatsApp URL Builder Helper (TypeScript)

```typescript
// src/utils/whatsapp.ts
export function createWhatsAppOrderLink(
  phoneNumber: string,
  productName: string,
  price: number,
  businessName: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
  const formattedPrice = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(price);

  const message = `Halo ${businessName}! 👋\nSaya mau order *${productName}* (${formattedPrice}).\n\nBisa dibantu proses pesanannya kak? Terima kasih.`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}
```
