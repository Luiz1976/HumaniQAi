const cacheStore = new Map<string, { value: any; expiresAt: number }>();

export function cacheGet<T = any>(key: string): T | null {
  const item = cacheStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    cacheStore.delete(key);
    return null;
  }
  return item.value as T;
}

export function cacheSet(key: string, value: any, ttlSeconds = 60): void {
  const expiresAt = Date.now() + ttlSeconds * 1000;
  cacheStore.set(key, { value, expiresAt });
}

export function cacheMiddleware(ttlSeconds = 30) {
  return (req: any, res: any, next: any) => {
    // Aplicar cache apenas para GET
    if (req.method !== 'GET') {
      return next();
    }
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cacheGet(key);
    if (cached) {
      return res.json(cached);
    }
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      cacheSet(key, body, ttlSeconds);
      return originalJson(body);
    };
    next();
  };
}