"use client";

import { useEffect } from "react";

/**
 * Records a catalog open once per browser tab session.
 * Skips when the visitor already came through `/api/qr/:id/go` (`scanned=1`),
 * so QR analytics are not double-counted.
 */
export function CatalogScanTracker({
  slug,
  locale,
  qrId,
  alreadyRecorded,
}: {
  slug: string;
  locale: string;
  qrId?: string | null;
  alreadyRecorded?: boolean;
}) {
  useEffect(() => {
    if (alreadyRecorded) return;
    const key = `qru-scan:${slug}:${qrId ?? "direct"}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // private mode / blocked storage — still attempt the record
    }

    fetch("/api/scans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, locale, qrCodeId: qrId ?? undefined }),
      keepalive: true,
    }).catch(() => {
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* ignore */
      }
    });
  }, [slug, locale, qrId, alreadyRecorded]);

  return null;
}
