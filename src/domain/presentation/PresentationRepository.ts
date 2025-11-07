/**
 * Repository interface for Presentation data access
 * Provides an abstraction over the data source (filesystem, database, etc.)
 */

import type { Language } from '../blog/types';
import type { Presentation } from './Presentation';

/**
 * Raw presentation metadata structure
 */
export interface PresentationMetadata {
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: string;
  estimatedTime: number;
  totalSlides: number;
  author: string;
}

/**
 * Raw slide metadata structure
 */
export interface SlideMetadata {
  slideNumber: number;
  title: string;
  time: string;
  fileName: string;
}

/**
 * Raw slide structure
 */
export interface SlideData {
  title: string;
  time: string;
  content: string;
  notes?: string;
  fragments?: boolean;
  transition?: string;
  background?: string;
}

/**
 * Combined presentation data (metadata + slides)
 */
export interface PresentationData {
  metadata: PresentationMetadata;
  slides: SlideData[];
}

/**
 * Presentation list item with multi-language support
 */
export interface PresentationListItem {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  totalSlides: number;
  author: string;
  languages: string[];
}

/**
 * Repository interface for accessing presentation data
 * Returns domain models (Presentation) instead of raw data
 */
export interface PresentationRepository {
  /**
   * Find a presentation by its slug and language (returns domain model)
   * @param slug The presentation slug
   * @param language The language code (e.g., 'en', 'id')
   * @returns The Presentation domain model or null if not found
   */
  findBySlug(slug: string, language: Language): Promise<Presentation | null>;

  /**
   * Find all presentations for a specific language (returns domain models)
   * @param language The language code
   * @returns Array of Presentation domain models
   */
  findAll(language: Language): Promise<Presentation[]>;

  /**
   * Find all presentations (across all languages) as list items
   * @returns Array of presentation list items with language info
   */
  findAllWithLanguages(): Promise<PresentationListItem[]>;

  /**
   * Find a presentation by its slug (checks all languages)
   * @param slug The presentation slug
   * @returns Presentation list item or null if not found
   */
  findBySlugAnyLanguage(slug: string): Promise<PresentationListItem | null>;

  /**
   * Find all presentations that are related to a blog post
   * @param blogPostSlug The blog post slug
   * @param language The language code
   * @returns Array of related presentations
   */
  findByRelatedBlogPost(blogPostSlug: string, language: Language): Promise<PresentationListItem[]>;

  /**
   * Get all available presentation slugs for a language
   * @param language The language code
   * @returns Array of slugs
   */
  getSlugs(language: Language): Promise<string[]>;
}
