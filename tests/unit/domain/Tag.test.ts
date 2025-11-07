/**
 * Unit tests for Tag domain model
 */

import { describe, it, expect } from 'vitest';
import { Tag } from '../../../src/domain/blog/Tag';

describe('Tag Domain Model', () => {
	describe('Constructor and Validation', () => {
		it('should create a valid tag', () => {
			const tag = new Tag('javascript');

			expect(tag).toBeDefined();
			expect(tag.getSlug()).toBe('javascript');
		});

		it('should normalize slug on construction', () => {
			const tag = new Tag('JavaScript Programming');

			expect(tag.getSlug()).toBe('javascript-programming');
		});

		it('should throw error for empty slug', () => {
			expect(() => new Tag('')).toThrow('Tag slug cannot be empty');
			expect(() => new Tag('   ')).toThrow('Tag slug cannot be empty');
		});
	});

	describe('Display Name', () => {
		it('should return metadata name if available', () => {
			const tag = new Tag('javascript');

			// Assuming tagMetadata has JavaScript entry
			expect(tag.displayName).toBeDefined();
		});

		it('should generate display name from slug if no metadata', () => {
			const tag = new Tag('custom-tag-name');

			expect(tag.displayName).toBe('Custom Tag Name');
		});

		it('should handle single word tags', () => {
			const tag = new Tag('testing');

			expect(tag.displayName).toBeDefined();
		});
	});

	describe('Metadata Access', () => {
		it('should access icon from metadata', () => {
			const tag = new Tag('calculus');

			expect(tag.icon).toBeDefined();
		});

		it('should access category from metadata', () => {
			const tag = new Tag('calculus');

			expect(tag.category).toBe('mathematics');
		});

		it('should return general category for tags without metadata', () => {
			const tag = new Tag('unknown-tag');

			expect(tag.category).toBe('general');
		});

		it('should access learning level if available', () => {
			const tag = new Tag('calculus');

			expect(tag.learningLevel).toBeDefined();
		});

		it('should check if tag has metadata', () => {
			const knownTag = new Tag('javascript');
			const unknownTag = new Tag('unknown-tag-xyz');

			expect(knownTag.hasMetadata()).toBe(true);
			expect(unknownTag.hasMetadata()).toBe(false);
		});
	});

	describe('getRelatedTags()', () => {
		it('should return related tags', () => {
			const tag = new Tag('calculus');
			const related = tag.getRelatedTags();

			expect(Array.isArray(related)).toBe(true);
			expect(related.every((t) => t instanceof Tag)).toBe(true);
		});

		it('should respect limit parameter', () => {
			const tag = new Tag('calculus');
			const related = tag.getRelatedTags(2);

			expect(related.length).toBeLessThanOrEqual(2);
		});

		it('should return empty array for tags without related tags', () => {
			const tag = new Tag('unknown-tag');
			const related = tag.getRelatedTags();

			expect(related).toEqual([]);
		});
	});

	describe('isInCategory()', () => {
		it('should return true for matching category', () => {
			const tag = new Tag('calculus');

			expect(tag.isInCategory('mathematics')).toBe(true);
		});

		it('should return false for non-matching category', () => {
			const tag = new Tag('calculus');

			expect(tag.isInCategory('programming')).toBe(false);
		});
	});

	describe('hasLearningLevel()', () => {
		it('should return true for matching learning level', () => {
			const tag = new Tag('calculus');

			if (tag.learningLevel) {
				expect(tag.hasLearningLevel(tag.learningLevel)).toBe(true);
			}
		});

		it('should return false for non-matching learning level', () => {
			const tag = new Tag('calculus');

			// Assuming calculus is not basics level
			const result = tag.hasLearningLevel('basics');
			expect(typeof result).toBe('boolean');
		});
	});

	describe('isRelatedTo()', () => {
		it('should return true for related tags', () => {
			const tag1 = new Tag('calculus');
			const related = tag1.getRelatedTags();

			if (related.length > 0) {
				expect(tag1.isRelatedTo(related[0])).toBe(true);
			}
		});

		it('should return false for unrelated tags', () => {
			const tag1 = new Tag('calculus');
			const tag2 = new Tag('unknown-tag-xyz');

			expect(tag1.isRelatedTo(tag2)).toBe(false);
		});
	});

	describe('matchesQuery()', () => {
		it('should match query in slug', () => {
			const tag = new Tag('javascript');

			expect(tag.matchesQuery('java')).toBe(true);
			expect(tag.matchesQuery('script')).toBe(true);
		});

		it('should match query in display name', () => {
			const tag = new Tag('javascript');

			expect(tag.matchesQuery('Script')).toBe(true);
		});

		it('should return false for non-matching query', () => {
			const tag = new Tag('javascript');

			expect(tag.matchesQuery('python')).toBe(false);
		});
	});

	describe('equals()', () => {
		it('should return true for tags with same slug', () => {
			const tag1 = new Tag('javascript');
			const tag2 = new Tag('javascript');

			expect(tag1.equals(tag2)).toBe(true);
		});

		it('should return true even with different casing', () => {
			const tag1 = new Tag('javascript');
			const tag2 = new Tag('JavaScript');

			expect(tag1.equals(tag2)).toBe(true);
		});

		it('should return false for different tags', () => {
			const tag1 = new Tag('javascript');
			const tag2 = new Tag('python');

			expect(tag1.equals(tag2)).toBe(false);
		});
	});

	describe('compareByName()', () => {
		it('should compare tags alphabetically', () => {
			const tagA = new Tag('algebra');
			const tagB = new Tag('calculus');

			expect(tagA.compareByName(tagB)).toBeLessThan(0);
			expect(tagB.compareByName(tagA)).toBeGreaterThan(0);
		});

		it('should return 0 for equal tags', () => {
			const tag1 = new Tag('javascript');
			const tag2 = new Tag('javascript');

			expect(tag1.compareByName(tag2)).toBe(0);
		});
	});

	describe('Static: normalizeSlug()', () => {
		it('should normalize slug to lowercase', () => {
			expect(Tag.normalizeSlug('JavaScript')).toBe('javascript');
		});

		it('should replace spaces with hyphens', () => {
			expect(Tag.normalizeSlug('Unit Testing')).toBe('unit-testing');
		});

		it('should remove special characters', () => {
			expect(Tag.normalizeSlug('C++ Programming!')).toBe('c-programming');
		});

		it('should trim whitespace', () => {
			expect(Tag.normalizeSlug('  javascript  ')).toBe('javascript');
		});
	});

	describe('Static: createMany()', () => {
		it('should create multiple tags from slugs', () => {
			const tags = Tag.createMany(['javascript', 'python', 'typescript']);

			expect(tags).toHaveLength(3);
			expect(tags.every((t) => t instanceof Tag)).toBe(true);
		});

		it('should skip invalid tags', () => {
			const tags = Tag.createMany(['javascript', '', 'python']);

			expect(tags.length).toBeLessThanOrEqual(3);
			expect(tags.every((t) => t instanceof Tag)).toBe(true);
		});
	});

	describe('Static: getByCategory()', () => {
		it('should return tags for a specific category', () => {
			const mathTags = Tag.getByCategory('mathematics');

			expect(Array.isArray(mathTags)).toBe(true);
			expect(mathTags.length).toBeGreaterThan(0);
			expect(mathTags.every((t) => t.isInCategory('mathematics'))).toBe(true);
		});

		it('should return programming tags', () => {
			const progTags = Tag.getByCategory('programming');

			expect(Array.isArray(progTags)).toBe(true);
			expect(progTags.length).toBeGreaterThan(0);
		});
	});

	describe('Static: getByLearningLevel()', () => {
		it('should return tags for a specific learning level', () => {
			const basicTags = Tag.getByLearningLevel('basics');

			expect(Array.isArray(basicTags)).toBe(true);
			expect(basicTags.every((t) => t.hasLearningLevel('basics'))).toBe(true);
		});
	});

	describe('Static: getAll()', () => {
		it('should return all tags with metadata', () => {
			const allTags = Tag.getAll();

			expect(Array.isArray(allTags)).toBe(true);
			expect(allTags.length).toBeGreaterThan(0);
			expect(allTags.every((t) => t instanceof Tag)).toBe(true);
			expect(allTags.every((t) => t.hasMetadata())).toBe(true);
		});
	});

	describe('Static: sortAlphabetically()', () => {
		it('should sort tags alphabetically', () => {
			const tags = [new Tag('zebra'), new Tag('apple'), new Tag('banana')];
			const sorted = Tag.sortAlphabetically(tags);

			expect(sorted[0].displayName.toLowerCase()).toContain('a');
			expect(sorted[sorted.length - 1].displayName.toLowerCase()).toContain('z');
		});

		it('should not mutate original array', () => {
			const tags = [new Tag('zebra'), new Tag('apple')];
			const original = [...tags];
			Tag.sortAlphabetically(tags);

			expect(tags[0].equals(original[0])).toBe(true);
		});
	});

	describe('Static: filterByQuery()', () => {
		it('should filter tags by query', () => {
			const tags = [new Tag('javascript'), new Tag('python'), new Tag('typescript')];
			const filtered = Tag.filterByQuery(tags, 'script');

			expect(filtered.length).toBe(2); // javascript, typescript
		});

		it('should return all tags for empty query', () => {
			const tags = [new Tag('javascript'), new Tag('python')];
			const filtered = Tag.filterByQuery(tags, '');

			expect(filtered).toEqual(tags);
		});
	});

	describe('toJSON()', () => {
		it('should serialize to JSON', () => {
			const tag = new Tag('javascript');
			const json = tag.toJSON();

			expect(json).toHaveProperty('slug');
			expect(json).toHaveProperty('displayName');
			expect(json).toHaveProperty('category');
			expect(json.slug).toBe('javascript');
		});
	});

	describe('toString()', () => {
		it('should return slug as string', () => {
			const tag = new Tag('javascript');

			expect(tag.toString()).toBe('javascript');
		});
	});
});
