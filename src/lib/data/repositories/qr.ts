import "server-only";
import { prisma } from "@/lib/prisma";
import { mapQr } from "@/lib/data/map";
import type { QrCode, QrDotStyle } from "@/lib/data/types";

export async function listQrCodesByCompany(companyId: string): Promise<QrCode[]> {
  const rows = await prisma.qrCode.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapQr);
}

export async function getQrCodeById(id: string, companyId: string): Promise<QrCode | undefined> {
  const row = await prisma.qrCode.findFirst({ where: { id, companyId } });
  return row ? mapQr(row) : undefined;
}

/** Public lookup used by the QR scan redirect (`/api/qr/:id/go`). */
export async function getQrCodeByIdPublic(id: string): Promise<QrCode | undefined> {
  const row = await prisma.qrCode.findUnique({ where: { id } });
  return row ? mapQr(row) : undefined;
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

export async function createQrCode(input: CreateQrInput): Promise<QrCode> {
  const row = await prisma.qrCode.create({
    data: {
      companyId: input.companyId,
      name: input.name,
      targetUrl: input.targetUrl,
      dotsColor: input.dotsColor ?? "#7C5CFF",
      backgroundColor: input.backgroundColor ?? "#0B0B14",
      dotsStyle: input.dotsStyle ?? "ROUNDED",
      cornerStyle: input.cornerStyle ?? "EXTRA_ROUNDED",
      logoUrl: input.logoUrl ?? null,
      scans: 0,
      isActive: true,
    },
  });
  return mapQr(row);
}

type QrPatch = Partial<Pick<QrCode, "name" | "targetUrl" | "dotsColor" | "backgroundColor" | "dotsStyle" | "cornerStyle" | "logoUrl" | "isActive">>;

export async function updateQrCode(
  id: string,
  companyId: string,
  patch: QrPatch,
): Promise<QrCode | undefined> {
  const existing = await prisma.qrCode.findFirst({ where: { id, companyId } });
  if (!existing) return undefined;
  const row = await prisma.qrCode.update({
    where: { id },
    data: {
      ...(patch.name !== undefined ? { name: patch.name } : {}),
      ...(patch.targetUrl !== undefined ? { targetUrl: patch.targetUrl } : {}),
      ...(patch.dotsColor !== undefined ? { dotsColor: patch.dotsColor } : {}),
      ...(patch.backgroundColor !== undefined ? { backgroundColor: patch.backgroundColor } : {}),
      ...(patch.dotsStyle !== undefined ? { dotsStyle: patch.dotsStyle } : {}),
      ...(patch.cornerStyle !== undefined ? { cornerStyle: patch.cornerStyle } : {}),
      ...(patch.logoUrl !== undefined ? { logoUrl: patch.logoUrl } : {}),
      ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
    },
  });
  return mapQr(row);
}

export async function setQrActiveForCompany(id: string, companyId: string, isActive: boolean): Promise<QrCode | undefined> {
  return updateQrCode(id, companyId, { isActive });
}

export async function setAllQrActive(companyId: string, isActive: boolean): Promise<number> {
  const result = await prisma.qrCode.updateMany({
    where: { companyId },
    data: { isActive },
  });
  return result.count;
}

export async function deleteQrCode(id: string, companyId: string): Promise<boolean> {
  const result = await prisma.qrCode.deleteMany({ where: { id, companyId } });
  return result.count > 0;
}
