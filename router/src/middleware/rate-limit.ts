import type { Context, Next } from 'hono';

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

const store = new Map<string, RateLimitEntry>();

export function rateLimit(config?: Partial<RateLimitConfig>) {
  const windowMs = config?.windowMs ?? 60_000;
  const maxRequests = config?.maxRequests ?? 100;

  // Cleanup stale entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now - entry.windowStart > windowMs * 2) store.delete(key);
    }
  }, 300_000).unref();

  return async (c: Context, next: Next) => {
    const key = c.req.header('X-API-Key') ?? c.req.header('x-forwarded-for') ?? 'anonymous';
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 0, windowStart: now };
      store.set(key, entry);
    }

    entry.count++;

    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    c.header('X-RateLimit-Reset', String(Math.ceil((entry.windowStart + windowMs) / 1000)));

    if (entry.count > maxRequests) {
      return c.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMITED',
            message: `Rate limit exceeded. Max ${maxRequests} requests per ${windowMs / 1000}s window.`,
          },
        },
        429
      );
    }

    await next();
  };
}
