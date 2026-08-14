import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/guard";
import { mailerStatus, sendMail } from "@/lib/mailer";
import { SITE } from "@/lib/site";

export async function GET() {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;
  return NextResponse.json({ mail: mailerStatus() });
}

export async function POST() {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;

  const result = await sendMail({
    to: user.email,
    subject: "QR-Universe Resend test",
    text: "If you can read this, verification emails will send.",
    html: `<p>If you can read this, verification emails will send.</p><p>${SITE.name}</p>`,
  });

  if (!result.sent) {
    return NextResponse.json({ ok: false, error: result.error ?? "failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
