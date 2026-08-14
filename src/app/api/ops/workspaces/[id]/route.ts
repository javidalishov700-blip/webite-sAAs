import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/guard";
import { opsWorkspacePatchSchema } from "@/lib/validators/ops";
import {
  banWorkspace,
  getOpsWorkspaceGuard,
  setWorkspacePlan,
  unbanWorkspace,
} from "@/lib/data/repositories/ops";
import { deleteCompany } from "@/lib/data/repositories/companies";

interface Params {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = opsWorkspacePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const guard = await getOpsWorkspaceGuard(id);
  if (!guard) return NextResponse.json({ error: "not_found" }, { status: 404 });

  if (parsed.data.action === "setPlan") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    await setWorkspacePlan(id, parsed.data.plan);
    return NextResponse.json({ ok: true });
  }

  if (guard.protectedReason) {
    return NextResponse.json({ error: "protected" }, { status: 403 });
  }

  if (parsed.data.action === "ban") {
    await banWorkspace(id, parsed.data.reason);
  } else {
    await unbanWorkspace(id);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;

  const { id } = await params;
  const guard = await getOpsWorkspaceGuard(id);
  if (!guard) return NextResponse.json({ error: "not_found" }, { status: 404 });
  if (guard.protectedReason) {
    return NextResponse.json({ error: "protected" }, { status: 403 });
  }
  if (id === user.companyId) {
    return NextResponse.json({ error: "protected" }, { status: 403 });
  }

  await deleteCompany(id);
  return NextResponse.json({ ok: true });
}
