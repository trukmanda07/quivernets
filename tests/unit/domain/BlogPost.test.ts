/**
 * Unit tests for BlogPost domain model
 */

import { describe, it, expect } from 'vitest';
import { BlogPost } from '../../../src/domain/blog/BlogPost';
import type { CollectionEntry } from 'astro:content';

// Helper to create a mock blog post entry
function createMockEntry(overrides: Partial<any> = {}): CollectionEntry<'blog-en'> {
	return {
		id: 'test-post.md',
		slug: 'test-post',
		body: 'Test content',
		collection: 'blog-en',
		data: {
			title: 'Test Post',
			description: 'Test description',
			pubDate: new Date('2024-01-01'),
			tags: ['javascript', 'testing'],
			category: 'programming',
			difficulty: 'beginner',
			draft: false,
			...overrides,
		},
	} as CollectionEntry<'blog-en'>;
}

describe('BlogPost Domain Model', () => {
	describe('Constructor and Validation', () => {
		it('should create a valid blog post', () => {
			const entry = createMockEntry();
			const post = new BlogPost(entry);

			expect(post).toBeDefined();
			expect(post.title).toBe('Test Post');
			expect(post.slug).toBe('test-post');
		});

		it('should throw error for null entry', () => {
			expect(() => new BlogPost(null as any)).toThrow('BlogPost entry cannot be null');
		});

		it('should throw error for missing title', () => {
			const entry = createMockEntry({ title: '' });
			expect(() => new BlogPost(entry)).toThrow('BlogPost must have a non-empty title');
		});

		it('should throw error for missing id', () => {
			const entry = createMockEntry();
			entry.id = '';
			expect(() => new BlogPost(entry)).toThrow('BlogPost must have a non-empty id');
		});

		it('should throw error for missing pubDate', () => {
			const entry = createMockEntry({ pubDate: undefined });
			expect(() => new BlogPost(entry)).toThrow('BlogPost must have a publication date');
		});
	});

	describe('Property Accessors', () => {
		it('should access basic properties', () => {
			const entry = createMockEntry();
			const post = new BlogPost(entry);

			expect(post.title).toBe('Test Post');
			expect(post.slug).toBe('test-post');
			expect(post.description).toBe('Test description');
			expect(post.category).toBe('programming');
			expect(post.difficulty).toBe('beginner');
		});

		it('should access tags', () => {
			const entry = createMockEntry();
			const post = new BlogPost(entry);

			expect(post.tags).toEqual(['javascript', 'testing']);
		});

		it('should normalize tags', () => {
			const entry = createMockEntry({ tags: ['JavaScript', 'Unit Testing'] });
			const post = new BlogPost(entry);

			expect(post.normalizedTags).toEqual(['javascript', 'unit-testing']);
		});

		it('should handle missing tags', () => {
			const entry = createMockEntry({ tags: undefined });
			const post = new BlogPost(entry);

			expect(post.tags).toEqual([]);
			expect(post.normalizedTags).toEqual([]);
		});

		it('should get language from collection', () => {
			const entry = createMockEntry();
			const post = new BlogPost(entry);

			expect(post.language).toBe('en');
		});
	});

	describe('isPublished()', () => {
		it('should return true for non-draft posts', () => {
			const entry = createMockEntry({ draft: false });
			const post = new BlogPost(entry);

			expect(post.isPublished()).toBe(true);
		});

		it('should return false for draft posts', () => {
			const entry = createMockEntry({ draft: true });
			const post = new BlogPost(entry);

			expect(post.isPublished()).toBe(false);
		});
	});

	describe('isFeatured()', () => {
		it('should return true for featured posts', () => {
			const entry = createMockEntry({ featured: true });
			const post = new BlogPost(entry);

			expect(post.isFeatured()).toBe(true);
		});

		it('should return false for non-featured posts', () => {
			const entry = createMockEntry({ featured: false });
			const post = new BlogPost(entry);

			expect(post.isFeatured()).toBe(false);
		});
	});

	describe('hasTag()', () => {
		it('should return true for existing tag (case insensitive)', () => {
			const entry = createMockEntry({ tags: ['JavaScript', 'Testing'] });
			const post = new BlogPost(entry);

			expect(post.hasTag('javascript')).toBe(true);
			expect(post.hasTag('JAVASCRIPT')).toBe(true);
			expect(post.hasTag('testing')).toBe(true);
		});

		it('should return false for non-existing tag', () => {
			const entry = createMockEntry({ tags: ['javascript'] });
			const post = new BlogPost(entry);

			expect(post.hasTag('python')).toBe(false);
		});

		it('should handle tags with spaces', () => {
			const entry = createMockEntry({ tags: ['Unit Testing'] });
			const post = new BlogPost(entry);

			expect(post.hasTag('unit-testing')).toBe(true);
			expect(post.hasTag('Unit Testing')).toBe(true);
		});
	});

	describe('hasAllTags()', () => {
		it('should return true when post has all specified tags', () => {
			const entry = createMockEntry({ tags: ['javascript', 'testing', 'vitest'] });
			const post = new BlogPost(entry);

			expect(post.hasAllTags(['javascript', 'testing'])).toBe(true);
		});

		it('should return false when post is missing a tag', () => {
			const entry = createMockEntry({ tags: ['javascript'] });
			const post = new BlogPost(entry);

			expect(post.hasAllTags(['javascript', 'python'])).toBe(false);
		});
	});

	describe('hasAnyTag()', () => {
		it('should return true when post has at least one tag', () => {
			const entry = createMockEntry({ tags: ['javascript'] });
			const post = new BlogPost(entry);

			expect(post.hasAnyTag(['javascript', 'python'])).toBe(true);
		});

		it('should return false when post has none of the tags', () => {
			const entry = createMockEntry({ tags: ['javascript'] });
			const post = new BlogPost(entry);

			expect(post.hasAnyTag(['python', 'ruby'])).toBe(false);
		});
	});

	describe('Tag Sharing Methods', () => {
		it('should count shared tags between posts', () => {
			const entry1 = createMockEntry({ tags: ['javascript', 'testing', 'vitest'] });
			const entry2 = createMockEntry({ tags: ['javascript', 'typescript', 'testing'] });

			const post1 = new BlogPost(entry1);
			const post2 = new BlogPost(entry2);

			expect(post1.countSharedTags(post2)).toBe(2); // javascript, testing
		});

		it('should check if posts share tags', () => {
			const entry1 = createMockEntry({ tags: ['javascript'] });
			const entry2 = createMockEntry({ tags: ['javascript', 'typescript'] });
			const entry3 = createMockEntry({ tags: ['python'] });

			const post1 = new BlogPost(entry1);
			const post2 = new BlogPost(entry2);
			const post3 = new BlogPost(entry3);

			expect(post1.sharesTagsWith(post2)).toBe(true);
			expect(post1.sharesTagsWith(post3)).toBe(false);
		});

		it('should get list of shared tags', () => {
			const entry1 = createMockEntry({ tags: ['javascript', 'testing', 'vitest'] });
			const entry2 = createMockEntry({ tags: ['javascript', 'typescript', 'testing'] });

			const post1 = new BlogPost(entry1);
			const post2 = new BlogPost(entry2);

			const shared = post1.getSharedTags(post2);
			expect(shared).toEqual(['javascript', 'testing']);
		});
	});

	describe('isInCategory()', () => {
		it('should return true for matching category (case insensitive)', () => {
			const entry = createMockEntry({ category: 'programming' });
			const post = new BlogPost(entry);

			expect(post.isInCategory('programming')).toBe(true);
			expect(post.isInCategory('PROGRAMMING')).toBe(true);
		});

		it('should return false for non-matching category', () => {
			const entry = createMockEntry({ category: 'programming' });
			const post = new BlogPost(entry);

			expect(post.isInCategory('mathematics')).toBe(false);
		});
	});

	describe('hasDifficulty()', () => {
		it('should return true for matching difficulty', () => {
			const entry = createMockEntry({ difficulty: 'intermediate' });
			const post = new BlogPost(entry);

			expect(post.hasDifficulty('intermediate')).toBe(true);
		});

		it('should return false for non-matching difficulty', () => {
			const entry = createMockEntry({ difficulty: 'beginner' });
			const post = new BlogPost(entry);

			expect(post.hasDifficulty('advanced')).toBe(false);
		});
	});

	describe('isPublishedWithinDays()', () => {
		it('should return true for recent post', () => {
			const today = new Date();
			const entry = createMockEntry({ pubDate: today });
			const post = new BlogPost(entry);

			expect(post.isPublishedWithinDays(7)).toBe(true);
		});

		it('should return false for old post', () => {
			const oldDate = new Date('2020-01-01');
			const entry = createMockEntry({ pubDate: oldDate });
			const post = new BlogPost(entry);

			expect(post.isPublishedWithinDays(7)).toBe(false);
		});
	});

	describe('hasBeenUpdated()', () => {
		it('should return true when post has been updated', () => {
			const pubDate = new Date('2024-01-01');
			const updatedDate = new Date('2024-01-15');
			const entry = createMockEntry({ pubDate, updatedDate });
			const post = new BlogPost(entry);

			expect(post.hasBeenUpdated()).toBe(true);
		});

		it('should return false when post has not been updated', () => {
			const entry = createMockEntry({ updatedDate: undefined });
			const post = new BlogPost(entry);

			expect(post.hasBeenUpdated()).toBe(false);
		});
	});

	describe('matchesSearchQuery()', () => {
		it('should match query in title', () => {
			const entry = createMockEntry({ title: 'JavaScript Guide' });
			const post = new BlogPost(entry);

			expect(post.matchesSearchQuery('javascript')).toBe(true);
			expect(post.matchesSearchQuery('JAVASCRIPT')).toBe(true);
		});

		it('should match query in description', () => {
			const entry = createMockEntry({ description: 'Learn Python programming' });
			const post = new BlogPost(entry);

			expect(post.matchesSearchQuery('python')).toBe(true);
		});

		it('should match query in tags', () => {
			const entry = createMockEntry({ tags: ['typescript', 'testing'] });
			const post = new BlogPost(entry);

			expect(post.matchesSearchQuery('typescript')).toBe(true);
		});

		it('should return false for non-matching query', () => {
			const entry = createMockEntry({
				title: 'JavaScript Guide',
				description: 'Learn JS',
				tags: ['javascript'],
			});
			const post = new BlogPost(entry);

			expect(post.matchesSearchQuery('python')).toBe(false);
		});
	});

	describe('Static Factory Methods', () => {
		it('should create post from entry', () => {
			const entry = createMockEntry();
			const post = BlogPost.fromEntry(entry);

			expect(post).toBeInstanceOf(BlogPost);
			expect(post.title).toBe('Test Post');
		});

		it('should create multiple posts from entries', () => {
			const entries = [createMockEntry(), createMockEntry({ title: 'Post 2' })];
			const posts = BlogPost.fromEntries(entries);

			expect(posts).toHaveLength(2);
			expect(posts[0]).toBeInstanceOf(BlogPost);
			expect(posts[1]).toBeInstanceOf(BlogPost);
		});
	});
});
