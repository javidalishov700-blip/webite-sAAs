import { NextRequest, NextResponse } from "next/server";
import { loginSchema } from "@/lib/validators/auth";
import { findUserByEmail, getPrimaryMembership, markEmailVerified } from "@/lib/data/repositories/users";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform-admin";
import { hasVerifyToken } from "@/lib/auth/tokens";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`login:${ip}`, RATE.login.limit, RATE.login.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const { email, password, remember } = parsed.data;
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

    if (!user.emailVerifiedAt) {
      if (await hasVerifyToken(user.id)) {
        return NextResponse.json({ error: "unverified" }, { status: 403 });
      }
      await markEmailVerified(user.id);
    }

    await setSessionCookie(user.id, remember === true);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[login]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
