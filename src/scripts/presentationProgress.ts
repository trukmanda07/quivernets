// Client-side script for presentation progress tracking
// This runs in the browser and integrates with PresentationBase component

import {
  saveProgress,
  loadProgress,
  type PresentationProgress
} from '../utils/progressTracker';

/**
 * Initialize presentation with progress tracking
 * @param slug - Presentation slug for tracking
 * @param slides - Array of slides
 * @param updateSlideCallback - Function to call when changing slides
 * @returns Initial slide index to start from
 */
export function initPresentationProgress(
  slug: string,
  slides: any[],
  updateSlideCallback: (index: number) => void
): number {
  if (!slug) return 0;

  const progress = loadProgress(slug);

  if (progress && progress.currentSlide > 0 && !progress.completed) {
    // Check if user wants to resume
    const shouldResume = showResumePrompt(progress);

    if (shouldResume) {
      return progress.currentSlide;
    }
  }

  return 0;
}

/**
 * Show a resume prompt to the user
 * @param progress - Progress data
 * @returns true if user wants to resume, false otherwise
 */
function showResumePrompt(progress: PresentationProgress): boolean {
  // For now, auto-resume. Later we can add a UI prompt
  return true;

  // Future implementation with UI:
  // const banner = createResumeBanner(progress);
  // return new Promise(resolve => {
  //   // Show banner with Resume / Start Over buttons
  //   // resolve(true) on Resume, resolve(false) on Start Over
  // });
}

/**
 * Track slide change and save progress
 * @param slug - Presentation slug
 * @param slideIndex - Current slide index
 * @param totalSlides - Total number of slides
 */
export function trackSlideChange(
  slug: string,
  slideIndex: number,
  totalSlides: number
): void {
  if (!slug) return;

  saveProgress(slug, slideIndex, totalSlides);

  // Show completion message if last slide
  if (slideIndex === totalSlides - 1) {
    showCompletionMessage();
  }
}

/**
 * Show a completion message/celebration
 */
function showCompletionMessage(): void {
  // Simple console log for now
  console.log('🎉 Presentation completed!');

  // Future: Show a modal or toast notification
  // showToast('🎉 Presentation completed! Great job!');
}

/**
 * Create resume banner HTML (for future use)
 */
export function createResumeBannerHTML(
  slug: string,
  currentSlide: number,
  totalSlides: number
): string {
  return `
    <div class="resume-banner bg-blue-100 border-l-4 border-blue-500 p-4 mb-6 rounded">
      <p class="font-semibold text-blue-900">
        ⏱️ You were on slide ${currentSlide + 1} of ${totalSlides}
      </p>
      <div class="mt-2 flex gap-2">
        <button
          id="btn-resume-${slug}"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
        >
          Resume
        </button>
        <button
          id="btn-start-over-${slug}"
          class="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded transition"
        >
          Start Over
        </button>
      </div>
    </div>
  `;
}

// Export for global use in inline scripts if needed
declare global {
  interface Window {
    PresentationProgress: {
      save: typeof saveProgress;
      load: typeof loadProgress;
      track: typeof trackSlideChange;
    };
  }
}

if (typeof window !== 'undefined') {
  window.PresentationProgress = {
    save: saveProgress,
    load: loadProgress,
    track: trackSlideChange,
  };
}
