/**
 * Resets the local mock database (`.data/db.json`) back to the seeded demo
 * state. Useful after playing around in the admin dashboard.
 *
 * Usage: pnpm seed
 */
import { db } from "@/lib/data/store";

const fresh = db.reset();

console.log("Seeded QR-Universe mock database:");
console.log(`  companies:  ${fresh.companies.length}`);
console.log(`  categories: ${fresh.categories.length}`);
console.log(`  items:      ${fresh.items.length}`);
console.log(`  qr codes:   ${fresh.qrCodes.length}`);
console.log(`  scans:      ${fresh.scanEvents.length}`);
console.log("\nDemo logins (password: demo1234):");
fresh.users.forEach((u) => console.log(`  - ${u.email}`));
