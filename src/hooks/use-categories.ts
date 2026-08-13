"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Category } from "@/lib/data/types";
import type { CategoryInput } from "@/lib/validators/category";

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => api.get<{ categories: Category[] }>("/api/categories").then((r) => r.categories),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => api.post<{ category: Category }>("/api/categories", input).then((r) => r.category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string } & Partial<CategoryInput>) =>
      api.patch<{ category: Category }>(`/api/categories/${id}`, input).then((r) => r.category),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      queryClient.invalidateQueries({ queryKey: queryKeys.items });
    },
  });
}

export function useReorderCategories() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) =>
      api.post<{ categories: Category[] }>("/api/categories/reorder", { orderedIds }).then((r) => r.categories),
    onMutate: async (orderedIds) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.categories });
      const previous = queryClient.getQueryData<Category[]>(queryKeys.categories);
      if (previous) {
        const byId = new Map(previous.map((c) => [c.id, c]));
        const reordered = orderedIds.map((id, index) => ({ ...byId.get(id)!, position: index })).filter(Boolean);
        queryClient.setQueryData(queryKeys.categories, reordered);
      }
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.categories, context.previous);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: queryKeys.categories }),
  });
}
