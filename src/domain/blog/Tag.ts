/**
 * Tag Domain Model
 *
 * Rich domain model for tags that encapsulates behavior and validation.
 * Replaces the procedural tagHelpers functions with proper OOP approach.
 */

import {
	tagMetadata,
	type TagCategory,
	type LearningLevel,
	type TagMetadata,
} from '../../data/tagMetadata';

/**
 * Tag domain class with behavior and validation.
 *
 * This class provides:
 * - Tag metadata access (display name, icon, category, etc.)
 * - Tag validation (slug normalization)
 * - Related tags discovery
 * - Equality and comparison methods
 *
 * @example
 * const tag = new Tag('javascript');
 * console.log(tag.displayName); // "JavaScript"
 * console.log(tag.icon); // "🟨"
 * console.log(tag.category); // "programming"
 *
 * @example
 * const relatedTags = tag.getRelatedTags();
 * console.log(relatedTags.map(t => t.displayName));
 */
export class Tag {
	private readonly slug: string;
	private readonly metadata: TagMetadata | undefined;

	/**
	 * Create a Tag instance
	 *
	 * @param slug - Tag slug (will be normalized)
	 * @throws Error if slug is empty after normalization
	 */
	constructor(slug: string) {
		this.slug = Tag.normalizeSlug(slug);

		if (!this.slug) {
			throw new Error('Tag slug cannot be empty');
		}

		this.metadata = this.lookupMetadata();
	}

	/**
	 * Look up metadata for this tag
	 */
	private lookupMetadata(): TagMetadata | undefined {
		// Direct lookup
		if (tagMetadata[this.slug]) {
			return tagMetadata[this.slug];
		}

		// Check aliases
		for (const metadata of Object.values(tagMetadata)) {
			if (metadata.aliases?.includes(this.slug)) {
				return metadata;
			}
		}

		return undefined;
	}

	// ===== Accessors =====

	/**
	 * Get the normalized slug
	 */
	getSlug(): string {
		return this.slug;
	}

	/**
	 * Get the display name (with proper capitalization)
	 */
	get displayName(): string {
		if (this.metadata) {
			return this.metadata.name;
		}

		// Generate display name from slug
		return this.slug
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	/**
	 * Get the tag icon (if available)
	 */
	get icon(): string | undefined {
		return this.metadata?.icon;
	}

	/**
	 * Get the tag color (if available)
	 */
	get color(): string | undefined {
		return this.metadata?.color;
	}

	/**
	 * Get the tag description (if available)
	 */
	get description(): string | undefined {
		return this.metadata?.description;
	}

	/**
	 * Get the tag category
	 */
	get category(): TagCategory {
		return this.metadata?.category || 'general';
	}

	/**
	 * Get the learning level (if available)
	 */
	get learningLevel(): LearningLevel | undefined {
		return this.metadata?.learningPath;
	}

	/**
	 * Check if tag has metadata
	 */
	hasMetadata(): boolean {
		return this.metadata !== undefined;
	}

	// ===== Behavior Methods =====

	/**
	 * Get related tags
	 *
	 * @param limit - Maximum number of related tags to return
	 * @returns Array of related Tag instances
	 */
	getRelatedTags(limit: number = 5): Tag[] {
		if (!this.metadata || !this.metadata.relatedTags) {
			return [];
		}

		return this.metadata.relatedTags
			.slice(0, limit)
			.map((slug) => {
				try {
					return new Tag(slug);
				} catch {
					return null;
				}
			})
			.filter((tag): tag is Tag => tag !== null);
	}

	/**
	 * Check if this tag is in a specific category
	 *
	 * @param category - Category to check
	 * @returns True if tag is in the category
	 */
	isInCategory(category: TagCategory): boolean {
		return this.category === category;
	}

	/**
	 * Check if this tag has a specific learning level
	 *
	 * @param level - Learning level to check
	 * @returns True if tag matches the level
	 */
	hasLearningLevel(level: LearningLevel): boolean {
		return this.learningLevel === level;
	}

	/**
	 * Check if this tag is related to another tag
	 *
	 * @param other - Another tag
	 * @returns True if tags are related
	 */
	isRelatedTo(other: Tag): boolean {
		if (!this.metadata?.relatedTags) {
			return false;
		}

		return this.metadata.relatedTags.includes(other.slug);
	}

	/**
	 * Check if this tag matches an alias
	 *
	 * @param alias - Alias to check
	 * @returns True if this tag has the alias
	 */
	hasAlias(alias: string): boolean {
		if (!this.metadata?.aliases) {
			return false;
		}

		const normalizedAlias = Tag.normalizeSlug(alias);
		return this.metadata.aliases.includes(normalizedAlias);
	}

	/**
	 * Check if this tag matches a search query
	 *
	 * @param query - Search query
	 * @returns True if tag matches the query
	 */
	matchesQuery(query: string): boolean {
		const lowerQuery = query.toLowerCase();

		// Check slug
		if (this.slug.includes(lowerQuery)) {
			return true;
		}

		// Check display name
		if (this.displayName.toLowerCase().includes(lowerQuery)) {
			return true;
		}

		// Check description
		if (this.description?.toLowerCase().includes(lowerQuery)) {
			return true;
		}

		// Check aliases
		if (this.metadata?.aliases?.some((alias) => alias.includes(lowerQuery))) {
			return true;
		}

		return false;
	}

	// ===== Comparison Methods =====

	/**
	 * Check equality with another tag
	 *
	 * @param other - Another tag
	 * @returns True if tags have the same slug
	 */
	equals(other: Tag): boolean {
		return this.slug === other.slug;
	}

	/**
	 * Compare tags alphabetically
	 *
	 * @param other - Another tag
	 * @returns Comparison result (-1, 0, 1)
	 */
	compareByName(other: Tag): number {
		return this.displayName.localeCompare(other.displayName);
	}

	/**
	 * Convert to string (returns slug)
	 */
	toString(): string {
		return this.slug;
	}

	/**
	 * Convert to JSON representation
	 */
	toJSON() {
		return {
			slug: this.slug,
			displayName: this.displayName,
			icon: this.icon,
			color: this.color,
			description: this.description,
			category: this.category,
			learningLevel: this.learningLevel,
		};
	}

	// ===== Static Methods =====

	/**
	 * Normalize a tag slug
	 *
	 * @param slug - Tag slug to normalize
	 * @returns Normalized slug
	 */
	static normalizeSlug(slug: string): string {
		return slug
			.toLowerCase()
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^\w-]/g, '');
	}

	/**
	 * Create a Tag from a string (factory method)
	 *
	 * @param slug - Tag slug
	 * @returns Tag instance
	 */
	static create(slug: string): Tag {
		return new Tag(slug);
	}

	/**
	 * Create multiple Tag instances from slugs
	 *
	 * @param slugs - Array of tag slugs
	 * @returns Array of Tag instances
	 */
	static createMany(slugs: string[]): Tag[] {
		return slugs
			.map((slug) => {
				try {
					return new Tag(slug);
				} catch {
					return null;
				}
			})
			.filter((tag): tag is Tag => tag !== null);
	}

	/**
	 * Get all tags for a specific category
	 *
	 * @param category - Category to filter by
	 * @returns Array of Tag instances
	 */
	static getByCategory(category: TagCategory): Tag[] {
		return Object.keys(tagMetadata)
			.filter((slug) => tagMetadata[slug].category === category)
			.map((slug) => new Tag(slug));
	}

	/**
	 * Get all tags for a specific learning level
	 *
	 * @param level - Learning level to filter by
	 * @returns Array of Tag instances
	 */
	static getByLearningLevel(level: LearningLevel): Tag[] {
		return Object.keys(tagMetadata)
			.filter((slug) => tagMetadata[slug].learningPath === level)
			.map((slug) => new Tag(slug));
	}

	/**
	 * Get all available tags
	 *
	 * @returns Array of all Tag instances with metadata
	 */
	static getAll(): Tag[] {
		return Object.keys(tagMetadata).map((slug) => new Tag(slug));
	}

	/**
	 * Sort tags alphabetically
	 *
	 * @param tags - Array of tags to sort
	 * @returns Sorted array
	 */
	static sortAlphabetically(tags: Tag[]): Tag[] {
		return [...tags].sort((a, b) => a.compareByName(b));
	}

	/**
	 * Filter tags by search query
	 *
	 * @param tags - Array of tags to filter
	 * @param query - Search query
	 * @returns Filtered array
	 */
	static filterByQuery(tags: Tag[], query: string): Tag[] {
		if (!query.trim()) {
			return tags;
		}

		return tags.filter((tag) => tag.matchesQuery(query));
	}
}
