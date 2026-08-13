"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";
import type { AnalyticsSummary } from "@/lib/data/types";

export function useAnalytics() {
  return useQuery({
    queryKey: queryKeys.analytics,
    queryFn: () => api.get<{ summary: AnalyticsSummary }>("/api/analytics").then((r) => r.summary),
    refetchInterval: 60_000,
  });
}
