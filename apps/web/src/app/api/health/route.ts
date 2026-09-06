import { NextResponse } from "next/server";
import { aiAvailable } from "@umkmcraft/ai";
import { store } from "@/lib/server/store";


export async function GET() {
  let db = "ok";
  try {
    await store.listSites("healthcheck");
  } catch {
    db = "error";
  }
  return NextResponse.json({
    status: db === "ok" ? "ok" : "degraded",
    db,
    ai: aiAvailable() ? "gemini" : "template-fallback",
    time: new Date().toISOString(),
  });
}
