import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Node (Vercel included) has no WebSocket in some runtimes; Neon pool needs one.
neonConfig.webSocketConstructor = ws;

function databaseUrl(): string {
  const raw = process.env.DATABASE_URL;
  if (!raw) {
    throw new Error("DATABASE_URL is not set");
  }
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("sslmode")) url.searchParams.set("sslmode", "require");
    // Prisma-engine pooler flags are not used by the Neon WebSocket driver.
    url.searchParams.delete("pgbouncer");
    url.searchParams.delete("connection_limit");
    url.searchParams.delete("connect_timeout");
    return url.toString();
  } catch {
    return raw;
  }
}

function createPrisma(): PrismaClient {
  const adapter = new PrismaNeon({ connectionString: databaseUrl() });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();
globalForPrisma.prisma = prisma;
