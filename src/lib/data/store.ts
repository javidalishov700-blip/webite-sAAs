import fs from "node:fs";
import path from "node:path";
import type {
  Category,
  Company,
  Item,
  ItemAttribute,
  Membership,
  QrCode,
  ScanEvent,
  User,
} from "@/lib/data/types";
import { buildSeedDb, type SeedDb } from "@/lib/data/seed-data";

export { generateId, nowIso } from "@/lib/data/ids";

export interface DbShape extends SeedDb {
  users: User[];
  memberships: Membership[];
  companies: Company[];
  categories: Category[];
  items: Item[];
  attributes: ItemAttribute[];
  qrCodes: QrCode[];
  scanEvents: ScanEvent[];
}

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "db.json");

declare global {
  var __qrUniverseDb: DbShape | undefined;
}

function readFromDisk(): DbShape | null {
  try {
    if (!fs.existsSync(DB_FILE)) return null;
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(raw) as DbShape;
    if (!parsed.companies || !Array.isArray(parsed.companies)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeToDisk(data: DbShape) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // best-effort persistence only — in read-only sandboxes we silently fall
    // back to the in-memory copy for the lifetime of the process.
  }
}

function initDb(): DbShape {
  const fromDisk = readFromDisk();
  if (fromDisk) return fromDisk;
  const seeded = buildSeedDb();
  writeToDisk(seeded);
  return seeded;
}

function getDb(): DbShape {
  if (!globalThis.__qrUniverseDb) {
    globalThis.__qrUniverseDb = initDb();
  }
  return globalThis.__qrUniverseDb;
}

/** Persists the current in-memory state to disk. Call after every mutation. */
function persist() {
  writeToDisk(getDb());
}

export const db = {
  get state() {
    return getDb();
  },
  persist,
  /** Testing/demo utility: wipes all data and reseeds from scratch. */
  reset() {
    globalThis.__qrUniverseDb = buildSeedDb();
    persist();
    return globalThis.__qrUniverseDb;
  },
};

