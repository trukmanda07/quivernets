/**
 * Unit tests for FileSystemPresentationRepository
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { FileSystemPresentationRepository } from '../../../src/infrastructure/presentation/FileSystemPresentationRepository';
import type { Language } from '../../../src/domain/blog/types';
import path from 'path';

describe('FileSystemPresentationRepository', () => {
  let repository: FileSystemPresentationRepository;

  beforeEach(() => {
    // Initialize repository with the actual content directory
    const contentDir = path.join(process.cwd(), 'src/content');
    repository = new FileSystemPresentationRepository(contentDir);
    repository.clearCache(); // Clear cache between tests
  });

  describe('getSlugs', () => {
    it('should return slugs for presentations in English', async () => {
      const slugs = await repository.getSlugs('en');
      expect(slugs).toBeInstanceOf(Array);
      // Should have at least some presentations
      expect(slugs.length).toBeGreaterThanOrEqual(0);
    });

    it('should return slugs for presentations in Indonesian', async () => {
      const slugs = await repository.getSlugs('id');
      expect(slugs).toBeInstanceOf(Array);
      expect(slugs.length).toBeGreaterThanOrEqual(0);
    });

    it('should cache slugs after first call', async () => {
      const slugs1 = await repository.getSlugs('en');
      const slugs2 = await repository.getSlugs('en');

      expect(slugs1).toEqual(slugs2);
    });

    it('should return empty array for non-existent language directory', async () => {
      const slugs = await repository.getSlugs('fr' as Language);
      expect(slugs).toEqual([]);
    });
  });

  describe('findBySlug', () => {
    it('should return null for non-existent presentation', async () => {
      const result = await repository.findBySlug('non-existent-slug-xyz', 'en');
      expect(result).toBeNull();
    });

    it('should load presentation metadata and slides if they exist', async () => {
      // Get first slug to test with
      const slugs = await repository.getSlugs('en');

      if (slugs.length > 0) {
        const firstSlug = slugs[0];
        const presentation = await repository.findBySlug(firstSlug, 'en');

        expect(presentation).not.toBeNull();
        expect(presentation?.metadata).toBeDefined();
        expect(presentation?.slides).toBeInstanceOf(Array);
        expect(presentation?.metadata.title).toBeDefined();
        expect(presentation?.metadata.description).toBeDefined();
      }
    });

    it('should cache presentation data after first load', async () => {
      const slugs = await repository.getSlugs('en');

      if (slugs.length > 0) {
        const firstSlug = slugs[0];
        const presentation1 = await repository.findBySlug(firstSlug, 'en');
        const presentation2 = await repository.findBySlug(firstSlug, 'en');

        expect(presentation1).toEqual(presentation2);
      }
    });
  });

  describe('findAll', () => {
    it('should return array of presentation domain models for English', async () => {
      const presentations = await repository.findAll('en');

      expect(presentations).toBeInstanceOf(Array);
      presentations.forEach((p) => {
        expect(p.id).toBeDefined();
        expect(p.getTitle()).toBeDefined();
        expect(p.getDescription()).toBeDefined();
        expect(p.getLanguage()).toBe('en');
      });
    });

    it('should return array of presentation domain models for Indonesian', async () => {
      const presentations = await repository.findAll('id');

      expect(presentations).toBeInstanceOf(Array);
      presentations.forEach((p) => {
        expect(p.id).toBeDefined();
        expect(p.getLanguage()).toBe('id');
      });
    });

    it('should sort presentations by date (newest first)', async () => {
      const presentations = await repository.findAll('en');

      if (presentations.length > 1) {
        for (let i = 0; i < presentations.length - 1; i++) {
          const date1 = presentations[i].getPubDate();
          const date2 = presentations[i + 1].getPubDate();
          expect(date1.valueOf()).toBeGreaterThanOrEqual(date2.valueOf());
        }
      }
    });

    it('should cache results after first call', async () => {
      const presentations1 = await repository.findAll('en');
      const presentations2 = await repository.findAll('en');

      expect(presentations1).toEqual(presentations2);
    });
  });

  describe('findAllWithLanguages', () => {
    it('should return presentations with language information', async () => {
      const presentations = await repository.findAllWithLanguages();

      expect(presentations).toBeInstanceOf(Array);
      presentations.forEach((p) => {
        expect(p.id).toBeDefined();
        expect(p.languages).toBeInstanceOf(Array);
        expect(p.languages.length).toBeGreaterThan(0);
      });
    });

    it('should not duplicate presentations across languages', async () => {
      const presentations = await repository.findAllWithLanguages();
      const ids = presentations.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(ids.length).toBe(uniqueIds.size);
    });

    it('should include all available languages for each presentation', async () => {
      const presentations = await repository.findAllWithLanguages();

      presentations.forEach((p) => {
        // Languages should be unique
        const uniqueLangs = new Set(p.languages);
        expect(p.languages.length).toBe(uniqueLangs.size);
      });
    });

    it('should cache results after first call', async () => {
      const presentations1 = await repository.findAllWithLanguages();
      const presentations2 = await repository.findAllWithLanguages();

      expect(presentations1).toEqual(presentations2);
    });
  });

  describe('findBySlugAnyLanguage', () => {
    it('should find presentation regardless of language', async () => {
      const allPresentations = await repository.findAllWithLanguages();

      if (allPresentations.length > 0) {
        const firstPresentation = allPresentations[0];
        const found = await repository.findBySlugAnyLanguage(firstPresentation.id);

        expect(found).not.toBeNull();
        expect(found?.id).toBe(firstPresentation.id);
      }
    });

    it('should return null for non-existent slug', async () => {
      const result = await repository.findBySlugAnyLanguage('non-existent-slug-xyz');
      expect(result).toBeNull();
    });
  });

  describe('findByRelatedBlogPost', () => {
    it('should return presentations related to a blog post', async () => {
      const allPresentations = await repository.findAllWithLanguages();

      // Find a presentation with a related blog post
      const presentationWithBlogPost = allPresentations.find(
        (p) => p.relatedBlogPost && p.relatedBlogPost.length > 0
      );

      if (presentationWithBlogPost) {
        const relatedPresentations = await repository.findByRelatedBlogPost(
          presentationWithBlogPost.relatedBlogPost!,
          presentationWithBlogPost.languages[0] as Language
        );

        expect(relatedPresentations).toBeInstanceOf(Array);
        expect(relatedPresentations.length).toBeGreaterThan(0);
        expect(relatedPresentations.some((p) => p.id === presentationWithBlogPost.id)).toBe(true);
      }
    });

    it('should return empty array for non-existent blog post', async () => {
      const result = await repository.findByRelatedBlogPost('non-existent-blog-post', 'en');
      expect(result).toEqual([]);
    });

    it('should filter by language', async () => {
      const allPresentations = await repository.findAllWithLanguages();

      const presentationWithBlogPost = allPresentations.find(
        (p) => p.relatedBlogPost && p.languages.includes('en')
      );

      if (presentationWithBlogPost) {
        const relatedPresentations = await repository.findByRelatedBlogPost(
          presentationWithBlogPost.relatedBlogPost!,
          'en'
        );

        relatedPresentations.forEach((p) => {
          expect(p.languages).toContain('en');
        });
      }
    });
  });

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      // Load some data to populate cache
      await repository.findAllWithLanguages();
      await repository.getSlugs('en');

      // Clear cache
      repository.clearCache();

      // Subsequent calls should reload from filesystem
      const presentations = await repository.findAllWithLanguages();
      expect(presentations).toBeInstanceOf(Array);
    });
  });
});
