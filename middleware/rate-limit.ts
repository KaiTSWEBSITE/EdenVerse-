type RateLimitOptions = {
  windowMs?: number;
  max?: number;
};

const store = new Map<string, { count: number; resetAt: number }>();

export function applyRateLimit(key: string, options: RateLimitOptions = {}) {
  const windowMs = options.windowMs ?? 60_000;
  const max = options.max ?? 30;
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: max - 1 };
  }

  if (current.count >= max) {
    return { success: false, remaining: 0, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  store.set(key, current);
  return { success: true, remaining: max - current.count };
}
