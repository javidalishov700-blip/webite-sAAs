import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createSessionToken, needsRefresh, sessionCookieOptions, verifySessionToken } from "@/lib/auth/jwt";

export async function setSessionCookie(userId: string, remember = false) {
  const token = await createSessionToken({ userId, remember });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(remember));
}

/**
 * Slides an unremembered session forward so an owner who is working never
 * hits the idle limit. Route Handlers only: Server Components cannot set
 * cookies, and the middleware refreshes page loads on its own.
 */
export async function refreshSessionCookie() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return;
  const payload = await verifySessionToken(token);
  if (!payload || !needsRefresh(payload)) return;
  store.set(SESSION_COOKIE_NAME, await createSessionToken({ userId: payload.userId }), sessionCookieOptions(false));
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
}

export async function getSessionUserId(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const payload = await verifySessionToken(token);
  return payload?.userId ?? null;
}

export { verifySessionToken };
