import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { signupSchema } from "@/lib/validators/auth";
import { findUserByEmail, createUserWithCompanyMembership } from "@/lib/data/repositories/users";
import { createCompany } from "@/lib/data/repositories/companies";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const { name, email, password, companyName, industry } = parsed.data;

  try {
    if (await findUserByEmail(email)) {
      return NextResponse.json({ error: "emailTaken" }, { status: 409 });
    }

    const company = await createCompany({ name: companyName, industry });
    const passwordHash = await hashPassword(password);
    const user = await createUserWithCompanyMembership({
      name,
      email,
      passwordHash,
      companyId: company.id,
      role: "OWNER",
      acceptedTermsAt: new Date(),
    });

    await setSessionCookie(user.id);
    return NextResponse.json({ ok: true, companySlug: company.slug });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "emailTaken" }, { status: 409 });
    }
    console.error("[signup]", error);
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
}
