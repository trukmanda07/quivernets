/**
 * Blog Post Service
 *
 * Centralized service layer for blog post operations.
 * Handles filtering, sorting, and querying logic that was previously
 * duplicated across multiple pages.
 *
 * Phase 4: Now uses rich domain models (BlogPost) instead of anemic data structures.
 * The service delegates business logic to domain model methods where appropriate.
 */

import { BlogPost } from '../domain/blog/BlogPost';
import { BlogPostRepository, type Language } from '../repositories/BlogPostRepository';

/**
 * Filter options for blog posts
 */
export interface BlogPostFilters {
	/**
	 * Filter by category
	 */
	category?: string;

	/**
	 * Filter by difficulty level
	 */
	difficulty?: 'beginner' | 'intermediate' | 'advanced';

	/**
	 * Filter by tags (AND logic - post must have all tags)
	 */
	tags?: string[];

	/**
	 * Exclude draft posts (default: false)
	 */
	excludeDrafts?: boolean;
}

/**
 * Sort options for blog posts
 */
export type SortOrder = 'latest' | 'oldest' | 'title-asc' | 'title-desc';

/**
 * Options for finding posts
 */
export interface FindOptions {
	/**
	 * Sort order (default: 'latest')
	 */
	sort?: SortOrder;

	/**
	 * Maximum number of posts to return
	 */
	limit?: number;
}

/**
 * Service for blog post operations.
 * Centralizes filtering, sorting, and querying logic.
 *
 * @example
 * // Get recent posts
 * const posts = await BlogPostService.getRecent('en', 5);
 *
 * @example
 * // Find posts with filters
 * const posts = await BlogPostService.find('en', {
 *   category: 'ml',
 *   difficulty: 'beginner',
 *   tags: ['python', 'scikit-learn']
 * }, {
 *   sort: 'latest',
 *   limit: 10
 * });
 */
export class BlogPostService {
	/**
	 * Get all posts for a language (respecting cache).
	 * Posts are sorted by publication date (latest first).
	 *
	 * @param language - Language code ('en' or 'id')
	 * @returns Array of BlogPost domain models
	 */
	static async getAll(language: Language): Promise<BlogPost[]> {
		const posts = await BlogPostRepository.findAll(language);
		// Sort by date (latest first) by default
		return posts.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
	}

	/**
	 * Get a single post by slug.
	 *
	 * @param slug - Post slug
	 * @param language - Language code
	 * @returns BlogPost domain model or null if not found
	 */
	static async getBySlug(slug: string, language: Language): Promise<BlogPost | null> {
		return BlogPostRepository.findBySlug(slug, language);
	}

	/**
	 * Find posts with filters and options.
	 *
	 * @param language - Language code
	 * @param filters - Filter criteria
	 * @param options - Sort and limit options
	 * @returns Filtered and sorted array of blog posts
	 *
	 * @example
	 * const posts = await BlogPostService.find('en', {
	 *   category: 'ml',
	 *   excludeDrafts: true
	 * }, {
	 *   sort: 'latest',
	 *   limit: 10
	 * });
	 */
	static async find(
		language: Language,
		filters?: BlogPostFilters,
		options?: FindOptions,
	): Promise<BlogPost[]> {
		let posts = await this.getAll(language);

		// Apply filters
		if (filters) {
			posts = this.applyFilters(posts, filters);
		}

		// Sort
		if (options?.sort) {
			posts = this.sortPosts(posts, options.sort);
		}

		// Limit
		if (options?.limit && options.limit > 0) {
			posts = posts.slice(0, options.limit);
		}

		return posts;
	}

	/**
	 * Get recent posts (non-draft, sorted by latest).
	 *
	 * @param language - Language code
	 * @param limit - Maximum number of posts (default: 10)
	 * @returns Recent blog posts
	 */
	static async getRecent(language: Language, limit: number = 10): Promise<BlogPost[]> {
		return this.find(language, { excludeDrafts: true }, { sort: 'latest', limit });
	}

	/**
	 * Search posts by keyword in title, description, or tags.
	 *
	 * @param query - Search query
	 * @param language - Language code
	 * @returns Posts matching the query
	 */
	static async search(query: string, language: Language): Promise<BlogPost[]> {
		const posts = await this.getAll(language);

		if (!query.trim()) {
			return posts;
		}

		// Delegate to domain model method
		return posts.filter((post) => post.matchesSearchQuery(query));
	}

	/**
	 * Get posts by category.
	 *
	 * @param category - Category name
	 * @param language - Language code
	 * @param options - Sort and limit options
	 * @returns Posts in the category
	 */
	static async getByCategory(
		category: string,
		language: Language,
		options?: FindOptions,
	): Promise<BlogPost[]> {
		return this.find(language, { category, excludeDrafts: true }, options);
	}

	/**
	 * Get posts by difficulty level.
	 *
	 * @param difficulty - Difficulty level
	 * @param language - Language code
	 * @param options - Sort and limit options
	 * @returns Posts at the difficulty level
	 */
	static async getByDifficulty(
		difficulty: 'beginner' | 'intermediate' | 'advanced',
		language: Language,
		options?: FindOptions,
	): Promise<BlogPost[]> {
		return this.find(language, { difficulty, excludeDrafts: true }, options);
	}

	/**
	 * Get posts by tags (AND logic - post must have all tags).
	 *
	 * @param tags - Array of tag names
	 * @param language - Language code
	 * @param options - Sort and limit options
	 * @returns Posts with all the tags
	 */
	static async getByTags(
		tags: string[],
		language: Language,
		options?: FindOptions,
	): Promise<BlogPost[]> {
		return this.find(language, { tags, excludeDrafts: true }, options);
	}

	/**
	 * Apply filters to posts.
	 * Now delegates to domain model methods where appropriate.
	 *
	 * @param posts - Array of posts to filter
	 * @param filters - Filter criteria
	 * @returns Filtered array
	 */
	private static applyFilters(posts: BlogPost[], filters: BlogPostFilters): BlogPost[] {
		let filtered = posts;

		// Category filter - delegate to domain model
		if (filters.category) {
			filtered = filtered.filter((p) => p.isInCategory(filters.category!));
		}

		// Difficulty filter - delegate to domain model
		if (filters.difficulty) {
			filtered = filtered.filter((p) => p.hasDifficulty(filters.difficulty!));
		}

		// Tags filter (AND logic - must have all tags) - delegate to domain model
		if (filters.tags && filters.tags.length > 0) {
			filtered = filtered.filter((p) => p.hasAllTags(filters.tags!));
		}

		// Draft filter - delegate to domain model
		if (filters.excludeDrafts) {
			filtered = filtered.filter((p) => p.isPublished());
		}

		return filtered;
	}

	/**
	 * Sort posts according to specified order.
	 * Now uses domain model properties.
	 *
	 * @param posts - Array of posts to sort
	 * @param sortOrder - Sort order
	 * @returns Sorted array (does not mutate original)
	 */
	private static sortPosts(posts: BlogPost[], sortOrder: SortOrder): BlogPost[] {
		const sorted = [...posts];

		switch (sortOrder) {
			case 'latest':
				return sorted.sort((a, b) => b.pubDate.valueOf() - a.pubDate.valueOf());
			case 'oldest':
				return sorted.sort((a, b) => a.pubDate.valueOf() - b.pubDate.valueOf());
			case 'title-asc':
				return sorted.sort((a, b) => a.title.localeCompare(b.title));
			case 'title-desc':
				return sorted.sort((a, b) => b.title.localeCompare(a.title));
			default:
				return sorted;
		}
	}
}
