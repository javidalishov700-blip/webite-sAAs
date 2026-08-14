/**
 * Resets `.data/db.json` to a clean state plus the public live-demo catalog
 * (no login accounts).
 *
 * Usage: pnpm seed
 */
import { db } from "@/lib/data/store";

const fresh = db.reset();

console.log("Reset QR-Universe store:");
console.log(`  companies:  ${fresh.companies.length} (includes public /c/live-demo)`);
console.log(`  categories: ${fresh.categories.length}`);
console.log(`  items:      ${fresh.items.length}`);
console.log(`  users:      ${fresh.users.length} (signups create real accounts)`);
