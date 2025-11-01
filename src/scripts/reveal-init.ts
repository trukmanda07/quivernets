/**
 * Reveal.js initialization script
 * Loaded as a bundled client-side script
 *
 * Refactored to use extracted utilities for better testability
 */

import Reveal from 'reveal.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';
import { ProgressTracker } from '../utils/presentation/ProgressTracker';
import { renderMath } from '../utils/presentation/mathRendering';

// Get config from global variable (set by inline script)
declare global {
  interface Window {
    __REVEAL_CONFIG__: any;
    __REVEAL_SLUG__: string;
    __REVEAL_SLIDES__: any[];
  }
}

// Initialize progress tracker
const progressTracker = new ProgressTracker();

// ===== REVEAL.JS INITIALIZATION =====
const slug = window.__REVEAL_SLUG__;
const slides = window.__REVEAL_SLIDES__;
const revealConfig = window.__REVEAL_CONFIG__;

const deck = new Reveal({
  plugins: [Highlight, Notes],
  // Configuration
  ...revealConfig,
  // Mobile optimizations
  touch: true,
  keyboard: true,
  overview: true,
  help: true,
  // View distance (preload slides)
  viewDistance: window.innerWidth > 768 ? 3 : 1,
  mobileViewDistance: 1,
});

// Initialize reveal.js
deck.initialize().then(() => {
  console.log('✅ reveal.js initialized');

  // Load saved progress
  if (slug) {
    const progress = progressTracker.load(slug);
    if (progress && progress.currentSlide > 0 && !progress.completed) {
      console.log(`📖 Resuming from slide ${progress.currentSlide + 1} of ${slides.length}`);
      deck.slide(progress.currentSlide);
    }
  }

  // Initial KaTeX render
  const currentSlide = deck.getCurrentSlide();
  if (currentSlide) {
    renderMath(currentSlide);
  }
}).catch((error) => {
  console.error('❌ reveal.js initialization failed:', error);
});

// ===== EVENT LISTENERS =====

// Slide changed event
deck.on('slidechanged', (event: any) => {
  console.log(`Slide changed: ${event.indexh + 1} / ${slides.length}`);

  // Save progress
  if (slug) {
    progressTracker.save(slug, event.indexh, slides.length);

    // Log completion
    if (event.indexh === slides.length - 1) {
      console.log('🎉 Presentation completed!');
    }
  }

  // Render KaTeX on new slide
  const currentSlide = deck.getCurrentSlide();
  if (currentSlide) {
    renderMath(currentSlide);
  }
});

// Fragment events (for debugging)
deck.on('fragmentshown', (event: any) => {
  console.log('Fragment shown:', event.fragment);
});

deck.on('fragmenthidden', (event: any) => {
  console.log('Fragment hidden:', event.fragment);
});

// Overview mode events
deck.on('overviewshown', () => {
  console.log('Overview mode opened');
});

deck.on('overviewhidden', () => {
  console.log('Overview mode closed');
});

// Expose deck globally for debugging
if (typeof window !== 'undefined') {
  (window as any).Reveal = deck;
  console.log('💡 Tip: Access reveal.js via window.Reveal in console');
  console.log('💡 Press "?" for keyboard shortcuts help');
}
