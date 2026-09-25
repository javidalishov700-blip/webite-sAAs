"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ThemeProvider, useTheme } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { PresenceBeacon } from "@/components/presence-beacon";
import { CookieBanner } from "@/components/cookie-banner";

/** Toasts follow the page: a dark toast on the white day theme read as an alarm. */
function ThemedToaster() {
  const { resolvedTheme } = useTheme();
  return (
    <Toaster
      richColors
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      toastOptions={{
        classNames: {
          toast: "glass-card !rounded-2xl",
        },
      }}
    />
  );
}

/** The root <html> is owned by the top-level layout (so viewport/theme-color
 *  ship before any locale data resolves) and defaults to lang="en" — patch
 *  in the real locale once we know it. */
function DocumentLocale({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  return null;
}

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

export function Providers({ children, locale }: { children: React.ReactNode; locale: string }) {
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
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
      <QueryClientProvider client={queryClient}>
        <DocumentLocale locale={locale} />
        {children}
        <ThemedToaster />
        <Suspense fallback={null}>
          <PreviewAwareChrome />
        </Suspense>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
