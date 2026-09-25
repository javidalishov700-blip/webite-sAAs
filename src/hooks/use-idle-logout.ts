"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";
import { localizedPath } from "@/lib/catalog-url";

/** Matches IDLE_TIMEOUT_SECONDS on the server. */
const IDLE_MS = 30 * 60 * 1000;
/** While the owner is working, tell the server at most this often. */
const PING_EVERY_MS = 4 * 60 * 1000;
const CHECK_EVERY_MS = 60 * 1000;
const ACTIVITY = ["pointerdown", "keydown", "scroll", "touchstart"] as const;

export function sendToLogin(locale: string) {
  const next = window.location.pathname + window.location.search;
  window.location.assign(`${localizedPath(locale, "/login")}?reason=expired&next=${encodeURIComponent(next)}`);
}

/**
 * Keeps an unremembered session alive while the owner works, and once it has
 * lapsed on the server, takes them to the sign-in page instead of leaving a
 * panel whose every save would fail. The server decides: a remembered session
 * keeps answering, so nothing happens to it.
 */
export function useIdleLogout() {
  const locale = useLocale();

  useEffect(() => {
    let lastActivity = Date.now();
    let lastPing = Date.now();
    let checking = false;

    const signedIn = async (method: "GET" | "POST") => {
      try {
        const res = await fetch("/api/auth/session", { method, cache: "no-store" });
        const data = (await res.json()) as { user?: unknown };
        return Boolean(data.user);
      } catch {
        return true; // offline: the next check will tell
      }
    };

    const onActivity = () => {
      lastActivity = Date.now();
      if (lastActivity - lastPing < PING_EVERY_MS) return;
      lastPing = lastActivity;
      void signedIn("POST").then((ok) => {
        if (!ok) sendToLogin(locale);
      });
    };

    const check = async () => {
      if (checking || Date.now() - lastActivity < IDLE_MS) return;
      checking = true;
      if (await signedIn("GET")) lastActivity = Date.now();
      else sendToLogin(locale);
      checking = false;
    };

    const onVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    ACTIVITY.forEach((name) => window.addEventListener(name, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => void check(), CHECK_EVERY_MS);
    return () => {
      ACTIVITY.forEach((name) => window.removeEventListener(name, onActivity));
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [locale]);
}
