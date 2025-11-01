/**
 * ProgressTracker - Manages presentation progress using localStorage
 * Extracted from reveal-init.ts for better testability and reusability
 *
 * Implements TDD approach - tests written first in tests/unit/presentation/ProgressTracker.test.ts
 */

export interface ProgressData {
  currentSlide: number;
  totalSlides: number;
  lastVisited: string; // ISO date string
  completed: boolean;
}

export type AllProgressData = Record<string, ProgressData>;

export class ProgressTracker {
  private static readonly STORAGE_KEY = 'presentationProgress';
  private storage: Storage;

  /**
   * Create a new ProgressTracker
   * @param storage - Storage implementation (defaults to localStorage if available)
   */
  constructor(storage?: Storage) {
    // Use provided storage or fall back to global localStorage
    if (storage) {
      this.storage = storage;
    } else if (typeof localStorage !== 'undefined') {
      this.storage = localStorage;
    } else {
      // If no storage available, use a no-op storage
      this.storage = this.createNoOpStorage();
    }
  }

  /**
   * Save progress for a presentation
   * @param presentationSlug - Unique identifier for the presentation
   * @param slideIndex - Current slide index (0-based)
   * @param totalSlides - Total number of slides
   */
  save(presentationSlug: string, slideIndex: number, totalSlides: number): void {
    if (!presentationSlug) return;

    try {
      const allProgress = this.loadAllProgress();
      const isLastSlide = slideIndex === totalSlides - 1;

      allProgress[presentationSlug] = {
        currentSlide: slideIndex,
        totalSlides,
        lastVisited: new Date().toISOString(),
        completed: isLastSlide,
      };

      this.storage.setItem(
        ProgressTracker.STORAGE_KEY,
        JSON.stringify(allProgress)
      );
    } catch (error) {
      // Silently fail for storage errors (quota exceeded, etc.)
      console.error('Error saving progress:', error);
    }
  }

  /**
   * Load progress for a specific presentation
   * @param presentationSlug - Unique identifier for the presentation
   * @returns Progress data or null if not found
   */
  load(presentationSlug: string): ProgressData | null {
    if (!presentationSlug) return null;

    try {
      const allProgress = this.loadAllProgress();
      return allProgress[presentationSlug] || null;
    } catch (error) {
      console.error('Error loading progress:', error);
      return null;
    }
  }

  /**
   * Get progress percentage for a presentation
   * @param presentationSlug - Unique identifier for the presentation
   * @returns Progress percentage (0-100)
   */
  getProgress(presentationSlug: string): number {
    const progress = this.load(presentationSlug);
    if (!progress) return 0;

    return Math.floor((progress.currentSlide / progress.totalSlides) * 100);
  }

  /**
   * Clear progress for a specific presentation
   * @param presentationSlug - Unique identifier for the presentation
   */
  clear(presentationSlug: string): void {
    try {
      const allProgress = this.loadAllProgress();
      delete allProgress[presentationSlug];

      this.storage.setItem(
        ProgressTracker.STORAGE_KEY,
        JSON.stringify(allProgress)
      );
    } catch (error) {
      console.error('Error clearing progress:', error);
    }
  }

  /**
   * Get all saved progress data
   * @returns All progress data keyed by presentation slug
   */
  getAllProgress(): AllProgressData {
    try {
      return this.loadAllProgress();
    } catch (error) {
      console.error('Error getting all progress:', error);
      return {};
    }
  }

  /**
   * Load all progress from storage
   * @private
   */
  private loadAllProgress(): AllProgressData {
    try {
      const data = this.storage.getItem(ProgressTracker.STORAGE_KEY);
      if (!data) return {};

      return JSON.parse(data);
    } catch (error) {
      // Return empty object if JSON is corrupted or storage errors
      return {};
    }
  }

  /**
   * Create a no-op storage implementation for environments without storage
   * @private
   */
  private createNoOpStorage(): Storage {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    };
  }
}

/**
 * Convenience function for backward compatibility with old code
 * @deprecated Use ProgressTracker class instead
 */
export function loadProgress(presentationSlug: string): ProgressData | null {
  const tracker = new ProgressTracker();
  return tracker.load(presentationSlug);
}

/**
 * Convenience function for backward compatibility with old code
 * @deprecated Use ProgressTracker class instead
 */
export function saveProgress(
  presentationSlug: string,
  slideIndex: number,
  totalSlides: number
): void {
  const tracker = new ProgressTracker();
  tracker.save(presentationSlug, slideIndex, totalSlides);
}
