"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { Company } from "@/lib/data/types";

export function useCompany(initialData?: Company) {
  return useQuery({
    queryKey: queryKeys.company,
    queryFn: () => api.get<{ company: Company }>("/api/companies/me").then((r) => r.company),
    initialData,
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Record<string, unknown>) =>
      api.patch<{ company: Company }>("/api/companies/me", input).then((r) => r.company),
    onSuccess: (company) => queryClient.setQueryData(queryKeys.company, company),
  });
}
