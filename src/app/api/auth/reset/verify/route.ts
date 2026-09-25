import { NextRequest, NextResponse } from "next/server";
import { verifyResetCodeSchema } from "@/lib/validators/auth";
import { consumeUserCode, issueAuthToken, RESET_GRANT_TTL_MS } from "@/lib/auth/tokens";
import { findUserByEmail } from "@/lib/data/repositories/users";
import { RESET_GRANT_COOKIE } from "@/lib/constants";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

/**
 * Step two of a reset. The code is checked (and spent) here, before the page
 * asks for a new password; what comes back is a single-use grant in an
 * httpOnly cookie that only the final step can read, so page scripts never
 * hold anything that could set a password.
 */
export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`reset-verify:${ip}`, RATE.resetCode.limit, RATE.resetCode.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const parsed = verifyResetCodeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const user = await findUserByEmail(parsed.data.email);
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });

    const result = await consumeUserCode(user.id, "PASSWORD_RESET", parsed.data.code);
    if (result === "locked") return NextResponse.json({ error: "locked" }, { status: 400 });
    if (result !== "ok") return NextResponse.json({ error: "invalid" }, { status: 400 });

    const grant = await issueAuthToken(user.id, "PASSWORD_RESET", RESET_GRANT_TTL_MS);
    const response = NextResponse.json({ ok: true });
    response.cookies.set(RESET_GRANT_COOKIE, grant, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/reset",
      maxAge: RESET_GRANT_TTL_MS / 1000,
    });
    return response;
  } catch (error) {
    console.error("[reset/verify]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
