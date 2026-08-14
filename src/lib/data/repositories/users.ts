import "server-only";
import { prisma } from "@/lib/prisma";
import { mapMembership, mapUser } from "@/lib/data/map";
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    companyId: membership.company.id,
    companyName: membership.company.name,
    companySlug: membership.company.slug,
    role: membership.role,
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
