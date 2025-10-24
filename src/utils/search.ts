import Fuse from 'fuse.js';
import type { CollectionEntry } from 'astro:content';
import type { Language } from '../i18n';

export interface SearchablePost {
	id: string;
	title: string;
	description: string;
	content: string;
	category?: string;
	tags?: string[];
	difficulty?: string;
	pubDate: Date;
	slug: string;
	language: Language;
}

/**
 * Converts a blog post to a searchable format
 */
export function postToSearchable(
	post: CollectionEntry<'blog-en'> | CollectionEntry<'blog-id'>,
	lang: Language
): SearchablePost {
	// Extract plain text from the body (remove markdown formatting)
	const content = post.body || '';

	return {
		id: post.id,
		title: post.data.title,
		description: post.data.description || '',
		content: content,
		category: post.data.category,
		tags: post.data.tags || [],
		difficulty: post.data.difficulty,
		pubDate: post.data.pubDate,
		slug: post.id,
		language: lang,
	};
}

/**
 * Fuse.js search options for optimal results
 */
export const fuseOptions: Fuse.IFuseOptions<SearchablePost> = {
	keys: [
		{ name: 'title', weight: 0.4 },
		{ name: 'description', weight: 0.3 },
		{ name: 'tags', weight: 0.2 },
		{ name: 'category', weight: 0.15 },
		{ name: 'content', weight: 0.1 },
	],
	threshold: 0.4, // Lower = more strict matching
	minMatchCharLength: 2,
	includeScore: true,
	includeMatches: true,
	ignoreLocation: true, // Search entire string, not just beginning
	useExtendedSearch: false,
};

/**
 * Create a search index from posts
 */
export function createSearchIndex(posts: SearchablePost[]): Fuse<SearchablePost> {
	return new Fuse(posts, fuseOptions);
}

/**
 * Search through posts with Fuse.js
 */
export function searchPosts(
	searchIndex: Fuse<SearchablePost>,
	query: string,
	limit: number = 20
): Fuse.FuseResult<SearchablePost>[] {
	if (!query || query.trim().length < 2) {
		return [];
	}

	return searchIndex.search(query, { limit });
}

/**
 * Get search suggestions/autocomplete results
 */
export function getSearchSuggestions(
	searchIndex: Fuse<SearchablePost>,
	query: string,
	limit: number = 5
): string[] {
	if (!query || query.trim().length < 2) {
		return [];
	}

	const results = searchIndex.search(query, { limit });

	// Extract unique titles as suggestions
	return [...new Set(results.map(result => result.item.title))].slice(0, limit);
}
