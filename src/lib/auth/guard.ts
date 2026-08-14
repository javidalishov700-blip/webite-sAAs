import "server-only";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth/session";
import { hydrateSessionUser } from "@/lib/data/repositories/users";
import type { SessionUser } from "@/lib/data/types";

/** Returns the current session user, or `null` if not authenticated. Never redirects. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const userId = await getSessionUserId();
  if (!userId) return null;
  return await hydrateSessionUser(userId);
}

/** For use in Server Components/layouts that must be authenticated — redirects to /login otherwise. */
export async function requireUser(locale: string): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }
  return user;
}

/** For use in Route Handlers — returns `null` instead of redirecting so callers can send a 401 JSON response. */
export async function requireApiUser(): Promise<SessionUser | null> {
  return getCurrentUser();
}

/**
 * Convenience for Route Handlers: returns the session user, or a ready-to-return
 * 401 `NextResponse`. Usage: `const { user, response } = await requireSession(); if (!user) return response!;`
 */
export async function requireSession(): Promise<{ user: SessionUser | null; response: NextResponse | null }> {
  const user = await getCurrentUser();
  if (!user) {
    return { user: null, response: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  if (user.companyBanned && !user.isPlatformAdmin) {
    return { user: null, response: NextResponse.json({ error: "banned" }, { status: 403 }) };
  }
  return { user, response: null };
}

export async function requirePlatformAdmin(): Promise<{ user: SessionUser | null; response: NextResponse | null }> {
  const { user, response } = await requireSession();
  if (!user) return { user: null, response };
  if (!user.isPlatformAdmin) {
    return { user: null, response: NextResponse.json({ error: "forbidden" }, { status: 403 }) };
  }
  return { user, response: null };
}
