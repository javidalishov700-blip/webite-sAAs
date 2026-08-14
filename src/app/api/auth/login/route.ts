import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { findUserByEmail } from "@/lib/data/repositories/users";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const { email, password } = parsed.data;
  const user = await findUserByEmail(email);
  if (!user) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  await setSessionCookie(user.id);
  return NextResponse.json({ ok: true });
}
