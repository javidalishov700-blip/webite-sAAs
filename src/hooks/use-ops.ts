"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Plan } from "@/lib/data/types";
import type { OpsReport, OpsWorkspace } from "@/lib/ops-types";

export function useOpsWorkspaces(query: string) {
  return useQuery({
    queryKey: queryKeys.opsWorkspaces(query),
    queryFn: () => api.get<{ workspaces: OpsWorkspace[] }>(`/api/ops/workspaces?q=${encodeURIComponent(query)}`).then((r) => r.workspaces),
  });
}

export function useOpsReports() {
  return useQuery({
    queryKey: queryKeys.opsReports,
    queryFn: () => api.get<{ reports: OpsReport[] }>("/api/ops/reports").then((r) => r.reports),
  });
}

export function useOpsWorkspaceActions() {
  const queryClient = useQueryClient();
  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["ops-workspaces"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.opsReports });
  }

  const patch = useMutation({
    mutationFn: (input: { id: string; action: "ban" | "unban" | "setPlan"; plan?: Plan; reason?: string }) =>
      api.patch(`/api/ops/workspaces/${input.id}`, {
        action: input.action,
        plan: input.plan,
        reason: input.reason,
      }),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/ops/workspaces/${id}`),
    onSuccess: invalidate,
  });

  return { patch, remove };
}
