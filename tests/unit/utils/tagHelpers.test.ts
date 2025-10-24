import { describe, it, expect } from 'vitest';
import {
	getTagMetadata,
	getTagsByCategory,
	getTagsByLearningLevel,
	getRelatedTags,
	sortTags,
	filterTagsByQuery,
	filterTagsByLetter,
	normalizeTagSlug,
	getTagDisplayName,
	getTagIcon,
	getTagCategory,
	getTagLearningLevel,
	hasTagMetadata,
	parseTagsFromUrl,
	buildTagsUrlParam,
	getCategoryMetadata,
	getLearningLevelMetadata,
	getAllCategories,
	getAllLearningLevels,
	createTagCloudData,
	getAvailableLetters,
	hasNumericTags,
} from '@/utils/tagHelpers';

describe('tagHelpers.ts', () => {
	describe('getTagMetadata', () => {
		it('should return metadata for existing tag', () => {
			const metadata = getTagMetadata('calculus');

			expect(metadata).toBeDefined();
			expect(metadata?.name).toBe('Calculus');
			expect(metadata?.slug).toBe('calculus');
		});

		it('should handle normalized slug lookup', () => {
			const metadata = getTagMetadata('Calculus');

			expect(metadata).toBeDefined();
			expect(metadata?.slug).toBe('calculus');
		});

		it('should handle slug with spaces', () => {
			const metadata = getTagMetadata('linear algebra');

			expect(metadata).toBeDefined();
			expect(metadata?.slug).toBe('linear-algebra');
		});

		it('should return undefined for non-existent tag', () => {
			const metadata = getTagMetadata('nonexistent-tag');

			expect(metadata).toBeUndefined();
		});

		it('should find tag by alias if provided', () => {
			const metadata = getTagMetadata('calculus');

			if (metadata?.aliases) {
				const aliasMetadata = getTagMetadata(metadata.aliases[0]);
				expect(aliasMetadata).toBeDefined();
			}
		});
	});

	describe('getTagsByCategory', () => {
		it('should return all mathematics tags', () => {
			const mathTags = getTagsByCategory('mathematics');

			expect(mathTags.length).toBeGreaterThan(0);
			expect(mathTags.every((tag) => tag.category === 'mathematics')).toBe(true);
		});

		it('should return all programming tags', () => {
			const progTags = getTagsByCategory('programming');

			expect(progTags.every((tag) => tag.category === 'programming')).toBe(true);
		});

		it('should return all computer-science tags', () => {
			const csTags = getTagsByCategory('computer-science');

			expect(csTags.every((tag) => tag.category === 'computer-science')).toBe(true);
		});

		it('should return empty array for category with no tags', () => {
			const tags = getTagsByCategory('general');

			expect(Array.isArray(tags)).toBe(true);
		});
	});

	describe('getTagsByLearningLevel', () => {
		it('should return all basics level tags', () => {
			const basicTags = getTagsByLearningLevel('basics');

			expect(basicTags.length).toBeGreaterThan(0);
			expect(basicTags.every((tag) => tag.learningPath === 'basics')).toBe(true);
		});

		it('should return all intermediate level tags', () => {
			const intermediateTags = getTagsByLearningLevel('intermediate');

			expect(intermediateTags.length).toBeGreaterThan(0);
			expect(intermediateTags.every((tag) => tag.learningPath === 'intermediate')).toBe(true);
		});

		it('should return all advanced level tags', () => {
			const advancedTags = getTagsByLearningLevel('advanced');

			expect(advancedTags.every((tag) => tag.learningPath === 'advanced')).toBe(true);
		});
	});

	describe('getRelatedTags', () => {
		it('should return related tags for calculus', () => {
			const relatedTags = getRelatedTags('calculus');

			expect(relatedTags.length).toBeGreaterThan(0);
			expect(relatedTags.every((tag) => tag !== undefined)).toBe(true);
		});

		it('should respect the limit parameter', () => {
			const relatedTags = getRelatedTags('calculus', 2);

			expect(relatedTags.length).toBeLessThanOrEqual(2);
		});

		it('should return empty array for tag without related tags', () => {
			const relatedTags = getRelatedTags('nonexistent-tag');

			expect(relatedTags).toEqual([]);
		});

		it('should use default limit of 5', () => {
			const relatedTags = getRelatedTags('calculus');

			expect(relatedTags.length).toBeLessThanOrEqual(5);
		});

		it('should filter out invalid related tags', () => {
			const relatedTags = getRelatedTags('calculus');

			expect(relatedTags.every((tag) => tag.slug)).toBe(true);
		});
	});

	describe('sortTags', () => {
		const testTags = [
			{ name: 'Zebra', count: 10 },
			{ name: 'Apple', count: 25 },
			{ name: 'Mango', count: 5 },
		];

		it('should sort tags alphabetically', () => {
			const sorted = sortTags(testTags, 'alphabetical');

			expect(sorted[0].name).toBe('Apple');
			expect(sorted[1].name).toBe('Mango');
			expect(sorted[2].name).toBe('Zebra');
		});

		it('should sort tags by popularity (count)', () => {
			const sorted = sortTags(testTags, 'popular');

			expect(sorted[0].count).toBe(25);
			expect(sorted[1].count).toBe(10);
			expect(sorted[2].count).toBe(5);
		});

		it('should not mutate original array', () => {
			const original = [...testTags];
			sortTags(testTags, 'alphabetical');

			expect(testTags).toEqual(original);
		});

		it('should handle tags without count property', () => {
			const tagsWithoutCount = [
				{ name: 'Zebra' },
				{ name: 'Apple' },
				{ name: 'Mango' },
			];

			const sorted = sortTags(tagsWithoutCount, 'popular');

			expect(sorted).toHaveLength(3);
		});

		it('should default to popular sorting', () => {
			const sorted = sortTags(testTags);

			expect(sorted[0].count).toBe(25);
		});

		it('should sort by recent (fallback to popular)', () => {
			const sorted = sortTags(testTags, 'recent');

			expect(sorted[0].count).toBe(25);
		});
	});

	describe('filterTagsByQuery', () => {
		const testTags = [
			{ name: 'Calculus', slug: 'calculus' },
			{ name: 'Algebra', slug: 'algebra' },
			{ name: 'JavaScript', slug: 'javascript' },
		];

		it('should filter tags by name', () => {
			const filtered = filterTagsByQuery(testTags, 'calc');

			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('Calculus');
		});

		it('should filter tags by slug', () => {
			const filtered = filterTagsByQuery(testTags, 'algebra');

			expect(filtered.length).toBeGreaterThan(0);
			expect(filtered[0].slug).toBe('algebra');
		});

		it('should be case-insensitive', () => {
			const filtered = filterTagsByQuery(testTags, 'CALC');

			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('Calculus');
		});

		it('should return all tags for empty query', () => {
			const filtered = filterTagsByQuery(testTags, '');

			expect(filtered).toEqual(testTags);
		});

		it('should return all tags for whitespace query', () => {
			const filtered = filterTagsByQuery(testTags, '   ');

			expect(filtered).toEqual(testTags);
		});

		it('should filter by partial match', () => {
			const filtered = filterTagsByQuery(testTags, 'script');

			expect(filtered.length).toBeGreaterThan(0);
			expect(filtered[0].name).toBe('JavaScript');
		});

		it('should check metadata description if available', () => {
			const filtered = filterTagsByQuery(testTags, 'calculus');

			expect(filtered.length).toBeGreaterThan(0);
		});
	});

	describe('filterTagsByLetter', () => {
		const testTags = [
			{ name: 'Apple' },
			{ name: 'Banana' },
			{ name: 'Cherry' },
			{ name: '3D Graphics' },
		];

		it('should filter tags starting with specific letter', () => {
			const filtered = filterTagsByLetter(testTags, 'a');

			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('Apple');
		});

		it('should be case-insensitive', () => {
			const filtered = filterTagsByLetter(testTags, 'A');

			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('Apple');
		});

		it('should return all tags for "all" filter', () => {
			const filtered = filterTagsByLetter(testTags, 'all');

			expect(filtered).toEqual(testTags);
		});

		it('should filter numeric tags for "0-9"', () => {
			const filtered = filterTagsByLetter(testTags, '0-9');

			expect(filtered).toHaveLength(1);
			expect(filtered[0].name).toBe('3D Graphics');
		});

		it('should return empty array for non-matching letter', () => {
			const filtered = filterTagsByLetter(testTags, 'z');

			expect(filtered).toEqual([]);
		});
	});

	describe('normalizeTagSlug', () => {
		it('should convert to lowercase', () => {
			expect(normalizeTagSlug('CALCULUS')).toBe('calculus');
		});

		it('should replace spaces with hyphens', () => {
			expect(normalizeTagSlug('Linear Algebra')).toBe('linear-algebra');
		});

		it('should remove special characters', () => {
			expect(normalizeTagSlug('C++ Programming')).toBe('c-programming');
			expect(normalizeTagSlug('React.js')).toBe('reactjs');
		});

		it('should trim whitespace', () => {
			expect(normalizeTagSlug('  calculus  ')).toBe('calculus');
		});

		it('should handle multiple spaces', () => {
			expect(normalizeTagSlug('linear   algebra')).toBe('linear-algebra');
		});

		it('should handle already normalized slugs', () => {
			expect(normalizeTagSlug('calculus')).toBe('calculus');
			expect(normalizeTagSlug('linear-algebra')).toBe('linear-algebra');
		});
	});

	describe('getTagDisplayName', () => {
		it('should return proper name from metadata', () => {
			expect(getTagDisplayName('calculus')).toBe('Calculus');
		});

		it('should capitalize slug if no metadata', () => {
			const displayName = getTagDisplayName('my-custom-tag');

			expect(displayName).toBe('My Custom Tag');
		});

		it('should handle single word tags', () => {
			const displayName = getTagDisplayName('programming');

			expect(displayName).toContain('Programming');
		});

		it('should handle multi-word slugs', () => {
			const displayName = getTagDisplayName('linear-algebra');

			expect(displayName).toBeDefined();
		});
	});

	describe('getTagIcon', () => {
		it('should return icon for tag with icon metadata', () => {
			const icon = getTagIcon('calculus');

			expect(icon).toBeDefined();
			expect(typeof icon).toBe('string');
		});

		it('should return undefined for tag without icon', () => {
			const icon = getTagIcon('nonexistent-tag');

			expect(icon).toBeUndefined();
		});
	});

	describe('getTagCategory', () => {
		it('should return category for existing tag', () => {
			expect(getTagCategory('calculus')).toBe('mathematics');
		});

		it('should return "general" for tag without metadata', () => {
			expect(getTagCategory('nonexistent-tag')).toBe('general');
		});
	});

	describe('getTagLearningLevel', () => {
		it('should return learning level for tag with metadata', () => {
			const level = getTagLearningLevel('calculus');

			expect(level).toBeDefined();
		});

		it('should return undefined for tag without learning level', () => {
			const level = getTagLearningLevel('nonexistent-tag');

			expect(level).toBeUndefined();
		});
	});

	describe('hasTagMetadata', () => {
		it('should return true for tags with metadata', () => {
			expect(hasTagMetadata('calculus')).toBe(true);
			expect(hasTagMetadata('algebra')).toBe(true);
		});

		it('should return false for tags without metadata', () => {
			expect(hasTagMetadata('nonexistent-tag')).toBe(false);
		});
	});

	describe('parseTagsFromUrl', () => {
		it('should parse comma-separated tags', () => {
			const tags = parseTagsFromUrl('calculus,algebra,geometry');

			expect(tags).toEqual(['calculus', 'algebra', 'geometry']);
		});

		it('should normalize tag slugs', () => {
			const tags = parseTagsFromUrl('Calculus,Linear Algebra');

			expect(tags).toEqual(['calculus', 'linear-algebra']);
		});

		it('should return empty array for null parameter', () => {
			const tags = parseTagsFromUrl(null);

			expect(tags).toEqual([]);
		});

		it('should filter out empty tags', () => {
			const tags = parseTagsFromUrl('calculus,,algebra,');

			expect(tags).toEqual(['calculus', 'algebra']);
		});

		it('should handle single tag', () => {
			const tags = parseTagsFromUrl('calculus');

			expect(tags).toEqual(['calculus']);
		});
	});

	describe('buildTagsUrlParam', () => {
		it('should build comma-separated URL parameter', () => {
			const param = buildTagsUrlParam(['calculus', 'algebra', 'geometry']);

			expect(param).toBe('calculus,algebra,geometry');
		});

		it('should return null for empty array', () => {
			const param = buildTagsUrlParam([]);

			expect(param).toBeNull();
		});

		it('should normalize tags in output', () => {
			const param = buildTagsUrlParam(['Calculus', 'Linear Algebra']);

			expect(param).toBe('calculus,linear-algebra');
		});

		it('should handle single tag', () => {
			const param = buildTagsUrlParam(['calculus']);

			expect(param).toBe('calculus');
		});
	});

	describe('getCategoryMetadata', () => {
		it('should return metadata for valid category', () => {
			const metadata = getCategoryMetadata('mathematics');

			expect(metadata).toBeDefined();
		});

		it('should return metadata for all category types', () => {
			expect(getCategoryMetadata('mathematics')).toBeDefined();
			expect(getCategoryMetadata('programming')).toBeDefined();
			expect(getCategoryMetadata('computer-science')).toBeDefined();
		});
	});

	describe('getLearningLevelMetadata', () => {
		it('should return metadata for valid learning level', () => {
			const metadata = getLearningLevelMetadata('basics');

			expect(metadata).toBeDefined();
		});

		it('should return metadata for all learning levels', () => {
			expect(getLearningLevelMetadata('basics')).toBeDefined();
			expect(getLearningLevelMetadata('intermediate')).toBeDefined();
			expect(getLearningLevelMetadata('advanced')).toBeDefined();
		});
	});

	describe('getAllCategories', () => {
		it('should return all category keys', () => {
			const categories = getAllCategories();

			expect(categories.length).toBeGreaterThan(0);
			expect(Array.isArray(categories)).toBe(true);
		});

		it('should include expected categories', () => {
			const categories = getAllCategories();

			expect(categories).toContain('mathematics');
		});
	});

	describe('getAllLearningLevels', () => {
		it('should return all learning level keys', () => {
			const levels = getAllLearningLevels();

			expect(levels.length).toBeGreaterThan(0);
			expect(Array.isArray(levels)).toBe(true);
		});

		it('should include expected learning levels', () => {
			const levels = getAllLearningLevels();

			expect(levels).toContain('basics');
			expect(levels).toContain('intermediate');
			expect(levels).toContain('advanced');
		});
	});

	describe('createTagCloudData', () => {
		const testTags = [
			{ name: 'Calculus', count: 50 },
			{ name: 'Algebra', count: 25 },
			{ name: 'Geometry', count: 10 },
		];

		it('should add size property to tags', () => {
			const cloudData = createTagCloudData(testTags);

			expect(cloudData.every((tag) => 'size' in tag)).toBe(true);
		});

		it('should scale sizes between min and max', () => {
			const cloudData = createTagCloudData(testTags, 0.875, 1.5);

			expect(cloudData[0].size).toBeGreaterThanOrEqual(0.875);
			expect(cloudData[0].size).toBeLessThanOrEqual(1.5);
		});

		it('should assign largest size to most popular tag', () => {
			const cloudData = createTagCloudData(testTags);
			const maxSizeTag = cloudData.reduce((prev, curr) =>
				curr.size > prev.size ? curr : prev
			);

			expect(maxSizeTag.count).toBe(50);
		});

		it('should handle empty array', () => {
			const cloudData = createTagCloudData([]);

			expect(cloudData).toEqual([]);
		});

		it('should handle tags with same count', () => {
			const sameTags = [
				{ name: 'A', count: 10 },
				{ name: 'B', count: 10 },
			];

			const cloudData = createTagCloudData(sameTags);

			expect(cloudData).toHaveLength(2);
		});
	});

	describe('getAvailableLetters', () => {
		const testTags = [
			{ name: 'Apple' },
			{ name: 'Banana' },
			{ name: 'Cherry' },
			{ name: 'Avocado' },
		];

		it('should return unique letters', () => {
			const letters = getAvailableLetters(testTags);

			expect(letters).toContain('A');
			expect(letters).toContain('B');
			expect(letters).toContain('C');
		});

		it('should return sorted letters', () => {
			const letters = getAvailableLetters(testTags);

			expect(letters).toEqual(['A', 'B', 'C']);
		});

		it('should handle empty array', () => {
			const letters = getAvailableLetters([]);

			expect(letters).toEqual([]);
		});

		it('should only include alphabetic letters', () => {
			const mixedTags = [{ name: 'Apple' }, { name: '3D' }];
			const letters = getAvailableLetters(mixedTags);

			expect(letters).toEqual(['A']);
		});
	});

	describe('hasNumericTags', () => {
		it('should return true for tags starting with numbers', () => {
			const tags = [{ name: '3D Graphics' }, { name: 'Calculus' }];

			expect(hasNumericTags(tags)).toBe(true);
		});

		it('should return false for tags without numbers', () => {
			const tags = [{ name: 'Calculus' }, { name: 'Algebra' }];

			expect(hasNumericTags(tags)).toBe(false);
		});

		it('should return false for empty array', () => {
			expect(hasNumericTags([])).toBe(false);
		});
	});
});
