import { NextRequest, NextResponse } from "next/server";
import { generateConfig, summarizeSlots } from "@umkmcraft/ai";
import type { Slots } from "@umkmcraft/ai";
import { parseUmkmConfig, UmkmWebsiteConfigSchema } from "@umkmcraft/schema";
import { checkSlug } from "@umkmcraft/utils";
import { store } from "@/lib/server/store";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";


interface GenerateBody {
  slots: Slots;
  conversationSummary?: string;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`generate:${clientIp(req)}`, 5, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Kuota generate habis untuk hari ini. Hubungi kami bila butuh lebih." },
      { status: 429 },
    );
  }

  let body: GenerateBody;
  try {
    body = (await req.json()) as GenerateBody;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const slots = body.slots;
  if (!slots?.businessName || !slots.category || !slots.whatsappNumber) {
    return NextResponse.json({ error: "Data usaha belum lengkap" }, { status: 400 });
  }

  const { conversationSummary, intakeSlots } = summarizeSlots(slots);
  const { config, engine, notes } = await generateConfig({
    slots: intakeSlots,
    category: slots.category,
    conversationSummary,
  });

  // Validasi ganda (defense-in-depth — template engine juga divalidasi)
  const validated = parseUmkmConfig(config);
  if (!validated.ok) {
    return NextResponse.json(
      { error: "Konfigurasi gagal validasi", issues: validated.issues },
      { status: 500 },
    );
  }
  const finalConfig = UmkmWebsiteConfigSchema.parse(validated.config);

  // Cek slug — bentrok → suffix
  let slug = finalConfig.meta.site_id;
  const slugCheck = checkSlug(slug);
  if (!slugCheck.ok) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  // Simpan sebagai draft milik sesi anonim.
  // Tanpa cookie → terbitkan cookie baru di respons (Oracle #5: dilarang "anon")
  let sessionToken = req.cookies.get("uc_session")?.value;
  const mintCookie = !sessionToken;
  if (mintCookie) sessionToken = crypto.randomUUID();
  const { site } = await store.createSite({
    ownerId: sessionToken!,
    slug,
    businessCategory: finalConfig.meta.business_category,
    config: finalConfig,
    changeSource: engine === "template" ? "MANUAL" : "AI_GENERATION",
  });
  await store.bindOwner(sessionToken!, site.id);

  const res = NextResponse.json({
    siteId: site.id,
    slug: site.slug,
    config: finalConfig,
    engine,
    notes,
  });
  if (mintCookie) {
    res.cookies.set("uc_session", sessionToken!, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production" && !(process.env.NEXT_PUBLIC_TENANT_DOMAIN ?? "").includes("lvh.me"),
      maxAge: 60 * 60 * 24 * 90,
      path: "/",
    });
  }
  return res;
}
