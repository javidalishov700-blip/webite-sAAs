import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { OpsConsole } from "@/components/admin/ops-console";

export default async function OpsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const user = await requireUser(locale);
  if (!user.isPlatformAdmin) notFound();
  return <OpsConsole />;
}
