/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import Redis from 'ioredis';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class CacheManager {
  private redis: Redis | null = null;
  private memoryCache = new Map<string, CacheEntry<any>>();

  constructor() {
    if (process.env.REDIS_URL) {
      try {
        this.redis = new Redis(process.env.REDIS_URL, {
          lazyConnect: true,
          maxRetriesPerRequest: 2,
        });
        this.redis.connect().catch(() => {
          console.warn('[Cache] Could not connect to Redis, using in-memory TTL cache.');
          this.redis = null;
        });
      } catch (e) {
        this.redis = null;
      }
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    if (this.redis) {
      try {
        const val = await this.redis.get(key);
        if (val) return JSON.parse(val) as T;
      } catch (err) {
        // Fallback to memory
      }
    }

    const entry = this.memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }
    return entry.data as T;
  }

  public async set<T>(key: string, data: T, ttlMs: number): Promise<void> {
    if (this.redis) {
      try {
        const ttlSec = Math.max(1, Math.floor(ttlMs / 1000));
        await this.redis.set(key, JSON.stringify(data), 'EX', ttlSec);
        return;
      } catch (err) {
        // Fallback to memory
      }
    }

    this.memoryCache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  public async clear(): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.flushdb();
      } catch (e) {}
    }
    this.memoryCache.clear();
  }
}

export const cacheManager = new CacheManager();
