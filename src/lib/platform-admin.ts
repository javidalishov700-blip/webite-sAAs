import "server-only";

const OWNER_ADMIN_EMAIL = "javidalishov700@gmail.com";

export function platformAdminEmails(): string[] {
  const fromEnv = (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([OWNER_ADMIN_EMAIL, ...fromEnv])];
}

export function isPlatformAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return platformAdminEmails().includes(email.trim().toLowerCase());
}

export function isPlatformOperator(user: { email: string; platformAdmin?: boolean | null }): boolean {
  return Boolean(user.platformAdmin) || isPlatformAdminEmail(user.email);
}
