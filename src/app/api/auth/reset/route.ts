import { NextRequest, NextResponse } from "next/server";
import { resetCodeSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { consumeAuthToken, consumeUserCode } from "@/lib/auth/tokens";
import { findUserByEmail, findUserById, getPrimaryMembership, setUserPassword } from "@/lib/data/repositories/users";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform-admin";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Two ways in: the 6-digit code the forgot page now sends (email + code), and
 * the link older reset mails carried (token), which keeps working until it
 * expires.
 */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`reset:${ip}`, RATE.resetCode.limit, RATE.resetCode.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const byCode = resetCodeSchema.safeParse(body);
  const byLink = byCode.success ? null : resetPasswordSchema.safeParse(body);
  if (!byCode.success && !byLink?.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    let userId: string | null = null;
    if (byCode.success) {
      const user = await findUserByEmail(byCode.data.email);
      if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });
      const result = await consumeUserCode(user.id, "PASSWORD_RESET", byCode.data.code);
      if (result === "locked") return NextResponse.json({ error: "locked" }, { status: 400 });
      if (result !== "ok") return NextResponse.json({ error: "invalid" }, { status: 400 });
      userId = user.id;
    } else if (byLink?.success) {
      userId = await consumeAuthToken(byLink.data.token, "PASSWORD_RESET");
    }
    if (!userId) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const membership = await getPrimaryMembership(userId);
    const company = membership ? await getCompanyById(membership.companyId) : undefined;
    if (company?.bannedAt && !isPlatformOperator(user)) {
      return NextResponse.json({ error: "banned" }, { status: 403 });
    }

    const password = byCode.success ? byCode.data.password : byLink!.data!.password;
    await setUserPassword(userId, await hashPassword(password));
    await setSessionCookie(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[reset]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
