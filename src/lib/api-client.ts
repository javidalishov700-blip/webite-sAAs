"use client";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
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
    throw new ApiError((data && (data.error as string)) ?? `Request failed (${res.status})`, res.status);
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
