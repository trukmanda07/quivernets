import { describe, it, expect } from 'vitest';
import { getCollection } from 'astro:content';
import { z } from 'zod';

describe('Content Schema Validation', () => {
	describe('Blog Collection Structure', () => {
		it('should load English blog collection without errors', async () => {
			const posts = await getCollection('blog-en');
			expect(posts).toBeDefined();
			expect(Array.isArray(posts)).toBe(true);
		});

		it('should load Indonesian blog collection without errors', async () => {
			const posts = await getCollection('blog-id');
			expect(posts).toBeDefined();
			expect(Array.isArray(posts)).toBe(true);
		});

		it('should have at least one post in collections', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');

			expect(enPosts.length + idPosts.length).toBeGreaterThan(0);
		});
	});

	describe('Required Fields Validation', () => {
		it('all posts should have required title field', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(post.data.title, `Post ${post.id} should have a title`).toBeDefined();
				expect(
					typeof post.data.title,
					`Post ${post.id} title should be a string`
				).toBe('string');
				expect(
					post.data.title.length,
					`Post ${post.id} title should not be empty`
				).toBeGreaterThan(0);
			});
		});

		it('all posts should have required description field', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					post.data.description,
					`Post ${post.id} should have a description`
				).toBeDefined();
				expect(
					typeof post.data.description,
					`Post ${post.id} description should be a string`
				).toBe('string');
			});
		});

		it('all posts should have valid pubDate', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(post.data.pubDate, `Post ${post.id} should have pubDate`).toBeDefined();
				expect(
					post.data.pubDate instanceof Date,
					`Post ${post.id} pubDate should be a Date object`
				).toBe(true);
				expect(
					!isNaN(post.data.pubDate.getTime()),
					`Post ${post.id} pubDate should be a valid date`
				).toBe(true);
			});
		});

		it('all posts should have correct language field', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');

			enPosts.forEach((post) => {
				expect(
					post.data.language,
					`English post ${post.id} should have language 'en'`
				).toBe('en');
			});

			idPosts.forEach((post) => {
				expect(
					post.data.language,
					`Indonesian post ${post.id} should have language 'id'`
				).toBe('id');
			});
		});
	});

	describe('Optional Fields Validation', () => {
		it('posts with updatedDate should have valid dates', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				if (post.data.updatedDate) {
					expect(
						post.data.updatedDate instanceof Date,
						`Post ${post.id} updatedDate should be a Date object`
					).toBe(true);
					expect(
						!isNaN(post.data.updatedDate.getTime()),
						`Post ${post.id} updatedDate should be a valid date`
					).toBe(true);
				}
			});
		});

		it('posts with tags should have valid arrays', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					Array.isArray(post.data.tags),
					`Post ${post.id} tags should be an array`
				).toBe(true);
				post.data.tags.forEach((tag: string) => {
					expect(typeof tag, `Post ${post.id} tags should be strings`).toBe('string');
				});
			});
		});

		it('posts with difficulty should have valid values', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];
			const validDifficulties = ['beginner', 'intermediate', 'advanced'];

			allPosts.forEach((post) => {
				if (post.data.difficulty) {
					expect(
						validDifficulties.includes(post.data.difficulty),
						`Post ${post.id} difficulty should be beginner, intermediate, or advanced`
					).toBe(true);
				}
			});
		});

		it('posts should have valid author field', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(post.data.author, `Post ${post.id} should have an author`).toBeDefined();
				expect(
					typeof post.data.author,
					`Post ${post.id} author should be a string`
				).toBe('string');
			});
		});
	});

	describe('Boolean Fields Validation', () => {
		it('hasMath field should be boolean', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					typeof post.data.hasMath,
					`Post ${post.id} hasMath should be boolean`
				).toBe('boolean');
			});
		});

		it('hasCode field should be boolean', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					typeof post.data.hasCode,
					`Post ${post.id} hasCode should be boolean`
				).toBe('boolean');
			});
		});

		it('featured field should be boolean', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					typeof post.data.featured,
					`Post ${post.id} featured should be boolean`
				).toBe('boolean');
			});
		});

		it('draft field should be boolean', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				expect(
					typeof post.data.draft,
					`Post ${post.id} draft should be boolean`
				).toBe('boolean');
			});
		});
	});

	describe('Translation Fields Validation', () => {
		it('posts with translationId should have valid format', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				if (post.data.translationId) {
					expect(
						typeof post.data.translationId,
						`Post ${post.id} translationId should be a string`
					).toBe('string');
					expect(
						post.data.translationId.length,
						`Post ${post.id} translationId should not be empty`
					).toBeGreaterThan(0);
				}
			});
		});

		it('posts with translatedVersions should have valid structure', async () => {
			const enPosts = await getCollection('blog-en');
			const idPosts = await getCollection('blog-id');
			const allPosts = [...enPosts, ...idPosts];

			allPosts.forEach((post) => {
				if (post.data.translatedVersions) {
					expect(
						typeof post.data.translatedVersions,
						`Post ${post.id} translatedVersions should be an object`
					).toBe('object');

					if (post.data.translatedVersions.en) {
						expect(
							typeof post.data.translatedVersions.en,
							`Post ${post.id} en translation should be a string`
						).toBe('string');
					}

					if (post.data.translatedVersions.id) {
						expect(
							typeof post.data.translatedVersions.id,
							`Post ${post.id} id translation should be a string`
						).toBe('string');
					}
				}
			});
		});
	});
});
