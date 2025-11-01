/**
 * Zod Validation Schemas for Presentation System
 * Week 2: Add runtime validation to catch errors early
 */

import { z } from 'astro:content';

/**
 * Schema for individual slide data
 */
export const SlideSchema = z.object({
  title: z.string().min(1, 'Slide title cannot be empty'),
  time: z.string().regex(/^\d+\s*(min|mins|minute|minutes)$/i, 'Time must be in format "X min"'),
  content: z.string().min(1, 'Slide content cannot be empty'),
  notes: z.string().optional(),
  fragments: z.boolean().optional(),
  transition: z.enum(['none', 'fade', 'slide', 'convex', 'concave', 'zoom']).optional(),
  background: z.string().optional(),
});

export type Slide = z.infer<typeof SlideSchema>;

/**
 * Schema for presentation metadata (loaded from metadata.json)
 */
export const PresentationMetadataSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  pubDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  updatedDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  relatedBlogPost: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  language: z.enum(['en', 'id']),
  estimatedTime: z.number().positive('Estimated time must be positive'),
  totalSlides: z.number().positive('Total slides must be positive'),
  author: z.string().optional(),
});

export type PresentationMetadata = z.infer<typeof PresentationMetadataSchema>;

/**
 * Schema for Reveal.js configuration
 */
export const RevealConfigSchema = z.object({
  // Display
  controls: z.boolean().default(true),
  controlsTutorial: z.boolean().default(true),
  controlsLayout: z.enum(['bottom-right', 'edges']).default('bottom-right'),
  controlsBackArrows: z.enum(['faded', 'hidden', 'visible']).default('faded'),

  // Progress bar
  progress: z.boolean().default(true),

  // Slide number
  slideNumber: z.union([
    z.boolean(),
    z.enum(['c', 'c/t', 'h.v', 'h/v'])
  ]).default('c/t'),

  // Show speaker notes
  showNotes: z.boolean().default(false),

  // Hash-based navigation
  hash: z.boolean().default(true),
  hashOneBasedIndex: z.boolean().default(false),

  // Respond to hash changes
  respondToHashChanges: z.boolean().default(true),

  // History
  history: z.boolean().default(false),

  // Keyboard navigation
  keyboard: z.boolean().default(true),
  keyboardCondition: z.enum(['focused', 'null']).optional(),

  // Disabled keyboard bindings
  disableLayout: z.boolean().default(false),

  // Overview mode
  overview: z.boolean().default(true),

  // Center slides
  center: z.boolean().default(true),

  // Touch navigation
  touch: z.boolean().default(true),

  // Loop presentation
  loop: z.boolean().default(false),

  // RTL mode
  rtl: z.boolean().default(false),

  // Fragments
  fragments: z.boolean().default(true),

  // Embedded mode
  embedded: z.boolean().default(false),

  // Help overlay
  help: z.boolean().default(true),

  // Pause overlay
  pause: z.boolean().default(true),

  // Show slide number on overview
  showSlideNumber: z.enum(['all', 'print', 'speaker']).default('all'),

  // Preload iframes
  preloadIframes: z.union([z.boolean(), z.null()]).default(null),

  // Auto-animate
  autoAnimate: z.boolean().default(true),
  autoAnimateMatcher: z.any().optional(),
  autoAnimateEasing: z.string().default('ease'),
  autoAnimateDuration: z.number().default(1.0),
  autoAnimateUnmatched: z.boolean().default(true),

  // Auto-slide
  autoSlide: z.number().default(0),
  autoSlideStoppable: z.boolean().default(true),
  autoSlideMethod: z.any().optional(),

  // Mouse wheel navigation
  mouseWheel: z.boolean().default(false),

  // Hide cursor
  hideInactiveCursor: z.boolean().default(true),
  hideCursorTime: z.number().default(5000),

  // Transitions
  transition: z.enum(['none', 'fade', 'slide', 'convex', 'concave', 'zoom']).default('slide'),
  transitionSpeed: z.enum(['default', 'fast', 'slow']).default('default'),
  backgroundTransition: z.enum(['none', 'fade', 'slide', 'convex', 'concave', 'zoom']).default('fade'),

  // Parallax
  parallaxBackgroundImage: z.string().optional(),
  parallaxBackgroundSize: z.string().optional(),
  parallaxBackgroundHorizontal: z.number().optional(),
  parallaxBackgroundVertical: z.number().optional(),

  // Display mode
  display: z.string().default('block'),

  // Viewport dimensions
  width: z.number().positive().default(960),
  height: z.number().positive().default(700),

  // Factor of display size for scaling
  margin: z.number().min(0).max(1).default(0.04),

  // Bounds for smallest/largest scale
  minScale: z.number().positive().default(0.2),
  maxScale: z.number().positive().default(2.0),

  // View distance
  viewDistance: z.number().int().positive().default(3),
  mobileViewDistance: z.number().int().positive().default(2),

  // PDF export options
  pdfMaxPagesPerSlide: z.number().int().positive().default(1),
  pdfSeparateFragments: z.boolean().default(true),
  pdfPageHeightOffset: z.number().default(-1),
}).partial(); // All fields are optional with defaults

export type RevealConfig = z.infer<typeof RevealConfigSchema>;

/**
 * Schema for slide metadata (slide-metadata.json)
 */
export const SlideMetadataSchema = z.object({
  slides: z.array(z.object({
    title: z.string(),
    time: z.string(),
    file: z.string(), // Path to HTML file
  })),
  totalSlides: z.number().positive(),
});

export type SlideMetadata = z.infer<typeof SlideMetadataSchema>;

/**
 * Schema for progress data stored in localStorage
 */
export const ProgressDataSchema = z.object({
  currentSlide: z.number().int().min(0),
  totalSlides: z.number().int().positive(),
  lastVisited: z.string().datetime(),
  completed: z.boolean(),
});

export type ProgressData = z.infer<typeof ProgressDataSchema>;

/**
 * Validate and parse presentation metadata
 * @throws {z.ZodError} If validation fails
 */
export function validatePresentationMetadata(data: unknown): PresentationMetadata {
  return PresentationMetadataSchema.parse(data);
}

/**
 * Validate and parse Reveal.js config
 * @throws {z.ZodError} If validation fails
 */
export function validateRevealConfig(data: unknown): RevealConfig {
  return RevealConfigSchema.parse(data);
}

/**
 * Validate and parse slide data
 * @throws {z.ZodError} If validation fails
 */
export function validateSlide(data: unknown): Slide {
  return SlideSchema.parse(data);
}

/**
 * Validate and parse slide metadata
 * @throws {z.ZodError} If validation fails
 */
export function validateSlideMetadata(data: unknown): SlideMetadata {
  return SlideMetadataSchema.parse(data);
}

/**
 * Safe validation that returns success/error result instead of throwing
 */
export function safeValidatePresentationMetadata(data: unknown) {
  return PresentationMetadataSchema.safeParse(data);
}

export function safeValidateRevealConfig(data: unknown) {
  return RevealConfigSchema.safeParse(data);
}

export function safeValidateSlide(data: unknown) {
  return SlideSchema.safeParse(data);
}
