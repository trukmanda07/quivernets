/**
 * Type definitions for presentation components
 * Extracted from PresentationBase.astro for reusability
 */

/**
 * Individual slide data structure
 */
export interface Slide {
  title: string;
  time: string;
  content: string; // HTML string
}

/**
 * Main presentation component props
 */
export interface PresentationProps {
  slides: Slide[];
  title: string;
  totalSlides?: number;
  relatedBlogPost?: string;
  language?: string;
  displayMode?: 'fullscreen' | 'instagram';
  slug?: string; // For progress tracking
}

/**
 * Display mode types
 */
export type DisplayMode = 'fullscreen' | 'instagram';

/**
 * Supported languages
 */
export type Language = 'en' | 'id';

/**
 * Progress data stored in localStorage
 */
export interface ProgressData {
  currentSlide: number;
  totalSlides: number;
  lastVisited: string; // ISO date string
  completed: boolean;
}

/**
 * Share platform types
 */
export type SharePlatform = 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'copy';

/**
 * Navigation direction
 */
export type NavigationDirection = 'next' | 'prev' | 'goto';

/**
 * Gesture types
 */
export type GestureType = 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down';

/**
 * Touch event data for gesture detection
 */
export interface TouchEventData {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  timestamp: number;
}
