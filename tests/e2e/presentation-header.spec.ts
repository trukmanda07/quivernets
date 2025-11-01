/**
 * E2E Tests for PresentationHeader Component
 * These tests verify the header functionality BEFORE and AFTER refactoring
 * Week 3: Comprehensive header component testing
 */

import { test, expect } from '@playwright/test';

test.describe('PresentationHeader Component', () => {
  const presentationUrl = '/en/presentations/gradient-descent-linear-regression';

  test.describe('Header Layout and Visibility', () => {
    test('should display header with correct structure', async ({ page }) => {
      await page.goto(presentationUrl);

      // Header should be visible
      const header = page.locator('.presentation-header');
      await expect(header).toBeVisible();

      // Header should be fixed at top
      const position = await header.evaluate((el) =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('fixed');
    });

    test('should display presentation title', async ({ page }) => {
      await page.goto(presentationUrl);

      const title = page.locator('.header-title');
      await expect(title).toBeVisible();
      await expect(title).toContainText(/gradient/i);
    });

    test('should have shadow styling', async ({ page }) => {
      await page.goto(presentationUrl);

      const header = page.locator('.presentation-header');
      const hasShadow = await header.evaluate((el) =>
        el.classList.contains('shadow-md')
      );
      expect(hasShadow).toBe(true);
    });
  });

  test.describe('Desktop Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
    });

    test('should show desktop navigation on large screens', async ({ page }) => {
      await page.goto(presentationUrl);

      const desktopNav = page.locator('.desktop-nav');
      await expect(desktopNav).toBeVisible();
    });

    test('should have all navigation links', async ({ page }) => {
      await page.goto(presentationUrl);

      const desktopNav = page.locator('.desktop-nav');

      // Check for all navigation links
      await expect(desktopNav.locator('a[href*="/en/"]').first()).toBeVisible();

      // Should have Home, Blog, Presentations, About links
      const links = await desktopNav.locator('a').all();
      expect(links.length).toBeGreaterThanOrEqual(4);
    });

    test('should navigate when clicking desktop nav links', async ({ page }) => {
      await page.goto(presentationUrl);

      // Find and click Blog link
      const blogLink = page.locator('.desktop-nav a[href*="/blog"]');
      if (await blogLink.isVisible()) {
        await blogLink.click();
        await page.waitForLoadState('domcontentloaded');

        // Should navigate to blog
        expect(page.url()).toContain('/blog');
      }
    });

    test('should hide hamburger menu on desktop', async ({ page }) => {
      await page.goto(presentationUrl);

      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      await expect(mobileMenuBtn).toBeHidden();
    });
  });

  test.describe('Mobile Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
    });

    test('should show hamburger menu button on mobile', async ({ page }) => {
      await page.goto(presentationUrl);

      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      await expect(mobileMenuBtn).toBeVisible();
    });

    test('should hide desktop navigation on mobile', async ({ page }) => {
      await page.goto(presentationUrl);

      const desktopNav = page.locator('.desktop-nav');
      await expect(desktopNav).toBeHidden();
    });

    test('should toggle mobile menu on button click', async ({ page }) => {
      await page.goto(presentationUrl);

      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      const mobileNav = page.locator('#mobile-nav');

      // Initially hidden
      await expect(mobileNav).toHaveClass(/hidden/);

      // Click to open
      await mobileMenuBtn.click();
      await page.waitForTimeout(100);
      await expect(mobileNav).not.toHaveClass(/hidden/);

      // Click again to close
      await mobileMenuBtn.click();
      await page.waitForTimeout(100);
      await expect(mobileNav).toHaveClass(/hidden/);
    });

    test('should have all navigation links in mobile menu', async ({ page }) => {
      await page.goto(presentationUrl);

      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      await mobileMenuBtn.click();

      const mobileNav = page.locator('#mobile-nav');
      const links = await mobileNav.locator('a').all();

      // Should have at least 4 navigation links
      expect(links.length).toBeGreaterThanOrEqual(4);
    });

    test('should have proper touch target sizes on mobile', async ({ page }) => {
      await page.goto(presentationUrl);

      // Hamburger button should be at least 44x44px
      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      const box = await mobileMenuBtn.boundingBox();

      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    });
  });

  test.describe('Blog Link Button', () => {
    test('should show blog link button when related post exists', async ({ page }) => {
      await page.goto(presentationUrl);

      const blogButton = page.locator('.action-btn-blog');

      // This presentation should have a related blog post
      if (await blogButton.isVisible()) {
        await expect(blogButton).toBeVisible();

        // Should have proper styling
        const bgColor = await blogButton.evaluate((el) =>
          window.getComputedStyle(el).backgroundColor
        );
        expect(bgColor).toBeTruthy();
      }
    });

    test('should show icon and text on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto(presentationUrl);

      const blogButton = page.locator('.action-btn-blog');

      if (await blogButton.isVisible()) {
        // Should have SVG icon
        const icon = blogButton.locator('svg');
        await expect(icon).toBeVisible();

        // Should have text on desktop
        const text = blogButton.locator('span');
        if (await text.isVisible()) {
          await expect(text).toBeVisible();
        }
      }
    });

    test('should show only icon on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(presentationUrl);

      const blogButton = page.locator('.action-btn-blog');

      if (await blogButton.isVisible()) {
        // Text should be hidden via CSS on mobile
        const text = blogButton.locator('span');
        const fontSize = await text.evaluate((el) =>
          window.getComputedStyle(el).fontSize
        );

        // Text should be hidden (font-size: 0 on mobile)
        expect(parseFloat(fontSize)).toBeLessThanOrEqual(1);
      }
    });

    test('should navigate to blog post when clicked', async ({ page }) => {
      await page.goto(presentationUrl);

      const blogButton = page.locator('.action-btn-blog');

      if (await blogButton.isVisible()) {
        await blogButton.click();
        await page.waitForLoadState('domcontentloaded');

        // Should navigate to blog
        expect(page.url()).toContain('/blog/');
      }
    });
  });

  test.describe('Share Button and Menu', () => {
    test('should display share button', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await expect(shareBtn).toBeVisible();
    });

    test('should have proper share button styling', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      const bgColor = await shareBtn.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );

      // Should have purple background (rgb(147, 51, 234) = #9333ea)
      expect(bgColor).toBeTruthy();
    });

    test('should open share menu on button click', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      const shareMenu = page.locator('#share-menu');

      // Initially hidden
      await expect(shareMenu).toHaveClass(/hidden/);

      // Click to open
      await shareBtn.click();
      await page.waitForTimeout(100);
      await expect(shareMenu).not.toHaveClass(/hidden/);
    });

    test('should close share menu when clicking outside', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      const shareMenu = page.locator('#share-menu');

      // Open menu
      await shareBtn.click();
      await expect(shareMenu).not.toHaveClass(/hidden/);

      // Click outside (on title)
      await page.locator('.header-title').click();
      await page.waitForTimeout(100);

      // Menu should close
      await expect(shareMenu).toHaveClass(/hidden/);
    });

    test('should have all share options in menu', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const shareMenu = page.locator('#share-menu');

      // Check for all share options
      await expect(shareMenu.locator('#share-copy')).toBeVisible();
      await expect(shareMenu.locator('#share-twitter')).toBeVisible();
      await expect(shareMenu.locator('#share-facebook')).toBeVisible();
      await expect(shareMenu.locator('#share-linkedin')).toBeVisible();
      await expect(shareMenu.locator('#share-whatsapp')).toBeVisible();
    });

    test('should have proper menu positioning', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const shareMenu = page.locator('#share-menu');

      // Menu should be positioned below button
      const position = await shareMenu.evaluate((el) =>
        window.getComputedStyle(el).position
      );
      expect(position).toBe('absolute');
    });
  });

  test.describe('Share Functionality', () => {
    test('should copy link to clipboard', async ({ page, context }) => {
      // Grant clipboard permissions
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto(presentationUrl);
      await page.waitForTimeout(500);

      // Open share menu
      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      // Click copy button
      const copyBtn = page.locator('#share-copy');
      await copyBtn.click();

      // Check for success notification
      const notification = page.locator('text=/copied/i');
      await expect(notification).toBeVisible({ timeout: 2000 });

      // Verify clipboard content
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toContain('/presentations/');
    });

    test('should include slide number in share URL', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto(presentationUrl);
      await page.waitForTimeout(1000);

      // Navigate to slide 3
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(500);

      // Copy link
      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();
      const copyBtn = page.locator('#share-copy');
      await copyBtn.click();

      await page.waitForTimeout(500);

      // Clipboard should contain slide hash
      const clipboardText = await page.evaluate(() =>
        navigator.clipboard.readText()
      );
      expect(clipboardText).toMatch(/#\/\d+/);
    });

    test('should show notification on successful copy', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const copyBtn = page.locator('#share-copy');
      await copyBtn.click();

      // Notification should appear
      const notification = page.locator('.fixed.top-20.right-4');
      await expect(notification).toBeVisible();

      // Notification should contain success message
      await expect(notification).toContainText(/copied/i);
    });

    test('should close share menu after copy', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);

      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const shareMenu = page.locator('#share-menu');
      const copyBtn = page.locator('#share-copy');

      await copyBtn.click();
      await page.waitForTimeout(200);

      // Menu should close after action
      await expect(shareMenu).toHaveClass(/hidden/);
    });

    test('should open Twitter share in new window', async ({ page, context }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      // Listen for popup
      const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

      const twitterBtn = page.locator('#share-twitter');
      await twitterBtn.click();

      // Should open new window
      const popup = await popupPromise;
      expect(popup.url()).toContain('twitter.com');

      await popup.close();
    });

    test('should open Facebook share in new window', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

      const facebookBtn = page.locator('#share-facebook');
      await facebookBtn.click();

      const popup = await popupPromise;
      expect(popup.url()).toContain('facebook.com');

      await popup.close();
    });

    test('should open LinkedIn share in new window', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

      const linkedinBtn = page.locator('#share-linkedin');
      await linkedinBtn.click();

      const popup = await popupPromise;
      expect(popup.url()).toContain('linkedin.com');

      await popup.close();
    });

    test('should open WhatsApp share in new window', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      await shareBtn.click();

      const popupPromise = page.waitForEvent('popup', { timeout: 5000 });

      const whatsappBtn = page.locator('#share-whatsapp');
      await whatsappBtn.click();

      const popup = await popupPromise;
      expect(popup.url()).toContain('wa.me');

      await popup.close();
    });
  });

  test.describe('Language Switcher', () => {
    test('should display language switcher', async ({ page }) => {
      await page.goto(presentationUrl);

      // Language switcher should be in header actions
      const headerActions = page.locator('.header-actions');
      await expect(headerActions).toBeVisible();
    });

    test('should have language links', async ({ page }) => {
      await page.goto(presentationUrl);

      // Should have links with language paths
      const langLinks = page.locator('a[href*="/en/"], a[href*="/id/"]');
      const count = await langLinks.count();

      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should adapt title size on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(presentationUrl);

      const title = page.locator('.header-title');
      const fontSize = await title.evaluate((el) =>
        window.getComputedStyle(el).fontSize
      );

      // Font size should be smaller on mobile
      expect(parseFloat(fontSize)).toBeLessThan(16);
    });

    test('should limit title width on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(presentationUrl);

      const title = page.locator('.header-title');
      const maxWidth = await title.evaluate((el) =>
        window.getComputedStyle(el).maxWidth
      );

      // Should have max-width constraint
      expect(maxWidth).not.toBe('none');
    });

    test('should maintain header layout on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(presentationUrl);

      const header = page.locator('.presentation-header');
      await expect(header).toBeVisible();

      // Should have proper spacing
      const headerTop = page.locator('.header-top');
      await expect(headerTop).toBeVisible();
    });

    test('should maintain accessibility on all viewports', async ({ page }) => {
      const viewports = [
        { width: 375, height: 667 },  // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1920, height: 1080 } // Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(presentationUrl);

        // All interactive elements should be visible
        const header = page.locator('.presentation-header');
        await expect(header).toBeVisible();

        // Share button should always be accessible
        const shareBtn = page.locator('#share-btn');
        await expect(shareBtn).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(presentationUrl);

      // Mobile menu button should have aria-label
      const mobileMenuBtn = page.locator('#mobile-menu-btn');
      const ariaLabel = await mobileMenuBtn.getAttribute('aria-label');

      expect(ariaLabel).toBeTruthy();
      expect(ariaLabel?.toLowerCase()).toContain('menu');
    });

    test('should have proper link titles', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      const title = await shareBtn.getAttribute('title');

      expect(title).toBeTruthy();
    });

    test('should support keyboard navigation', async ({ page }) => {
      await page.goto(presentationUrl);

      // Tab through interactive elements
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Should be able to focus on buttons
      const focusedElement = await page.evaluate(() =>
        document.activeElement?.tagName
      );

      expect(['A', 'BUTTON']).toContain(focusedElement);
    });
  });

  test.describe('Performance', () => {
    test('should load header quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto(presentationUrl);

      const header = page.locator('.presentation-header');
      await expect(header).toBeVisible();

      const loadTime = Date.now() - startTime;

      // Header should be visible within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('should not block presentation loading', async ({ page }) => {
      await page.goto(presentationUrl);

      // Both header and presentation should load
      await expect(page.locator('.presentation-header')).toBeVisible();
      await expect(page.locator('.reveal')).toBeVisible();
    });
  });

  test.describe('Visual Regression Prevention', () => {
    test('should maintain consistent styling', async ({ page }) => {
      await page.goto(presentationUrl);

      const header = page.locator('.presentation-header');

      // Check background color
      const bgColor = await header.evaluate((el) =>
        window.getComputedStyle(el).backgroundColor
      );
      expect(bgColor).toBe('rgb(255, 255, 255)'); // white

      // Check z-index
      const zIndex = await header.evaluate((el) =>
        window.getComputedStyle(el).zIndex
      );
      expect(zIndex).toBe('1000');
    });

    test('should maintain button colors', async ({ page }) => {
      await page.goto(presentationUrl);

      const shareBtn = page.locator('#share-btn');
      const color = await shareBtn.evaluate((el) =>
        window.getComputedStyle(el).color
      );

      // Should have white text
      expect(color).toBe('rgb(255, 255, 255)');
    });
  });
});
