"use client";

import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useUploadImage() {
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post<{ url: string; bytes: number }>("/api/uploads", formData);
    },
  });
}
