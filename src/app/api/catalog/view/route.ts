import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  slug: z.string().min(1).max(64),
  itemId: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "invalid" }, { status: 400 });

  const item = await prisma.item.findFirst({
    where: {
      id: parsed.data.itemId,
      isVisible: true,
      company: { slug: parsed.data.slug, isPublished: true },
    },
    select: { id: true, companyId: true },
  });
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });

  await prisma.itemView.create({
    data: { companyId: item.companyId, itemId: item.id },
  });
  return NextResponse.json({ ok: true });
}
