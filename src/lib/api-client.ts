"use client";

export class ApiError extends Error {
  status: number;
  code?: string;
  payload?: Record<string, unknown>;

  constructor(message: string, status: number, payload?: Record<string, unknown>) {
    super(message);
    this.status = status;
    this.payload = payload;
    this.code = typeof payload?.code === "string" ? payload.code : undefined;
  }
}

export function isPlanLimitError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === "plan_limit";
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      ...(options?.body && !(options.body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });

  const contentType = res.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const payload = data && typeof data === "object" ? (data as Record<string, unknown>) : undefined;
    throw new ApiError((payload?.error as string) ?? `Request failed (${res.status})`, res.status, payload);
  }
  return data as T;
}

export const api = {
  get: <T,>(url: string) => apiFetch<T>(url),
  post: <T,>(url: string, body?: unknown) =>
    apiFetch<T>(url, { method: "POST", body: body instanceof FormData ? body : JSON.stringify(body ?? {}) }),
  patch: <T,>(url: string, body?: unknown) => apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  put: <T,>(url: string, body?: unknown) => apiFetch<T>(url, { method: "PUT", body: JSON.stringify(body ?? {}) }),
  delete: <T,>(url: string) => apiFetch<T>(url, { method: "DELETE" }),
};
