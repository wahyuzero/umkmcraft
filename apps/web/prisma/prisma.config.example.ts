// Konfigurasi Prisma 7 — URL DB pindah ke sini (tidak lagi di schema.prisma).
// Untuk MVP file-backed store, file ini TIDAK dipakai; aktifkan saat migrasi
// ke Postgres dengan: mv prisma.config.example.ts prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
