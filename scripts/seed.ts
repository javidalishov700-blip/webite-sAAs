/**
 * Seeds the public live-demo catalog in Neon if it is missing.
 * Does not wipe user workspaces.
 *
 * Usage: pnpm seed
 */
import { ensureLiveDemoCatalog } from "@/lib/data/ensure-live-demo";
import { prisma } from "@/lib/prisma";

async function main() {
  await ensureLiveDemoCatalog();
  const companies = await prisma.company.count();
  const items = await prisma.item.count();
  console.log("Neon seed complete:");
  console.log(`  companies: ${companies} (includes public /c/live-demo)`);
  console.log(`  items:      ${items}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
