import { NextRequest, NextResponse } from "next/server";
import { resetGrantSchema, resetPasswordSchema } from "@/lib/validators/auth";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, getPrimaryMembership, setUserPassword } from "@/lib/data/repositories/users";
import { getCompanyById } from "@/lib/data/repositories/companies";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { isPlatformOperator } from "@/lib/platform-admin";
import { RESET_GRANT_COOKIE } from "@/lib/constants";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

function withGrantCleared(response: NextResponse) {
  response.cookies.set(RESET_GRANT_COOKIE, "", { path: "/api/auth/reset", maxAge: 0 });
  return response;
}

/**
 * Sets the new password. Two ways in: the grant cookie /api/auth/reset/verify
 * hands out once the emailed code was accepted, or the link that reset mails
 * carried before codes, which keeps working until it expires. A code on its
 * own is never enough here.
 */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`reset:${ip}`, RATE.resetCode.limit, RATE.resetCode.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const byLink = resetPasswordSchema.safeParse(body);
  const byGrant = byLink.success ? null : resetGrantSchema.safeParse(body);
  if (!byLink.success && !byGrant?.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    let userId: string | null;
    let password: string;
    if (byLink.success) {
      userId = await consumeAuthToken(byLink.data.token, "PASSWORD_RESET");
      password = byLink.data.password;
      if (!userId) return NextResponse.json({ error: "invalid" }, { status: 400 });
    } else {
      const grant = request.cookies.get(RESET_GRANT_COOKIE)?.value;
      userId = grant ? await consumeAuthToken(grant, "PASSWORD_RESET") : null;
      password = byGrant!.data!.password;
      if (!userId) return withGrantCleared(NextResponse.json({ error: "expired" }, { status: 400 }));
    }

    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const membership = await getPrimaryMembership(userId);
    const company = membership ? await getCompanyById(membership.companyId) : undefined;
    if (company?.bannedAt && !isPlatformOperator(user)) {
      return withGrantCleared(NextResponse.json({ error: "banned" }, { status: 403 }));
    }

    await setUserPassword(userId, await hashPassword(password));
    await setSessionCookie(userId);
    return withGrantCleared(NextResponse.json({ ok: true }));
  } catch (error) {
    console.error("[reset]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
