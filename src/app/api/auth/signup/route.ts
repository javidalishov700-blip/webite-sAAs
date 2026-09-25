import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { signupSchema } from "@/lib/validators/auth";
import {
  findUserByEmail,
  createUserWithCompanyMembership,
  deleteStaleUnverifiedSignup,
} from "@/lib/data/repositories/users";
import { createCompany } from "@/lib/data/repositories/companies";
import { hashPassword } from "@/lib/auth/password";
import { sendVerificationCode, sendSignupAlert } from "@/lib/auth/email-flows";
import { getRequestIp } from "@/lib/request-meta";
import { RATE, rateLimit } from "@/lib/rate-limit";
import type { AppLocale } from "@/lib/data/types";

export const runtime = "nodejs";

// A café that signs up in Azerbaijani prices in manat and wants its menu to
// open in Azerbaijani; everything here stays editable in Settings.
const SIGNUP_DEFAULTS: Record<AppLocale, { currency: string; supportedLocales: AppLocale[] }> = {
  az: { currency: "AZN", supportedLocales: ["az", "en", "ru"] },
  tr: { currency: "TRY", supportedLocales: ["tr", "en"] },
  ru: { currency: "USD", supportedLocales: ["ru", "en"] },
  en: { currency: "USD", supportedLocales: ["en"] },
};

export async function POST(request: NextRequest) {
  const ip = getRequestIp(request) ?? "unknown";
  if (!rateLimit(`signup:${ip}`, RATE.signup.limit, RATE.signup.windowMs)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, companyName, industry, locale } = parsed.data;

  try {
    const existing = await findUserByEmail(email);
    if (existing) {
      const recycled = await deleteStaleUnverifiedSignup(existing);
      if (!recycled) {
        return NextResponse.json({ error: "emailTaken" }, { status: 409 });
      }
    }

    const defaults = SIGNUP_DEFAULTS[locale ?? "en"];
    const company = await createCompany({
      name: companyName,
      industry,
      isPublished: false,
      currency: defaults.currency,
      defaultLocale: locale ?? "en",
      supportedLocales: defaults.supportedLocales,
    });
    const passwordHash = await hashPassword(password);
    const user = await createUserWithCompanyMembership({
      name,
      email,
      passwordHash,
      companyId: company.id,
      role: "OWNER",
      acceptedTermsAt: new Date(),
    });

    await sendVerificationCode({ id: user.id, email: user.email }, locale);
    await sendSignupAlert({ companyName: company.name, ownerName: user.name, ownerEmail: user.email });

    return NextResponse.json({ ok: true, needsVerification: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "emailTaken" }, { status: 409 });
    }
    console.error("[signup]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
