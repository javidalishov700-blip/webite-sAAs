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
    },
  });
  return mapQr(row);
}

export async function updateQrCode(
  id: string,
  companyId: string,
  patch: Partial<Omit<QrCode, "id" | "companyId" | "createdAt">>,
): Promise<QrCode | undefined> {
  const existing = await prisma.qrCode.findFirst({ where: { id, companyId } });
  if (!existing) return undefined;
  const { updatedAt: _ignored, ...rest } = patch;
  const row = await prisma.qrCode.update({
    where: { id },
    data: rest,
  });
  return mapQr(row);
}

export async function deleteQrCode(id: string, companyId: string): Promise<boolean> {
  const result = await prisma.qrCode.deleteMany({ where: { id, companyId } });
  return result.count > 0;
}
