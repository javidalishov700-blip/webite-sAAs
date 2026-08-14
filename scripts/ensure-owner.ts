/**
 * Production bootstrap: make sure Javid can log in as platform admin.
 * Password is set once (stamp token), then later deploys do not overwrite it.
 */
import { createHash } from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const OWNER_EMAIL = "javidalishov700@gmail.com";
const OWNER_NAME = "Javid Alishov";
const OWNER_PASSWORD = "QrUniverse700!";
const STAMP = "owner-login-reset-2026-08-14";

function stampHash() {
  return createHash("sha256").update(STAMP).digest("hex");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let n = 1;
  while (await prisma.company.findUnique({ where: { slug } })) {
    n += 1;
    slug = `${base}-${n}`;
  }
  return slug;
}

async function main() {
  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 10);
  let user = await prisma.user.findUnique({ where: { email: OWNER_EMAIL } });

  if (!user) {
    const company = await prisma.company.create({
      data: {
        slug: await uniqueSlug("javid"),
        name: "Javid",
        industry: "OTHER",
        plan: "ENTERPRISE",
        isPublished: false,
      },
    });
    user = await prisma.user.create({
      data: {
        name: OWNER_NAME,
        email: OWNER_EMAIL,
        passwordHash,
        platformAdmin: true,
        emailVerifiedAt: new Date(),
        acceptedTermsAt: new Date(),
        memberships: { create: { role: "OWNER", companyId: company.id } },
      },
    });
    await prisma.authToken.create({
      data: {
        userId: user.id,
        type: "PASSWORD_RESET",
        tokenHash: stampHash(),
        expiresAt: new Date("2099-01-01T00:00:00.000Z"),
        usedAt: new Date(),
      },
    });
    console.log("[owner] created account", user.email);
  } else {
    const already = await prisma.authToken.findUnique({ where: { tokenHash: stampHash() } });
    await prisma.user.update({
      where: { id: user.id },
      data: {
        platformAdmin: true,
        emailVerifiedAt: user.emailVerifiedAt ?? new Date(),
        ...(already ? {} : { passwordHash }),
      },
    });
    if (!already) {
      await prisma.authToken.create({
        data: {
          userId: user.id,
          type: "PASSWORD_RESET",
          tokenHash: stampHash(),
          expiresAt: new Date("2099-01-01T00:00:00.000Z"),
          usedAt: new Date(),
        },
      });
      console.log("[owner] password set once for", user.email);
    } else {
      console.log("[owner] already bootstrapped", user.email);
    }
  }
}

main()
  .catch((error) => {
    console.error("[owner] bootstrap failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
