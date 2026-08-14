import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { itemSchema } from "@/lib/validators/item";
import { createItem, listItemsByCompany } from "@/lib/data/repositories/items";
import { getCategoryById } from "@/lib/data/repositories/categories";

export async function GET() {
  const { user, response } = await requireSession();
  if (!user) return response!;
  return NextResponse.json({ items: await listItemsByCompany(user.companyId) });
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = itemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid" }, { status: 400 });
  }

  const category = await getCategoryById(parsed.data.categoryId);
  if (!category || category.companyId !== user.companyId) {
    return NextResponse.json({ error: "invalid_category" }, { status: 400 });
  }

  const item = await createItem({ companyId: user.companyId, ...parsed.data });
  return NextResponse.json({ item }, { status: 201 });
}
