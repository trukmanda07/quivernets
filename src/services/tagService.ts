import type { CollectionEntry } from 'astro:content';

/**
 * Represents a tag with its count across blog posts.
 */
export interface TagCount {
	name: string;
	slug: string;
	count: number;
}

/**
 * Options for tag counting and sorting.
 */
export interface TagCountOptions {
	/**
	 * Minimum count to include tag (default: 1)
	 */
	minCount?: number;

	/**
	 * Sort order (default: 'count-desc')
	 */
	sortBy?: 'count-desc' | 'count-asc' | 'name-asc' | 'name-desc';

	/**
	 * Maximum number of tags to return (default: unlimited)
	 */
	limit?: number;
}

/**
 * Service for tag-related operations.
 * Provides single source of truth for tag counting, normalization, and sorting.
 */
export class TagService {
	/**
	 * Normalize a tag name into a URL-safe slug.
	 *
	 * Examples:
	 *   "Linear Algebra" → "linear-algebra"
	 *   "C++" → "cpp"
	 *   "Machine Learning" → "machine-learning"
	 *
	 * @param tagName - Original tag name
	 * @returns URL-safe slug
	 */
	static normalizeSlug(tagName: string): string {
		return tagName
			.toLowerCase()
			.trim()
			.replace(/\+\+/g, 'pp') // C++ → cpp
			.replace(/\s+/g, '-') // spaces → hyphens
			.replace(/[^\w-]/g, '') // remove non-alphanumeric (except hyphens)
			.replace(/-+/g, '-') // collapse multiple hyphens
			.replace(/^-|-$/g, ''); // trim leading/trailing hyphens
	}

	/**
	 * Calculate tag counts from a collection of blog posts.
	 *
	 * @param posts - Array of blog post entries
	 * @param options - Counting and sorting options
	 * @returns Array of tags with counts, sorted according to options
	 */
	static calculateTagCounts(
		posts: CollectionEntry<'blog-en'>[] | CollectionEntry<'blog-id'>[],
		options: TagCountOptions = {},
	): TagCount[] {
		const { minCount = 1, sortBy = 'count-desc', limit } = options;

		// Count tag occurrences
		const tagCounts = new Map<string, number>();

		posts.forEach((post) => {
			const tags = post.data.tags || [];
			tags.forEach((tag) => {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			});
		});

		// Convert to array of TagCount objects
		let tagCountArray = Array.from(tagCounts.entries())
			.map(([name, count]) => ({
				name,
				slug: this.normalizeSlug(name),
				count,
			}))
			.filter((tag) => tag.count >= minCount);

		// Sort according to options
		tagCountArray = this.sortTags(tagCountArray, sortBy);

		// Apply limit if specified
		if (limit && limit > 0) {
			tagCountArray = tagCountArray.slice(0, limit);
		}

		return tagCountArray;
	}

	/**
	 * Get unique tags from posts (no counting).
	 *
	 * @param posts - Array of blog post entries
	 * @returns Array of unique tag names
	 */
	static getUniqueTags(
		posts: CollectionEntry<'blog-en'>[] | CollectionEntry<'blog-id'>[],
	): string[] {
		const uniqueTags = new Set<string>();

		posts.forEach((post) => {
			const tags = post.data.tags || [];
			tags.forEach((tag) => uniqueTags.add(tag));
		});

		return Array.from(uniqueTags).sort();
	}

	/**
	 * Get all tags that appear in a specific category.
	 *
	 * @param posts - Array of blog post entries
	 * @param category - Category to filter by
	 * @returns Array of tags with counts for that category
	 */
	static getTagsForCategory(
		posts: CollectionEntry<'blog-en'>[] | CollectionEntry<'blog-id'>[],
		category: string,
		options: TagCountOptions = {},
	): TagCount[] {
		const categoryPosts = posts.filter((post) => post.data.category === category);
		return this.calculateTagCounts(categoryPosts, options);
	}

	/**
	 * Get top N most used tags.
	 *
	 * @param posts - Array of blog post entries
	 * @param topN - Number of top tags to return (default: 10)
	 * @returns Array of top N tags by count
	 */
	static getTopTags(
		posts: CollectionEntry<'blog-en'>[] | CollectionEntry<'blog-id'>[],
		topN: number = 10,
	): TagCount[] {
		return this.calculateTagCounts(posts, {
			sortBy: 'count-desc',
			limit: topN,
		});
	}

	/**
	 * Sort tags according to specified order.
	 *
	 * @param tags - Array of tags to sort
	 * @param sortBy - Sort order
	 * @returns Sorted array (does not mutate original)
	 */
	private static sortTags(
		tags: TagCount[],
		sortBy: TagCountOptions['sortBy'],
	): TagCount[] {
		const sorted = [...tags];

		switch (sortBy) {
			case 'count-desc':
				return sorted.sort((a, b) => b.count - a.count);

			case 'count-asc':
				return sorted.sort((a, b) => a.count - b.count);

			case 'name-asc':
				return sorted.sort((a, b) => a.name.localeCompare(b.name));

			case 'name-desc':
				return sorted.sort((a, b) => b.name.localeCompare(a.name));

			default:
				return sorted;
		}
	}
}
