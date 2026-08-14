import { NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/guard";
import { listOpsReports } from "@/lib/data/repositories/ops";

export async function GET() {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;
  const reports = await listOpsReports();
  return NextResponse.json({ reports });
}
