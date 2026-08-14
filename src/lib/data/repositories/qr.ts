import { db, generateId, nowIso } from "@/lib/data/store";
import type { QrCode, QrDotStyle } from "@/lib/data/types";

export function listQrCodesByCompany(companyId: string): QrCode[] {
  return db.state.qrCodes
    .filter((q) => q.companyId === companyId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getQrCodeById(id: string, companyId: string): QrCode | undefined {
  return db.state.qrCodes.find((q) => q.id === id && q.companyId === companyId);
}

/** Public lookup used by the QR scan redirect (`/api/qr/:id/go`). */
export function getQrCodeByIdPublic(id: string): QrCode | undefined {
  return db.state.qrCodes.find((q) => q.id === id);
}

export interface CreateQrInput {
  companyId: string;
  name: string;
  targetUrl: string;
  dotsColor?: string;
  backgroundColor?: string;
  dotsStyle?: QrDotStyle;
  cornerStyle?: QrDotStyle;
  logoUrl?: string | null;
}

export function createQrCode(input: CreateQrInput): QrCode {
  const timestamp = nowIso();
  const qr: QrCode = {
    id: generateId("qr"),
    companyId: input.companyId,
    name: input.name,
    targetUrl: input.targetUrl,
    dotsColor: input.dotsColor ?? "#7C5CFF",
    backgroundColor: input.backgroundColor ?? "#0B0B14",
    dotsStyle: input.dotsStyle ?? "ROUNDED",
    cornerStyle: input.cornerStyle ?? "EXTRA_ROUNDED",
    logoUrl: input.logoUrl ?? null,
    scans: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  db.state.qrCodes.push(qr);
  db.persist();
  return qr;
}

export function updateQrCode(
  id: string,
  companyId: string,
  patch: Partial<Omit<QrCode, "id" | "companyId" | "createdAt">>,
): QrCode | undefined {
  const qr = getQrCodeById(id, companyId);
  if (!qr) return undefined;
  Object.assign(qr, patch, { updatedAt: nowIso() });
  db.persist();
  return qr;
}

export function deleteQrCode(id: string, companyId: string): boolean {
  const idx = db.state.qrCodes.findIndex((q) => q.id === id && q.companyId === companyId);
  if (idx === -1) return false;
  db.state.qrCodes.splice(idx, 1);
  db.persist();
  return true;
}
