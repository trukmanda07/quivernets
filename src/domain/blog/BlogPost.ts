/**
 * BlogPost Domain Model
 *
 * Rich domain model for blog posts that encapsulates behavior and validation.
 * Replaces the anemic data structures with a proper object-oriented approach.
 */

import type { CollectionEntry } from 'astro:content';

/**
 * BlogPost domain class with behavior and validation.
 *
 * This class wraps the Astro CollectionEntry and provides:
 * - Business logic methods (isPublished, isFeatured, etc.)
 * - Tag operations (hasTag, sharesTagsWith, etc.)
 * - Validation in constructor
 * - Encapsulated behavior
 *
 * @example
 * const post = new BlogPost(astroPost);
 * if (post.isPublished() && post.hasTag('typescript')) {
 *   console.log(post.title);
 * }
 */
export class BlogPost {
	private readonly entry: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>;

	constructor(entry: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>) {
		this.validateEntry(entry);
		this.entry = entry;
	}

	/**
	 * Validate the blog post entry on construction.
	 * Throws error if entry is invalid.
	 */
	private validateEntry(entry: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>): void {
		if (!entry) {
			throw new Error('BlogPost entry cannot be null or undefined');
		}

		if (!entry.data) {
			throw new Error('BlogPost entry must have data property');
		}

		if (!entry.data.title || entry.data.title.trim() === '') {
			throw new Error('BlogPost must have a non-empty title');
		}

		// ID validation (slug is derived from id)
		if (!entry.id || entry.id.trim() === '') {
			throw new Error('BlogPost must have a non-empty id');
		}

		if (!entry.data.pubDate) {
			throw new Error('BlogPost must have a publication date');
		}
	}

	// ===== Accessors =====

	/**
	 * Get the blog post title
	 */
	get title(): string {
		return this.entry.data.title;
	}

	/**
	 * Get the blog post slug
	 */
	get slug(): string {
		// Astro provides slug at runtime, but it's not in the type definition
		// Slug is derived from id by removing the file extension
		return (this.entry as any).slug || this.entry.id.replace(/\.mdx?$/, '');
	}

	/**
	 * Get the blog post description
	 */
	get description(): string {
		return this.entry.data.description || '';
	}

	/**
	 * Get the publication date
	 */
	get pubDate(): Date {
		return this.entry.data.pubDate instanceof Date
			? this.entry.data.pubDate
			: new Date(this.entry.data.pubDate);
	}

	/**
	 * Get the update date (if exists)
	 */
	get updatedDate(): Date | undefined {
		const updated = this.entry.data.updatedDate;
		if (!updated) return undefined;
		return updated instanceof Date ? updated : new Date(updated);
	}

	/**
	 * Get the hero image URL
	 */
	get heroImage(): string | undefined {
		return this.entry.data.heroImage;
	}

	/**
	 * Get the category
	 */
	get category(): string | undefined {
		return this.entry.data.category;
	}

	/**
	 * Get the difficulty level
	 */
	get difficulty(): 'beginner' | 'intermediate' | 'advanced' | undefined {
		return this.entry.data.difficulty;
	}

	/**
	 * Get the tags array
	 */
	get tags(): string[] {
		return this.entry.data.tags || [];
	}

	/**
	 * Get the normalized tags (lowercase with hyphens)
	 */
	get normalizedTags(): string[] {
		return this.tags.map((tag) => tag.toLowerCase().replace(/\s+/g, '-'));
	}

	/**
	 * Get the draft status
	 */
	get isDraft(): boolean {
		return this.entry.data.draft === true;
	}

	/**
	 * Get the underlying Astro entry (for compatibility)
	 */
	getEntry(): CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'> {
		return this.entry;
	}

	/**
	 * Get the collection name (language)
	 */
	get collection(): 'blog-en' | 'blog-id' {
		return this.entry.collection;
	}

	/**
	 * Get the language code
	 */
	get language(): 'en' | 'id' {
		return this.entry.collection === 'blog-en' ? 'en' : 'id';
	}

	// ===== Behavior Methods =====

	/**
	 * Check if the post is published (not a draft)
	 */
	isPublished(): boolean {
		return !this.isDraft;
	}

	/**
	 * Check if the post is featured
	 */
	isFeatured(): boolean {
		return this.entry.data.featured === true;
	}

	/**
	 * Check if the post has a specific tag (case-insensitive)
	 *
	 * @param tag - Tag name to check
	 * @returns True if post has the tag
	 */
	hasTag(tag: string): boolean {
		const normalizedTag = tag.toLowerCase().replace(/\s+/g, '-');
		return this.normalizedTags.includes(normalizedTag);
	}

	/**
	 * Check if the post has all the specified tags (AND logic)
	 *
	 * @param tags - Array of tag names to check
	 * @returns True if post has all the tags
	 */
	hasAllTags(tags: string[]): boolean {
		return tags.every((tag) => this.hasTag(tag));
	}

	/**
	 * Check if the post has any of the specified tags (OR logic)
	 *
	 * @param tags - Array of tag names to check
	 * @returns True if post has at least one of the tags
	 */
	hasAnyTag(tags: string[]): boolean {
		return tags.some((tag) => this.hasTag(tag));
	}

	/**
	 * Count how many tags this post shares with another post
	 *
	 * @param other - Another blog post
	 * @returns Number of shared tags
	 */
	countSharedTags(other: BlogPost): number {
		const otherTags = new Set(other.normalizedTags);
		return this.normalizedTags.filter((tag) => otherTags.has(tag)).length;
	}

	/**
	 * Check if this post shares any tags with another post
	 *
	 * @param other - Another blog post
	 * @returns True if posts share at least one tag
	 */
	sharesTagsWith(other: BlogPost): boolean {
		return this.countSharedTags(other) > 0;
	}

	/**
	 * Get the list of tags shared with another post
	 *
	 * @param other - Another blog post
	 * @returns Array of shared tags
	 */
	getSharedTags(other: BlogPost): string[] {
		const otherTags = new Set(other.normalizedTags);
		return this.normalizedTags.filter((tag) => otherTags.has(tag));
	}

	/**
	 * Check if the post is in a specific category
	 *
	 * @param category - Category name
	 * @returns True if post is in the category
	 */
	isInCategory(category: string): boolean {
		return this.category?.toLowerCase() === category.toLowerCase();
	}

	/**
	 * Check if the post matches a difficulty level
	 *
	 * @param difficulty - Difficulty level
	 * @returns True if post matches the difficulty
	 */
	hasDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): boolean {
		return this.difficulty === difficulty;
	}

	/**
	 * Check if the post was published within the last N days
	 *
	 * @param days - Number of days
	 * @returns True if post is recent
	 */
	isPublishedWithinDays(days: number): boolean {
		const daysAgo = new Date();
		daysAgo.setDate(daysAgo.getDate() - days);
		return this.pubDate >= daysAgo;
	}

	/**
	 * Check if the post has been updated since publication
	 */
	hasBeenUpdated(): boolean {
		return this.updatedDate !== undefined && this.updatedDate > this.pubDate;
	}

	/**
	 * Get the most recent date (updated or published)
	 */
	getMostRecentDate(): Date {
		return this.hasBeenUpdated() ? this.updatedDate! : this.pubDate;
	}

	/**
	 * Check if the post matches a search query
	 * Searches in title, description, and tags
	 *
	 * @param query - Search query string
	 * @returns True if post matches the query
	 */
	matchesSearchQuery(query: string): boolean {
		const lowerQuery = query.toLowerCase().trim();
		if (!lowerQuery) return true;

		return (
			this.title.toLowerCase().includes(lowerQuery) ||
			this.description.toLowerCase().includes(lowerQuery) ||
			this.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
		);
	}

	/**
	 * Convert to a plain object (for serialization)
	 */
	toJSON() {
		return {
			slug: this.slug,
			title: this.title,
			description: this.description,
			pubDate: this.pubDate,
			updatedDate: this.updatedDate,
			heroImage: this.heroImage,
			category: this.category,
			difficulty: this.difficulty,
			tags: this.tags,
			isDraft: this.isDraft,
			language: this.language,
		};
	}

	/**
	 * String representation
	 */
	toString(): string {
		return `BlogPost(${this.slug}, ${this.title})`;
	}

	// ===== Static Factory Methods =====

	/**
	 * Create a BlogPost from an Astro collection entry
	 */
	static fromEntry(entry: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>): BlogPost {
		return new BlogPost(entry);
	}

	/**
	 * Create multiple BlogPost instances from entries
	 */
	static fromEntries(
		entries: Array<CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>>,
	): BlogPost[] {
		return entries.map((entry) => new BlogPost(entry));
	}
}
