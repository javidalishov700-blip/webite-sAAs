import { db, generateId, nowIso } from "@/lib/data/store";
import type { Membership, Role, SessionUser, User } from "@/lib/data/types";

export function findUserByEmail(email: string): User | undefined {
  const normalized = email.trim().toLowerCase();
  return db.state.users.find((u) => u.email.toLowerCase() === normalized);
}

export function findUserById(id: string): User | undefined {
  return db.state.users.find((u) => u.id === id);
}

export function getMembershipsForUser(userId: string): Membership[] {
  return db.state.memberships.filter((m) => m.userId === userId);
}

export function getPrimaryMembership(userId: string): Membership | undefined {
  return getMembershipsForUser(userId)[0];
}

/** Hydrates a bare user id into the denormalized session payload stored in the JWT. */
export function hydrateSessionUser(userId: string): SessionUser | null {
  const user = findUserById(userId);
  if (!user) return null;
  const membership = getPrimaryMembership(userId);
  if (!membership) return null;
  const company = db.state.companies.find((c) => c.id === membership.companyId);
  if (!company) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    companyId: company.id,
    companyName: company.name,
    companySlug: company.slug,
    role: membership.role,
  };
}

export function createUserWithCompanyMembership(input: {
  name: string;
  email: string;
  passwordHash: string;
  companyId: string;
  role?: Role;
}): User {
  const timestamp = nowIso();
  const user: User = {
    id: generateId("usr"),
    name: input.name,
    email: input.email.trim().toLowerCase(),
    passwordHash: input.passwordHash,
    avatarUrl: null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.state.users.push(user);
  db.state.memberships.push({
    id: generateId("mem"),
    role: input.role ?? "OWNER",
    userId: user.id,
    companyId: input.companyId,
    createdAt: timestamp,
  });
  db.persist();
  return user;
}
