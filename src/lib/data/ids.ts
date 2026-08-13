export function generateId(prefix: string): string {
  const raw =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `${prefix}_${raw.replace(/-/g, "").slice(0, 20)}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function daysAgoIso(days: number, hour = 12, minute = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}
