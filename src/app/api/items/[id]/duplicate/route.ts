import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { duplicateItem, getItemById } from "@/lib/data/repositories/items";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { assertPlanCapacity } from "@/lib/plan-guard";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(_request: Request, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;
  const existing = await getItemById(id);
  if (!existing || existing.companyId !== user.companyId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  const company = await getCompanyById(user.companyId);
  if (!company) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const capacity = await assertPlanCapacity(user.companyId, company.plan, "items");
  if (capacity) return capacity;
  const item = await duplicateItem(id, user.companyId);
  return NextResponse.json({ item }, { status: 201 });
}
