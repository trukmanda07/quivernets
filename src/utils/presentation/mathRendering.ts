/**
 * Math Rendering Utility - KaTeX integration for presentations
 * Extracted from reveal-init.ts for better testability and reusability
 *
 * Implements TDD approach - tests written first in tests/unit/presentation/mathRendering.test.ts
 */

/**
 * Render mathematical formulas using KaTeX
 *
 * Supports both inline math ($...$) and display math ($$...$$) delimiters.
 * Gracefully handles cases where KaTeX is not loaded or rendering fails.
 *
 * @param element - The HTML element containing math formulas to render
 *
 * @example
 * ```typescript
 * const slideElement = document.querySelector('.slide');
 * renderMath(slideElement);
 * ```
 */
export function renderMath(element: HTMLElement | null | undefined): void {
  // Guard against null/undefined elements
  if (!element) {
    return;
  }

  // Check if KaTeX's auto-render function is available
  if (typeof (window as any).renderMathInElement === 'undefined') {
    return;
  }

  try {
    (window as any).renderMathInElement(element, {
      // Define delimiters for inline and display math
      delimiters: [
        // Display math: $$...$$
        { left: '$$', right: '$$', display: true },
        // Inline math: $...$
        { left: '$', right: '$', display: false },
      ],
      // Don't throw on malformed math - gracefully skip it
      throwOnError: false,
    });
  } catch (error) {
    // Silently handle any KaTeX rendering errors
    console.warn('KaTeX rendering error:', error);
  }
}

/**
 * Render math in all elements matching a selector
 *
 * Useful for rendering math in multiple slides or sections at once.
 *
 * @param selector - CSS selector for elements to render math in
 * @param container - Container element to search within (defaults to document)
 *
 * @example
 * ```typescript
 * // Render math in all slides
 * renderMathInAll('.slide');
 *
 * // Render math in slides within a specific container
 * const presentation = document.querySelector('.presentation');
 * renderMathInAll('.slide', presentation);
 * ```
 */
export function renderMathInAll(
  selector: string,
  container: HTMLElement | Document = document
): void {
  const elements = container.querySelectorAll<HTMLElement>(selector);

  elements.forEach((element) => {
    renderMath(element);
  });
}

/**
 * Check if KaTeX is loaded and available
 *
 * @returns True if KaTeX's renderMathInElement function is available
 *
 * @example
 * ```typescript
 * if (isKatexAvailable()) {
 *   renderMath(element);
 * } else {
 *   console.warn('KaTeX is not loaded');
 * }
 * ```
 */
export function isKatexAvailable(): boolean {
  return typeof (window as any).renderMathInElement !== 'undefined';
}
