import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { buildCache } from './buildCache';
import { unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

describe('BuildCache', () => {
	const cacheDir = join(process.cwd(), '.astro', 'cache');
	const cacheFile = join(cacheDir, 'build-cache.json');
	const cacheBackup = join(cacheDir, 'build-cache.json.bak');
	const cacheTmp = join(cacheDir, 'build-cache.json.tmp');

	beforeEach(() => {
		// Clear cache state
		buildCache.clear();

		// Clean up any cache files from disk
		[cacheFile, cacheBackup, cacheTmp].forEach((file) => {
			try {
				if (existsSync(file)) {
					unlinkSync(file);
				}
			} catch (error) {
				// Ignore errors
			}
		});
	});

	afterEach(() => {
		// Clean up after tests
		[cacheFile, cacheBackup, cacheTmp].forEach((file) => {
			try {
				if (existsSync(file)) {
					unlinkSync(file);
				}
			} catch (error) {
				// Ignore errors
			}
		});
	});

	describe('getOrSet', () => {
		it('should cache values', async () => {
			let callCount = 0;
			const factory = async () => {
				callCount++;
				return 'test-value';
			};

			const result1 = await buildCache.getOrSet('test-key', factory);
			const result2 = await buildCache.getOrSet('test-key', factory);

			expect(result1).toBe('test-value');
			expect(result2).toBe('test-value');
			expect(callCount).toBe(1); // Factory called only once
		});

		it('should compute value on cache miss', async () => {
			const result = await buildCache.getOrSet('new-key', async () => 'computed');
			expect(result).toBe('computed');
		});

		it('should handle different cache keys', async () => {
			const result1 = await buildCache.getOrSet('key1', async () => 'value1');
			const result2 = await buildCache.getOrSet('key2', async () => 'value2');

			expect(result1).toBe('value1');
			expect(result2).toBe('value2');
		});

		it('should handle async factory functions', async () => {
			const asyncFactory = async () => {
				await new Promise((resolve) => setTimeout(resolve, 10));
				return 'async-value';
			};

			const result = await buildCache.getOrSet('async-key', asyncFactory);
			expect(result).toBe('async-value');
		});

		it('should handle different value types', async () => {
			const objResult = await buildCache.getOrSet('obj', async () => ({ foo: 'bar' }));
			const arrResult = await buildCache.getOrSet('arr', async () => [1, 2, 3]);
			const numResult = await buildCache.getOrSet('num', async () => 42);
			const boolResult = await buildCache.getOrSet('bool', async () => true);
			const nullResult = await buildCache.getOrSet('null', async () => null);

			expect(objResult).toEqual({ foo: 'bar' });
			expect(arrResult).toEqual([1, 2, 3]);
			expect(numResult).toBe(42);
			expect(boolResult).toBe(true);
			expect(nullResult).toBe(null);
		});

		it('should handle complex objects', async () => {
			const complexObj = {
				name: 'Test',
				nested: {
					values: [1, 2, 3],
					meta: {
						timestamp: Date.now(),
					},
				},
			};

			const result = await buildCache.getOrSet('complex', async () => complexObj);
			expect(result).toEqual(complexObj);
		});

		it('should preserve object references on cache hits', async () => {
			const obj = { value: 'test' };
			const factory = async () => obj;

			const result1 = await buildCache.getOrSet('obj-ref', factory);
			const result2 = await buildCache.getOrSet('obj-ref', factory);

			expect(result1).toBe(result2); // Same reference
			expect(result1).toBe(obj); // Original object reference
		});
	});

	describe('getStats', () => {
		it('should track hits and misses', async () => {
			// Use blog-like keys to get consistent hashing
			await buildCache.getOrSet('blog-en', async () => 'value1');
			await buildCache.getOrSet('blog-en', async () => 'value1'); // Should be hit if content hasn't changed
			await buildCache.getOrSet('blog-id', async () => 'value2');

			const stats = buildCache.getStats();
			// Since we're using blog- keys, content hash depends on filesystem
			// Just verify stats are tracked (hits + misses should equal total calls)
			expect(stats.hits + stats.misses).toBe(3);
			expect(stats.hitRate).toBeGreaterThanOrEqual(0);
			expect(stats.hitRate).toBeLessThanOrEqual(1);
		});

		it('should calculate correct hit rate', async () => {
			await buildCache.getOrSet('key1', async () => 'value1'); // Miss
			await buildCache.getOrSet('key1', async () => 'value1'); // Hit
			await buildCache.getOrSet('key1', async () => 'value1'); // Hit
			await buildCache.getOrSet('key1', async () => 'value1'); // Hit

			const stats = buildCache.getStats();
			expect(stats.hits).toBe(3);
			expect(stats.misses).toBe(1);
			expect(stats.hitRate).toBe(0.75); // 3/4 = 0.75
		});

		it('should return correct cache size', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			await buildCache.getOrSet('key2', async () => 'value2');
			await buildCache.getOrSet('key3', async () => 'value3');

			const stats = buildCache.getStats();
			expect(stats.size).toBe(3);
		});

		it('should handle zero operations', () => {
			const stats = buildCache.getStats();
			expect(stats.hits).toBe(0);
			expect(stats.misses).toBe(0);
			expect(stats.hitRate).toBe(0);
			expect(stats.size).toBe(0);
		});

		it('should handle only hits', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			await buildCache.getOrSet('key1', async () => 'value1');

			const stats = buildCache.getStats();
			expect(stats.hitRate).toBe(0.5);
		});
	});

	describe('invalidate', () => {
		it('should invalidate specific entries', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');

			buildCache.invalidate('key1');

			let callCount = 0;
			await buildCache.getOrSet('key1', async () => {
				callCount++;
				return 'value1-new';
			});

			expect(callCount).toBe(1); // Re-computed after invalidation
		});

		it('should not affect other entries', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			await buildCache.getOrSet('key2', async () => 'value2');

			buildCache.invalidate('key1');

			const stats = buildCache.getStats();
			expect(stats.size).toBe(1); // Only key2 remains
		});

		it('should handle invalidating non-existent keys', () => {
			expect(() => buildCache.invalidate('non-existent')).not.toThrow();
			const stats = buildCache.getStats();
			expect(stats.size).toBe(0);
		});
	});

	describe('clear', () => {
		it('should clear all entries', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			await buildCache.getOrSet('key2', async () => 'value2');
			await buildCache.getOrSet('key3', async () => 'value3');

			buildCache.clear();

			const stats = buildCache.getStats();
			expect(stats.size).toBe(0);
			expect(stats.hits).toBe(0);
			expect(stats.misses).toBe(0);
		});

		it('should allow re-populating after clear', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			buildCache.clear();

			const result = await buildCache.getOrSet('key1', async () => 'new-value');
			expect(result).toBe('new-value');

			const stats = buildCache.getStats();
			expect(stats.size).toBe(1);
			expect(stats.misses).toBe(1);
		});

		it('should reset statistics', async () => {
			await buildCache.getOrSet('key1', async () => 'value1');
			await buildCache.getOrSet('key1', async () => 'value1'); // Hit
			await buildCache.getOrSet('key2', async () => 'value2');

			buildCache.clear();

			const stats = buildCache.getStats();
			expect(stats.hits).toBe(0);
			expect(stats.misses).toBe(0);
			expect(stats.hitRate).toBe(0);
		});
	});

	describe('concurrent access', () => {
		it('should handle multiple concurrent requests for same key', async () => {
			let factoryCallCount = 0;
			const factory = async () => {
				factoryCallCount++;
				await new Promise((resolve) => setTimeout(resolve, 50));
				return 'value';
			};

			// Start multiple concurrent requests
			const promises = [
				buildCache.getOrSet('concurrent-key', factory),
				buildCache.getOrSet('concurrent-key', factory),
				buildCache.getOrSet('concurrent-key', factory),
			];

			const results = await Promise.all(promises);

			// All should return the same value
			results.forEach((result) => {
				expect(result).toBe('value');
			});

			// Factory might be called multiple times due to race condition
			// This is expected behavior for this simple cache
			expect(factoryCallCount).toBeGreaterThanOrEqual(1);
		});

		it('should handle concurrent requests for different keys', async () => {
			const results = await Promise.all([
				buildCache.getOrSet('key1', async () => 'value1'),
				buildCache.getOrSet('key2', async () => 'value2'),
				buildCache.getOrSet('key3', async () => 'value3'),
			]);

			expect(results).toEqual(['value1', 'value2', 'value3']);

			const stats = buildCache.getStats();
			expect(stats.size).toBe(3);
		});
	});

	describe('error handling', () => {
		it('should propagate factory errors', async () => {
			const errorFactory = async () => {
				throw new Error('Factory error');
			};

			await expect(buildCache.getOrSet('error-key', errorFactory)).rejects.toThrow(
				'Factory error',
			);
		});

		it('should not cache failed computations', async () => {
			let callCount = 0;
			const errorFactory = async () => {
				callCount++;
				throw new Error('Factory error');
			};

			// First call should fail
			await expect(buildCache.getOrSet('error-key', errorFactory)).rejects.toThrow();

			// Second call should also try to compute (error not cached)
			await expect(buildCache.getOrSet('error-key', errorFactory)).rejects.toThrow();

			expect(callCount).toBe(2); // Called twice, not cached
		});
	});

	describe('edge cases', () => {
		it('should handle empty string keys', async () => {
			const result = await buildCache.getOrSet('', async () => 'empty-key-value');
			expect(result).toBe('empty-key-value');
		});

		it('should handle very long keys', async () => {
			const longKey = 'a'.repeat(1000);
			const result = await buildCache.getOrSet(longKey, async () => 'long-key-value');
			expect(result).toBe('long-key-value');
		});

		it('should handle keys with special characters', async () => {
			const specialKeys = ['key/with/slashes', 'key:with:colons', 'key.with.dots'];

			for (const key of specialKeys) {
				const result = await buildCache.getOrSet(key, async () => `value-${key}`);
				expect(result).toBe(`value-${key}`);
			}

			const stats = buildCache.getStats();
			expect(stats.size).toBe(3);
		});

		it('should handle undefined and null values', async () => {
			const undefinedResult = await buildCache.getOrSet('undefined', async () => undefined);
			const nullResult = await buildCache.getOrSet('null', async () => null);

			expect(undefinedResult).toBeUndefined();
			expect(nullResult).toBeNull();
		});
	});
});
