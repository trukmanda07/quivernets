/**
 * Blog Post Repository
 *
 * Repository pattern implementation that acts as an adapter between
 * Astro's content collections and our domain models.
 *
 * This repository:
 * - Fetches data from Astro collections (via cache)
 * - Maps raw data to domain models (BlogPost)
 * - Provides a clean interface for data access
 */

import { BlogPost } from '../domain/blog/BlogPost';
import { getCachedBlogPosts } from '../utils/buildCache';
import type { CollectionEntry } from 'astro:content';

export type Language = 'en' | 'id';

/**
 * Repository for blog posts.
 * Acts as an adapter between Astro data and domain models.
 */
export class BlogPostRepository {
	/**
	 * Get all posts for a language, mapped to domain models.
	 *
	 * @param language - Language code ('en' or 'id')
	 * @returns Array of BlogPost domain models
	 */
	static async findAll(language: Language): Promise<BlogPost[]> {
		const entries = await getCachedBlogPosts(language);
		return this.mapEntriesToDomain(entries);
	}

	/**
	 * Find a post by slug, mapped to domain model.
	 *
	 * @param slug - Post slug
	 * @param language - Language code
	 * @returns BlogPost domain model or null if not found
	 */
	static async findBySlug(slug: string, language: Language): Promise<BlogPost | null> {
		const posts = await this.findAll(language);
		return posts.find((post) => post.slug === slug) ?? null;
	}

	/**
	 * Find posts by category.
	 *
	 * @param category - Category name
	 * @param language - Language code
	 * @returns Array of BlogPost domain models
	 */
	static async findByCategory(category: string, language: Language): Promise<BlogPost[]> {
		const posts = await this.findAll(language);
		return posts.filter((post) => post.isInCategory(category));
	}

	/**
	 * Find posts by tags (posts must have all specified tags).
	 *
	 * @param tags - Array of tag names
	 * @param language - Language code
	 * @returns Array of BlogPost domain models
	 */
	static async findByTags(tags: string[], language: Language): Promise<BlogPost[]> {
		const posts = await this.findAll(language);
		return posts.filter((post) => post.hasAllTags(tags));
	}

	/**
	 * Find published posts (non-drafts).
	 *
	 * @param language - Language code
	 * @returns Array of published BlogPost domain models
	 */
	static async findPublished(language: Language): Promise<BlogPost[]> {
		const posts = await this.findAll(language);
		return posts.filter((post) => post.isPublished());
	}

	/**
	 * Find featured posts.
	 *
	 * @param language - Language code
	 * @returns Array of featured BlogPost domain models
	 */
	static async findFeatured(language: Language): Promise<BlogPost[]> {
		const posts = await this.findAll(language);
		return posts.filter((post) => post.isFeatured());
	}

	/**
	 * Map Astro collection entries to BlogPost domain models.
	 *
	 * @param entries - Array of Astro collection entries
	 * @returns Array of BlogPost domain models
	 */
	private static mapEntriesToDomain(
		entries: Array<CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>>,
	): BlogPost[] {
		return entries.map((entry) => new BlogPost(entry));
	}

	/**
	 * Map a single entry to domain model.
	 *
	 * @param entry - Astro collection entry
	 * @returns BlogPost domain model
	 */
	private static mapEntryToDomain(
		entry: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>,
	): BlogPost {
		return new BlogPost(entry);
	}
}
