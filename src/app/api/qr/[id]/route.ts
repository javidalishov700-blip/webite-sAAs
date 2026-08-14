import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { qrSchema } from "@/lib/validators/qr";
import { deleteQrCode, updateQrCode } from "@/lib/data/repositories/qr";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = qrSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const qr = await updateQrCode(id, user.companyId, parsed.data);
  if (!qr) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ qrCode: qr });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requireSession();
  if (!user) return response!;
  const { id } = await params;

  const ok = await deleteQrCode(id, user.companyId);
  if (!ok) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
