import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('should load the homepage successfully', async ({ page }) => {
		await page.goto('/');

		// Check that the page loads
		await expect(page).toHaveTitle(/QuiverLearn/i);
	});

	test('should display the header with navigation', async ({ page }) => {
		await page.goto('/');

		// Check for header presence
		const header = page.locator('header');
		await expect(header).toBeVisible();
	});

	test('should have language switcher', async ({ page }) => {
		await page.goto('/');

		// Check for language switcher (should have en/id options)
		const langSwitcher = page.locator('[data-language-switcher], a[href*="/en/"], a[href*="/id/"]').first();
		await expect(langSwitcher).toBeVisible();
	});

	test('should display blog posts or content', async ({ page }) => {
		await page.goto('/en/');

		// Check that there's some content on the page
		const content = page.locator('main, article, .post-card').first();
		await expect(content).toBeVisible();
	});

	test('should navigate to English homepage', async ({ page }) => {
		await page.goto('/en/');

		// Verify we're on the English version
		expect(page.url()).toContain('/en/');
	});

	test('should navigate to Indonesian homepage', async ({ page }) => {
		await page.goto('/id/');

		// Verify we're on the Indonesian version
		expect(page.url()).toContain('/id/');
	});

	test('should have footer', async ({ page }) => {
		await page.goto('/');

		const footer = page.locator('footer');
		await expect(footer).toBeVisible();
	});
});
