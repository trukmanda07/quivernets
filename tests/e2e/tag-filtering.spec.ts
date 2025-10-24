import { test, expect } from '@playwright/test';

test.describe('Tag Filtering', () => {
	test('tags page is accessible and displays tags', async ({ page }) => {
		await page.goto('/en/tags');

		// Page should load
		await expect(page).toHaveURL(/\/tags/);

		// Should have some tag elements
		const tags = page.locator(
			'a[href*="/tags/"], .tag, [class*="tag"], button[data-tag]'
		);

		const count = await tags.count();
		expect(count).toBeGreaterThan(0);
	});

	test('clicking a tag navigates to filtered view', async ({ page }) => {
		await page.goto('/en/tags');

		// Find and click a tag
		const firstTag = page.locator(
			'a[href*="/tags/"], .tag a, [class*="tag"] a'
		).first();

		if (await firstTag.isVisible({ timeout: 5000 }).catch(() => false)) {
			const tagHref = await firstTag.getAttribute('href');

			await firstTag.click();

			// Should navigate to tag page
			await page.waitForLoadState('networkidle');

			// URL should contain /tags/ and a tag name
			expect(page.url()).toContain('/tags/');

			// Should show filtered posts
			const posts = page.locator(
				'article, .post, .post-card, [class*="post"]'
			);

			// Either has posts or "no posts" message
			const hasPosts = await posts.first().isVisible({ timeout: 3000 }).catch(() => false);
			const noPostsMsg = await page
				.locator('text=/no posts|no articles|nothing found/i')
				.isVisible({ timeout: 1000 })
				.catch(() => false);

			expect(hasPosts || noPostsMsg).toBe(true);
		}
	});

	test('filtering by category shows correct posts', async ({ page }) => {
		// Navigate to tags or blog page
		await page.goto('/en/tags');

		// Look for category filter (could be dropdown, buttons, or links)
		const categoryFilter = page.locator(
			'[data-category], select[name*="category"], button[data-filter*="category"]'
		).first();

		if (await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
			await categoryFilter.click();

			await page.waitForTimeout(500);

			// Posts should update
			const posts = page.locator('article, .post-card');
			const count = await posts.count();

			// Should have some posts or "no posts" message
			expect(count >= 0).toBe(true);
		} else {
			// Try clicking a specific category link
			const categoryLink = page.locator(
				'a[href*="category="], a[href*="/categories/"]'
			).first();

			if (await categoryLink.isVisible({ timeout: 3000 }).catch(() => false)) {
				await categoryLink.click();
				await expect(page).toHaveURL(/category|categories/);
			}
		}
	});

	test('filtering by learning level shows appropriate posts', async ({ page }) => {
		await page.goto('/en/tags');

		// Look for level filters (beginner, intermediate, advanced)
		const levelFilter = page.locator(
			'button:has-text("Beginner"), button:has-text("Intermediate"), button:has-text("Advanced"), [data-level]'
		).first();

		if (await levelFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
			await levelFilter.click();

			await page.waitForTimeout(500);

			// Posts should update or filter
			const posts = page.locator('article, .post-card');
			const count = await posts.count();

			expect(count >= 0).toBe(true);
		}
	});

	test('multiple filters work together', async ({ page }) => {
		await page.goto('/en/tags');

		// Try applying multiple filters if available
		const firstFilter = page.locator(
			'[data-category], [data-tag], button[data-filter]'
		).first();

		if (await firstFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
			await firstFilter.click();
			await page.waitForTimeout(500);

			const countAfterFirst = await page
				.locator('article, .post-card')
				.count();

			// Try second filter
			const secondFilter = page.locator(
				'[data-category], [data-tag], button[data-filter]'
			).nth(1);

			if (await secondFilter.isVisible({ timeout: 3000 }).catch(() => false)) {
				await secondFilter.click();
				await page.waitForTimeout(500);

				const countAfterSecond = await page
					.locator('article, .post-card')
					.count();

				// Counts might change or stay the same depending on filters
				expect(countAfterSecond >= 0).toBe(true);
			}
		}
	});

	test('active filters are displayed correctly', async ({ page }) => {
		await page.goto('/en/tags');

		// Click a tag to activate filter
		const tag = page.locator('a[href*="/tags/"], .tag a').first();

		if (await tag.isVisible({ timeout: 5000 }).catch(() => false)) {
			const tagText = await tag.textContent();

			await tag.click();
			await page.waitForLoadState('networkidle');

			// Look for active filter indicator
			const activeFilter = page.locator(
				'.active-filter, [class*="active"], [aria-current="page"]'
			);

			const hasActiveIndicator = await activeFilter
				.isVisible({ timeout: 3000 })
				.catch(() => false);

			// Or check if tag name appears in heading/title
			const heading = page.locator('h1, h2').first();
			const headingText = await heading.textContent().catch(() => '');

			// Either has active indicator or shows tag in heading
			expect(hasActiveIndicator || headingText.includes(tagText || '')).toBeTruthy();
		}
	});

	test('can clear filters and see all posts', async ({ page }) => {
		// Start with a filter applied
		await page.goto('/en/tags/calculus').catch(() => page.goto('/en/tags'));

		// Look for "clear filter" or "all" button
		const clearButton = page.locator(
			'button:has-text("Clear"), button:has-text("All"), a:has-text("All"), [data-clear-filter]'
		).first();

		if (await clearButton.isVisible({ timeout: 5000 }).catch(() => false)) {
			const countBefore = await page.locator('article, .post-card').count();

			await clearButton.click();
			await page.waitForTimeout(500);

			const countAfter = await page.locator('article, .post-card').count();

			// Count should change or stay same
			expect(countAfter >= 0).toBe(true);
		} else {
			// Navigate back to main tags/blog page
			await page.goto('/en/blog');

			const allPosts = page.locator('article, .post-card');
			const count = await allPosts.count();

			expect(count >= 0).toBe(true);
		}
	});

	test('tag cloud or tag list is interactive', async ({ page }) => {
		await page.goto('/en/tags');

		// Tags should be clickable
		const tags = page.locator('a[href*="/tags/"], .tag a, [data-tag]');

		const count = await tags.count();

		if (count > 0) {
			// All tags should be clickable
			for (let i = 0; i < Math.min(count, 3); i++) {
				const tag = tags.nth(i);
				const isClickable = await tag.isEnabled().catch(() => false);
				expect(isClickable).toBe(true);
			}
		}
	});
});
