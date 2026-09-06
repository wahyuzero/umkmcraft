import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter, Plus_Jakarta_Sans, Poppins, DM_Sans } from "next/font/google";
import "./globals.css";

/**
 * Root layout MINIMAL — chrome builder ada di route group (builder),
 * situs tenant (sites/*) punya wrapper sendiri. Font dimuat sekali di sini.
 */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-poppins", display: "swap" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "UMKM Craft — Website Usaha dalam 30 Detik", template: "%s | UMKM Craft" },
  description:
    "Bikin website usaha profesional, katalog WhatsApp 1-klik, dan informasi bisnis dalam 30 detik via obrolan AI. Khusus UMKM Indonesia.",
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "UMKM Craft",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body
        className={`${bricolage.variable} ${inter.variable} ${jakarta.variable} ${poppins.variable} ${dmSans.variable}`}
      >
        {children}
      </body>
    </html>
  );
}
