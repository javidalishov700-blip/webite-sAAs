import "server-only";
import { createHash, randomBytes, randomInt } from "crypto";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AuthTokenKind = "EMAIL_VERIFY" | "PASSWORD_RESET";

/** Codes are short-lived since, unlike the reset link's 256-bit token, a 6-digit code is guessable. */
export const VERIFY_TTL_MS = 15 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;
export const STALE_UNVERIFIED_MS = 48 * 60 * 60 * 1000;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export function generateNumericCode(digits = 6): string {
  return randomInt(0, 10 ** digits).toString().padStart(digits, "0");
}

export async function issueAuthToken(
  userId: string,
  type: AuthTokenKind,
  ttlMs: number,
  makeRaw: () => string = generateRawToken,
): Promise<string> {
  await prisma.authToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
  // A 6-digit code's small space means retrying past a tokenHash collision is
  // worth handling; a 256-bit reset token will just succeed on the first try.
  for (let attempt = 0; ; attempt++) {
    const raw = makeRaw();
    try {
      await prisma.authToken.create({
        data: {
          userId,
          type,
          tokenHash: hashToken(raw),
          expiresAt: new Date(Date.now() + ttlMs),
        },
      });
      return raw;
    } catch (error) {
      const isCollision = error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isCollision || attempt >= 4) throw error;
    }
  }
}

export async function consumeAuthToken(raw: string, type: AuthTokenKind): Promise<string | null> {
  const token = raw.trim();
  if (!token) return null;
  const row = await prisma.authToken.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!row || row.type !== type || row.usedAt || row.expiresAt.getTime() < Date.now()) {
    return null;
  }
  await prisma.authToken.update({ where: { id: row.id }, data: { usedAt: new Date() } });
  return row.userId;
}

export async function hasVerifyToken(userId: string): Promise<boolean> {
  const count = await prisma.authToken.count({ where: { userId, type: "EMAIL_VERIFY" } });
  return count > 0;
}
