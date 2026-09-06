/**
 * Generation dua fase (ADR-3) — Fase 2: structured generation.
 * AI SDK 6: generateText + Output.object → result.output (bukan experimental_output).
 * Repair loop maks 2 retry, lalu fallback model lebih besar, lalu graceful
 * degradation ke template engine — user TIDAK PERNAH melihat error 500.
 */
import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import { UmkmWebsiteConfigSchema, type UmkmWebsiteConfig } from "@umkmcraft/schema";
import { sanitizeConfig } from "@umkmcraft/utils";
import { buildSlicedSystemPrompt, buildRepairPrompt } from "./prompts";
import { generateTemplateConfig, type IntakeSlots } from "./template-engine";
import type { ZodIssue } from "zod";

const PRIMARY_MODEL = process.env.AI_MODEL_PRIMARY || "gemini-2.5-flash-lite";
const FALLBACK_MODEL = process.env.AI_MODEL_FALLBACK || "gemini-2.5-flash";

export function aiAvailable(): boolean {
  return Boolean(process.env.GOOGLE_GENERATIVE_AI_API_KEY);
}

interface GenerateInput {
  slots: IntakeSlots;
  category: string;
  conversationSummary: string;
}

function toIssues(issues: ZodIssue[]): Array<{ path: string; message: string }> {
  return issues.map((i) => ({ path: i.path.map(String).join(".") || "(root)", message: i.message }));
}

async function callModel(modelId: string, prompt: string, system: string): Promise<string> {
  const { text } = await generateText({
    model: google(modelId),
    system,
    prompt,
    maxOutputTokens: 4000,
    abortSignal: AbortSignal.timeout(20_000),
  });
  return text;
}

/** Satu upaya: generate → parse → (retry dengan feedback error ≤2×). */
async function generateWithRepair(
  modelId: string,
  system: string,
  prompt: string,
): Promise<{ config?: UmkmWebsiteConfig; raw: string; issues: Array<{ path: string; message: string }> }> {
  let lastRaw = "";
  let lastIssues: Array<{ path: string; message: string }> = [];
  for (let attempt = 0; attempt < 3; attempt++) {
    const attemptPrompt =
      attempt === 0 ? prompt : buildRepairPrompt(lastRaw, lastIssues);
    const text = await callModel(modelId, attemptPrompt, system);
    lastRaw = text;
    // strip kemungkinan markdown fence
    const jsonText = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    let candidate: unknown;
    try {
      candidate = JSON.parse(jsonText);
    } catch (e) {
      lastIssues = [{ path: "(root)", message: `JSON tidak valid: ${(e as Error).message}` }];
      continue;
    }
    const parsed = UmkmWebsiteConfigSchema.safeParse(candidate);
    if (parsed.success) {
      return { config: sanitizeConfig(parsed.data), raw: text, issues: [] };
    }
    lastIssues = toIssues(parsed.error.issues);
  }
  return { raw: lastRaw, issues: lastIssues };
}

export async function generateConfig(
  input: GenerateInput,
): Promise<{ config: UmkmWebsiteConfig; engine: "ai" | "ai_fallback" | "template"; notes: string[] }> {
  const notes: string[] = [];
  const system = buildSlicedSystemPrompt(input.category);
  const prompt = `Data bisnis dari hasil wawancara:
${input.conversationSummary}

Buat konfigurasi website JSON lengkap sesuai skema untuk bisnis "${input.slots.businessName}" (kategori: ${input.category}).`;

  if (!aiAvailable()) {
    notes.push("AI key tidak tersedia — memakai template engine deterministik.");
    return { config: generateTemplateConfig(input.slots), engine: "template", notes };
  }

  // Upaya 1-2: model primary + repair loop
  try {
    const r1 = await generateWithRepair(PRIMARY_MODEL, system, prompt);
    if (r1.config) return { config: r1.config, engine: "ai", notes };
    notes.push(`Primary model gagal validasi: ${r1.issues.length} issue.`);
  } catch (e) {
    notes.push(`Primary model error: ${(e as Error).message}`);
  }

  // Upaya 3: fallback model lebih besar
  try {
    const r2 = await generateWithRepair(FALLBACK_MODEL, system, prompt);
    if (r2.config) return { config: r2.config, engine: "ai_fallback", notes };
    notes.push("Fallback model gagal validasi.");
  } catch (e) {
    notes.push(`Fallback model error: ${(e as Error).message}`);
  }

  // Graceful degradation: template kategori + slot valid
  notes.push("Semua upaya AI gagal — graceful degradation ke template.");
  return { config: generateTemplateConfig(input.slots), engine: "template", notes };
}
