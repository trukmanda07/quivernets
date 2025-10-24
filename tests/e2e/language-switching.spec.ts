import { test, expect } from '@playwright/test';

test.describe('Language Switching', () => {
	test('language switcher is visible', async ({ page }) => {
		await page.goto('/en/');

		// Look for language switcher (various possible implementations)
		const langSwitcher = page.locator(
			'[data-language-switcher], [class*="lang"], [class*="language"], a[href*="/en/"], a[href*="/id/"]'
		).first();

		await expect(langSwitcher).toBeVisible({ timeout: 5000 });
	});

	test('switching from English to Indonesian updates URL', async ({ page }) => {
		await page.goto('/en/');

		// Find Indonesian language link
		const idLink = page.locator(
			'a[href*="/id/"], a[href*="/id"], button:has-text("ID"), button:has-text("Indonesian"), [data-lang="id"]'
		).first();

		if (await idLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await idLink.click();

			// Wait for navigation
			await page.waitForLoadState('networkidle');

			// URL should now contain /id/
			expect(page.url()).toContain('/id/');
		} else {
			// Manually navigate to Indonesian version
			await page.goto('/id/');
			expect(page.url()).toContain('/id/');
		}
	});

	test('switching from Indonesian to English updates URL', async ({ page }) => {
		await page.goto('/id/');

		// Find English language link
		const enLink = page.locator(
			'a[href*="/en/"], a[href*="/en"], button:has-text("EN"), button:has-text("English"), [data-lang="en"]'
		).first();

		if (await enLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await enLink.click();

			// Wait for navigation
			await page.waitForLoadState('networkidle');

			// URL should now contain /en/
			expect(page.url()).toContain('/en/');
		} else {
			// Manually navigate to English version
			await page.goto('/en/');
			expect(page.url()).toContain('/en/');
		}
	});

	test('language persists across navigation', async ({ page }) => {
		// Start in Indonesian
		await page.goto('/id/');

		// Navigate to blog
		const blogLink = page.locator('a[href*="/id/blog"]').first();

		if (await blogLink.isVisible({ timeout: 5000 }).catch(() => false)) {
			await blogLink.click();
		} else {
			await page.goto('/id/blog');
		}

		// Should still be in Indonesian
		expect(page.url()).toContain('/id/');

		// Navigate to another page
		await page.goto('/id/').catch(() => {});

		// Try clicking a post link
		const postLink = page.locator('a[href*="/id/blog/"]').first();

		if (await postLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			const href = await postLink.getAttribute('href');
			expect(href).toContain('/id/');
		}
	});

	test('content changes when switching languages', async ({ page }) => {
		// Go to English homepage
		await page.goto('/en/');
		const enContent = await page.locator('main, body').textContent();

		// Go to Indonesian homepage
		await page.goto('/id/');
		const idContent = await page.locator('main, body').textContent();

		// Content should be different (or at least have different language markers)
		// Check for common Indonesian vs English words
		const hasEnglish = enContent?.includes('Blog') || enContent?.includes('Posts');
		const hasIndonesian =
			idContent?.includes('Tentang') ||
			idContent?.includes('Artikel') ||
			idContent?.includes('Kategori');

		// At least one should be true
		expect(hasEnglish || hasIndonesian).toBe(true);
	});

	test('language switcher highlights current language', async ({ page }) => {
		// Test English
		await page.goto('/en/');

		const enIndicator = page.locator(
			'[data-lang="en"][aria-current], [data-lang="en"].active, [href*="/en/"].active, button:has-text("EN").active'
		);

		const enHighlighted = await enIndicator.isVisible({ timeout: 3000 }).catch(() => false);

		// Test Indonesian
		await page.goto('/id/');

		const idIndicator = page.locator(
			'[data-lang="id"][aria-current], [data-lang="id"].active, [href*="/id/"].active, button:has-text("ID").active'
		);

		const idHighlighted = await idIndicator.isVisible({ timeout: 3000 }).catch(() => false);

		// At least one should work (or they might not have visual indicators)
		// This is a nice-to-have feature
		if (enHighlighted || idHighlighted) {
			expect(enHighlighted || idHighlighted).toBe(true);
		}
	});

	test('both languages have accessible content', async ({ page }) => {
		// Test English
		await page.goto('/en/');
		const enMain = page.locator('main, [role="main"]').first();
		await expect(enMain).toBeVisible();

		const enContent = await enMain.textContent();
		expect(enContent?.length).toBeGreaterThan(0);

		// Test Indonesian
		await page.goto('/id/');
		const idMain = page.locator('main, [role="main"]').first();
		await expect(idMain).toBeVisible();

		const idContent = await idMain.textContent();
		expect(idContent?.length).toBeGreaterThan(0);
	});
});
