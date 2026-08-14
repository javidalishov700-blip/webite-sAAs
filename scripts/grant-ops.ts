/**
 * Grant platform-admin access to an existing user.
 *
 * Usage: pnpm ops:grant you@email.com
 */
import { prisma } from "@/lib/prisma";

async function main() {
  const fromArg = process.argv[2]?.trim().toLowerCase();
  const fromEnv = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .find(Boolean);
  const email = fromArg || fromEnv;
  if (!email || !email.includes("@")) {
    console.error("Usage: pnpm ops:grant you@email.com");
    console.error("Or set PLATFORM_ADMIN_EMAILS in .env and run pnpm ops:grant");
    process.exit(1);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    console.error("No user with that email. Create the account first, then run this again.");
    process.exit(1);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { platformAdmin: true },
  });
  console.log(`Granted Control access to ${user.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
