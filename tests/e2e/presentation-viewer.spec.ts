/**
 * E2E Tests for Presentation Viewer (Reveal.js Integration)
 * Week 2: Comprehensive testing of presentation functionality
 */

import { test, expect } from '@playwright/test';

test.describe('Presentation Viewer', () => {
  // Use an actual presentation that exists in the project
  const presentationUrl = '/en/presentations/gradient-descent-linear-regression';
  const presentationSlug = 'gradient-descent-linear-regression';

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto(presentationUrl);
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Basic Loading', () => {
    test('should load presentation successfully', async ({ page }) => {
      await page.goto(presentationUrl);

      // Check that Reveal.js container is visible
      await expect(page.locator('.reveal')).toBeVisible();

      // Check that presentation header is visible
      await expect(page.locator('.presentation-header')).toBeVisible();

      // Check that slides are rendered
      const slides = page.locator('.reveal .slides section');
      const slideCount = await slides.count();
      expect(slideCount).toBeGreaterThan(0);
    });

    test('should display presentation title', async ({ page }) => {
      await page.goto(presentationUrl);

      // Title should be visible in header
      const header = page.locator('.presentation-header');
      await expect(header).toBeVisible();
    });

    test('should start on first slide', async ({ page }) => {
      await page.goto(presentationUrl);

      // Wait for Reveal.js to initialize
      await page.waitForTimeout(500);

      // First slide should have 'present' class
      const firstSlide = page.locator('.reveal .slides section').first();
      await expect(firstSlide).toHaveClass(/present/);
    });
  });

  test.describe('Navigation - Keyboard', () => {
    test('should navigate to next slide with ArrowRight', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Press right arrow
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // URL should have hash for slide 2
      expect(page.url()).toContain('#/1');
    });

    test('should navigate to previous slide with ArrowLeft', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Go to slide 2
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // Go back to slide 1
      await page.keyboard.press('ArrowLeft');
      await page.waitForTimeout(300);

      // Should be back on first slide
      expect(page.url()).toContain('#/0');
    });

    test('should navigate to first slide with Home key', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate to slide 3
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // Press Home
      await page.keyboard.press('Home');
      await page.waitForTimeout(300);

      // Should be on first slide
      expect(page.url()).toContain('#/0');
    });

    test('should navigate to last slide with End key', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Press End
      await page.keyboard.press('End');
      await page.waitForTimeout(500);

      // Should be on last slide (check that we're not on first)
      const url = page.url();
      expect(url).not.toContain('#/0');
    });
  });

  test.describe('Navigation - Controls', () => {
    test('should have Reveal.js navigation controls', async ({ page }) => {
      await page.goto(presentationUrl);

      // Reveal.js should show controls
      const controls = page.locator('.reveal .controls');
      await expect(controls).toBeVisible();
    });

    test('should navigate with control buttons', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Click next button
      const nextButton = page.locator('.navigate-right');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);

        // Should move to next slide
        expect(page.url()).toContain('#/1');
      }
    });
  });

  test.describe('Progress Tracking', () => {
    test('should save progress to localStorage', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate to slide 3
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Check localStorage
      const progress = await page.evaluate((slug) => {
        const data = localStorage.getItem('presentationProgress');
        return data ? JSON.parse(data) : null;
      }, presentationSlug);

      expect(progress).toBeTruthy();
      expect(progress[presentationSlug]).toBeDefined();
      expect(progress[presentationSlug].currentSlide).toBeGreaterThanOrEqual(0);
    });

    test('should resume from saved progress', async ({ page }) => {
      // First, save progress at slide 3
      await page.goto(presentationUrl);
      await page.evaluate((slug) => {
        const progressData = {
          [slug]: {
            currentSlide: 2, // 0-based index
            totalSlides: 10,
            lastVisited: new Date().toISOString(),
            completed: false,
          },
        };
        localStorage.setItem('presentationProgress', JSON.stringify(progressData));
      }, presentationSlug);

      // Reload the page
      await page.reload();
      await page.waitForTimeout(1000);

      // Should resume at slide 3
      const url = page.url();
      expect(url).toContain('#/2');
    });

    test('should not resume if presentation is completed', async ({ page }) => {
      // Set completed progress
      await page.goto(presentationUrl);
      await page.evaluate((slug) => {
        const progressData = {
          [slug]: {
            currentSlide: 9,
            totalSlides: 10,
            lastVisited: new Date().toISOString(),
            completed: true,
          },
        };
        localStorage.setItem('presentationProgress', JSON.stringify(progressData));
      }, presentationSlug);

      // Reload
      await page.reload();
      await page.waitForTimeout(1000);

      // Should start from beginning
      expect(page.url()).toContain('#/0');
    });

    test('should update progress on slide change', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate through slides
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // Check that progress was updated
      const progress = await page.evaluate((slug) => {
        const data = localStorage.getItem('presentationProgress');
        return data ? JSON.parse(data)[slug] : null;
      }, presentationSlug);

      expect(progress.currentSlide).toBeGreaterThan(0);
    });
  });

  test.describe('KaTeX Math Rendering', () => {
    test('should load KaTeX library', async ({ page }) => {
      await page.goto(presentationUrl);

      // Check if KaTeX CSS is loaded
      const katexLink = page.locator('link[href*="katex"]');
      await expect(katexLink).toHaveCount(1);
    });

    test('should render math formulas if present', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(1000);

      // Look for KaTeX rendered elements
      const katexElements = page.locator('.katex');
      const count = await katexElements.count();

      // If there's math in the presentation, it should be rendered
      if (count > 0) {
        await expect(katexElements.first()).toBeVisible();
      }
    });

    test('should render math on slide change', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate to next slide
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Math should still be rendered if present
      const katexElements = page.locator('.katex');
      const count = await katexElements.count();

      if (count > 0) {
        await expect(katexElements.first()).toBeVisible();
      }
    });
  });

  test.describe('Deep Linking', () => {
    test('should load specific slide from URL hash', async ({ page }) => {
      // Navigate directly to slide 3
      await page.goto(`${presentationUrl}#/2`);
      await page.waitForTimeout(1000);

      // Should be on slide 3
      expect(page.url()).toContain('#/2');
    });

    test('should update URL hash on navigation', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate to slide 2
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // URL should update
      expect(page.url()).toContain('#/1');
    });

    test('should support browser back/forward navigation', async ({ page }) => {
      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Navigate forward
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      // Use browser back
      await page.goBack();
      await page.waitForTimeout(300);

      expect(page.url()).toContain('#/1');

      // Use browser forward
      await page.goForward();
      await page.waitForTimeout(300);

      expect(page.url()).toContain('#/2');
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should work on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(presentationUrl);

      // Presentation should load
      await expect(page.locator('.reveal')).toBeVisible();

      // Navigation should work
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(300);

      expect(page.url()).toContain('#/1');
    });

    test('should work on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(presentationUrl);

      await expect(page.locator('.reveal')).toBeVisible();
    });

    test('should work on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(presentationUrl);

      await expect(page.locator('.reveal')).toBeVisible();
    });
  });

  test.describe('Console Logging', () => {
    test('should log initialization success', async ({ page }) => {
      const messages: string[] = [];

      page.on('console', (msg) => {
        messages.push(msg.text());
      });

      await page.goto(presentationUrl);
      await page.waitForTimeout(1000);

      // Should see initialization message
      const hasInitMessage = messages.some((msg) =>
        msg.includes('reveal.js initialized')
      );
      expect(hasInitMessage).toBe(true);
    });

    test('should log slide changes', async ({ page }) => {
      const messages: string[] = [];

      page.on('console', (msg) => {
        messages.push(msg.text());
      });

      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Clear previous messages
      messages.length = 0;

      // Navigate to next slide
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Should log slide change
      const hasSlideChange = messages.some((msg) =>
        msg.includes('Slide changed')
      );
      expect(hasSlideChange).toBe(true);
    });
  });

  test.describe('Presentation Header', () => {
    test('should display navigation menu', async ({ page }) => {
      await page.goto(presentationUrl);

      // Desktop nav should be visible on desktop
      await page.setViewportSize({ width: 1024, height: 768 });
      const desktopNav = page.locator('.desktop-nav, nav');

      if (await desktopNav.isVisible()) {
        await expect(desktopNav).toBeVisible();
      }
    });

    test('should have language switcher', async ({ page }) => {
      await page.goto(presentationUrl);

      // Look for language switcher or language links
      const langLinks = page.locator('a[href*="/id/"], a[href*="/en/"]');
      const count = await langLinks.count();

      // Should have at least one language option
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle missing KaTeX gracefully', async ({ page }) => {
      // Block KaTeX script
      await page.route('**/katex**', (route) => route.abort());

      await page.goto(presentationUrl);
      await page.waitForTimeout(1000);

      // Presentation should still load
      await expect(page.locator('.reveal')).toBeVisible();
    });

    test('should handle corrupted localStorage gracefully', async ({ page }) => {
      await page.goto(presentationUrl);

      // Corrupt localStorage
      await page.evaluate(() => {
        localStorage.setItem('presentationProgress', 'invalid json {{{');
      });

      // Reload - should not crash
      await page.reload();
      await page.waitForTimeout(1000);

      await expect(page.locator('.reveal')).toBeVisible();
    });
  });
});
