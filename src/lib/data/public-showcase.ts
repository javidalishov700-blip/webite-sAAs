import { generateId, nowIso } from "@/lib/data/ids";
import type { SeedDb } from "@/lib/data/seed-data";
import type { CompanyPublicView } from "@/lib/data/types";

export const PUBLIC_SHOWCASE_SLUG = "live-demo";

export const SHOWCASE_MENU = [
  {
    name: "Starters",
    icon: "Salad",
    items: [
      { title: "Bruschetta Trio", price: 8.5, image: "1540420773420-3366772f4999", desc: "Tomato, ricotta, basil-fig.", kcal: 320 },
      { title: "Caesar Salad", price: 9.9, image: "1512621776951-a57141f2eefd", desc: "Romaine, parmesan, house dressing.", kcal: 410 },
    ],
  },
  {
    name: "Mains",
    icon: "UtensilsCrossed",
    items: [
      { title: "Classic Cheeseburger", price: 12.9, image: "1568901346375-23c9450c58cd", desc: "Double smash, aged cheddar.", kcal: 780, featured: true },
      { title: "Margherita Pizza", price: 11, image: "1565299624946-b28f40a0ae38", desc: "San Marzano, fior di latte.", kcal: 690, featured: true },
      { title: "Truffle Pasta", price: 14.5, image: "1567620905732-2d1ec7ab7445", desc: "Tagliatelle, mushroom cream.", kcal: 640 },
    ],
  },
  {
    name: "Desserts",
    icon: "IceCreamCone",
    items: [
      { title: "Molten Chocolate Cake", price: 6.9, image: "1578985545062-69928b1d9587", desc: "Warm center, vanilla ice cream.", kcal: 520, featured: true },
      { title: "Tiramisu", price: 6.5, image: "1551024506-0bccd828d307", desc: "Espresso, mascarpone, cocoa.", kcal: 430 },
    ],
  },
  {
    name: "Drinks",
    icon: "GlassWater",
    items: [
      { title: "Fresh Orange Juice", price: 4, image: "1544145945-f90425340c7e", desc: "Cold-pressed, no sugar.", kcal: 110 },
      { title: "Espresso", price: 3, image: "1509042239860-f550ce710b93", desc: "Double shot, house roast.", kcal: 5 },
    ],
  },
] as const;

/** Restaurants expect a calorie figure next to the price; the demo shows it. */
function calorieAttribute(itemId: string, kcal: number) {
  return { id: `attr_${itemId}_kcal`, itemId, key: "calories", value: String(kcal), type: "NUMBER" as const, unit: "kcal", position: 0 };
}

function unsplash(id: string, w = 900): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

/** Public browse-only catalog (no login). Used by the landing live-demo CTA. */
export function ensurePublicShowcase<T extends SeedDb>(data: T): T {
  if (data.companies.some((c) => c.slug === PUBLIC_SHOWCASE_SLUG)) return data;

  const now = nowIso();
  const companyId = generateId("cmp");

  data.companies.push({
    id: companyId,
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
    phone: null,
    website: null,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  });

  SHOWCASE_MENU.forEach((cat, ci) => {
    const categoryId = generateId("cat");
    data.categories.push({
      id: categoryId,
      companyId,
      name: cat.name,
      icon: cat.icon,
      position: ci,
      isVisible: true,
      createdAt: now,
      updatedAt: now,
    });
    cat.items.forEach((item, ii) => {
      const itemId = generateId("itm");
      data.items.push({
        id: itemId,
        companyId,
        categoryId,
        title: item.title,
        description: item.desc,
        price: item.price,
        compareAtPrice: null,
        currency: "USD",
        images: [unsplash(item.image)],
        isVisible: true,
        isFeatured: Boolean("featured" in item && item.featured),
        stockCount: null,
        position: ii,
        createdAt: now,
        updatedAt: now,
      });
      data.attributes.push(calorieAttribute(itemId, item.kcal));
    });
  });

  const qrId = generateId("qr");
  data.qrCodes.push({
    id: qrId,
    companyId,
    name: "Showcase QR",
    targetUrl: `/api/qr/${qrId}/go`,
    dotsColor: "#FF6B4A",
    backgroundColor: "#120A08",
    dotsStyle: "ROUNDED",
    cornerStyle: "EXTRA_ROUNDED",
    logoUrl: null,
    scans: 0,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  return data;
}

/**
 * DB-free Live Kitchen catalog for the landing CTA.
 * Used when Neon/Prisma is unreachable so "/c/live-demo" never 500s.
 */
export function getStaticLiveDemoCatalog(): CompanyPublicView {
  const now = "2026-01-01T00:00:00.000Z";
  const companyId = "cmp_live_demo";
  return {
    id: companyId,
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
    phone: null,
    website: null,
    isPublished: true,
    bannedAt: null,
    bannedReason: null,
    createdAt: now,
    updatedAt: now,
    categories: SHOWCASE_MENU.map((cat, ci) => {
      const categoryId = `cat_live_${ci}`;
      return {
        id: categoryId,
        companyId,
        name: cat.name,
        icon: cat.icon,
        position: ci,
        isVisible: true,
        createdAt: now,
        updatedAt: now,
        items: cat.items.map((item, ii) => {
          const itemId = `itm_live_${ci}_${ii}`;
          return {
          id: itemId,
          companyId,
          categoryId,
          title: item.title,
          description: item.desc,
          price: item.price,
          compareAtPrice: null,
          currency: "USD",
          images: [unsplash(item.image)],
          isVisible: true,
          isFeatured: Boolean("featured" in item && item.featured),
          stockCount: null,
          position: ii,
          createdAt: now,
          updatedAt: now,
          attributes: [calorieAttribute(itemId, item.kcal)],
          };
        }),
      };
    }),
  };
}
