import { describe, it, expect, beforeEach } from 'vitest';
import Fuse from 'fuse.js';
import {
	postToSearchable,
	fuseOptions,
	createSearchIndex,
	searchPosts,
	getSearchSuggestions,
	type SearchablePost,
} from '@/utils/search';
import type { CollectionEntry } from 'astro:content';

describe('search.ts', () => {
	describe('postToSearchable', () => {
		it('should convert a blog post to searchable format with all fields', () => {
			const post: CollectionEntry<'blog-en'> = {
				id: 'test-post',
				slug: 'test-post',
				body: 'This is the content of the post',
				collection: 'blog-en',
				data: {
					title: 'Test Post',
					description: 'A test post description',
					category: 'Mathematics',
					tags: ['calculus', 'algebra'],
					difficulty: 'intermediate',
					pubDate: new Date('2024-01-01'),
				},
			};

			const result = postToSearchable(post, 'en');

			expect(result).toEqual({
				id: 'test-post',
				title: 'Test Post',
				description: 'A test post description',
				content: 'This is the content of the post',
				category: 'Mathematics',
				tags: ['calculus', 'algebra'],
				difficulty: 'intermediate',
				pubDate: new Date('2024-01-01'),
				slug: 'test-post',
				language: 'en',
			});
		});

		it('should handle post with missing optional fields', () => {
			const post: CollectionEntry<'blog-id'> = {
				id: 'minimal-post',
				slug: 'minimal-post',
				body: 'Minimal content',
				collection: 'blog-id',
				data: {
					title: 'Minimal Post',
					pubDate: new Date('2024-01-01'),
				},
			};

			const result = postToSearchable(post, 'id');

			expect(result.description).toBe('');
			expect(result.category).toBeUndefined();
			expect(result.tags).toEqual([]);
			expect(result.difficulty).toBeUndefined();
			expect(result.language).toBe('id');
		});

		it('should handle post with empty body', () => {
			const post: CollectionEntry<'blog-en'> = {
				id: 'empty-body',
				slug: 'empty-body',
				body: '',
				collection: 'blog-en',
				data: {
					title: 'Empty Body Post',
					pubDate: new Date('2024-01-01'),
				},
			};

			const result = postToSearchable(post, 'en');

			expect(result.content).toBe('');
		});

		it('should preserve slug from post id', () => {
			const post: CollectionEntry<'blog-en'> = {
				id: 'my-custom-slug',
				slug: 'different-slug',
				body: 'Content',
				collection: 'blog-en',
				data: {
					title: 'Test',
					pubDate: new Date('2024-01-01'),
				},
			};

			const result = postToSearchable(post, 'en');

			expect(result.slug).toBe('my-custom-slug');
		});
	});

	describe('fuseOptions', () => {
		it('should have correct search keys with weights', () => {
			expect(fuseOptions.keys).toHaveLength(5);
			expect(fuseOptions.keys).toEqual([
				{ name: 'title', weight: 0.4 },
				{ name: 'description', weight: 0.3 },
				{ name: 'tags', weight: 0.2 },
				{ name: 'category', weight: 0.15 },
				{ name: 'content', weight: 0.1 },
			]);
		});

		it('should have optimal search configuration', () => {
			expect(fuseOptions.threshold).toBe(0.4);
			expect(fuseOptions.minMatchCharLength).toBe(2);
			expect(fuseOptions.includeScore).toBe(true);
			expect(fuseOptions.includeMatches).toBe(true);
			expect(fuseOptions.ignoreLocation).toBe(true);
			expect(fuseOptions.useExtendedSearch).toBe(false);
		});
	});

	describe('createSearchIndex', () => {
		it('should create a Fuse instance with provided posts', () => {
			const posts: SearchablePost[] = [
				{
					id: 'post-1',
					title: 'First Post',
					description: 'Description 1',
					content: 'Content 1',
					pubDate: new Date('2024-01-01'),
					slug: 'post-1',
					language: 'en',
				},
			];

			const index = createSearchIndex(posts);

			expect(index).toBeInstanceOf(Fuse);
		});

		it('should create index with empty posts array', () => {
			const index = createSearchIndex([]);

			expect(index).toBeInstanceOf(Fuse);
		});

		it('should allow searching on created index', () => {
			const posts: SearchablePost[] = [
				{
					id: 'post-1',
					title: 'Calculus Basics',
					description: 'Learn calculus',
					content: 'Derivatives and integrals',
					pubDate: new Date('2024-01-01'),
					slug: 'post-1',
					language: 'en',
				},
			];

			const index = createSearchIndex(posts);
			const results = index.search('calculus');

			expect(results.length).toBeGreaterThan(0);
			expect(results[0].item.title).toBe('Calculus Basics');
		});
	});

	describe('searchPosts', () => {
		let searchIndex: Fuse<SearchablePost>;
		let posts: SearchablePost[];

		beforeEach(() => {
			posts = [
				{
					id: 'post-1',
					title: 'Introduction to Calculus',
					description: 'Learn the basics of calculus',
					content: 'Derivatives, integrals, and limits',
					category: 'Mathematics',
					tags: ['calculus', 'mathematics'],
					pubDate: new Date('2024-01-01'),
					slug: 'intro-calculus',
					language: 'en',
				},
				{
					id: 'post-2',
					title: 'Advanced Algebra',
					description: 'Complex algebraic structures',
					content: 'Groups, rings, and fields',
					category: 'Mathematics',
					tags: ['algebra', 'mathematics'],
					pubDate: new Date('2024-01-02'),
					slug: 'advanced-algebra',
					language: 'en',
				},
				{
					id: 'post-3',
					title: 'JavaScript Basics',
					description: 'Learn JavaScript programming',
					content: 'Variables, functions, and objects',
					category: 'Programming',
					tags: ['javascript', 'programming'],
					pubDate: new Date('2024-01-03'),
					slug: 'js-basics',
					language: 'en',
				},
			];
			searchIndex = createSearchIndex(posts);
		});

		it('should find posts matching the query', () => {
			const results = searchPosts(searchIndex, 'calculus');

			expect(results.length).toBeGreaterThan(0);
			expect(results[0].item.title).toBe('Introduction to Calculus');
		});

		it('should return empty array for queries shorter than 2 characters', () => {
			expect(searchPosts(searchIndex, 'a')).toEqual([]);
			expect(searchPosts(searchIndex, '1')).toEqual([]);
			expect(searchPosts(searchIndex, '')).toEqual([]);
		});

		it('should return empty array for empty query', () => {
			const results = searchPosts(searchIndex, '');

			expect(results).toEqual([]);
		});

		it('should return empty array for whitespace-only query', () => {
			const results = searchPosts(searchIndex, '   ');

			expect(results).toEqual([]);
		});

		it('should respect the limit parameter', () => {
			const results = searchPosts(searchIndex, 'mathematics', 1);

			expect(results.length).toBeLessThanOrEqual(1);
		});

		it('should use default limit of 20', () => {
			const results = searchPosts(searchIndex, 'math');

			expect(results.length).toBeLessThanOrEqual(20);
		});

		it('should search across multiple fields (title, description, tags)', () => {
			const calcResults = searchPosts(searchIndex, 'calculus');
			const mathResults = searchPosts(searchIndex, 'mathematics');
			const jsResults = searchPosts(searchIndex, 'javascript');

			expect(calcResults.length).toBeGreaterThan(0);
			expect(mathResults.length).toBeGreaterThan(0);
			expect(jsResults.length).toBeGreaterThan(0);
		});

		it('should include score and matches in results', () => {
			const results = searchPosts(searchIndex, 'calculus');

			expect(results[0]).toHaveProperty('score');
			expect(results[0]).toHaveProperty('matches');
		});

		it('should handle case-insensitive searches', () => {
			const lowerResults = searchPosts(searchIndex, 'calculus');
			const upperResults = searchPosts(searchIndex, 'CALCULUS');
			const mixedResults = searchPosts(searchIndex, 'CaLcUlUs');

			expect(lowerResults.length).toBeGreaterThan(0);
			expect(upperResults.length).toBeGreaterThan(0);
			expect(mixedResults.length).toBeGreaterThan(0);
		});
	});

	describe('getSearchSuggestions', () => {
		let searchIndex: Fuse<SearchablePost>;
		let posts: SearchablePost[];

		beforeEach(() => {
			posts = [
				{
					id: 'post-1',
					title: 'Introduction to Calculus',
					description: 'Basics',
					content: 'Content',
					pubDate: new Date('2024-01-01'),
					slug: 'intro-calculus',
					language: 'en',
				},
				{
					id: 'post-2',
					title: 'Advanced Calculus',
					description: 'Advanced topics',
					content: 'Content',
					pubDate: new Date('2024-01-02'),
					slug: 'advanced-calculus',
					language: 'en',
				},
				{
					id: 'post-3',
					title: 'Calculus Applications',
					description: 'Real-world uses',
					content: 'Content',
					pubDate: new Date('2024-01-03'),
					slug: 'calculus-apps',
					language: 'en',
				},
			];
			searchIndex = createSearchIndex(posts);
		});

		it('should return unique title suggestions', () => {
			const suggestions = getSearchSuggestions(searchIndex, 'calculus');

			expect(suggestions.length).toBeGreaterThan(0);
			expect(suggestions.every((s) => typeof s === 'string')).toBe(true);
		});

		it('should respect the limit parameter', () => {
			const suggestions = getSearchSuggestions(searchIndex, 'calculus', 2);

			expect(suggestions.length).toBeLessThanOrEqual(2);
		});

		it('should return empty array for queries shorter than 2 characters', () => {
			expect(getSearchSuggestions(searchIndex, 'a')).toEqual([]);
			expect(getSearchSuggestions(searchIndex, '')).toEqual([]);
		});

		it('should return empty array for whitespace-only query', () => {
			const suggestions = getSearchSuggestions(searchIndex, '   ');

			expect(suggestions).toEqual([]);
		});

		it('should deduplicate titles with Set', () => {
			const suggestions = getSearchSuggestions(searchIndex, 'calculus', 10);

			const uniqueSuggestions = [...new Set(suggestions)];
			expect(suggestions.length).toBe(uniqueSuggestions.length);
		});

		it('should use default limit of 5', () => {
			const suggestions = getSearchSuggestions(searchIndex, 'calculus');

			expect(suggestions.length).toBeLessThanOrEqual(5);
		});
	});
});
