import { requireUser } from "@/lib/auth/guard";
import { AdminShell } from "@/components/admin/admin-shell";
import { AccountBanned } from "@/components/admin/account-banned";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);
  if (user.companyBanned && !user.isPlatformAdmin) {
    return <AccountBanned />;
  }

  return <AdminShell user={user}>{children}</AdminShell>;
}
