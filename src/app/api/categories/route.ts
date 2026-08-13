import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { categorySchema } from "@/lib/validators/category";
import { createCategory, listCategoriesByCompany } from "@/lib/data/repositories/categories";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  return NextResponse.json({ categories: listCategoriesByCompany(user.companyId) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid" }, { status: 400 });
  }

  const category = createCategory({ companyId: user.companyId, name: parsed.data.name, icon: parsed.data.icon });
  return NextResponse.json({ category }, { status: 201 });
}
