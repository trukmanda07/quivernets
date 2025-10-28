/**
 * Reveal.js initialization script
 * Loaded as a bundled client-side script
 */

import Reveal from 'reveal.js';
import Highlight from 'reveal.js/plugin/highlight/highlight.esm.js';
import Notes from 'reveal.js/plugin/notes/notes.esm.js';

// Get config from global variable (set by inline script)
declare global {
  interface Window {
    __REVEAL_CONFIG__: any;
    __REVEAL_SLUG__: string;
    __REVEAL_SLIDES__: any[];
  }
}

// ===== PROGRESS TRACKING UTILITIES =====
const STORAGE_KEY = 'presentationProgress';

function loadProgress(presentationSlug: string) {
  if (typeof localStorage === 'undefined' || !presentationSlug) return null;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allProgress = data ? JSON.parse(data) : {};
    return allProgress[presentationSlug] || null;
  } catch (error) {
    console.error('Error loading progress:', error);
    return null;
  }
}

function saveProgress(presentationSlug: string, slideIndex: number, totalSlides: number) {
  if (typeof localStorage === 'undefined' || !presentationSlug) return;
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const allProgress = data ? JSON.parse(data) : {};
    const isLastSlide = slideIndex === totalSlides - 1;

    allProgress[presentationSlug] = {
      currentSlide: slideIndex,
      totalSlides,
      lastVisited: new Date().toISOString(),
      completed: isLastSlide,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allProgress));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

// ===== KATEX RENDERING =====
function renderKaTeX() {
  if (typeof (window as any).renderMathInElement !== 'undefined') {
    const currentSlide = deck.getCurrentSlide();
    if (currentSlide) {
      (window as any).renderMathInElement(currentSlide, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false},
        ],
        throwOnError: false
      });
    }
  }
}

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
    const progress = loadProgress(slug);
    if (progress && progress.currentSlide > 0 && !progress.completed) {
      console.log(`📖 Resuming from slide ${progress.currentSlide + 1} of ${slides.length}`);
      deck.slide(progress.currentSlide);
    }
  }

  // Initial KaTeX render
  renderKaTeX();
}).catch((error) => {
  console.error('❌ reveal.js initialization failed:', error);
});

// ===== EVENT LISTENERS =====

// Slide changed event
deck.on('slidechanged', (event: any) => {
  console.log(`Slide changed: ${event.indexh + 1} / ${slides.length}`);

  // Save progress
  if (slug) {
    saveProgress(slug, event.indexh, slides.length);

    // Log completion
    if (event.indexh === slides.length - 1) {
      console.log('🎉 Presentation completed!');
    }
  }

  // Render KaTeX on new slide
  renderKaTeX();
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
