/**
 * Edge-safe JWT helpers (no `server-only` / `next/headers` imports) so they
 * can run inside `middleware.ts` as well as regular server code.
 */
import { SignJWT, jwtVerify } from "jose";

const encoder = new TextEncoder();

function getSecretKey() {
  const secret = process.env.AUTH_SECRET ?? "qr-universe-dev-secret-do-not-use-in-production";
  return encoder.encode(secret);
}

export interface SessionPayload {
  userId: string;
  [key: string]: unknown;
}

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (typeof payload.userId !== "string") return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
