/**
 * POST /api/sites/from-template — buat situs DRAFT baru dari katalog template
 * (@umkmcraft/templates) TANPA LLM. Pola cookie+createSite+bindOwner identik
 * dengan api/ai/generate/route.ts; inti logika ada di
 * lib/server/create-from-template.ts (testable tanpa alias @/).
 *
 * Body JSON: { templateId, businessName?, whatsappNumber?, city? }
 * - templateId kosong/bukan string → 400
 * - template tak dikenal → 404
 * - config gagal validasi (bug internal) → 500
 * - sukses → 200 { siteId, slug } — editor mengambil config dari store.
 */
import { NextRequest, NextResponse } from "next/server";
import { createSiteFromTemplate } from "@/lib/server/create-from-template";
import { rateLimit, clientIp } from "@/lib/server/rate-limit";

interface FromTemplateBody {
  templateId?: string;
  businessName?: string;
  whatsappNumber?: string;
  city?: string;
}

export async function POST(req: NextRequest) {
  const rl = rateLimit(`from-template:${clientIp(req)}`, 10, 60 * 60 * 1000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Kuota pembuatan situs dari template habis untuk jam ini. Coba lagi nanti ya." },
      { status: 429 },
    );
  }

  let body: FromTemplateBody;
  try {
    body = (await req.json()) as FromTemplateBody;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  if (typeof body.templateId !== "string" || body.templateId.trim() === "") {
    return NextResponse.json({ error: "Pilih template dulu ya" }, { status: 400 });
  }
  // Trim sebelum dipakai: id katalog bersih dari spasi copy-paste
  // (mis. " warung-makan-v1 ") agar tidak jatuh ke 404 unknown-template.
  const templateId = body.templateId.trim();

  // Tanpa cookie → terbitkan cookie baru di respons (Oracle #5: dilarang "anon").
  let sessionToken = req.cookies.get("uc_session")?.value;
  const mintCookie = !sessionToken;
  if (mintCookie) sessionToken = crypto.randomUUID();

  const result = await createSiteFromTemplate(
    {
      templateId, // sudah di-trim di atas
      businessName: body.businessName,
      whatsappNumber: body.whatsappNumber,
      city: body.city,
    },
    sessionToken!,
  );

  if (!result.ok) {
    if (result.reason === "unknown-template") {
      return NextResponse.json({ error: "Template nggak ditemukan" }, { status: 404 });
    }
    // parseUmkmConfig sudah menjaga lapis 1 — sampai sini berarti bug internal.
    return NextResponse.json({ error: "Konfigurasi gagal validasi" }, { status: 500 });
  }

  const res = NextResponse.json({ siteId: result.siteId, slug: result.slug });
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
