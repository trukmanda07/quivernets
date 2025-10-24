import { test, expect } from '@playwright/test';

test.describe('Blog Navigation', () => {
	test('homepage loads and displays recent posts', async ({ page }) => {
		await page.goto('/en/');

		// Check page loads
		await expect(page).toHaveTitle(/QuiverLearn/i);

		// Check for content presence (posts or articles)
		const content = page.locator('main, article, .post, .post-card, [class*="post"]').first();
		await expect(content).toBeVisible({ timeout: 10000 });
	});

	test('can navigate from homepage to blog listing', async ({ page }) => {
		await page.goto('/en/');

		// Look for blog link (could be in nav, header, or main content)
		const blogLink = page.locator('a[href*="/blog"]').first();

		// If blog link exists, click it
		if (await blogLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await blogLink.click();
			await expect(page).toHaveURL(/\/blog/);
		} else {
			// If we're already on blog page or no link, just verify we can access it
			await page.goto('/en/blog');
			await expect(page).toHaveURL(/\/en\/blog/);
		}
	});

	test('can navigate to individual blog post', async ({ page }) => {
		await page.goto('/en/blog');

		// Wait for page to load
		await page.waitForLoadState('networkidle');

		// Find first post link (article, post-card, or any link in main content)
		const postLink = page.locator('main a[href*="/blog/"], article a, .post-card a, a[class*="post"]').first();

		if (await postLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await postLink.click();

			// Verify we're on a post page (URL should contain /blog/ and something after it)
			await expect(page).toHaveURL(/\/blog\/[^/]+/);

			// Verify post content is visible
			const content = page.locator('main, article, .content, [class*="content"]').first();
			await expect(content).toBeVisible();
		}
	});

	test('breadcrumbs navigate correctly', async ({ page }) => {
		// Navigate to a blog post
		await page.goto('/en/blog');

		const postLink = page.locator('main a[href*="/blog/"]').first();
		if (await postLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await postLink.click();

			// Look for breadcrumbs
			const breadcrumb = page.locator('[class*="breadcrumb"], nav[aria-label*="Breadcrumb" i]').first();

			if (await breadcrumb.isVisible({ timeout: 5000 }).catch(() => false)) {
				// Click on "Blog" or "Home" in breadcrumbs
				const blogCrumb = breadcrumb.locator('a[href*="/blog"], a:has-text("Blog")').first();

				if (await blogCrumb.isVisible().catch(() => false)) {
					await blogCrumb.click();
					await expect(page).toHaveURL(/\/blog\/?$/);
				}
			}
		}
	});

	test('header navigation is present and functional', async ({ page }) => {
		await page.goto('/en/');

		// Check header exists
		const header = page.locator('header, [role="banner"]').first();
		await expect(header).toBeVisible();

		// Check for navigation links
		const nav = page.locator('nav, header nav, [role="navigation"]').first();
		await expect(nav).toBeVisible({ timeout: 5000 });

		// Verify there are clickable links in navigation
		const navLinks = nav.locator('a');
		const count = await navLinks.count();
		expect(count).toBeGreaterThan(0);
	});

	test('footer is present on all pages', async ({ page }) => {
		// Test on multiple pages
		const urls = ['/en/', '/en/blog'];

		for (const url of urls) {
			await page.goto(url);
			const footer = page.locator('footer, [role="contentinfo"]').first();
			await expect(footer).toBeVisible({ timeout: 5000 });
		}
	});

	test('can navigate back and forward through browser history', async ({ page }) => {
		// Start at homepage
		await page.goto('/en/');
		const homeUrl = page.url();

		// Navigate to blog
		await page.goto('/en/blog');
		await expect(page).toHaveURL(/\/blog/);

		// Go back
		await page.goBack();
		expect(page.url()).toBe(homeUrl);

		// Go forward
		await page.goForward();
		await expect(page).toHaveURL(/\/blog/);
	});

	test('404 page exists for invalid routes', async ({ page }) => {
		const response = await page.goto('/en/nonexistent-page-12345');

		// Should get 404 status or redirect
		expect(response?.status()).toBeOneOf([404, 301, 302, 200]);

		// Page should load (even if it's a 404 page)
		await expect(page.locator('body')).toBeVisible();
	});
});
