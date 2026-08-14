import "server-only";
import { prisma } from "@/lib/prisma";
import { mapMembership, mapUser } from "@/lib/data/map";
import { isPlatformOperator } from "@/lib/platform-admin";
import { hasVerifyToken, STALE_UNVERIFIED_MS } from "@/lib/auth/tokens";
import type { Membership, Role, SessionUser, User } from "@/lib/data/types";

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
  return row ? mapUser(row) : undefined;
}

export async function findUserById(id: string): Promise<User | undefined> {
  const row = await prisma.user.findUnique({ where: { id } });
  return row ? mapUser(row) : undefined;
}

export async function getMembershipsForUser(userId: string): Promise<Membership[]> {
  const rows = await prisma.membership.findMany({ where: { userId } });
  return rows.map(mapMembership);
}

export async function getPrimaryMembership(userId: string): Promise<Membership | undefined> {
  const row = await prisma.membership.findFirst({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
  return row ? mapMembership(row) : undefined;
}

async function ensureEmailVerified(userId: string, emailVerifiedAt: Date | null): Promise<boolean> {
  if (emailVerifiedAt) return true;
  // New signups always get an EMAIL_VERIFY token. Legacy accounts have none — treat as verified.
  if (await hasVerifyToken(userId)) return false;
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });
  return true;
}

/** Hydrates a bare user id into the denormalized session payload stored in the JWT. */
export async function hydrateSessionUser(userId: string): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memberships: {
        orderBy: { createdAt: "asc" },
        take: 1,
        include: { company: true },
      },
    },
  });
  const membership = user?.memberships[0];
  if (!user || !membership) return null;
  const emailVerified = await ensureEmailVerified(user.id, user.emailVerifiedAt);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    companyId: membership.company.id,
    companyName: membership.company.name,
    companySlug: membership.company.slug,
    role: membership.role,
    isPlatformAdmin: isPlatformOperator({ email: user.email, platformAdmin: user.platformAdmin }),
    companyBanned: Boolean(membership.company.bannedAt),
    emailVerified,
  };
}

export async function createUserWithCompanyMembership(input: {
  name: string;
  email: string;
  passwordHash: string;
  companyId: string;
  role?: Role;
  acceptedTermsAt?: Date | null;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email.trim().toLowerCase(),
      passwordHash: input.passwordHash,
      acceptedTermsAt: input.acceptedTermsAt ?? null,
      memberships: {
        create: {
          role: input.role ?? "OWNER",
          companyId: input.companyId,
        },
      },
    },
  });
  return mapUser(user);
}

export async function markEmailVerified(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { emailVerifiedAt: new Date() },
  });
}

export async function setUserPassword(userId: string, passwordHash: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, emailVerifiedAt: new Date() },
  });
}

/**
 * Removes an unverified signup so the email can be used again after the
 * verification window. Never touches accounts that already verified, or
 * legacy accounts that never received a verify token.
 */
export async function deleteStaleUnverifiedSignup(user: User): Promise<boolean> {
  if (user.emailVerifiedAt) return false;
  if (!(await hasVerifyToken(user.id))) return false;
  const age = Date.now() - new Date(user.createdAt).getTime();
  if (age < STALE_UNVERIFIED_MS) return false;

  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  for (const membership of memberships) {
    const remaining = await prisma.membership.count({ where: { companyId: membership.companyId } });
    if (remaining === 0) {
      await prisma.company.delete({ where: { id: membership.companyId } }).catch(() => undefined);
    }
  }
  return true;
}

export async function verifyWorkspaceOwners(companyId: string): Promise<number> {
  const members = await prisma.membership.findMany({
    where: { companyId },
    select: { userId: true },
  });
  if (members.length === 0) return 0;
  const result = await prisma.user.updateMany({
    where: { id: { in: members.map((member) => member.userId) }, emailVerifiedAt: null },
    data: { emailVerifiedAt: new Date() },
  });
  return result.count;
}
