"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

function visitorId(): string {
  const key = "qru-visitor";
  try {
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = crypto.randomUUID();
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `anon-${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function PresenceBeacon() {
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    setId(visitorId());
  }, []);

  useQuery({
    queryKey: ["presence", id],
    enabled: Boolean(id),
    queryFn: () => api.post<{ count: number }>("/api/presence", { visitorId: id }),
    refetchInterval: 20_000,
  });

  return null;
}

export function useOnlineCount() {
  return useQuery({
    queryKey: ["presence-count"],
    queryFn: () => api.get<{ count: number }>("/api/presence").then((r) => r.count),
    refetchInterval: 15_000,
    staleTime: 10_000,
  });
}
