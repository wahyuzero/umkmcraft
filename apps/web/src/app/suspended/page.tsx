import type { Metadata } from "next";
import { SuspendedView } from "@/components/SuspendedView";

export const metadata: Metadata = { title: "Situs Ditangguhkan" };

export default function SuspendedPage() {
  return <SuspendedView />;
}
