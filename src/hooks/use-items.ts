"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { ItemWithAttributes } from "@/lib/data/types";
import type { ItemInput } from "@/lib/validators/item";

export function useItems() {
  return useQuery({
    queryKey: queryKeys.items,
    queryFn: () => api.get<{ items: ItemWithAttributes[] }>("/api/items").then((r) => r.items),
  });
}

export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ItemInput) => api.post<{ item: ItemWithAttributes }>("/api/items", input).then((r) => r.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useUpdateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<ItemInput>) =>
      api.patch<{ item: ItemWithAttributes }>(`/api/items/${id}`, input).then((r) => r.item),
    onMutate: async ({ id, ...patch }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.items });
      const previous = queryClient.getQueryData<ItemWithAttributes[]>(queryKeys.items);
      if (previous) {
        queryClient.setQueryData(
          queryKeys.items,
          previous.map((item) => (item.id === id ? { ...item, ...patch } : item)),
        );
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.items, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
}

export function useDuplicateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post<{ item: ItemWithAttributes }>(`/api/items/${id}/duplicate`).then((r) => r.item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useDeleteItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
      queryClient.invalidateQueries({ queryKey: queryKeys.analytics });
    },
  });
}

export function useReorderItems() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, orderedIds }: { categoryId: string; orderedIds: string[] }) =>
      api.post("/api/items/reorder", { categoryId, orderedIds }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.items }),
  });
}
