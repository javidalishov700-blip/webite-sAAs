import { NextRequest, NextResponse } from "next/server";
import { emailLocaleSchema } from "@/lib/validators/auth";
import { findUserByEmail } from "@/lib/data/repositories/users";
import { sendVerificationLink } from "@/lib/auth/email-flows";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`resend:${ip}`, RATE.forgot.limit, RATE.forgot.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = emailLocaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: true });
  }

  try {
    const user = await findUserByEmail(parsed.data.email);
    if (user && !user.emailVerifiedAt) {
      await sendVerificationLink({ id: user.id, email: user.email }, parsed.data.locale);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[resend-verify]", error);
    return NextResponse.json({ ok: true });
  }
}
