import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { reorderCategoriesSchema } from "@/lib/validators/category";
import { reorderCategories } from "@/lib/data/repositories/categories";

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = reorderCategoriesSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const categories = reorderCategories(user.companyId, parsed.data.orderedIds);
  return NextResponse.json({ categories });
}
