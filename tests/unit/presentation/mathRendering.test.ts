/**
 * Math Rendering Unit Tests
 * TDD Approach - Tests written FIRST before implementation
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderMath } from '@/utils/presentation/mathRendering';

describe('renderMath', () => {
  let mockRenderMathInElement: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Create a mock for the KaTeX renderMathInElement function
    mockRenderMathInElement = vi.fn();
    (global as any).renderMathInElement = mockRenderMathInElement;
  });

  afterEach(() => {
    // Clean up global mock
    delete (global as any).renderMathInElement;
  });

  it('should render math when KaTeX is available', () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Formula: $E = mc^2$</p>';

    renderMath(element);

    expect(mockRenderMathInElement).toHaveBeenCalledTimes(1);
    expect(mockRenderMathInElement).toHaveBeenCalledWith(
      element,
      expect.objectContaining({
        delimiters: expect.arrayContaining([
          expect.objectContaining({ left: '$$', right: '$$', display: true }),
          expect.objectContaining({ left: '$', right: '$', display: false }),
        ]),
        throwOnError: false,
      })
    );
  });

  it('should not throw when KaTeX is unavailable', () => {
    delete (global as any).renderMathInElement;

    const element = document.createElement('div');
    element.innerHTML = '<p>Formula: $E = mc^2$</p>';

    expect(() => renderMath(element)).not.toThrow();
  });

  it('should handle null element gracefully', () => {
    const element = null as any;

    expect(() => renderMath(element)).not.toThrow();
  });

  it('should handle undefined element gracefully', () => {
    const element = undefined as any;

    expect(() => renderMath(element)).not.toThrow();
  });

  it('should use correct delimiters for inline and display math', () => {
    const element = document.createElement('div');

    renderMath(element);

    const config = mockRenderMathInElement.mock.calls[0][1];

    // Check inline delimiter
    const inlineDelimiter = config.delimiters.find(
      (d: any) => d.left === '$' && d.right === '$'
    );
    expect(inlineDelimiter).toBeDefined();
    expect(inlineDelimiter.display).toBe(false);

    // Check display delimiter
    const displayDelimiter = config.delimiters.find(
      (d: any) => d.left === '$$' && d.right === '$$'
    );
    expect(displayDelimiter).toBeDefined();
    expect(displayDelimiter.display).toBe(true);
  });

  it('should set throwOnError to false to handle malformed math', () => {
    const element = document.createElement('div');

    renderMath(element);

    const config = mockRenderMathInElement.mock.calls[0][1];
    expect(config.throwOnError).toBe(false);
  });

  it('should handle KaTeX rendering errors gracefully', () => {
    mockRenderMathInElement.mockImplementation(() => {
      throw new Error('KaTeX rendering error');
    });

    const element = document.createElement('div');

    // Should not throw even if KaTeX throws
    expect(() => renderMath(element)).not.toThrow();
  });

  it('should render math in complex HTML structure', () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <div class="slide">
        <h2>Math Example</h2>
        <p>Inline: $x^2 + y^2 = z^2$</p>
        <p>Display:</p>
        <p>$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$</p>
        <ul>
          <li>Item with math: $a = b + c$</li>
        </ul>
      </div>
    `;

    renderMath(element);

    expect(mockRenderMathInElement).toHaveBeenCalledWith(
      element,
      expect.any(Object)
    );
  });

  it('should be callable multiple times without issues', () => {
    const element = document.createElement('div');

    renderMath(element);
    renderMath(element);
    renderMath(element);

    expect(mockRenderMathInElement).toHaveBeenCalledTimes(3);
  });

  it('should work with empty elements', () => {
    const element = document.createElement('div');
    // Empty element

    expect(() => renderMath(element)).not.toThrow();
    expect(mockRenderMathInElement).toHaveBeenCalledTimes(1);
  });

  it('should handle detached DOM elements', () => {
    const element = document.createElement('div');
    element.innerHTML = '<p>Test $x + y$</p>';
    // Element not attached to document

    expect(() => renderMath(element)).not.toThrow();
    expect(mockRenderMathInElement).toHaveBeenCalledTimes(1);
  });
});
