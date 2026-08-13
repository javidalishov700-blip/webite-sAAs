import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { reorderItemsSchema } from "@/lib/validators/item";
import { getCategoryById } from "@/lib/data/repositories/categories";
import { reorderItems } from "@/lib/data/repositories/items";

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = reorderItemsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const category = getCategoryById(parsed.data.categoryId);
  if (!category || category.companyId !== user.companyId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const items = reorderItems(parsed.data.categoryId, parsed.data.orderedIds);
  return NextResponse.json({ items });
}
