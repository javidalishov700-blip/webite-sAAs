import { NextRequest, NextResponse } from "next/server";
import { resetPasswordSchema } from "@/lib/validators/auth";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, getPrimaryMembership, setUserPassword } from "@/lib/data/repositories/users";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform-admin";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`reset:${ip}`, RATE.forgot.limit, RATE.forgot.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const userId = await consumeAuthToken(parsed.data.token, "PASSWORD_RESET");
    if (!userId) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const membership = await getPrimaryMembership(userId);
    const company = membership ? await getCompanyById(membership.companyId) : undefined;
    if (company?.bannedAt && !isPlatformOperator(user)) {
      return NextResponse.json({ error: "banned" }, { status: 403 });
    }

    await setUserPassword(userId, await hashPassword(parsed.data.password));
    await setSessionCookie(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reset]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
