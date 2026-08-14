"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PresenceBeacon } from "@/components/presence-beacon";
import { CookieBanner } from "@/components/cookie-banner";

function PreviewAwareChrome() {
  const preview = useSearchParams().get("preview") === "1";
  if (preview) return null;
  return (
    <>
      <PresenceBeacon />
      <CookieBanner />
    </>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          richColors
          position="bottom-right"
          theme="dark"
          toastOptions={{
            classNames: {
              toast: "glass-card !rounded-2xl",
            },
          }}
        />
        <Suspense fallback={null}>
          <PreviewAwareChrome />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
