import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { getCompanyById, updateCompany, deleteCompany } from "@/lib/data/repositories/companies";
import { clearSessionCookie } from "@/lib/auth/session";
import { companySettingsSchema, onboardingSchema } from "@/lib/validators/company";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const company = getCompanyById(user.companyId);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ company });
}

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);

  // Onboarding sends a partial subset; settings sends the full schema. Accept either.
  const settingsParsed = companySettingsSchema.partial().safeParse(body);
  const onboardingParsed = onboardingSchema.partial().safeParse(body);

  if (!settingsParsed.success && !onboardingParsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const patch = { ...(onboardingParsed.data ?? {}), ...(settingsParsed.data ?? {}) };
  const mapped = {
    ...(patch.companyName ? { name: patch.companyName } : {}),
    ...(patch.name ? { name: patch.name } : {}),
    ...(patch.description !== undefined ? { description: patch.description } : {}),
    ...(patch.industry ? { industry: patch.industry } : {}),
    ...(patch.logoUrl !== undefined ? { logoUrl: patch.logoUrl } : {}),
    ...(patch.accentColor ? { accentColor: patch.accentColor } : {}),
    ...(patch.currency ? { currency: patch.currency } : {}),
    ...(patch.defaultLocale ? { defaultLocale: patch.defaultLocale } : {}),
    ...(patch.supportedLocales ? { supportedLocales: patch.supportedLocales } : {}),
    ...(patch.address !== undefined ? { address: patch.address } : {}),
    ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    ...(patch.website !== undefined ? { website: patch.website } : {}),
    ...(patch.isPublished !== undefined ? { isPublished: patch.isPublished } : {}),
  };

  const company = updateCompany(user.companyId, mapped);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ company });
}

export async function DELETE() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  if (user.role !== "OWNER") {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  deleteCompany(user.companyId);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
