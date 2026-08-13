"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { QrCode } from "@/lib/data/types";
import type { QrInput } from "@/lib/validators/qr";

export function useQrCodes() {
  return useQuery({
    queryKey: queryKeys.qrCodes,
    queryFn: () => api.get<{ qrCodes: QrCode[] }>("/api/qr").then((r) => r.qrCodes),
  });
}

export function useCreateQrCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<QrInput>) => api.post<{ qrCode: QrCode }>("/api/qr", input).then((r) => r.qrCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}

export function useUpdateQrCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<QrInput>) =>
      api.patch<{ qrCode: QrCode }>(`/api/qr/${id}`, input).then((r) => r.qrCode),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}

export function useDeleteQrCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/qr/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.qrCodes }),
  });
}
