/**
 * Простой in-memory кэш с TTL.
 * Данные живут пока открыта вкладка — позволяет показывать
 * страницы мгновенно при повторном посещении.
 */

interface Entry { data: any; ts: number }

const store = new Map<string, Entry>();

export function cacheGet<T>(key: string, ttlMs = 60_000): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) { store.delete(key); return null; }
  return entry.data as T;
}

export function cacheSet(key: string, data: any): void {
  store.set(key, { data, ts: Date.now() });
}

export function cacheInvalidate(key: string): void {
  store.delete(key);
}
