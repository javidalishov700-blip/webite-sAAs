const TTL_MS = 45_000;

declare global {
  var __qrUniversePresence: Map<string, number> | undefined;
}

function table(): Map<string, number> {
  if (!globalThis.__qrUniversePresence) {
    globalThis.__qrUniversePresence = new Map();
  }
  return globalThis.__qrUniversePresence;
}

function prune(now = Date.now()) {
  const map = table();
  for (const [id, seen] of map) {
    if (now - seen > TTL_MS) map.delete(id);
  }
}

export function heartbeat(visitorId: string): number {
  const now = Date.now();
  prune(now);
  if (visitorId) table().set(visitorId, now);
  return table().size;
}

export function onlineCount(): number {
  prune();
  return table().size;
}
