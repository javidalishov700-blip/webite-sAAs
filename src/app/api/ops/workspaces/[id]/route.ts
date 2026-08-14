import { NextRequest, NextResponse } from "next/server";
import { requirePlatformAdmin } from "@/lib/auth/guard";
import { opsWorkspacePatchSchema } from "@/lib/validators/ops";
import {
  banWorkspace,
  getOpsWorkspaceGuard,
  getOpsWorkspaceInspect,
  setWorkspacePlan,
  setWorkspacePublished,
  unbanWorkspace,
} from "@/lib/data/repositories/ops";
import { deleteCompany } from "@/lib/data/repositories/companies";
import { verifyWorkspaceOwners } from "@/lib/data/repositories/users";
import { setAllQrActive, setQrActiveForCompany } from "@/lib/data/repositories/qr";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, { params }: Params) {
  const { user, response } = await requirePlatformAdmin();
  if (!user) return response!;

  const { id } = await params;
  const inspect = await getOpsWorkspaceInspect(id);
  if (!inspect) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ workspace: inspect });
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

  const action = parsed.data.action;

  if (action === "setPlan") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    await setWorkspacePlan(id, parsed.data.plan);
    return NextResponse.json({ ok: true });
  }

  if (action === "verifyEmail") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    await verifyWorkspaceOwners(id);
    return NextResponse.json({ ok: true });
  }

  if (action === "publish" || action === "unpublish") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    await setWorkspacePublished(id, action === "publish");
    return NextResponse.json({ ok: true });
  }

  if (action === "setQrActive") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    const qr = await setQrActiveForCompany(parsed.data.qrId, id, parsed.data.isActive);
    if (!qr) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  if (action === "setAllQrs") {
    if (guard.protectedReason === "live_demo") {
      return NextResponse.json({ error: "protected" }, { status: 403 });
    }
    await setAllQrActive(id, parsed.data.isActive);
    return NextResponse.json({ ok: true });
  }

  if (guard.protectedReason) {
    return NextResponse.json({ error: "protected" }, { status: 403 });
  }

  if (parsed.data.action === "ban") {
    await banWorkspace(id, parsed.data.reason);
    return NextResponse.json({ ok: true });
  }

  if (parsed.data.action === "unban") {
    await unbanWorkspace(id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "invalid" }, { status: 400 });
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
