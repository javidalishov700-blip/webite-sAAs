import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { findUserByEmail, getPrimaryMembership } from "@/lib/data/repositories/users";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform-admin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "invalid" }, { status: 401 });
    }

    const membership = await getPrimaryMembership(user.id);
    const company = membership ? await getCompanyById(membership.companyId) : undefined;
    if (company?.bannedAt && !isPlatformOperator(user)) {
      return NextResponse.json({ error: "banned" }, { status: 403 });
    }

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
