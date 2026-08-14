import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/guard";
import { getOpsWorkspaceInspect } from "@/lib/data/repositories/ops";
import { OpsInspectView } from "@/components/admin/ops-inspect";

export default async function OpsInspectPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const user = await requireUser(locale);
  if (!user.isPlatformAdmin) notFound();
  const data = await getOpsWorkspaceInspect(id);
  if (!data) notFound();
  return <OpsInspectView data={data} />;
}
