import { NextRequest, NextResponse } from "next/server";
import { verifyCodeSchema } from "@/lib/validators/auth";
import { consumeAuthToken } from "@/lib/auth/tokens";
import { findUserById, getPrimaryMembership, markEmailVerified } from "@/lib/data/repositories/users";
import { updateCompany } from "@/lib/data/repositories/companies";
import { setSessionCookie } from "@/lib/auth/session";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`verify:${ip}`, RATE.verify.limit, RATE.verify.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = verifyCodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const userId = await consumeAuthToken(parsed.data.code, "EMAIL_VERIFY");
    if (!userId) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }

    const user = await findUserById(userId);
    if (!user) return NextResponse.json({ error: "invalid" }, { status: 400 });

    await markEmailVerified(userId);
    const membership = await getPrimaryMembership(userId);
    if (membership) {
      await updateCompany(membership.companyId, { isPublished: true });
    }
    await setSessionCookie(userId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[verify]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
