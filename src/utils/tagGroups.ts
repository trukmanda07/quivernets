/**
 * Tag Grouping and Categorization Utilities
 *
 * Functions for organizing tags into categories and groups for better navigation.
 */

import { getTagMetadata, getTagsByCategory, getAllCategories } from './tagHelpers';
import type { TagCategory } from '../data/tagMetadata';

/**
 * Tag info with count
 */
export interface TagInfo {
  name: string;
  slug: string;
  count: number;
}

/**
 * Tag group with category metadata
 */
export interface TagGroup {
  category: TagCategory;
  categoryName: string;
  categoryDescription: string;
  categoryIcon: string;
  tags: TagInfo[];
}

/**
 * Group tags by their category
 * @param tags - Array of tag info objects
 * @returns Array of tag groups organized by category
 */
export function groupTagsByCategory(tags: TagInfo[]): TagGroup[] {
  const groups = new Map<TagCategory, TagInfo[]>();

  // Initialize all categories
  getAllCategories().forEach(category => {
    groups.set(category, []);
  });

  // Sort tags into their categories
  tags.forEach(tag => {
    const metadata = getTagMetadata(tag.slug);
    const category = metadata?.category || 'general';

    const categoryTags = groups.get(category) || [];
    categoryTags.push(tag);
    groups.set(category, categoryTags);
  });

  // Convert to TagGroup objects
  const result: TagGroup[] = [];

  groups.forEach((categoryTags, category) => {
    if (categoryTags.length > 0) {
      const categoryTagsFromMetadata = getTagsByCategory(category);
      const categoryMeta = categoryTagsFromMetadata[0];

      result.push({
        category,
        categoryName: category.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        categoryDescription: categoryMeta?.category || '',
        categoryIcon: getCategoryIcon(category),
        tags: categoryTags.sort((a, b) => b.count - a.count),
      });
    }
  });

  // Sort groups by a predefined order
  const categoryOrder: TagCategory[] = ['mathematics', 'computer-science', 'programming', 'tools', 'general'];

  return result.sort((a, b) => {
    const indexA = categoryOrder.indexOf(a.category);
    const indexB = categoryOrder.indexOf(b.category);
    return indexA - indexB;
  });
}

/**
 * Get icon for a category
 * @param category - Category key
 * @returns Icon string
 */
function getCategoryIcon(category: TagCategory): string {
  const icons: Record<TagCategory, string> = {
    'mathematics': '📐',
    'computer-science': '💻',
    'programming': '⌨️',
    'tools': '🛠️',
    'general': '📚',
  };

  return icons[category] || '📚';
}

/**
 * Get popular tags (top N by count)
 * @param tags - Array of tag info objects
 * @param limit - Number of tags to return
 * @returns Top N tags by count
 */
export function getPopularTags(tags: TagInfo[], limit = 10): TagInfo[] {
  return [...tags]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get tags by learning path level
 * @param tags - Array of tag info objects
 * @param level - Learning level ('basics', 'intermediate', 'advanced')
 * @returns Filtered tags
 */
export function getTagsByLearningPath(
  tags: TagInfo[],
  level: 'basics' | 'intermediate' | 'advanced'
): TagInfo[] {
  return tags.filter(tag => {
    const metadata = getTagMetadata(tag.slug);
    return metadata?.learningPath === level;
  });
}

/**
 * Create hierarchical tag structure for navigation
 * @param tags - Array of tag info objects
 * @returns Hierarchical structure
 */
export interface TagHierarchy {
  basics: TagInfo[];
  intermediate: TagInfo[];
  advanced: TagInfo[];
  uncategorized: TagInfo[];
}

export function createTagHierarchy(tags: TagInfo[]): TagHierarchy {
  const hierarchy: TagHierarchy = {
    basics: [],
    intermediate: [],
    advanced: [],
    uncategorized: [],
  };

  tags.forEach(tag => {
    const metadata = getTagMetadata(tag.slug);
    const level = metadata?.learningPath;

    if (level) {
      hierarchy[level].push(tag);
    } else {
      hierarchy.uncategorized.push(tag);
    }
  });

  // Sort each level by count
  Object.keys(hierarchy).forEach(key => {
    const levelKey = key as keyof TagHierarchy;
    hierarchy[levelKey].sort((a, b) => b.count - a.count);
  });

  return hierarchy;
}

/**
 * Get suggested tag combinations for exploration
 * @param tags - Array of tag info objects
 * @param limit - Number of combinations to return
 * @returns Array of tag combination suggestions
 */
export interface TagCombination {
  tags: string[];
  description: string;
  count: number; // Estimated number of posts with this combination
}

export function getSuggestedTagCombinations(
  tags: TagInfo[],
  limit = 5
): TagCombination[] {
  const combinations: TagCombination[] = [];

  // Predefined meaningful combinations
  const meaningfulCombos: Array<{ tags: string[]; description: string }> = [
    { tags: ['calculus', 'integration'], description: 'Integration techniques in Calculus' },
    { tags: ['calculus', 'differentiation'], description: 'Differentiation and Derivatives' },
    { tags: ['algorithms', 'data-structures'], description: 'Algorithms and Data Structures' },
    { tags: ['python', 'machine-learning'], description: 'Machine Learning with Python' },
    { tags: ['javascript', 'web-development'], description: 'Web Development with JavaScript' },
    { tags: ['mathematics', 'theory'], description: 'Mathematical Theory and Foundations' },
    { tags: ['programming', 'tutorial'], description: 'Programming Tutorials' },
  ];

  meaningfulCombos.forEach(combo => {
    // Check if all tags in the combo exist
    const tagsExist = combo.tags.every(tagSlug =>
      tags.some(t => t.slug === tagSlug || t.name.toLowerCase() === tagSlug)
    );

    if (tagsExist) {
      // Estimate count (minimum of the individual tag counts)
      const counts = combo.tags.map(tagSlug => {
        const tag = tags.find(t => t.slug === tagSlug || t.name.toLowerCase() === tagSlug);
        return tag?.count || 0;
      });
      const estimatedCount = Math.min(...counts);

      combinations.push({
        tags: combo.tags,
        description: combo.description,
        count: estimatedCount,
      });
    }
  });

  return combinations.slice(0, limit);
}

/**
 * Get tag statistics
 * @param tags - Array of tag info objects
 * @returns Tag statistics
 */
export interface TagStatistics {
  totalTags: number;
  totalPosts: number;
  averageTagsPerPost: number;
  mostPopularTag: TagInfo | null;
  categoryDistribution: Record<TagCategory, number>;
  learningLevelDistribution: Record<string, number>;
}

export function getTagStatistics(tags: TagInfo[]): TagStatistics {
  const totalTags = tags.length;
  const totalPosts = Math.max(...tags.map(t => t.count), 0);
  const mostPopularTag = tags.length > 0
    ? tags.reduce((max, tag) => tag.count > max.count ? tag : max, tags[0])
    : null;

  // Category distribution
  const categoryDistribution: Record<TagCategory, number> = {
    'mathematics': 0,
    'computer-science': 0,
    'programming': 0,
    'tools': 0,
    'general': 0,
  };

  tags.forEach(tag => {
    const metadata = getTagMetadata(tag.slug);
    const category = metadata?.category || 'general';
    categoryDistribution[category]++;
  });

  // Learning level distribution
  const learningLevelDistribution: Record<string, number> = {
    'basics': 0,
    'intermediate': 0,
    'advanced': 0,
    'uncategorized': 0,
  };

  tags.forEach(tag => {
    const metadata = getTagMetadata(tag.slug);
    const level = metadata?.learningPath || 'uncategorized';
    learningLevelDistribution[level]++;
  });

  return {
    totalTags,
    totalPosts,
    averageTagsPerPost: totalPosts > 0 ? totalTags / totalPosts : 0,
    mostPopularTag,
    categoryDistribution,
    learningLevelDistribution,
  };
}

/**
 * Filter tags by multiple criteria
 * @param tags - Array of tag info objects
 * @param filters - Filter criteria
 * @returns Filtered tags
 */
export interface TagFilters {
  category?: TagCategory;
  learningLevel?: 'basics' | 'intermediate' | 'advanced';
  minCount?: number;
  maxCount?: number;
  query?: string;
}

export function filterTags(tags: TagInfo[], filters: TagFilters): TagInfo[] {
  let filtered = [...tags];

  // Filter by category
  if (filters.category) {
    filtered = filtered.filter(tag => {
      const metadata = getTagMetadata(tag.slug);
      return metadata?.category === filters.category;
    });
  }

  // Filter by learning level
  if (filters.learningLevel) {
    filtered = filtered.filter(tag => {
      const metadata = getTagMetadata(tag.slug);
      return metadata?.learningPath === filters.learningLevel;
    });
  }

  // Filter by min count
  if (filters.minCount !== undefined) {
    filtered = filtered.filter(tag => tag.count >= filters.minCount!);
  }

  // Filter by max count
  if (filters.maxCount !== undefined) {
    filtered = filtered.filter(tag => tag.count <= filters.maxCount!);
  }

  // Filter by query
  if (filters.query) {
    const lowerQuery = filters.query.toLowerCase();
    filtered = filtered.filter(tag => {
      const nameMatch = tag.name.toLowerCase().includes(lowerQuery);
      const metadata = getTagMetadata(tag.slug);
      const descMatch = metadata?.description?.toLowerCase().includes(lowerQuery);
      return nameMatch || descMatch;
    });
  }

  return filtered;
}
