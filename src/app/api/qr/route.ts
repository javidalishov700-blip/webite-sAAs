import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { qrSchema } from "@/lib/validators/qr";
import { createQrCode, listQrCodesByCompany, updateQrCode } from "@/lib/data/repositories/qr";
import { getCompanyById, updateCompany } from "@/lib/data/repositories/companies";
import { qrGoPath } from "@/lib/catalog-url";
import { assertPlanCapacity } from "@/lib/plan-guard";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  return NextResponse.json({ qrCodes: await listQrCodesByCompany(user.companyId) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = qrSchema.partial().safeParse(body ?? {});
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const company = await getCompanyById(user.companyId);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const capacity = await assertPlanCapacity(user.companyId, company.plan, "qrCodes");
  if (capacity) return capacity;

  if (!company.isPublished) {
    await updateCompany(user.companyId, { isPublished: true });
  }

  const qr = await createQrCode({
    companyId: user.companyId,
    name: parsed.data.name ?? "New QR code",
    targetUrl: parsed.data.targetUrl ?? `/c/${company?.slug ?? ""}`,
    dotsColor: parsed.data.dotsColor ?? company?.accentColor,
    logoUrl: parsed.data.logoUrl ?? company?.logoUrl,
    dotsStyle: parsed.data.dotsStyle,
    cornerStyle: parsed.data.cornerStyle,
    backgroundColor: parsed.data.backgroundColor,
  });
  const withGoUrl = (await updateQrCode(qr.id, user.companyId, { targetUrl: qrGoPath(qr.id) })) ?? qr;
  return NextResponse.json({ qrCode: withGoUrl }, { status: 201 });
}
