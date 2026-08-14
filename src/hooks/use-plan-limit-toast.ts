"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { isPlanLimitError } from "@/lib/api-client";
import type { PlanResource } from "@/lib/plan";

export function usePlanLimitToast() {
  const t = useTranslations("admin.plan");
  const router = useRouter();

  function show(resource: PlanResource, limit?: number | null) {
    toast.error(t(`hit.${resource}`, { limit: limit ?? 0 }), {
      description: t("hitHint"),
      action: {
        label: t("upgradeCta"),
        onClick: () => router.push("/admin/settings"),
      },
    });
  }

  function fromError(error: unknown): boolean {
    if (!isPlanLimitError(error)) return false;
    const resource = (error.payload?.resource as PlanResource | undefined) ?? "items";
    const limit = typeof error.payload?.limit === "number" ? error.payload.limit : null;
    show(resource, limit);
    return true;
  }

  return { show, fromError };
}
