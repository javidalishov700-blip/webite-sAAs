import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { itemSchema } from "@/lib/validators/item";
import { deleteItem, getItemById, updateItem } from "@/lib/data/repositories/items";
import { getCategoryById } from "@/lib/data/repositories/categories";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { assertFeaturedAllowed } from "@/lib/plan-guard";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;
  const item = await getItemById(id);
  if (!item || item.companyId !== user.companyId) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ item });
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const existing = await getItemById(id);
  if (!existing || existing.companyId !== user.companyId) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = itemSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "invalid" }, { status: 400 });
  }

  if (parsed.data.categoryId) {
    const category = await getCategoryById(parsed.data.categoryId);
    if (!category || category.companyId !== user.companyId) {
      return NextResponse.json({ error: "invalid_category" }, { status: 400 });
    }
  }

  const company = await getCompanyById(user.companyId);
  const featured = assertFeaturedAllowed(company?.plan ?? "FREE", parsed.data.isFeatured, existing.isFeatured);
  if (featured) return featured;

  const item = await updateItem(id, user.companyId, parsed.data);
  return NextResponse.json({ item });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const ok = await deleteItem(id, user.companyId);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
