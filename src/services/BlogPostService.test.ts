/**
 * Tests for BlogPostService
 *
 * These tests use module mocking (vi.mock) to isolate the service from
 * the data layer (getCachedBlogPosts).
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BlogPostService } from './BlogPostService';
import type { BlogPost } from './BlogPostService';

// Mock getCachedBlogPosts at module level
vi.mock('@/utils/buildCache', () => ({
	getCachedBlogPosts: vi.fn(),
}));

import { getCachedBlogPosts } from '@/utils/buildCache';

// Helper to create mock blog posts
function createMockPost(overrides: any = {}): BlogPost {
	const baseData = {
		title: 'Test Post',
		description: 'Test description',
		pubDate: new Date('2024-01-01'),
		author: 'Test Author',
		tags: ['test'],
		difficulty: 'beginner' as const,
		category: 'test-category',
		draft: false,
	};

	return {
		id: overrides.id || 'test-post',
		slug: overrides.slug || 'test-post',
		collection: 'blog-en',
		data: {
			...baseData,
			...overrides.data,
		},
		...overrides,
	} as BlogPost;
}

describe('BlogPostService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getAll', () => {
		it('should return all posts sorted by date (latest first)', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					slug: 'post1',
					data: { pubDate: new Date('2024-01-01'), title: 'Post 1' },
				}),
				createMockPost({
					id: 'post3',
					slug: 'post3',
					data: { pubDate: new Date('2024-03-01'), title: 'Post 3' },
				}),
				createMockPost({
					id: 'post2',
					slug: 'post2',
					data: { pubDate: new Date('2024-02-01'), title: 'Post 2' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getAll('en');

			expect(result).toHaveLength(3);
			expect(result[0].id).toBe('post3'); // Latest first
			expect(result[1].id).toBe('post2');
			expect(result[2].id).toBe('post1');
		});

		it('should return empty array when no posts', async () => {
			vi.mocked(getCachedBlogPosts).mockResolvedValue([]);

			const result = await BlogPostService.getAll('en');

			expect(result).toEqual([]);
		});
	});

	describe('getBySlug', () => {
		it('should return post with matching slug', async () => {
			const mockPosts = [
				createMockPost({ id: 'post1', slug: 'post1' }),
				createMockPost({ id: 'post2', slug: 'post2' }),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getBySlug('post2', 'en');

			expect(result).not.toBeNull();
			expect(result?.slug).toBe('post2');
		});

		it('should return null when slug not found', async () => {
			const mockPosts = [createMockPost({ id: 'post1', slug: 'post1' })];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getBySlug('nonexistent', 'en');

			expect(result).toBeNull();
		});
	});

	describe('find', () => {
		describe('category filter', () => {
			it('should filter by category', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { category: 'ml', title: 'ML Post', pubDate: new Date('2024-01-01') },
					}),
					createMockPost({
						id: 'post2',
						data: { category: 'web', title: 'Web Post', pubDate: new Date('2024-01-02') },
					}),
					createMockPost({
						id: 'post3',
						data: { category: 'ml', title: 'ML Post 2', pubDate: new Date('2024-01-03') },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', { category: 'ml' });

				expect(result).toHaveLength(2);
				expect(result[0].id).toBe('post3'); // Sorted by date, latest first
				expect(result[1].id).toBe('post1');
			});
		});

		describe('difficulty filter', () => {
			it('should filter by difficulty', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { difficulty: 'beginner', title: 'Beginner Post' },
					}),
					createMockPost({
						id: 'post2',
						data: { difficulty: 'advanced', title: 'Advanced Post' },
					}),
					createMockPost({
						id: 'post3',
						data: { difficulty: 'beginner', title: 'Beginner Post 2' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', { difficulty: 'beginner' });

				expect(result).toHaveLength(2);
				expect(result[0].data.difficulty).toBe('beginner');
				expect(result[1].data.difficulty).toBe('beginner');
			});
		});

		describe('tags filter', () => {
			it('should filter by tags (AND logic)', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { tags: ['python', 'ml', 'scikit-learn'], title: 'Post 1' },
					}),
					createMockPost({
						id: 'post2',
						data: { tags: ['python', 'web'], title: 'Post 2' },
					}),
					createMockPost({
						id: 'post3',
						data: { tags: ['python', 'ml'], title: 'Post 3' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', { tags: ['python', 'ml'] });

				expect(result).toHaveLength(2);
				expect(result[0].id).toBe('post1');
				expect(result[1].id).toBe('post3');
			});

			it('should normalize tag comparison', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { tags: ['Machine Learning', 'Python'], title: 'Post 1' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {
					tags: ['machine-learning', 'python'],
				});

				expect(result).toHaveLength(1);
				expect(result[0].id).toBe('post1');
			});

			it('should return empty array when no posts have all required tags', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { tags: ['python'], title: 'Post 1' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', { tags: ['python', 'ml', 'react'] });

				expect(result).toHaveLength(0);
			});
		});

		describe('excludeDrafts filter', () => {
			it('should exclude draft posts when excludeDrafts is true', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { draft: false, title: 'Published Post' },
					}),
					createMockPost({
						id: 'post2',
						data: { draft: true, title: 'Draft Post' },
					}),
					createMockPost({
						id: 'post3',
						data: { draft: false, title: 'Published Post 2' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', { excludeDrafts: true });

				expect(result).toHaveLength(2);
				expect(result[0].id).toBe('post1');
				expect(result[1].id).toBe('post3');
			});
		});

		describe('combined filters', () => {
			it('should apply multiple filters together', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: {
							category: 'ml',
							difficulty: 'beginner',
							tags: ['python', 'scikit-learn'],
							draft: false,
							title: 'ML Beginner Post',
						},
					}),
					createMockPost({
						id: 'post2',
						data: {
							category: 'ml',
							difficulty: 'advanced',
							tags: ['python', 'tensorflow'],
							draft: false,
							title: 'ML Advanced Post',
						},
					}),
					createMockPost({
						id: 'post3',
						data: {
							category: 'web',
							difficulty: 'beginner',
							tags: ['react', 'javascript'],
							draft: false,
							title: 'Web Beginner Post',
						},
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {
					category: 'ml',
					difficulty: 'beginner',
					excludeDrafts: true,
				});

				expect(result).toHaveLength(1);
				expect(result[0].id).toBe('post1');
			});
		});

		describe('sorting', () => {
			it('should sort by latest (default)', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { pubDate: new Date('2024-01-01'), title: 'Post 1' },
					}),
					createMockPost({
						id: 'post2',
						data: { pubDate: new Date('2024-03-01'), title: 'Post 2' },
					}),
					createMockPost({
						id: 'post3',
						data: { pubDate: new Date('2024-02-01'), title: 'Post 3' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {}, { sort: 'latest' });

				expect(result[0].id).toBe('post2');
				expect(result[1].id).toBe('post3');
				expect(result[2].id).toBe('post1');
			});

			it('should sort by oldest', async () => {
				const mockPosts = [
					createMockPost({
						id: 'post1',
						data: { pubDate: new Date('2024-01-01'), title: 'Post 1' },
					}),
					createMockPost({
						id: 'post2',
						data: { pubDate: new Date('2024-03-01'), title: 'Post 2' },
					}),
					createMockPost({
						id: 'post3',
						data: { pubDate: new Date('2024-02-01'), title: 'Post 3' },
					}),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {}, { sort: 'oldest' });

				expect(result[0].id).toBe('post1');
				expect(result[1].id).toBe('post3');
				expect(result[2].id).toBe('post2');
			});

			it('should sort by title ascending', async () => {
				const mockPosts = [
					createMockPost({ id: 'post1', data: { title: 'Zebra Post' } }),
					createMockPost({ id: 'post2', data: { title: 'Apple Post' } }),
					createMockPost({ id: 'post3', data: { title: 'Banana Post' } }),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {}, { sort: 'title-asc' });

				expect(result[0].data.title).toBe('Apple Post');
				expect(result[1].data.title).toBe('Banana Post');
				expect(result[2].data.title).toBe('Zebra Post');
			});

			it('should sort by title descending', async () => {
				const mockPosts = [
					createMockPost({ id: 'post1', data: { title: 'Zebra Post' } }),
					createMockPost({ id: 'post2', data: { title: 'Apple Post' } }),
					createMockPost({ id: 'post3', data: { title: 'Banana Post' } }),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {}, { sort: 'title-desc' });

				expect(result[0].data.title).toBe('Zebra Post');
				expect(result[1].data.title).toBe('Banana Post');
				expect(result[2].data.title).toBe('Apple Post');
			});
		});

		describe('limit option', () => {
			it('should limit the number of results', async () => {
				const mockPosts = [
					createMockPost({ id: 'post1' }),
					createMockPost({ id: 'post2' }),
					createMockPost({ id: 'post3' }),
					createMockPost({ id: 'post4' }),
					createMockPost({ id: 'post5' }),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result = await BlogPostService.find('en', {}, { limit: 3 });

				expect(result).toHaveLength(3);
			});

			it('should ignore limit if 0 or negative', async () => {
				const mockPosts = [
					createMockPost({ id: 'post1' }),
					createMockPost({ id: 'post2' }),
				];

				vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

				const result1 = await BlogPostService.find('en', {}, { limit: 0 });
				const result2 = await BlogPostService.find('en', {}, { limit: -1 });

				expect(result1).toHaveLength(2);
				expect(result2).toHaveLength(2);
			});
		});
	});

	describe('getRecent', () => {
		it('should return recent non-draft posts', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { pubDate: new Date('2024-01-01'), draft: false, title: 'Post 1' },
				}),
				createMockPost({
					id: 'post2',
					data: { pubDate: new Date('2024-03-01'), draft: true, title: 'Draft Post' },
				}),
				createMockPost({
					id: 'post3',
					data: { pubDate: new Date('2024-02-01'), draft: false, title: 'Post 3' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getRecent('en', 10);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('post3'); // Latest non-draft
			expect(result[1].id).toBe('post1');
		});

		it('should limit to specified count', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { pubDate: new Date('2024-01-01'), draft: false },
				}),
				createMockPost({
					id: 'post2',
					data: { pubDate: new Date('2024-02-01'), draft: false },
				}),
				createMockPost({
					id: 'post3',
					data: { pubDate: new Date('2024-03-01'), draft: false },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getRecent('en', 2);

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('post3');
			expect(result[1].id).toBe('post2');
		});
	});

	describe('search', () => {
		it('should search in title', async () => {
			const mockPosts = [
				createMockPost({ id: 'post1', data: { title: 'Introduction to Machine Learning' } }),
				createMockPost({ id: 'post2', data: { title: 'Web Development Basics' } }),
				createMockPost({ id: 'post3', data: { title: 'Advanced Machine Learning' } }),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.search('machine learning', 'en');

			expect(result).toHaveLength(2);
			expect(result[0].id).toBe('post1');
			expect(result[1].id).toBe('post3');
		});

		it('should search in description', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { title: 'Post 1', description: 'Learn about Python programming' },
				}),
				createMockPost({
					id: 'post2',
					data: { title: 'Post 2', description: 'JavaScript tutorial' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.search('python', 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});

		it('should search in tags', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { title: 'Post 1', tags: ['python', 'ml'] },
				}),
				createMockPost({
					id: 'post2',
					data: { title: 'Post 2', tags: ['javascript', 'react'] },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.search('python', 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});

		it('should be case-insensitive', async () => {
			const mockPosts = [
				createMockPost({ id: 'post1', data: { title: 'Machine Learning Basics' } }),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.search('MACHINE LEARNING', 'en');

			expect(result).toHaveLength(1);
		});

		it('should return all posts for empty query', async () => {
			const mockPosts = [createMockPost({ id: 'post1' }), createMockPost({ id: 'post2' })];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.search('', 'en');

			expect(result).toHaveLength(2);
		});
	});

	describe('getByCategory', () => {
		it('should return posts in category', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { category: 'ml', draft: false, title: 'ML Post' },
				}),
				createMockPost({
					id: 'post2',
					data: { category: 'web', draft: false, title: 'Web Post' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getByCategory('ml', 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});

		it('should exclude drafts', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { category: 'ml', draft: false, title: 'Published' },
				}),
				createMockPost({
					id: 'post2',
					data: { category: 'ml', draft: true, title: 'Draft' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getByCategory('ml', 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});
	});

	describe('getByDifficulty', () => {
		it('should return posts at difficulty level', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { difficulty: 'beginner', draft: false, title: 'Beginner' },
				}),
				createMockPost({
					id: 'post2',
					data: { difficulty: 'advanced', draft: false, title: 'Advanced' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getByDifficulty('beginner', 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});
	});

	describe('getByTags', () => {
		it('should return posts with all specified tags', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { tags: ['python', 'ml'], draft: false, title: 'Post 1' },
				}),
				createMockPost({
					id: 'post2',
					data: { tags: ['python'], draft: false, title: 'Post 2' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getByTags(['python', 'ml'], 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});

		it('should exclude drafts', async () => {
			const mockPosts = [
				createMockPost({
					id: 'post1',
					data: { tags: ['python'], draft: false, title: 'Published' },
				}),
				createMockPost({
					id: 'post2',
					data: { tags: ['python'], draft: true, title: 'Draft' },
				}),
			];

			vi.mocked(getCachedBlogPosts).mockResolvedValue(mockPosts as any);

			const result = await BlogPostService.getByTags(['python'], 'en');

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe('post1');
		});
	});
});
