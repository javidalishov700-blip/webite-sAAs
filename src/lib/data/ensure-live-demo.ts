import { prisma } from "@/lib/prisma";
import { PUBLIC_SHOWCASE_SLUG, SHOWCASE_MENU } from "@/lib/data/public-showcase";

function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

let seeded = false;

/** Idempotent: creates the public Live Kitchen catalog if it is missing. Never throws. */
export async function ensureLiveDemoCatalog(): Promise<void> {
  if (seeded) return;

  try {
    const existing = await prisma.company.findUnique({ where: { slug: PUBLIC_SHOWCASE_SLUG } });
    if (existing) {
      seeded = true;
      return;
    }

    await prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          slug: PUBLIC_SHOWCASE_SLUG,
          name: "Live Kitchen",
          description: "A public sample catalog — scan, browse, tap. Create your own after signup.",
          logoUrl: unsplash("1414235077428-338989a2e8c0", 256),
          coverUrl: unsplash("1414235077428-338989a2e8c0", 1600),
          industry: "RESTAURANT",
          plan: "PRO",
          currency: "USD",
          defaultLocale: "en",
          supportedLocales: ["en", "ru", "tr", "az"],
          accentColor: "#FF6B4A",
          address: "Sample venue",
          isPublished: true,
        },
      });

      for (const [ci, cat] of SHOWCASE_MENU.entries()) {
        const category = await tx.category.create({
          data: {
            companyId: company.id,
            name: cat.name,
            icon: cat.icon,
            position: ci,
            isVisible: true,
          },
        });
        for (const [ii, item] of cat.items.entries()) {
          await tx.item.create({
            data: {
              companyId: company.id,
              categoryId: category.id,
              title: item.title,
              description: item.desc,
              price: item.price,
              currency: "USD",
              images: [unsplash(item.image)],
              isVisible: true,
              isFeatured: "featured" in item ? Boolean(item.featured) : false,
              position: ii,
            },
          });
        }
      }

      const qr = await tx.qrCode.create({
        data: {
          companyId: company.id,
          name: "Showcase QR",
          targetUrl: "/c/live-demo",
          dotsColor: "#FF6B4A",
          backgroundColor: "#120A08",
          dotsStyle: "ROUNDED",
          cornerStyle: "EXTRA_ROUNDED",
        },
      });
      await tx.qrCode.update({
        where: { id: qr.id },
        data: { targetUrl: `/api/qr/${qr.id}/go` },
      });
    });

    seeded = true;
  } catch (error) {
    try {
      const again = await prisma.company.findUnique({ where: { slug: PUBLIC_SHOWCASE_SLUG } });
      if (again) {
        seeded = true;
        return;
      }
    } catch {
      // ignore follow-up lookup failures
    }
    console.error("[live-demo] seed skipped:", error);
  }
}
