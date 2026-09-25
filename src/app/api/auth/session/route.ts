import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/guard";
import { refreshSessionCookie } from "@/lib/auth/session";

/** Who is signed in. Reading it is not activity, so it never extends the session. */
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}

/**
 * The admin panel posts here while the owner is typing or clicking, so a long
 * edit on one page does not count as idle time.
 */
export async function POST() {
  const user = await getCurrentUser();
  if (user) await refreshSessionCookie();
  return NextResponse.json({ user });
}
