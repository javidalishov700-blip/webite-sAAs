/**
 * Edge-safe JWT helpers (no `server-only` / `next/headers` imports) so they
 * can run inside `middleware.ts` as well as regular server code.
 */
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();
const DEV_FALLBACK = "qr-universe-dev-secret-do-not-use-in-production";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (secret && secret.length >= 16) {
    return encoder.encode(secret);
  }
  if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
    console.error("[auth] AUTH_SECRET is missing or shorter than 16 characters. Set it in Vercel env.");
  }
  return encoder.encode(DEV_FALLBACK);
}

export interface SessionPayload {
  userId: string;
  /** Set only when "Remember me" was ticked at sign-in. */
  remember?: boolean;
  iat?: number;
  [key: string]: unknown;
}

/** How long a remembered session lasts. */
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
/** A session nobody asked to remember ends after this long without activity. */
export const IDLE_TIMEOUT_SECONDS = 30 * 60;
/** An idle-limited token is re-issued at most this often while it is in use. */
export const REFRESH_AFTER_SECONDS = 5 * 60;

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const remember = payload.remember === true;
  return new SignJWT({ userId: payload.userId, remember })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${remember ? SESSION_TTL_SECONDS : IDLE_TIMEOUT_SECONDS}s`)
    .sign(getSecretKey());
}

function ageSeconds(payload: SessionPayload): number {
  return Math.floor(Date.now() / 1000) - (typeof payload.iat === "number" ? payload.iat : 0);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "string") return null;
    const session = payload as SessionPayload;
    // Tokens from before "Remember me" existed carry a 30-day expiry and no
    // claim; they fall under the idle rule like any unremembered session.
    if (session.remember !== true && ageSeconds(session) > IDLE_TIMEOUT_SECONDS) return null;
    return session;
  } catch {
    return null;
  }
}

/** True when a live, idle-limited session should be swapped for a fresh token. */
export function needsRefresh(payload: SessionPayload): boolean {
  return payload.remember !== true && ageSeconds(payload) > REFRESH_AFTER_SECONDS;
}

/** Without "Remember me" the cookie has no expiry, so closing the browser ends it. */
export function sessionCookieOptions(remember: boolean) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    ...(remember ? { maxAge: SESSION_TTL_SECONDS } : {}),
  };
}
