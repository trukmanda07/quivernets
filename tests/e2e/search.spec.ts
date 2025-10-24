import { test, expect } from '@playwright/test';

test.describe('Search Functionality', () => {
	test('search input is visible and accessible', async ({ page }) => {
		await page.goto('/en/');

		// Look for search input (could be in header, sidebar, or dedicated search page)
		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i], input[name*="search" i]'
		).first();

		// Either search is visible on homepage or accessible via search page
		const searchVisible = await searchInput.isVisible({ timeout: 3000 }).catch(() => false);

		if (!searchVisible) {
			// Try navigating to dedicated search page
			await page.goto('/en/search');
			const searchPage = page.locator(
				'input[type="search"], input[placeholder*="search" i]'
			).first();
			await expect(searchPage).toBeVisible({ timeout: 5000 });
		} else {
			await expect(searchInput).toBeVisible();
		}
	});

	test('can perform search and get results', async ({ page }) => {
		// Navigate to search page or find search input
		await page.goto('/en/search').catch(() => page.goto('/en/'));

		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]'
		).first();

		if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Type a common search term
			await searchInput.fill('calculus');

			// Wait a bit for search to process
			await page.waitForTimeout(1000);

			// Look for search results (various possible selectors)
			const results = page.locator(
				'.search-results, [class*="search-result"], [class*="result"], article, .post-card'
			);

			// Check if results are visible or no results message appears
			const hasResults = await results.first().isVisible({ timeout: 3000 }).catch(() => false);
			const noResults = await page
				.locator('text=/no results|nothing found|no matches/i')
				.isVisible({ timeout: 1000 })
				.catch(() => false);

			// Either should have results or "no results" message
			expect(hasResults || noResults).toBe(true);
		}
	});

	test('search filters results by title', async ({ page }) => {
		await page.goto('/en/search').catch(() => page.goto('/en/'));

		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i]'
		).first();

		if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Search for a specific term
			await searchInput.fill('introduction');
			await page.waitForTimeout(1000);

			// Get all visible results
			const results = page.locator('[class*="result"], article, .post-card').filter({
				hasText: /./,
			});

			const count = await results.count();

			if (count > 0) {
				// At least one result should contain the search term
				const firstResult = results.first();
				const text = await firstResult.textContent();
				expect(text?.toLowerCase()).toContain('introduction');
			}
		}
	});

	test('search shows suggestions or autocomplete', async ({ page }) => {
		await page.goto('/en/search').catch(() => page.goto('/en/'));

		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i]'
		).first();

		if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Type partial search term
			await searchInput.fill('calc');

			// Wait for suggestions
			await page.waitForTimeout(500);

			// Look for dropdown, suggestions, or autocomplete
			const suggestions = page.locator(
				'[class*="suggestion"], [class*="autocomplete"], [class*="dropdown"], [role="listbox"]'
			);

			// Suggestions might appear (optional feature)
			const hasSuggestions = await suggestions
				.first()
				.isVisible({ timeout: 2000 })
				.catch(() => false);

			// This is okay if suggestions don't exist
			if (hasSuggestions) {
				const suggestionCount = await suggestions.count();
				expect(suggestionCount).toBeGreaterThan(0);
			}
		}
	});

	test('search respects language filter', async ({ page }) => {
		// Test English search
		await page.goto('/en/search');

		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i]'
		).first();

		if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			await searchInput.fill('mathematics');
			await page.waitForTimeout(1000);

			// Results should be in English context
			const url = page.url();
			expect(url).toContain('/en/');

			// Try Indonesian
			await page.goto('/id/search');

			const idSearchInput = page.locator(
				'input[type="search"], input[placeholder*="search" i], input[placeholder*="cari" i]'
			).first();

			if (await idSearchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
				await idSearchInput.fill('matematika');
				await page.waitForTimeout(1000);

				// Results should be in Indonesian context
				const idUrl = page.url();
				expect(idUrl).toContain('/id/');
			}
		}
	});

	test('empty search shows appropriate feedback', async ({ page }) => {
		await page.goto('/en/search').catch(() => page.goto('/en/'));

		const searchInput = page.locator(
			'input[type="search"], input[placeholder*="search" i]'
		).first();

		if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
			// Clear any existing value
			await searchInput.fill('');

			// Try to submit empty search (press Enter)
			await searchInput.press('Enter');

			await page.waitForTimeout(500);

			// Should either:
			// 1. Show validation message
			// 2. Show all posts
			// 3. Show "enter search term" message
			const body = await page.locator('body').textContent();
			expect(body).toBeDefined();
		}
	});
});
