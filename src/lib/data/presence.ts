import "server-only";
import { prisma } from "@/lib/prisma";

export const PRESENCE_TTL_MS = 45_000;

export async function heartbeat(visitorId: string, scope = "site"): Promise<number> {
  const now = new Date();
  const cutoff = new Date(now.getTime() - PRESENCE_TTL_MS);

  await prisma.$transaction([
    prisma.presencePing.upsert({
      where: { visitorId_scope: { visitorId, scope } },
      create: { visitorId, scope, lastSeen: now },
      update: { lastSeen: now },
    }),
    prisma.presencePing.deleteMany({ where: { lastSeen: { lt: cutoff } } }),
  ]);

  return prisma.presencePing.count({
    where: { scope, lastSeen: { gte: cutoff } },
  });
}

export async function onlineCount(scope = "site"): Promise<number> {
  const cutoff = new Date(Date.now() - PRESENCE_TTL_MS);
  await prisma.presencePing.deleteMany({ where: { lastSeen: { lt: cutoff } } });
  return prisma.presencePing.count({
    where: { scope, lastSeen: { gte: cutoff } },
  });
}
