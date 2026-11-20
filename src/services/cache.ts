/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// MOCKED — in-memory TTL cache (Redis replaced for AI Studio ephemeral runtime)
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();

  public async get<T>(key: string): Promise<T | null> {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  public async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public async clear(): Promise<void> {
    this.memoryCache.clear();
  }
}

export const cacheManager = new CacheManager();
