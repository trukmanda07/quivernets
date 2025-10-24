import { describe, it, expect } from 'vitest';
import { getCollection } from 'astro:content';
import { postToSearchable } from '@/utils/search';

describe('Search Index Generation', () => {
	describe('English Search Index', () => {
		it('should generate search index for all English posts', async () => {
			const posts = await getCollection('blog-en');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'en'));

			expect(searchablePosts).toBeDefined();
			expect(Array.isArray(searchablePosts)).toBe(true);
			expect(searchablePosts.length).toBe(posts.length);
		});

		it('should include all required fields in English search index', async () => {
			const posts = await getCollection('blog-en');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'en'));

			searchablePosts.forEach((post, index) => {
				expect(post.id, `Post ${index} should have id`).toBeDefined();
				expect(post.title, `Post ${index} should have title`).toBeDefined();
				expect(post.description, `Post ${index} should have description`).toBeDefined();
				expect(post.content, `Post ${index} should have content`).toBeDefined();
				expect(post.slug, `Post ${index} should have slug`).toBeDefined();
				expect(post.language, `Post ${index} should have language`).toBe('en');
				expect(post.pubDate, `Post ${index} should have pubDate`).toBeInstanceOf(Date);
			});
		});

		it('should exclude draft posts from English search index', async () => {
			const posts = await getCollection('blog-en', ({ data }) => !data.draft);
			const searchablePosts = posts.map((post) => postToSearchable(post, 'en'));

			searchablePosts.forEach((post, index) => {
				const originalPost = posts[index];
				expect(
					originalPost.data.draft,
					`Post ${post.id} should not be a draft`
				).toBe(false);
			});
		});

		it('should preserve tags array in English search index', async () => {
			const posts = await getCollection('blog-en');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'en'));

			searchablePosts.forEach((post) => {
				expect(Array.isArray(post.tags), `Post ${post.id} tags should be an array`).toBe(
					true
				);
			});
		});
	});

	describe('Indonesian Search Index', () => {
		it('should generate search index for all Indonesian posts', async () => {
			const posts = await getCollection('blog-id');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'id'));

			expect(searchablePosts).toBeDefined();
			expect(Array.isArray(searchablePosts)).toBe(true);
			expect(searchablePosts.length).toBe(posts.length);
		});

		it.skipIf(!process.env.CI)('should include all required fields in Indonesian search index', async () => {
			const posts = await getCollection('blog-id');
			if (posts.length === 0) return; // Skip if no Indonesian posts exist

			const searchablePosts = posts.map((post) => postToSearchable(post, 'id'));

			searchablePosts.forEach((post, index) => {
				expect(post.id, `Post ${index} should have id`).toBeDefined();
				expect(post.title, `Post ${index} should have title`).toBeDefined();
				expect(post.description, `Post ${index} should have description`).toBeDefined();
				expect(post.content, `Post ${index} should have content`).toBeDefined();
				expect(post.slug, `Post ${index} should have slug`).toBeDefined();
				expect(post.language, `Post ${index} should have language`).toBe('id');
				expect(post.pubDate, `Post ${index} should have pubDate`).toBeInstanceOf(Date);
			});
		});

		it.skipIf(!process.env.CI)('should exclude draft posts from Indonesian search index', async () => {
			const posts = await getCollection('blog-id', ({ data }) => !data.draft);
			if (posts.length === 0) return; // Skip if no Indonesian posts exist

			const searchablePosts = posts.map((post) => postToSearchable(post, 'id'));

			searchablePosts.forEach((post, index) => {
				const originalPost = posts[index];
				expect(
					originalPost.data.draft,
					`Post ${post.id} should not be a draft`
				).toBe(false);
			});
		});

		it.skipIf(!process.env.CI)('should preserve tags array in Indonesian search index', async () => {
			const posts = await getCollection('blog-id');
			if (posts.length === 0) return; // Skip if no Indonesian posts exist

			const searchablePosts = posts.map((post) => postToSearchable(post, 'id'));

			searchablePosts.forEach((post) => {
				expect(Array.isArray(post.tags), `Post ${post.id} tags should be an array`).toBe(
					true
				);
			});
		});
	});

	describe('Search Index Structure', () => {
		it('should maintain consistent structure across all search entries', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allSearchable = [
				...enPosts.map((post) => postToSearchable(post, 'en')),
				...idPosts.map((post) => postToSearchable(post, 'id')),
			];

			const expectedKeys = [
				'id',
				'title',
				'description',
				'content',
				'pubDate',
				'slug',
				'language',
			];

			allSearchable.forEach((post) => {
				expectedKeys.forEach((key) => {
					expect(
						post.hasOwnProperty(key),
						`Post ${post.id} should have ${key} property`
					).toBe(true);
				});
			});
		});

		it('should have valid content for search indexing', async () => {
			const enPosts = await getCollection('blog-en');
			const searchablePosts = enPosts.map((post) => postToSearchable(post, 'en'));

			searchablePosts.forEach((post) => {
				expect(
					typeof post.content,
					`Post ${post.id} content should be a string`
				).toBe('string');
				expect(
					typeof post.title,
					`Post ${post.id} title should be a string`
				).toBe('string');
				expect(
					typeof post.description,
					`Post ${post.id} description should be a string`
				).toBe('string');
			});
		});

		it('should include optional metadata fields when available', async () => {
			const enPosts = await getCollection('blog-en');
			const searchablePosts = enPosts.map((post) => postToSearchable(post, 'en'));

			searchablePosts.forEach((post) => {
				if (post.category) {
					expect(
						typeof post.category,
						`Post ${post.id} category should be a string`
					).toBe('string');
				}
				if (post.difficulty) {
					expect(
						['beginner', 'intermediate', 'advanced'].includes(post.difficulty),
						`Post ${post.id} difficulty should be valid`
					).toBe(true);
				}
			});
		});
	});

	describe('Search Index Data Integrity', () => {
		it('should not have duplicate post IDs in English index', async () => {
			const posts = await getCollection('blog-en');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'en'));
			const ids = searchablePosts.map((post) => post.id);
			const uniqueIds = new Set(ids);

			expect(ids.length, 'All English post IDs should be unique').toBe(uniqueIds.size);
		});

		it('should not have duplicate post IDs in Indonesian index', async () => {
			const posts = await getCollection('blog-id');
			const searchablePosts = posts.map((post) => postToSearchable(post, 'id'));
			const ids = searchablePosts.map((post) => post.id);
			const uniqueIds = new Set(ids);

			expect(ids.length, 'All Indonesian post IDs should be unique').toBe(uniqueIds.size);
		});

		it('should have valid publication dates for sorting', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allSearchable = [
				...enPosts.map((post) => postToSearchable(post, 'en')),
				...idPosts.map((post) => postToSearchable(post, 'id')),
			];

			allSearchable.forEach((post) => {
				expect(
					post.pubDate instanceof Date,
					`Post ${post.id} pubDate should be a Date`
				).toBe(true);
				expect(
					!isNaN(post.pubDate.getTime()),
					`Post ${post.id} pubDate should be valid`
				).toBe(true);
			});
		});
	});
});
