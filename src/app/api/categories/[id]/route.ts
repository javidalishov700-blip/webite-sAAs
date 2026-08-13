import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { categorySchema } from "@/lib/validators/category";
import { deleteCategory, updateCategory } from "@/lib/data/repositories/categories";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const category = updateCategory(id, user.companyId, parsed.data);
  if (!category) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ category });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const ok = deleteCategory(id, user.companyId);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
