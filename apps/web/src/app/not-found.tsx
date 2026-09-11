import type { Metadata } from "next";
import { TenantNotFound } from "@/components/TenantNotFound";

/**
 * 404 root app — menggantikan default Next (putih, bahasa Inggris).
 * TenantNotFound dirancang self-sufficient (palet builder paper/ink/
 * cutline, di luar tema tenant), jadi cukup dipakai ulang dengan
 * homeHref "/" — root tidak punya konteks tenant.
 */
export const metadata: Metadata = {
  title: { absolute: "404 — UMKM Craft" },
};

export default function RootNotFound() {
  return <TenantNotFound homeHref="/" />;
}
