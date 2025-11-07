/**
 * Presentation Service Layer
 * Handles business logic and orchestration for presentations
 */

import type { PresentationRepository } from '../../domain/presentation/PresentationRepository';
import type { Presentation } from '../../domain/presentation/Presentation';
import type { Language } from '../../domain/blog/types';
import { getDefaultPresentationRepository } from '../../infrastructure/presentation/FileSystemPresentationRepository';

/**
 * Presentation list view model
 */
export interface PresentationListViewModel {
  id: string;
  title: string;
  description: string;
  tags: string[];
  difficulty: string;
  estimatedTime: number;
  totalSlides: number;
  relatedBlogPost?: string;
  pubDate: string;
  author: string;
}

/**
 * Presentation detail view model
 */
export interface PresentationDetailViewModel {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost?: string;
  category: string;
  tags: string[];
  difficulty: string;
  estimatedTime: number;
  totalSlides: number;
  author: string;
  slides: Array<{
    title: string;
    time: string;
    content: string;
  }>;
}

/**
 * Service class for presentation-related operations
 */
export class PresentationService {
  private repository: PresentationRepository;

  constructor(repository?: PresentationRepository) {
    this.repository = repository || getDefaultPresentationRepository();
  }

  /**
   * Get all presentations for a language as view models
   */
  async getPresentationsForLanguage(language: Language): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findAll(language);

    return presentations.map((p) => this.toPresentationListViewModel(p));
  }

  /**
   * Get a single presentation by slug as view model
   */
  async getPresentationBySlug(
    slug: string,
    language: Language
  ): Promise<PresentationDetailViewModel | null> {
    const presentation = await this.repository.findBySlug(slug, language);

    if (!presentation) {
      return null;
    }

    return this.toPresentationDetailViewModel(presentation);
  }

  /**
   * Find presentations related to a blog post
   */
  async getRelatedPresentations(
    blogPostSlug: string,
    language: Language
  ): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findByRelatedBlogPost(blogPostSlug, language);

    return presentations.map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      tags: p.tags,
      difficulty: p.difficulty,
      estimatedTime: p.estimatedTime,
      totalSlides: p.totalSlides,
      relatedBlogPost: p.relatedBlogPost,
      pubDate: p.pubDate,
      author: p.author,
    }));
  }

  /**
   * Get featured presentations (most recent, published)
   */
  async getFeaturedPresentations(
    language: Language,
    limit: number = 3
  ): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findAll(language);

    // Filter only published presentations
    const published = presentations.filter((p) => p.isPublished());

    // Take the most recent ones
    const featured = published.slice(0, limit);

    return featured.map((p) => this.toPresentationListViewModel(p));
  }

  /**
   * Get presentations by tag
   */
  async getPresentationsByTag(
    tag: string,
    language: Language
  ): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findAll(language);

    const filtered = presentations.filter((p) => p.hasTag(tag));

    return filtered.map((p) => this.toPresentationListViewModel(p));
  }

  /**
   * Get presentations by difficulty
   */
  async getPresentationsByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced',
    language: Language
  ): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findAll(language);

    const filtered = presentations.filter((p) => p.getDifficulty() === difficulty);

    return filtered.map((p) => this.toPresentationListViewModel(p));
  }

  /**
   * Get presentations by category
   */
  async getPresentationsByCategory(
    category: string,
    language: Language
  ): Promise<PresentationListViewModel[]> {
    const presentations = await this.repository.findAll(language);

    const filtered = presentations.filter(
      (p) => p.getCategory().toLowerCase() === category.toLowerCase()
    );

    return filtered.map((p) => this.toPresentationListViewModel(p));
  }

  /**
   * Get related presentations based on shared tags
   */
  async getSimilarPresentations(
    slug: string,
    language: Language,
    limit: number = 3
  ): Promise<PresentationListViewModel[]> {
    const targetPresentation = await this.repository.findBySlug(slug, language);

    if (!targetPresentation) {
      return [];
    }

    const allPresentations = await this.repository.findAll(language);

    // Filter out the target presentation and find those with shared tags
    const similar = allPresentations
      .filter((p) => p.id !== slug && p.sharesTagsWith(targetPresentation))
      .map((p) => ({
        presentation: p,
        sharedTags: p.getTags().filter((tag) => targetPresentation.hasTag(tag)).length,
      }))
      .sort((a, b) => b.sharedTags - a.sharedTags) // Sort by number of shared tags
      .slice(0, limit);

    return similar.map((item) => this.toPresentationListViewModel(item.presentation));
  }

  /**
   * Convert Presentation domain model to list view model
   */
  private toPresentationListViewModel(presentation: Presentation): PresentationListViewModel {
    return {
      id: presentation.id,
      title: presentation.getTitle(),
      description: presentation.getDescription(),
      tags: presentation.getTags(),
      difficulty: presentation.getDifficulty(),
      estimatedTime: presentation.getEstimatedTime(),
      totalSlides: presentation.getSlideCount(),
      relatedBlogPost: presentation.getRelatedBlogPost(),
      pubDate: presentation.metadata.pubDate,
      author: presentation.getAuthor(),
    };
  }

  /**
   * Convert Presentation domain model to detail view model
   */
  private toPresentationDetailViewModel(
    presentation: Presentation
  ): PresentationDetailViewModel {
    return {
      id: presentation.id,
      title: presentation.getTitle(),
      description: presentation.getDescription(),
      pubDate: presentation.metadata.pubDate,
      relatedBlogPost: presentation.getRelatedBlogPost(),
      category: presentation.getCategory(),
      tags: presentation.getTags(),
      difficulty: presentation.getDifficulty(),
      estimatedTime: presentation.getEstimatedTime(),
      totalSlides: presentation.getSlideCount(),
      author: presentation.getAuthor(),
      slides: presentation.slides.map((slide) => ({
        title: slide.getTitle(),
        time: slide.getFormattedTime(),
        content: slide.getContent(),
      })),
    };
  }
}

/**
 * Default singleton instance
 */
let defaultService: PresentationService | null = null;

/**
 * Get the default presentation service instance
 */
export function getDefaultPresentationService(): PresentationService {
  if (!defaultService) {
    defaultService = new PresentationService();
  }
  return defaultService;
}
