/**
 * Presentation domain model
 * Encapsulates presentation behavior and validation
 */

import type { Language } from '../blog/types';
import { Slide, type SlideData } from './Slide';

export type PresentationDifficulty = 'beginner' | 'intermediate' | 'advanced';

/**
 * Presentation metadata
 */
export interface PresentationMetadata {
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost?: string;
  category: string;
  tags: string[];
  difficulty: PresentationDifficulty;
  language: string;
  estimatedTime: number;
  totalSlides: number;
  author: string;
}

/**
 * Rich domain model for Presentation
 */
export class Presentation {
  readonly id: string;
  readonly metadata: PresentationMetadata;
  readonly slides: Slide[];

  constructor(id: string, metadata: PresentationMetadata, slideData: SlideData[]) {
    this.validateMetadata(metadata);

    this.id = id;
    this.metadata = metadata;
    this.slides = slideData.map((data, index) => new Slide(data, index + 1));

    // Validate consistency
    if (this.slides.length !== metadata.totalSlides) {
      console.warn(
        `Presentation ${id}: Slide count mismatch. Expected ${metadata.totalSlides}, got ${this.slides.length}`
      );
    }
  }

  /**
   * Validate presentation metadata
   */
  private validateMetadata(metadata: PresentationMetadata): void {
    if (!metadata.title || metadata.title.trim().length === 0) {
      throw new Error('Presentation title is required');
    }

    if (!metadata.description || metadata.description.trim().length === 0) {
      throw new Error('Presentation description is required');
    }

    if (!metadata.pubDate) {
      throw new Error('Presentation publication date is required');
    }

    if (metadata.totalSlides <= 0) {
      throw new Error('Presentation must have at least one slide');
    }

    if (metadata.estimatedTime <= 0) {
      throw new Error('Presentation estimated time must be positive');
    }

    if (!['beginner', 'intermediate', 'advanced'].includes(metadata.difficulty)) {
      throw new Error('Invalid presentation difficulty level');
    }
  }

  /**
   * Check if the presentation is published
   */
  isPublished(): boolean {
    const pubDate = new Date(this.metadata.pubDate);
    const now = new Date();
    return pubDate <= now;
  }

  /**
   * Check if the presentation has a related blog post
   */
  hasRelatedBlogPost(): boolean {
    return !!this.metadata.relatedBlogPost && this.metadata.relatedBlogPost.length > 0;
  }

  /**
   * Get the related blog post slug
   */
  getRelatedBlogPost(): string | undefined {
    return this.metadata.relatedBlogPost;
  }

  /**
   * Get the number of slides
   */
  getSlideCount(): number {
    return this.slides.length;
  }

  /**
   * Get a specific slide by index (0-based)
   */
  getSlide(index: number): Slide | undefined {
    return this.slides[index];
  }

  /**
   * Get a specific slide by number (1-based)
   */
  getSlideByNumber(number: number): Slide | undefined {
    return this.slides[number - 1];
  }

  /**
   * Check if the presentation has a specific tag
   */
  hasTag(tag: string): boolean {
    return this.metadata.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
  }

  /**
   * Check if the presentation shares tags with another presentation
   */
  sharesTagsWith(other: Presentation): boolean {
    return this.metadata.tags.some((tag) => other.hasTag(tag));
  }

  /**
   * Get the presentation difficulty level
   */
  getDifficulty(): PresentationDifficulty {
    return this.metadata.difficulty;
  }

  /**
   * Check if the presentation is for beginners
   */
  isBeginner(): boolean {
    return this.metadata.difficulty === 'beginner';
  }

  /**
   * Check if the presentation is intermediate
   */
  isIntermediate(): boolean {
    return this.metadata.difficulty === 'intermediate';
  }

  /**
   * Check if the presentation is advanced
   */
  isAdvanced(): boolean {
    return this.metadata.difficulty === 'advanced';
  }

  /**
   * Get the estimated completion time in minutes
   */
  getEstimatedTime(): number {
    return this.metadata.estimatedTime;
  }

  /**
   * Get the publication date
   */
  getPubDate(): Date {
    return new Date(this.metadata.pubDate);
  }

  /**
   * Get formatted publication date
   */
  getFormattedPubDate(locale: string = 'en-US'): string {
    return this.getPubDate().toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * Get the presentation category
   */
  getCategory(): string {
    return this.metadata.category;
  }

  /**
   * Get the presentation tags
   */
  getTags(): string[] {
    return [...this.metadata.tags]; // Return a copy
  }

  /**
   * Get the presentation title
   */
  getTitle(): string {
    return this.metadata.title;
  }

  /**
   * Get the presentation description
   */
  getDescription(): string {
    return this.metadata.description;
  }

  /**
   * Get the presentation author
   */
  getAuthor(): string {
    return this.metadata.author;
  }

  /**
   * Get the presentation language
   */
  getLanguage(): Language {
    return this.metadata.language as Language;
  }

  /**
   * Calculate total estimated reading time based on slides
   */
  calculateTotalTime(): number {
    return this.slides.reduce((total, slide) => total + slide.getEstimatedTime(), 0);
  }

  /**
   * Get a summary of the presentation
   */
  getSummary(): string {
    return `${this.metadata.title} - ${this.getSlideCount()} slides, ${this.getEstimatedTime()} minutes (${this.metadata.difficulty})`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON() {
    return {
      id: this.id,
      metadata: this.metadata,
      slides: this.slides.map((slide) => slide.toJSON()),
    };
  }
}
