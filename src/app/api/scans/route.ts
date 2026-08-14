import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCompanyBySlug } from "@/lib/data/repositories/companies";
import { getQrCodeById } from "@/lib/data/repositories/qr";
import { recordScan } from "@/lib/data/repositories/scans";

const scanSchema = z.object({
  slug: z.string().min(1),
  locale: z.enum(["en", "ru", "tr", "az"]).default("en"),
  qrCodeId: z.string().min(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = scanSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const company = await getCompanyBySlug(parsed.data.slug);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const qr = await getQrCodeById(parsed.data.qrCodeId, company.id);
  if (!qr) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const device = /mobile|android|iphone/i.test(request.headers.get("user-agent") ?? "") ? "mobile" : "desktop";
  await recordScan({
    companyId: company.id,
    qrCodeId: qr.id,
    locale: parsed.data.locale,
    device,
  });
  return NextResponse.json({ ok: true });
}
