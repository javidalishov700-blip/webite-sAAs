import { NextRequest, NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/guard";
import { changePasswordSchema } from "@/lib/validators/auth";
import { findUserById, setUserPassword } from "@/lib/data/repositories/users";
import { hashPassword, verifyPassword } from "@/lib/auth/password";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { user, response } = await requireSession();
  if (!user) return response!;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const account = await findUserById(user.id);
  if (!account) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const ok = await verifyPassword(parsed.data.currentPassword, account.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  await setUserPassword(user.id, await hashPassword(parsed.data.newPassword));
  return NextResponse.json({ ok: true });
}
