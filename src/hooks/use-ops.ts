"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Plan } from "@/lib/data/types";
import type { OpsMailStatus, OpsReport, OpsWorkspace } from "@/lib/ops-types";

export type OpsPatchInput =
  | { id: string; action: "ban"; reason?: string }
  | { id: string; action: "unban" }
  | { id: string; action: "setPlan"; plan: Plan }
  | { id: string; action: "publish" }
  | { id: string; action: "unpublish" }
  | { id: string; action: "verifyEmail" }
  | { id: string; action: "setQrActive"; qrId: string; isActive: boolean }
  | { id: string; action: "setAllQrs"; isActive: boolean };

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

export function useOpsMail() {
  const queryClient = useQueryClient();
  const status = useQuery({
    queryKey: queryKeys.opsMail,
    queryFn: () => api.get<{ mail: OpsMailStatus }>("/api/ops/mail").then((r) => r.mail),
  });
  const test = useMutation({
    mutationFn: () => api.post("/api/ops/mail"),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.opsMail }),
  });
  return { status, test };
}

export function useOpsWorkspaceActions() {
  const queryClient = useQueryClient();
  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["ops-workspaces"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.opsReports });
  }

  const patch = useMutation({
    mutationFn: (input: OpsPatchInput) => {
      const { id, ...body } = input;
      return api.patch(`/api/ops/workspaces/${id}`, body);
    },
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/api/ops/workspaces/${id}`),
    onSuccess: invalidate,
  });

  return { patch, remove };
}
