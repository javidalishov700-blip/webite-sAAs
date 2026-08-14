import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { duplicateItem, getItemById } from "@/lib/data/repositories/items";

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
  const item = await duplicateItem(id, user.companyId);
  return NextResponse.json({ item }, { status: 201 });
}
