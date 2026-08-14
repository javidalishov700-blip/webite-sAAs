"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  BadgeCheck,
  Eye,
  EyeOff,
  Flag,
  Lock,
  QrCode,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useOpsReports, useOpsWorkspaceActions, useOpsWorkspaces } from "@/hooks/use-ops";
import { ApiError } from "@/lib/api-client";
import type { Plan } from "@/lib/data/types";
import type { OpsWorkspace } from "@/lib/ops-types";

const PLANS: Plan[] = ["FREE", "PRO", "ENTERPRISE"];

export function OpsConsole() {
  const t = useTranslations("admin.ops");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [query, setQuery] = useState("");
  const [banTarget, setBanTarget] = useState<OpsWorkspace | null>(null);
  const [banReason, setBanReason] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<OpsWorkspace | null>(null);
  const [deleteSlug, setDeleteSlug] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(input.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [input]);

  const workspaces = useOpsWorkspaces(query);
  const reports = useOpsReports();
  const { patch, remove } = useOpsWorkspaceActions();

  function fail(err: unknown) {
    toast.error(err instanceof ApiError && err.status === 403 ? t("protectedError") : t("error"));
  }

  async function handlePlan(workspace: OpsWorkspace, plan: Plan) {
    if (plan === workspace.plan) return;
    try {
      await patch.mutateAsync({ id: workspace.id, action: "setPlan", plan });
      toast.success(t("planOk"));
    } catch (err) {
      fail(err);
    }
  }

  async function handleBan() {
    if (!banTarget) return;
    try {
      await patch.mutateAsync({ id: banTarget.id, action: "ban", reason: banReason.trim() || undefined });
      toast.success(t("bannedOk"));
      setBanTarget(null);
      setBanReason("");
    } catch (err) {
      fail(err);
    }
  }

  async function handleUnban(workspace: OpsWorkspace) {
    try {
      await patch.mutateAsync({ id: workspace.id, action: "unban" });
      toast.success(t("unbannedOk"));
    } catch (err) {
      fail(err);
    }
  }

  async function handlePublish(workspace: OpsWorkspace, publish: boolean) {
    try {
      await patch.mutateAsync({ id: workspace.id, action: publish ? "publish" : "unpublish" });
      toast.success(publish ? t("publishedOk") : t("unpublishedOk"));
    } catch (err) {
      fail(err);
    }
  }

  async function handleVerify(workspace: OpsWorkspace) {
    try {
      await patch.mutateAsync({ id: workspace.id, action: "verifyEmail" });
      toast.success(t("verifiedOk"));
    } catch (err) {
      fail(err);
    }
  }

  async function handleAllQrs(workspace: OpsWorkspace, isActive: boolean) {
    try {
      await patch.mutateAsync({ id: workspace.id, action: "setAllQrs", isActive });
      toast.success(isActive ? t("qrsOnOk") : t("qrsOffOk"));
    } catch (err) {
      fail(err);
    }
  }

  async function handleQr(workspace: OpsWorkspace, qrId: string, isActive: boolean) {
    try {
      await patch.mutateAsync({ id: workspace.id, action: "setQrActive", qrId, isActive });
    } catch (err) {
      fail(err);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await remove.mutateAsync(deleteTarget.id);
      toast.success(t("deletedOk"));
      setDeleteTarget(null);
      setDeleteSlug("");
    } catch (err) {
      fail(err);
    }
  }

  const mutating = patch.isPending || remove.isPending;

  return (
    <div className="max-w-5xl">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <div className="relative mb-5">
        <Search className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="h-11 rounded-full pl-10"
        />
      </div>

      <div className="space-y-3">
        {workspaces.isLoading
          ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)
          : workspaces.data?.length === 0
            ? <p className="text-sm text-muted-foreground">{t("empty")}</p>
            : workspaces.data?.map((workspace) => {
                const liveDemo = workspace.protectedReason === "live_demo";
                const lockedHard = Boolean(workspace.protected);
                return (
                <Card key={workspace.id}>
                  <CardContent className="flex flex-col gap-4 p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-display text-lg font-semibold">{workspace.name}</h2>
                        {workspace.bannedAt ? (
                          <Badge variant="destructive">{t("banned")}</Badge>
                        ) : workspace.isPublished ? (
                          <Badge variant="success">{t("live")}</Badge>
                        ) : (
                          <Badge variant="muted">{t("unpublished")}</Badge>
                        )}
                        {workspace.emailVerified ? (
                          <Badge variant="outline">{t("emailOk")}</Badge>
                        ) : (
                          <Badge variant="destructive">{t("emailPending")}</Badge>
                        )}
                        {workspace.protected ? (
                          <Badge variant="outline">
                            <Lock className="size-3" />
                            {workspace.protectedReason === "live_demo" ? t("protectedLiveDemo") : t("protectedAdmin")}
                          </Badge>
                        ) : null}
                      </div>
                      <p className="font-mono text-xs text-muted-foreground">/c/{workspace.slug}</p>
                      <p className="text-sm text-muted-foreground">
                        {workspace.owners.map((owner) => `${owner.name} · ${owner.email}`).join(" · ") || t("noOwner")}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("items", { count: workspace.itemCount })}
                        {` · ${t("qrs", { count: workspace.qrCount })}`}
                        {workspace.reportCount > 0 ? ` · ${t("reportCount", { count: workspace.reportCount })}` : ""}
                      </p>
                      {workspace.bannedReason ? (
                        <p className="text-xs text-destructive">{workspace.bannedReason}</p>
                      ) : null}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                      <Select
                        value={workspace.plan}
                        onValueChange={(value) => handlePlan(workspace, value as Plan)}
                        disabled={liveDemo || mutating}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLANS.map((plan) => (
                            <SelectItem key={plan} value={plan}>
                              {t(`plans.${plan}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2 sm:justify-end">
                        {workspace.bannedAt ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={lockedHard || mutating}
                            onClick={() => handleUnban(workspace)}
                          >
                            {t("unban")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={lockedHard || mutating}
                            onClick={() => {
                              setBanReason("");
                              setBanTarget(workspace);
                            }}
                          >
                            <ShieldAlert className="size-3.5" />
                            {t("ban")}
                          </Button>
                        )}
                        {workspace.isPublished ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={liveDemo || mutating}
                            onClick={() => handlePublish(workspace, false)}
                          >
                            <EyeOff className="size-3.5" />
                            {t("unpublish")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={liveDemo || mutating || Boolean(workspace.bannedAt)}
                            onClick={() => handlePublish(workspace, true)}
                          >
                            <Eye className="size-3.5" />
                            {t("publish")}
                          </Button>
                        )}
                        {!workspace.emailVerified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={liveDemo || mutating}
                            onClick={() => handleVerify(workspace)}
                          >
                            <BadgeCheck className="size-3.5" />
                            {t("verifyEmail")}
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" disabled>
                            <ShieldCheck className="size-3.5" />
                            {t("emailOk")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={liveDemo || mutating || workspace.qrCount === 0}
                          onClick={() => handleAllQrs(workspace, false)}
                        >
                          <QrCode className="size-3.5" />
                          {t("pauseQrs")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={liveDemo || mutating || workspace.qrCount === 0}
                          onClick={() => handleAllQrs(workspace, true)}
                        >
                          {t("enableQrs")}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={lockedHard || mutating}
                          onClick={() => {
                            setDeleteSlug("");
                            setDeleteTarget(workspace);
                          }}
                        >
                          <Trash2 className="size-3.5" />
                          {t("delete")}
                        </Button>
                      </div>
                    </div>
                    </div>

                    {workspace.qrCodes.length > 0 ? (
                      <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-3">
                        <p className="text-xs font-medium text-muted-foreground">{t("qrList")}</p>
                        {workspace.qrCodes.map((qr) => (
                          <div key={qr.id} className="flex items-center justify-between gap-3 text-sm">
                            <div className="min-w-0">
                              <p className="truncate font-medium">{qr.name}</p>
                              <p className="text-xs text-muted-foreground">{t("qrScans", { count: qr.scans })}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {qr.isActive ? t("qrOn") : t("qrOff")}
                              </span>
                              <Switch
                                checked={qr.isActive}
                                disabled={liveDemo || mutating}
                                onCheckedChange={(checked) => handleQr(workspace, qr.id, checked)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
                );
              })}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flag className="size-4" />
            {t("reports")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.isLoading ? (
            <Skeleton className="h-24 rounded-xl" />
          ) : reports.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">{t("noReports")}</p>
          ) : (
            reports.data?.map((report) => (
              <div key={report.id} className="rounded-xl border border-border/70 bg-muted/20 p-3.5">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-medium">{report.companyName}</span>
                  <span className="font-mono text-xs text-muted-foreground">/c/{report.companySlug}</span>
                  <Badge variant="outline">{t(`reportReasons.${report.reason}`)}</Badge>
                </div>
                {report.details ? <p className="mt-1.5 text-sm text-foreground/80">{report.details}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleString(locale)}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(banTarget)} onOpenChange={(open) => !open && setBanTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("banTitle")}</DialogTitle>
            <DialogDescription>{t("banHint", { name: banTarget?.name ?? "" })}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label htmlFor="ban-reason">{t("reasonLabel")}</Label>
            <Textarea
              id="ban-reason"
              maxLength={300}
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBanTarget(null)}>
              {t("cancel")}
            </Button>
            <Button variant="destructive" loading={patch.isPending} onClick={handleBan}>
              {t("confirmBan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("deleteHint", { slug: deleteTarget?.slug ?? "" })}</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            value={deleteSlug}
            onChange={(e) => setDeleteSlug(e.target.value)}
            placeholder={deleteTarget?.slug}
          />
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteSlug !== deleteTarget?.slug || remove.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDelete();
              }}
            >
              {t("confirmDelete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
