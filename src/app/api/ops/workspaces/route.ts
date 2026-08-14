import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/guard";
import { listOpsWorkspaces } from "@/lib/data/repositories/ops";

export async function GET(request: NextRequest) {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;

  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const workspaces = await listOpsWorkspaces(q);
  return NextResponse.json({ workspaces });
}
