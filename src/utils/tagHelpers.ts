/**
 * Tag Helper Utilities
 *
 * Utility functions for working with tags, including metadata lookup,
 * filtering, sorting, and tag-related operations.
 */

import { tagMetadata, categoryMetadata, learningLevelMetadata, type TagCategory, type LearningLevel, type TagMetadata } from '../data/tagMetadata';

/**
 * Get metadata for a specific tag
 * @param tagSlug - The tag slug to look up
 * @returns Tag metadata or undefined if not found
 */
export function getTagMetadata(tagSlug: string): TagMetadata | undefined {
  // Normalize the slug
  const normalizedSlug = tagSlug.toLowerCase().replace(/\s+/g, '-');

  // Direct lookup
  if (tagMetadata[normalizedSlug]) {
    return tagMetadata[normalizedSlug];
  }

  // Check aliases
  for (const [key, metadata] of Object.entries(tagMetadata)) {
    if (metadata.aliases?.includes(normalizedSlug)) {
      return metadata;
    }
  }

  return undefined;
}

/**
 * Get all tags for a specific category
 * @param category - The category to filter by
 * @returns Array of tag metadata objects
 */
export function getTagsByCategory(category: TagCategory): TagMetadata[] {
  return Object.values(tagMetadata).filter(tag => tag.category === category);
}

/**
 * Get all tags for a specific learning level
 * @param level - The learning level to filter by
 * @returns Array of tag metadata objects
 */
export function getTagsByLearningLevel(level: LearningLevel): TagMetadata[] {
  return Object.values(tagMetadata).filter(tag => tag.learningPath === level);
}

/**
 * Get related tags for a given tag
 * @param tagSlug - The tag slug to find related tags for
 * @param limit - Maximum number of related tags to return
 * @returns Array of related tag metadata objects
 */
export function getRelatedTags(tagSlug: string, limit = 5): TagMetadata[] {
  const tag = getTagMetadata(tagSlug);
  if (!tag || !tag.relatedTags) {
    return [];
  }

  return tag.relatedTags
    .map(relatedSlug => getTagMetadata(relatedSlug))
    .filter((t): t is TagMetadata => t !== undefined)
    .slice(0, limit);
}

/**
 * Sort tags by various criteria
 * @param tags - Array of tag objects with name and count
 * @param sortBy - Sorting criteria
 * @returns Sorted array of tags
 */
export function sortTags<T extends { name: string; count?: number }>(
  tags: T[],
  sortBy: 'alphabetical' | 'popular' | 'recent' = 'popular'
): T[] {
  const sorted = [...tags];

  switch (sortBy) {
    case 'alphabetical':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'popular':
      return sorted.sort((a, b) => (b.count || 0) - (a.count || 0));
    case 'recent':
      // For recent, we'd need timestamp data, fallback to popular
      return sorted.sort((a, b) => (b.count || 0) - (a.count || 0));
    default:
      return sorted;
  }
}

/**
 * Filter tags by search query
 * @param tags - Array of tag objects
 * @param query - Search query string
 * @returns Filtered array of tags
 */
export function filterTagsByQuery<T extends { name: string; slug?: string }>(
  tags: T[],
  query: string
): T[] {
  if (!query.trim()) {
    return tags;
  }

  const lowerQuery = query.toLowerCase();

  return tags.filter(tag => {
    const nameMatch = tag.name.toLowerCase().includes(lowerQuery);
    const slugMatch = tag.slug?.toLowerCase().includes(lowerQuery);

    // Also check metadata description if available
    const metadata = getTagMetadata(tag.slug || tag.name);
    const descriptionMatch = metadata?.description?.toLowerCase().includes(lowerQuery);

    return nameMatch || slugMatch || descriptionMatch;
  });
}

/**
 * Filter tags by first letter
 * @param tags - Array of tag objects
 * @param letter - Letter to filter by (or 'all' or '0-9')
 * @returns Filtered array of tags
 */
export function filterTagsByLetter<T extends { name: string }>(
  tags: T[],
  letter: string
): T[] {
  if (letter === 'all') {
    return tags;
  }

  if (letter === '0-9') {
    return tags.filter(tag => /^\d/.test(tag.name));
  }

  const lowerLetter = letter.toLowerCase();
  return tags.filter(tag => tag.name.toLowerCase().startsWith(lowerLetter));
}

/**
 * Normalize tag name to slug format
 * @param tagName - Tag name to normalize
 * @returns Normalized slug
 */
export function normalizeTagSlug(tagName: string): string {
  return tagName.toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]/g, '');
}

/**
 * Get tag display name (with proper capitalization)
 * @param tagSlug - Tag slug
 * @returns Display name
 */
export function getTagDisplayName(tagSlug: string): string {
  const metadata = getTagMetadata(tagSlug);
  return metadata?.name || tagSlug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get tag icon
 * @param tagSlug - Tag slug
 * @returns Icon string or undefined
 */
export function getTagIcon(tagSlug: string): string | undefined {
  const metadata = getTagMetadata(tagSlug);
  return metadata?.icon;
}

/**
 * Get tag category
 * @param tagSlug - Tag slug
 * @returns Category or 'general'
 */
export function getTagCategory(tagSlug: string): TagCategory {
  const metadata = getTagMetadata(tagSlug);
  return metadata?.category || 'general';
}

/**
 * Get tag learning level
 * @param tagSlug - Tag slug
 * @returns Learning level or undefined
 */
export function getTagLearningLevel(tagSlug: string): LearningLevel | undefined {
  const metadata = getTagMetadata(tagSlug);
  return metadata?.learningPath;
}

/**
 * Check if a tag exists in metadata
 * @param tagSlug - Tag slug to check
 * @returns True if tag has metadata
 */
export function hasTagMetadata(tagSlug: string): boolean {
  return getTagMetadata(tagSlug) !== undefined;
}

/**
 * Parse tag filter from URL parameter
 * @param tagsParam - URL parameter value (e.g., "calculus,algebra,geometry")
 * @returns Array of normalized tag slugs
 */
export function parseTagsFromUrl(tagsParam: string | null): string[] {
  if (!tagsParam) {
    return [];
  }

  return tagsParam
    .split(',')
    .map(tag => normalizeTagSlug(tag))
    .filter(tag => tag.length > 0);
}

/**
 * Build URL parameter from tag array
 * @param tags - Array of tag slugs
 * @returns URL parameter string or null
 */
export function buildTagsUrlParam(tags: string[]): string | null {
  if (tags.length === 0) {
    return null;
  }

  return tags.map(tag => normalizeTagSlug(tag)).join(',');
}

/**
 * Get category metadata
 * @param category - Category key
 * @returns Category metadata
 */
export function getCategoryMetadata(category: TagCategory) {
  return categoryMetadata[category];
}

/**
 * Get learning level metadata
 * @param level - Learning level key
 * @returns Learning level metadata
 */
export function getLearningLevelMetadata(level: LearningLevel) {
  return learningLevelMetadata[level];
}

/**
 * Get all available categories
 * @returns Array of category keys
 */
export function getAllCategories(): TagCategory[] {
  return Object.keys(categoryMetadata) as TagCategory[];
}

/**
 * Get all available learning levels
 * @returns Array of learning level keys
 */
export function getAllLearningLevels(): LearningLevel[] {
  return Object.keys(learningLevelMetadata) as LearningLevel[];
}

/**
 * Create tag cloud data with size weighting
 * @param tags - Array of tag objects with counts
 * @param minSize - Minimum font size
 * @param maxSize - Maximum font size
 * @returns Array of tags with size property
 */
export function createTagCloudData<T extends { name: string; count: number }>(
  tags: T[],
  minSize = 0.875,
  maxSize = 1.5
): Array<T & { size: number }> {
  if (tags.length === 0) {
    return [];
  }

  const counts = tags.map(t => t.count);
  const minCount = Math.min(...counts);
  const maxCount = Math.max(...counts);
  const range = maxCount - minCount || 1;

  return tags.map(tag => ({
    ...tag,
    size: minSize + ((tag.count - minCount) / range) * (maxSize - minSize),
  }));
}

/**
 * Get alphabet letters that have tags
 * @param tags - Array of tag objects
 * @returns Array of letters
 */
export function getAvailableLetters<T extends { name: string }>(tags: T[]): string[] {
  const letters = new Set<string>();

  tags.forEach(tag => {
    const firstChar = tag.name.charAt(0).toUpperCase();
    if (/[A-Z]/.test(firstChar)) {
      letters.add(firstChar);
    }
  });

  return Array.from(letters).sort();
}

/**
 * Check if any tags start with numbers
 * @param tags - Array of tag objects
 * @returns True if numeric tags exist
 */
export function hasNumericTags<T extends { name: string }>(tags: T[]): boolean {
  return tags.some(tag => /^\d/.test(tag.name));
}
