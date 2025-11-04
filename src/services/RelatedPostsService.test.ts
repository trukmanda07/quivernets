/**
 * Tests for RelatedPostsService
 *
 * Tests the recommendation scoring algorithm with various scenarios.
 */

import { describe, it, expect } from 'vitest';
import { RelatedPostsService } from './RelatedPostsService';
import { BlogPost } from '../domain/blog/BlogPost';
import type { CollectionEntry } from 'astro:content';

// Helper to create mock blog post entries
function createMockEntry(overrides: any = {}): CollectionEntry<'blog-en'> {
	const baseData = {
		title: 'Test Post',
		description: 'Test description',
		pubDate: new Date('2024-01-01'),
		author: 'Test Author',
		tags: [],
		difficulty: 'beginner' as const,
		category: 'test',
		draft: false,
	};

	// Use provided id for slug if slug not explicitly provided
	const idValue = overrides.id || 'test-post.md';
	const slugValue = overrides.slug || (typeof idValue === 'string' ? idValue.replace('.md', '') : 'test-post');

	// Merge data carefully to ensure required fields are never undefined
	const mergedData: any = { ...baseData };
	if (overrides.data) {
		Object.keys(overrides.data).forEach(key => {
			if (overrides.data[key] !== undefined) {
				mergedData[key] = overrides.data[key];
			}
		});
	}

	// Extract non-data overrides
	const { data: _, id: __, slug: ___, ...otherOverrides } = overrides;

	return {
		id: idValue,
		slug: slugValue,
		body: 'Test body',
		collection: 'blog-en',
		data: mergedData,
		...otherOverrides,
	} as CollectionEntry<'blog-en'>;
}

// Helper to create BlogPost domain models
function createMockPost(overrides: any = {}): BlogPost {
	return new BlogPost(createMockEntry(overrides));
}

describe('RelatedPostsService', () => {
	describe('findRelated', () => {
		it('should return empty array when no other posts', () => {
			const currentPost = createMockPost({ id: 'post1' });
			const allPosts = [currentPost];

			const related = RelatedPostsService.findRelated(currentPost, allPosts);

			expect(related).toEqual([]);
		});

		it('should exclude the current post from results', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml'], category: 'ml' },
			});
			const otherPost = createMockPost({
				id: 'post2',
				data: { tags: ['python', 'ml'], category: 'ml' },
			});

			const allPosts = [currentPost, otherPost];

			const related = RelatedPostsService.findRelated(currentPost, allPosts);

			expect(related).toHaveLength(1);
			expect(related[0].slug).toBe('post2');
		});

		it('should score based on shared tags', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml'], title: 'Current', difficulty: 'beginner', category: 'test' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python', 'ml'], title: 'Two shared tags', difficulty: 'beginner', category: 'test' },
				}),
				createMockPost({
					id: 'post3',
					data: { tags: ['python'], title: 'One shared tag', difficulty: 'beginner', category: 'test' },
				}),
				createMockPost({
					id: 'post4',
					data: { tags: ['javascript'], title: 'No shared tags', difficulty: 'advanced', category: 'web' },
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				maxResults: 10,
			});

			// Should return posts with shared tags, sorted by number of tags
			expect(related).toHaveLength(2);
			expect(related[0].slug).toBe('post2'); // 2 shared tags
			expect(related[1].slug).toBe('post3'); // 1 shared tag
			// post4 has no shared tags and different difficulty, so not included (score 0)
		});

		it('should score based on same category', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { category: 'ml', tags: [], difficulty: 'beginner' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { category: 'ml', tags: [], difficulty: 'beginner' },
				}),
				createMockPost({
					id: 'post3',
					data: { category: 'web', tags: [], difficulty: 'advanced' },
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				maxResults: 10,
			});

			expect(related).toHaveLength(1);
			expect(related[0].slug).toBe('post2'); // Same category
		});

		it('should score based on same difficulty', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { difficulty: 'advanced', tags: [], category: 'ml' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { difficulty: 'advanced', tags: [], category: 'ml' },
				}),
				createMockPost({
					id: 'post3',
					data: { difficulty: 'beginner', tags: [], category: 'ml' },
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				maxResults: 10,
			});

			// Both posts have same category (+2), but post2 also has same difficulty (+1)
			expect(related[0].slug).toBe('post2'); // Higher score
		});

		it('should combine multiple scoring factors', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: {
					tags: ['python', 'ml'],
					category: 'ml',
					difficulty: 'intermediate',
				},
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: {
						tags: ['python', 'ml'],
						category: 'ml',
						difficulty: 'intermediate',
						title: 'Perfect match',
					},
				}),
				createMockPost({
					id: 'post3',
					data: {
						tags: ['python'],
						category: 'ml',
						difficulty: 'beginner',
						title: 'Partial match',
					},
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts);

			// post2: 2 shared tags (6) + same category (2) + same difficulty (1) = 9
			// post3: 1 shared tag (3) + same category (2) = 5
			expect(related[0].slug).toBe('post2'); // Higher total score
		});

		it('should respect maxResults option', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python'] },
			});

			const posts = [
				currentPost,
				createMockPost({ id: 'post2', data: { tags: ['python'] } }),
				createMockPost({ id: 'post3', data: { tags: ['python'] } }),
				createMockPost({ id: 'post4', data: { tags: ['python'] } }),
				createMockPost({ id: 'post5', data: { tags: ['python'] } }),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				maxResults: 2,
			});

			expect(related).toHaveLength(2);
		});

		it('should respect minScore option', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml'], category: 'ml' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python', 'ml'], category: 'ml' }, // Score: 8
				}),
				createMockPost({
					id: 'post3',
					data: { tags: ['python'], category: 'web' }, // Score: 3
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				minScore: 5, // Only posts with score >= 5
			});

			expect(related).toHaveLength(1);
			expect(related[0].slug).toBe('post2');
		});

		it('should allow custom weights', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python'], category: 'ml' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python'], category: 'web' }, // 1 tag
				}),
				createMockPost({
					id: 'post3',
					data: { tags: [], category: 'ml' }, // same category
				}),
			];

			// With default weights: sharedTag=3, sameCategory=2
			// post2: 3, post3: 2 → post2 wins

			// With custom weights: sharedTag=1, sameCategory=5
			// post2: 1, post3: 5 → post3 wins
			const related = RelatedPostsService.findRelated(currentPost, posts, {
				weights: { sharedTag: 1, sameCategory: 5 },
			});

			expect(related[0].slug).toBe('post3'); // Category now more important
		});

		it('should return posts sorted by score descending', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml', 'ai'], category: 'ml' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python'], category: 'web' }, // Score: 3
				}),
				createMockPost({
					id: 'post3',
					data: { tags: ['python', 'ml', 'ai'], category: 'ml' }, // Score: 11
				}),
				createMockPost({
					id: 'post4',
					data: { tags: ['python', 'ml'], category: 'ml' }, // Score: 8
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts, {
				maxResults: 10,
			});

			expect(related[0].slug).toBe('post3'); // Highest score
			expect(related[1].slug).toBe('post4'); // Second highest
			expect(related[2].slug).toBe('post2'); // Lowest score
		});
	});

	describe('findRelatedWithScores', () => {
		it('should return scored posts with reasons', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml'], category: 'ml', difficulty: 'intermediate' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python', 'ml'], category: 'ml', difficulty: 'intermediate' },
				}),
			];

			const scored = RelatedPostsService.findRelatedWithScores(currentPost, posts);

			expect(scored).toHaveLength(1);
			expect(scored[0].score).toBeGreaterThan(0);
			expect(scored[0].reasons).toBeInstanceOf(Array);
			expect(scored[0].reasons.length).toBeGreaterThan(0);
			expect(scored[0].reasons[0]).toContain('shared tag');
		});
	});

	describe('explainRelation', () => {
		it('should explain why posts are related', () => {
			const post1 = createMockPost({
				id: 'post1',
				data: { tags: ['python', 'ml'], category: 'ml' },
			});
			const post2 = createMockPost({
				id: 'post2',
				data: { tags: ['python', 'ml'], category: 'ml' },
			});

			const explanation = RelatedPostsService.explainRelation(post1, post2);

			expect(explanation).toContain('Score:');
			expect(explanation).toContain('Reasons:');
			expect(explanation).toContain('shared tag');
			expect(explanation).toContain('Same category');
		});

		it('should indicate when posts are not related', () => {
			const post1 = createMockPost({
				id: 'post1',
				data: { tags: ['python'], category: 'ml', difficulty: 'beginner' },
			});
			const post2 = createMockPost({
				id: 'post2',
				data: { tags: ['javascript'], category: 'web', difficulty: 'advanced' },
			});

			const explanation = RelatedPostsService.explainRelation(post1, post2);

			expect(explanation).toContain('No relation');
			expect(explanation).toContain('score: 0');
		});
	});

	describe('getDefaultWeights', () => {
		it('should return default weights', () => {
			const weights = RelatedPostsService.getDefaultWeights();

			expect(weights).toHaveProperty('sharedTag');
			expect(weights).toHaveProperty('sameCategory');
			expect(weights).toHaveProperty('sameDifficulty');
			expect(weights.sharedTag).toBe(3);
			expect(weights.sameCategory).toBe(2);
			expect(weights.sameDifficulty).toBe(1);
		});
	});

	describe('edge cases', () => {
		it('should handle posts with no tags', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: [], category: 'ml' },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: [], category: 'ml' },
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts);

			expect(related).toHaveLength(1);
			expect(related[0].slug).toBe('post2');
		});

		it('should handle posts with no category', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python'], category: undefined },
			});

			const posts = [
				currentPost,
				createMockPost({
					id: 'post2',
					data: { tags: ['python'], category: undefined },
				}),
			];

			const related = RelatedPostsService.findRelated(currentPost, posts);

			expect(related).toHaveLength(1);
		});

		it('should handle empty allPosts array', () => {
			const currentPost = createMockPost({ id: 'post1' });
			const allPosts: BlogPost[] = [];

			const related = RelatedPostsService.findRelated(currentPost, allPosts);

			expect(related).toEqual([]);
		});

		it('should handle when current post is not in allPosts', () => {
			const currentPost = createMockPost({
				id: 'post1',
				data: { tags: ['python'] },
			});
			const allPosts = [
				createMockPost({ id: 'post2', data: { tags: ['python'] } }),
				createMockPost({ id: 'post3', data: { tags: ['python'] } }),
			];

			const related = RelatedPostsService.findRelated(currentPost, allPosts);

			// Should still find related posts
			expect(related).toHaveLength(2);
		});
	});
});
