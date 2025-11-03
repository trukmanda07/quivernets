import { describe, it, expect } from 'vitest';
import { TagService } from './tagService';
import type { CollectionEntry } from 'astro:content';

describe('TagService', () => {
	describe('normalizeSlug', () => {
		it('should convert to lowercase', () => {
			expect(TagService.normalizeSlug('Linear Algebra')).toBe('linear-algebra');
		});

		it('should replace spaces with hyphens', () => {
			expect(TagService.normalizeSlug('Machine Learning')).toBe('machine-learning');
		});

		it('should handle C++', () => {
			expect(TagService.normalizeSlug('C++')).toBe('cpp');
		});

		it('should remove special characters', () => {
			expect(TagService.normalizeSlug('TypeScript (Advanced)')).toBe('typescript-advanced');
		});

		it('should trim and collapse hyphens', () => {
			expect(TagService.normalizeSlug('  Test  -  Tag  ')).toBe('test-tag');
		});

		it('should handle edge cases', () => {
			expect(TagService.normalizeSlug('---test---')).toBe('test');
			expect(TagService.normalizeSlug('   ')).toBe('');
			expect(TagService.normalizeSlug('Test@#$%Tag')).toBe('testtag');
		});
	});

	describe('calculateTagCounts', () => {
		const mockPosts = [
			{
				id: 'post-1',
				data: { tags: ['JavaScript', 'TypeScript', 'Web'] },
			},
			{
				id: 'post-2',
				data: { tags: ['JavaScript', 'React'] },
			},
			{
				id: 'post-3',
				data: { tags: ['TypeScript', 'React', 'Web'] },
			},
		] as CollectionEntry<'blog-en'>[];

		it('should count tag occurrences correctly', () => {
			const result = TagService.calculateTagCounts(mockPosts);

			expect(result).toHaveLength(4);

			const jsTag = result.find((t) => t.name === 'JavaScript');
			expect(jsTag?.count).toBe(2);

			const tsTag = result.find((t) => t.name === 'TypeScript');
			expect(tsTag?.count).toBe(2);

			const reactTag = result.find((t) => t.name === 'React');
			expect(reactTag?.count).toBe(2);

			const webTag = result.find((t) => t.name === 'Web');
			expect(webTag?.count).toBe(2);
		});

		it('should sort by count descending by default', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['A'] } },
				{ id: 'p2', data: { tags: ['B'] } },
				{ id: 'p3', data: { tags: ['B'] } },
				{ id: 'p4', data: { tags: ['C'] } },
				{ id: 'p5', data: { tags: ['C'] } },
				{ id: 'p6', data: { tags: ['C'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts);

			expect(result[0].name).toBe('C');
			expect(result[0].count).toBe(3);
			expect(result[1].name).toBe('B');
			expect(result[1].count).toBe(2);
			expect(result[2].name).toBe('A');
			expect(result[2].count).toBe(1);
		});

		it('should filter by minCount', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['A'] } },
				{ id: 'p2', data: { tags: ['B', 'B'] } },
				{ id: 'p3', data: { tags: ['C', 'C', 'C'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts, {
				minCount: 2,
			});

			expect(result).toHaveLength(2);
			expect(result.find((t) => t.name === 'A')).toBeUndefined();
		});

		it('should respect limit option', () => {
			const result = TagService.calculateTagCounts(mockPosts, {
				limit: 2,
			});

			expect(result).toHaveLength(2);
		});

		it('should sort by name ascending', () => {
			const result = TagService.calculateTagCounts(mockPosts, {
				sortBy: 'name-asc',
			});

			expect(result[0].name).toBe('JavaScript');
			expect(result[1].name).toBe('React');
			expect(result[2].name).toBe('TypeScript');
			expect(result[3].name).toBe('Web');
		});

		it('should sort by name descending', () => {
			const result = TagService.calculateTagCounts(mockPosts, {
				sortBy: 'name-desc',
			});

			expect(result[0].name).toBe('Web');
			expect(result[1].name).toBe('TypeScript');
			expect(result[2].name).toBe('React');
			expect(result[3].name).toBe('JavaScript');
		});

		it('should sort by count ascending', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['A'] } },
				{ id: 'p2', data: { tags: ['B'] } },
				{ id: 'p3', data: { tags: ['B'] } },
				{ id: 'p4', data: { tags: ['C'] } },
				{ id: 'p5', data: { tags: ['C'] } },
				{ id: 'p6', data: { tags: ['C'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts, {
				sortBy: 'count-asc',
			});

			expect(result[0].count).toBe(1);
			expect(result[1].count).toBe(2);
			expect(result[2].count).toBe(3);
		});

		it('should handle posts with no tags', () => {
			const posts = [
				{ id: 'p1', data: { tags: undefined } },
				{ id: 'p2', data: { tags: [] } },
			] as any as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts);

			expect(result).toHaveLength(0);
		});

		it('should generate correct slugs for all tags', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['Machine Learning', 'C++'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts);

			const mlTag = result.find((t) => t.name === 'Machine Learning');
			expect(mlTag?.slug).toBe('machine-learning');

			const cppTag = result.find((t) => t.name === 'C++');
			expect(cppTag?.slug).toBe('cpp');
		});

		it('should combine minCount and limit options', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['A'] } },
				{ id: 'p2', data: { tags: ['B'] } },
				{ id: 'p3', data: { tags: ['B'] } },
				{ id: 'p4', data: { tags: ['C'] } },
				{ id: 'p5', data: { tags: ['C'] } },
				{ id: 'p6', data: { tags: ['C'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.calculateTagCounts(posts, {
				minCount: 2,
				limit: 1,
			});

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('C');
		});
	});

	describe('getUniqueTags', () => {
		it('should return unique tags sorted alphabetically', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['JavaScript', 'TypeScript'] } },
				{ id: 'p2', data: { tags: ['JavaScript', 'React'] } },
				{ id: 'p3', data: { tags: ['TypeScript'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.getUniqueTags(posts);

			expect(result).toEqual(['JavaScript', 'React', 'TypeScript']);
		});

		it('should handle posts with no tags', () => {
			const posts = [
				{ id: 'p1', data: { tags: undefined } },
				{ id: 'p2', data: { tags: [] } },
			] as any as CollectionEntry<'blog-en'>[];

			const result = TagService.getUniqueTags(posts);

			expect(result).toHaveLength(0);
		});

		it('should not duplicate tags', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['JavaScript'] } },
				{ id: 'p2', data: { tags: ['JavaScript'] } },
				{ id: 'p3', data: { tags: ['JavaScript'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.getUniqueTags(posts);

			expect(result).toEqual(['JavaScript']);
		});
	});

	describe('getTopTags', () => {
		it('should return top N tags by count', () => {
			const posts = [
				{ id: 'p1', data: { tags: ['A'] } },
				{ id: 'p2', data: { tags: ['A', 'B'] } },
				{ id: 'p3', data: { tags: ['A', 'B', 'C'] } },
				{ id: 'p4', data: { tags: ['A', 'B', 'C', 'D'] } },
			] as CollectionEntry<'blog-en'>[];

			const top2 = TagService.getTopTags(posts, 2);

			expect(top2).toHaveLength(2);
			expect(top2[0].name).toBe('A');
			expect(top2[0].count).toBe(4);
			expect(top2[1].name).toBe('B');
			expect(top2[1].count).toBe(3);
		});

		it('should default to top 10 tags', () => {
			const posts = Array.from({ length: 15 }, (_, i) => ({
				id: `p${i}`,
				data: { tags: [String.fromCharCode(65 + i)] },
			})) as CollectionEntry<'blog-en'>[];

			const result = TagService.getTopTags(posts);

			expect(result).toHaveLength(10);
		});
	});

	describe('getTagsForCategory', () => {
		it('should filter tags by category', () => {
			const posts = [
				{ id: 'p1', data: { category: 'math', tags: ['Calculus'] } },
				{ id: 'p2', data: { category: 'programming', tags: ['JavaScript'] } },
				{ id: 'p3', data: { category: 'math', tags: ['Algebra'] } },
				{ id: 'p4', data: { category: 'math', tags: ['Calculus'] } },
			] as CollectionEntry<'blog-en'>[];

			const mathTags = TagService.getTagsForCategory(posts, 'math');

			expect(mathTags).toHaveLength(2);
			expect(mathTags.map((t) => t.name)).toContain('Calculus');
			expect(mathTags.map((t) => t.name)).toContain('Algebra');
			expect(mathTags.map((t) => t.name)).not.toContain('JavaScript');

			const calculusTag = mathTags.find((t) => t.name === 'Calculus');
			expect(calculusTag?.count).toBe(2);
		});

		it('should support options', () => {
			const posts = [
				{ id: 'p1', data: { category: 'math', tags: ['A'] } },
				{ id: 'p2', data: { category: 'math', tags: ['B', 'B'] } },
				{ id: 'p3', data: { category: 'math', tags: ['C', 'C', 'C'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.getTagsForCategory(posts, 'math', {
				minCount: 2,
				limit: 1,
			});

			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('C');
		});

		it('should return empty array for non-existent category', () => {
			const posts = [
				{ id: 'p1', data: { category: 'math', tags: ['Calculus'] } },
			] as CollectionEntry<'blog-en'>[];

			const result = TagService.getTagsForCategory(posts, 'physics');

			expect(result).toHaveLength(0);
		});
	});
});
