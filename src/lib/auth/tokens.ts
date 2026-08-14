import "server-only";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export type AuthTokenKind = "EMAIL_VERIFY" | "PASSWORD_RESET";

export const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
export const RESET_TTL_MS = 60 * 60 * 1000;
export const STALE_UNVERIFIED_MS = 48 * 60 * 60 * 1000;

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function generateRawToken(): string {
  return randomBytes(32).toString("hex");
}

export async function issueAuthToken(userId: string, type: AuthTokenKind, ttlMs: number): Promise<string> {
  await prisma.authToken.updateMany({
    where: { userId, type, usedAt: null },
    data: { usedAt: new Date() },
  });
  const raw = generateRawToken();
  await prisma.authToken.create({
    data: {
      userId,
      type,
      tokenHash: hashToken(raw),
      expiresAt: new Date(Date.now() + ttlMs),
    },
  });
  return raw;
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
