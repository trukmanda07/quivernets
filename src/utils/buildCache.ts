/**
 * Build-Time Cache for Astro Static Site Generation
 *
 * Caches expensive operations (like getCollection()) during build to improve performance.
 * Uses disk-based persistence to work across Astro's parallel build processes.
 *
 * Key Features:
 * - Disk-based persistence (survives across page builds)
 * - Content hash validation (invalidates when files change)
 * - Environment-aware (dev vs production behavior)
 * - Statistics tracking (hit rate, performance metrics)
 * - Atomic writes (prevents corruption)
 *
 * Usage:
 *   import { getCachedBlogPosts } from '@/utils/buildCache';
 *   const posts = await getCachedBlogPosts('en');
 */

import { statSync, existsSync, readFileSync, writeFileSync, mkdirSync, unlinkSync, renameSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Cache entry with content validation
 */
interface CacheEntry<T> {
  value: T;
  timestamp: number;
  contentHash: string; // Hash of content directory for invalidation
}

/**
 * Cache statistics
 */
interface CacheStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
  invalidations: number;
}

/**
 * Serialized cache data structure
 */
interface CacheData {
  entries: Record<string, CacheEntry<unknown>>;
  stats: {
    hits: number;
    misses: number;
    invalidations: number;
  };
  lastUpdated: number;
}

/**
 * Build cache implementation with disk-based persistence
 */
class BuildCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map();
  private hits: number = 0;
  private misses: number = 0;
  private invalidations: number = 0;
  private isDevelopment: boolean;
  private cacheDir: string;
  private cacheFile: string;
  private statsFile: string;

  constructor() {
    this.isDevelopment = import.meta.env.DEV;
    this.cacheDir = join(process.cwd(), '.astro', 'cache');
    this.cacheFile = join(this.cacheDir, 'build-cache.json');
    this.statsFile = join(this.cacheDir, 'build-stats.json');

    // Ensure cache directory exists
    this.ensureCacheDir();

    // Load existing cache from disk
    this.loadFromDisk();

    if (this.isDevelopment) {
      console.log('[BuildCache] Disk-based cache initialized');
      console.log(`[BuildCache] Cache file: ${this.cacheFile}`);
      console.log(`[BuildCache] Loaded ${this.cache.size} entries from disk`);
    }
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }
    } catch (error) {
      console.warn('[BuildCache] Failed to create cache directory:', error);
    }
  }

  /**
   * Load cache from disk
   */
  private loadFromDisk(): void {
    try {
      if (existsSync(this.cacheFile)) {
        const data = readFileSync(this.cacheFile, 'utf-8');
        const cacheData: CacheData = JSON.parse(data);

        // Restore cache entries
        this.cache = new Map(Object.entries(cacheData.entries));

        // Restore stats
        this.hits = cacheData.stats.hits || 0;
        this.misses = cacheData.stats.misses || 0;
        this.invalidations = cacheData.stats.invalidations || 0;
      }
    } catch (error) {
      // Cache file corrupted or doesn't exist - start fresh
      if (this.isDevelopment) {
        console.warn('[BuildCache] Failed to load cache from disk, starting fresh:', error);
      }
      this.cache.clear();
    }
  }

  /**
   * Save cache to disk
   */
  private saveToDisk(): void {
    try {
      const cacheData: CacheData = {
        entries: Object.fromEntries(this.cache.entries()),
        stats: {
          hits: this.hits,
          misses: this.misses,
          invalidations: this.invalidations,
        },
        lastUpdated: Date.now(),
      };

      // Atomic write: write to temp file, then rename
      const tempFile = this.cacheFile + '.tmp';
      writeFileSync(tempFile, JSON.stringify(cacheData, null, 2), 'utf-8');

      // Rename is atomic on most filesystems
      if (existsSync(this.cacheFile)) {
        // Backup old cache
        const backupFile = this.cacheFile + '.bak';
        if (existsSync(backupFile)) {
          // Remove old backup
          try {
            unlinkSync(backupFile);
          } catch {}
        }
        renameSync(this.cacheFile, backupFile);
      }

      renameSync(tempFile, this.cacheFile);
    } catch (error) {
      console.warn('[BuildCache] Failed to save cache to disk:', error);
    }
  }

  /**
   * Get value from cache or compute it.
   * Validates content freshness before returning cached value.
   * Saves to disk after computing new values.
   *
   * @param key - Unique cache key
   * @param factory - Function to compute value if not cached or stale
   * @returns Cached or freshly computed value
   */
  async getOrSet<T>(key: string, factory: () => Promise<T>): Promise<T> {
    const contentHash = this.getContentHash(key);

    if (this.cache.has(key)) {
      const entry = this.cache.get(key) as CacheEntry<T>;

      // Validate cache is still fresh
      if (entry.contentHash === contentHash) {
        this.hits++;

        if (this.isDevelopment) {
          const age = Date.now() - entry.timestamp;
          console.log(`[BuildCache] HIT: ${key} (age: ${age}ms, hash: ${contentHash.slice(0, 8)})`);
        }

        // Update stats on disk periodically (every 10 hits)
        if (this.hits % 10 === 0) {
          this.saveToDisk();
        }

        return entry.value as T;
      } else {
        // Content changed - invalidate cache
        this.invalidations++;
        this.cache.delete(key);

        if (this.isDevelopment) {
          console.log(`[BuildCache] STALE: ${key} - content changed (${entry.contentHash.slice(0, 8)} → ${contentHash.slice(0, 8)})`);
        }
      }
    }

    // Cache miss - compute value
    this.misses++;

    if (this.isDevelopment) {
      console.log(`[BuildCache] MISS: ${key} - computing...`);
    }

    const startTime = Date.now();
    const value = await factory();
    const duration = Date.now() - startTime;

    // Store in cache with content hash
    this.cache.set(key, {
      value: value as unknown,
      timestamp: Date.now(),
      contentHash,
    });

    // Save to disk immediately after computing new value
    this.saveToDisk();

    if (this.isDevelopment) {
      console.log(`[BuildCache] STORED: ${key} (computed in ${duration}ms, saved to disk)`);
    }

    return value;
  }

  /**
   * Get content hash for cache key to detect changes.
   * Uses directory modification time as a simple hash.
   *
   * @param key - Cache key (typically collection name)
   * @returns Content hash string
   */
  private getContentHash(key: string): string {
    // For collection cache keys like 'blog-en', check content directory
    if (key.startsWith('blog-') || key.startsWith('presentations-')) {
      const collectionName = key;
      const contentPath = join(process.cwd(), 'src/content', collectionName);

      try {
        const stats = statSync(contentPath);
        // Use modification time + size as simple hash
        return `${stats.mtimeMs}-${stats.size}`;
      } catch (error) {
        // Directory doesn't exist - return unique hash to prevent caching
        return `no-dir-${Date.now()}`;
      }
    }

    // For other keys, use timestamp (always fresh)
    return Date.now().toString();
  }

  /**
   * Manually invalidate specific cache entry
   */
  invalidate(key: string): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
      this.invalidations++;
      this.saveToDisk(); // Persist invalidation

      if (this.isDevelopment) {
        console.log(`[BuildCache] INVALIDATED: ${key}`);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
    this.invalidations = 0;
    this.saveToDisk(); // Persist clear

    if (this.isDevelopment) {
      console.log(`[BuildCache] CLEARED: ${size} entries removed`);
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      size: this.cache.size,
      hits: this.hits,
      misses: this.misses,
      hitRate: total > 0 ? this.hits / total : 0,
      invalidations: this.invalidations,
    };
  }

  /**
   * Print cache statistics (useful at end of build)
   */
  printStats(): void {
    const stats = this.getStats();
    const total = stats.hits + stats.misses;

    console.log('\n' + '='.repeat(60));
    console.log('[BuildCache] Statistics');
    console.log('='.repeat(60));
    console.log(`  Entries:       ${stats.size}`);
    console.log(`  Hits:          ${stats.hits}`);
    console.log(`  Misses:        ${stats.misses}`);
    console.log(`  Total:         ${total}`);
    console.log(`  Hit Rate:      ${(stats.hitRate * 100).toFixed(1)}%`);
    console.log(`  Invalidations: ${stats.invalidations}`);
    console.log('='.repeat(60) + '\n');
  }
}

// Singleton instance - shared across all imports during build
export const buildCache = new BuildCache();

// Print stats at end of build (if in development)
if (import.meta.env.DEV && typeof process !== 'undefined') {
  process.on('beforeExit', () => {
    buildCache.printStats();
  });
}

/**
 * Helper: Get cached blog posts for a language
 *
 * @param lang - Language code ('en' or 'id')
 * @returns Array of blog post entries
 */
export async function getCachedBlogPosts(lang: 'en' | 'id') {
  const { getCollection } = await import('astro:content');
  const collectionName = `blog-${lang}` as 'blog-en' | 'blog-id';

  return buildCache.getOrSet(collectionName, async () => {
    try {
      const posts = await getCollection(collectionName);
      return posts;
    } catch (error) {
      console.warn(`[BuildCache] Failed to load collection ${collectionName}:`, error);
      return [];
    }
  });
}

/**
 * Helper: Get cached presentations
 *
 * @returns Array of all presentations
 */
export async function getCachedPresentations() {
  const { getAllPresentations } = await import('./loadPresentation');

  return buildCache.getOrSet('all-presentations', async () => {
    return getAllPresentations();
  });
}
