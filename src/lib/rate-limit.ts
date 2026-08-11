type RateLimitEntry = {
  count: number;
  resetTime: number;
};

const rateLimitMap = new Map<string, RateLimitEntry>();

if (typeof globalThis !== "undefined") {
  const g = globalThis as unknown as { rateLimitCleanupTimer?: NodeJS.Timeout };
  if (!g.rateLimitCleanupTimer) {
    g.rateLimitCleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of rateLimitMap.entries()) {
        if (now > entry.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }, 30000);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const res = checkRateLimit(key, limit, windowMs);
  return res.success;
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    const resetTime = now + windowMs;
    rateLimitMap.set(key, { count: 1, resetTime });
    return { success: true, limit, remaining: limit - 1, reset: resetTime };
  }

  if (entry.count >= limit) {
    return { success: false, limit, remaining: 0, reset: entry.resetTime };
  }

  entry.count++;
  return { success: true, limit, remaining: limit - entry.count, reset: entry.resetTime };
}
