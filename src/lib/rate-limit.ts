type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Process-local rate limit. On serverless this is best-effort (per isolate),
 * but it still slows credential stuffing and signup spam.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export const RATE = {
  signup: { limit: 8, windowMs: 60 * 60 * 1000 },
  login: { limit: 12, windowMs: 15 * 60 * 1000 },
  forgot: { limit: 6, windowMs: 60 * 60 * 1000 },
  // Typing a code is where typos happen; guesses are capped per code as well.
  resetCode: { limit: 20, windowMs: 60 * 60 * 1000 },
  verify: { limit: 10, windowMs: 60 * 60 * 1000 },
} as const;
