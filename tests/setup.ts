/**
 * Vitest setup file
 * This file runs before all tests and sets up mocks for Astro-specific modules
 */

import { vi } from 'vitest';

// Mock astro:content module
vi.mock('astro:content', async () => {
  const mock = await import('./mocks/astro-content');
  return {
    getCollection: mock.getCollection,
  };
});
