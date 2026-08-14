"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
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

function useVisitorId() {
  const [id, setId] = useState<string | null>(null);
  useEffect(() => {
    setId(visitorId());
  }, []);
  return id;
}

export function useOnlineCount(scope: string | null = "site") {
  const id = useVisitorId();
  return useQuery({
    queryKey: ["presence", scope, id],
    enabled: Boolean(id && scope),
    queryFn: () =>
      api.post<{ count: number }>("/api/presence", { visitorId: id, scope }).then((r) => r.count),
    refetchInterval: 12_000,
    staleTime: 8_000,
  });
}

export function PresenceBeacon() {
  const pathname = usePathname();
  const slug = pathname.match(/\/c\/([^/?#]+)/)?.[1] ?? null;
  useOnlineCount("site");
  useOnlineCount(slug ? `catalog:${slug}` : null);
  return null;
}
