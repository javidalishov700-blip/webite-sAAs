import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { categorySchema } from "@/lib/validators/category";
import { createCategory, listCategoriesByCompany } from "@/lib/data/repositories/categories";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { assertPlanCapacity } from "@/lib/plan-guard";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  return NextResponse.json({ categories: await listCategoriesByCompany(user.companyId) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid" }, { status: 400 });
  }

  const company = await getCompanyById(user.companyId);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const capacity = await assertPlanCapacity(user.companyId, company.plan, "categories");
  if (capacity) return capacity;

  const category = await createCategory({ companyId: user.companyId, name: parsed.data.name, icon: parsed.data.icon });
  return NextResponse.json({ category }, { status: 201 });
}
