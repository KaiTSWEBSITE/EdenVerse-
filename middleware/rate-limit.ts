type RateLimitOptions = {
  windowMs?: number;
  max?: number;
};

type RateLimitResult =
  | { success: true; remaining: number; retryAfter?: never }
  | { success: false; remaining: 0; retryAfter: number };

const store = new Map<string, { count: number; resetAt: number }>();

// Periodically clean up expired entries to prevent memory leaks
let lastCleanup = Date.now();
const CLEANUP_INTERVAL = 5 * 60_000; // every 5 minutes

function maybePurgeExpired(now: number) {
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

export function applyRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 30;
  const now = Date.now();

  maybePurgeExpired(now);

  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }

  if (current.count >= max) {
    return {
      success: false,
      remaining: 0,
      retryAfter: Math.ceil((current.resetAt - now) / 1000)
    };
  }

  current.count += 1;
  store.set(key, current);
  return { success: true, remaining: max - current.count };
}
