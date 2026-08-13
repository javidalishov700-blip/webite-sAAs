import "server-only";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME } from "@/lib/constants";
import { createSessionToken, verifySessionToken, SESSION_TTL_SECONDS } from "@/lib/auth/jwt";

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken({ userId });
  const store = await cookies();
  store.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
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
