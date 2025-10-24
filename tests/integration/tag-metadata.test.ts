import { describe, it, expect } from 'vitest';
import { tagMetadata } from '@data/tagMetadata';

describe('Tag Metadata Integrity', () => {
	describe('Tag Structure Validation', () => {
		it('should have at least one tag defined', () => {
			expect(Object.keys(tagMetadata).length).toBeGreaterThan(0);
		});

		it('all tags should have required fields', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				expect(tag, `Tag ${slug} should have a name`).toHaveProperty('name');
				expect(tag, `Tag ${slug} should have a description`).toHaveProperty('description');
				expect(typeof tag.name, `Tag ${slug} name should be a string`).toBe('string');
				expect(typeof tag.description, `Tag ${slug} description should be a string`).toBe('string');
			});
		});

		it('all tags should have unique slugs', () => {
			const slugs = Object.keys(tagMetadata);
			const uniqueSlugs = new Set(slugs);
			expect(slugs.length).toBe(uniqueSlugs.size);
		});
	});

	describe('Tag Categories', () => {
		const validCategories = ['mathematics', 'computer-science', 'programming', 'tools', 'general'];

		it('all tags should have valid categories', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.category) {
					expect(
						validCategories.includes(tag.category),
						`Tag ${slug} has invalid category: ${tag.category}`
					).toBe(true);
				}
			});
		});

		it('should have tags in each major category', () => {
			const categories = Object.values(tagMetadata)
				.filter(tag => tag.category)
				.map(tag => tag.category);

			expect(categories, 'Should have mathematics tags').toContain('mathematics');
			expect(categories, 'Should have computer-science tags').toContain('computer-science');
		});
	});

	describe('Tag Learning Levels', () => {
		const validLevels = ['basics', 'intermediate', 'advanced'];

		it('all tags with levels should have valid learning levels', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.learningPath) {
					expect(
						validLevels.includes(tag.learningPath),
						`Tag ${slug} has invalid learningPath: ${tag.learningPath}`
					).toBe(true);
				}
			});
		});

		it('should have tags at each learning level', () => {
			const levels = Object.values(tagMetadata)
				.filter((tag) => tag.learningPath)
				.map((tag) => tag.learningPath);

			expect(levels, 'Should have basics level tags').toContain('basics');
			expect(levels, 'Should have intermediate level tags').toContain('intermediate');
			expect(levels, 'Should have advanced level tags').toContain('advanced');
		});
	});

	describe('Tag Relationships', () => {
		it('related tags should reference existing tags', () => {
			const allSlugs = Object.keys(tagMetadata);

			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.relatedTags) {
					tag.relatedTags.forEach((relatedSlug) => {
						expect(
							allSlugs.includes(relatedSlug),
							`Tag ${slug} references non-existent related tag: ${relatedSlug}`
						).toBe(true);
					});
				}
			});
		});

		it('should not have circular self-references', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.relatedTags) {
					expect(
						tag.relatedTags.includes(slug),
						`Tag ${slug} should not reference itself`
					).toBe(false);
				}
			});
		});
	});

	describe('Tag Aliases', () => {
		it('all aliases should be unique across all tags', () => {
			const allAliases: string[] = [];

			Object.values(tagMetadata).forEach((tag) => {
				if (tag.aliases) {
					allAliases.push(...tag.aliases);
				}
			});

			const uniqueAliases = new Set(allAliases);
			expect(
				allAliases.length,
				'All aliases should be unique'
			).toBe(uniqueAliases.size);
		});

		it('aliases should not conflict with tag slugs', () => {
			const allSlugs = Object.keys(tagMetadata);
			const allAliases: string[] = [];

			Object.values(tagMetadata).forEach((tag) => {
				if (tag.aliases) {
					allAliases.push(...tag.aliases);
				}
			});

			allAliases.forEach((alias) => {
				expect(
					allSlugs.includes(alias),
					`Alias "${alias}" conflicts with a tag slug`
				).toBe(false);
			});
		});
	});

	describe('Tag Icons and Colors', () => {
		it('tags with icons should have valid icon strings', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.icon) {
					expect(
						typeof tag.icon,
						`Tag ${slug} icon should be a string`
					).toBe('string');
					expect(
						tag.icon.length,
						`Tag ${slug} icon should not be empty`
					).toBeGreaterThan(0);
				}
			});
		});

		it('tags with colors should have valid color strings', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				if (tag.color) {
					expect(
						typeof tag.color,
						`Tag ${slug} color should be a string`
					).toBe('string');
					expect(
						tag.color.length,
						`Tag ${slug} color should not be empty`
					).toBeGreaterThan(0);
				}
			});
		});
	});

	describe('Tag Slug Consistency', () => {
		it('tag slug should match its key in metadata', () => {
			Object.entries(tagMetadata).forEach(([key, tag]) => {
				expect(
					tag.slug,
					`Tag key ${key} should match tag.slug ${tag.slug}`
				).toBe(key);
			});
		});

		it('tag slugs should be lowercase and kebab-case', () => {
			Object.entries(tagMetadata).forEach(([slug, tag]) => {
				expect(
					slug,
					`Tag slug ${slug} should be lowercase`
				).toBe(slug.toLowerCase());
				expect(
					slug.includes(' '),
					`Tag slug ${slug} should not contain spaces`
				).toBe(false);
			});
		});
	});

	describe('Category Metadata Exports', () => {
		it('should export categoryMetadata', async () => {
			const { categoryMetadata } = await import('@data/tagMetadata');
			expect(categoryMetadata).toBeDefined();
			expect(typeof categoryMetadata).toBe('object');
		});

		it('should export learningLevelMetadata', async () => {
			const { learningLevelMetadata } = await import('@data/tagMetadata');
			expect(learningLevelMetadata).toBeDefined();
			expect(typeof learningLevelMetadata).toBe('object');
		});
	});
});
