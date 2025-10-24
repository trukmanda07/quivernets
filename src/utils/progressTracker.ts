// Progress Tracker Utility for Presentations
// Tracks slide position and completion status using localStorage

export interface PresentationProgress {
  currentSlide: number;
  totalSlides: number;
  lastVisited: string;
  completed: boolean;
}

const STORAGE_KEY = 'presentationProgress';

/**
 * Get all presentation progress data from localStorage
 */
function loadAllProgress(): Record<string, PresentationProgress> {
  if (typeof localStorage === 'undefined') {
    return {};
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error('Error loading presentation progress:', error);
    return {};
  }
}

/**
 * Save progress for a specific presentation
 * @param slug - Unique identifier for the presentation
 * @param slideIndex - Current slide index (0-based)
 * @param totalSlides - Total number of slides in presentation
 */
export function saveProgress(
  slug: string,
  slideIndex: number,
  totalSlides: number
): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const progress = loadAllProgress();
  const isLastSlide = slideIndex === totalSlides - 1;

  progress[slug] = {
    currentSlide: slideIndex,
    totalSlides,
    lastVisited: new Date().toISOString(),
    completed: isLastSlide,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error saving presentation progress:', error);
  }
}

/**
 * Load progress for a specific presentation
 * @param slug - Unique identifier for the presentation
 * @returns Progress data or null if not found
 */
export function loadProgress(slug: string): PresentationProgress | null {
  const progress = loadAllProgress();
  return progress[slug] || null;
}

/**
 * Mark a presentation as completed
 * @param slug - Unique identifier for the presentation
 */
export function markCompleted(slug: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const progress = loadAllProgress();
  if (progress[slug]) {
    progress[slug].completed = true;
    progress[slug].lastVisited = new Date().toISOString();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error('Error marking presentation as completed:', error);
    }
  }
}

/**
 * Get list of completed presentation slugs
 * @returns Array of presentation slugs that have been completed
 */
export function getCompletedPresentations(): string[] {
  const progress = loadAllProgress();
  return Object.entries(progress)
    .filter(([_, data]) => data.completed)
    .map(([slug]) => slug);
}

/**
 * Check if a specific presentation has been completed
 * @param slug - Unique identifier for the presentation
 * @returns true if completed, false otherwise
 */
export function isCompleted(slug: string): boolean {
  const progress = loadProgress(slug);
  return progress?.completed || false;
}

/**
 * Get completion percentage across all presentations
 * @param allPresentationSlugs - Array of all available presentation slugs
 * @returns Percentage of completed presentations (0-100)
 */
export function getOverallCompletionPercentage(
  allPresentationSlugs: string[]
): number {
  if (allPresentationSlugs.length === 0) return 0;

  const completedSlugs = getCompletedPresentations();
  const completedCount = allPresentationSlugs.filter(slug =>
    completedSlugs.includes(slug)
  ).length;

  return Math.round((completedCount / allPresentationSlugs.length) * 100);
}

/**
 * Clear progress for a specific presentation
 * @param slug - Unique identifier for the presentation
 */
export function clearProgress(slug: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  const progress = loadAllProgress();
  delete progress[slug];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.error('Error clearing presentation progress:', error);
  }
}

/**
 * Clear all presentation progress
 */
export function clearAllProgress(): void {
  if (typeof localStorage === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing all presentation progress:', error);
  }
}

/**
 * Get progress statistics
 * @returns Object with various progress statistics
 */
export function getProgressStats() {
  const progress = loadAllProgress();
  const entries = Object.entries(progress);

  return {
    totalTracked: entries.length,
    totalCompleted: entries.filter(([_, data]) => data.completed).length,
    recentlyVisited: entries
      .sort((a, b) =>
        new Date(b[1].lastVisited).getTime() - new Date(a[1].lastVisited).getTime()
      )
      .slice(0, 5)
      .map(([slug, data]) => ({ slug, ...data })),
    inProgress: entries
      .filter(([_, data]) => !data.completed && data.currentSlide > 0)
      .map(([slug, data]) => ({
        slug,
        ...data,
        percentComplete: Math.round((data.currentSlide / data.totalSlides) * 100)
      })),
  };
}
