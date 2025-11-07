/**
 * Unit tests for PresentationService
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PresentationService } from '../../../src/services/presentation/PresentationService';
import type { PresentationRepository } from '../../../src/domain/presentation/PresentationRepository';
import { Presentation } from '../../../src/domain/presentation/Presentation';
import type { PresentationMetadata } from '../../../src/domain/presentation/Presentation';
import type { SlideData } from '../../../src/domain/presentation/Slide';
import type { PresentationListItem } from '../../../src/domain/presentation/PresentationRepository';

describe('PresentationService', () => {
  let service: PresentationService;
  let mockRepository: PresentationRepository;

  const createMockMetadata = (overrides?: Partial<PresentationMetadata>): PresentationMetadata => ({
    title: 'Test Presentation',
    description: 'Test description',
    pubDate: '2024-01-01',
    category: 'Test',
    tags: ['test'],
    difficulty: 'beginner',
    language: 'en',
    estimatedTime: 30,
    totalSlides: 2,
    author: 'Test Author',
    ...overrides,
  });

  const createMockSlides = (): SlideData[] => [
    { title: 'Slide 1', time: '00:30', content: '<h1>Test</h1>' },
    { title: 'Slide 2', time: '01:00', content: '<p>Content</p>' },
  ];

  const createMockPresentation = (id: string, overrides?: Partial<PresentationMetadata>): Presentation => {
    return new Presentation(id, createMockMetadata(overrides), createMockSlides());
  };

  beforeEach(() => {
    mockRepository = {
      findBySlug: vi.fn(),
      findAll: vi.fn(),
      findAllWithLanguages: vi.fn(),
      findBySlugAnyLanguage: vi.fn(),
      findByRelatedBlogPost: vi.fn(),
      getSlugs: vi.fn(),
    };

    service = new PresentationService(mockRepository);
  });

  describe('getPresentationsForLanguage', () => {
    it('should return presentation view models', async () => {
      const mockPresentations = [
        createMockPresentation('test-1'),
        createMockPresentation('test-2'),
      ];

      (mockRepository.findAll as any).mockResolvedValue(mockPresentations);

      const result = await service.getPresentationsForLanguage('en');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('test-1');
      expect(result[0].title).toBe('Test Presentation');
      expect(mockRepository.findAll).toHaveBeenCalledWith('en');
    });
  });

  describe('getPresentationBySlug', () => {
    it('should return presentation detail view model', async () => {
      const mockPresentation = createMockPresentation('test-slug');

      (mockRepository.findBySlug as any).mockResolvedValue(mockPresentation);

      const result = await service.getPresentationBySlug('test-slug', 'en');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('test-slug');
      expect(result?.title).toBe('Test Presentation');
      expect(result?.slides).toHaveLength(2);
      expect(mockRepository.findBySlug).toHaveBeenCalledWith('test-slug', 'en');
    });

    it('should return null for non-existent presentation', async () => {
      (mockRepository.findBySlug as any).mockResolvedValue(null);

      const result = await service.getPresentationBySlug('non-existent', 'en');

      expect(result).toBeNull();
    });
  });

  describe('getRelatedPresentations', () => {
    it('should return related presentations', async () => {
      const mockListItems: PresentationListItem[] = [
        {
          id: 'test-1',
          title: 'Test 1',
          description: 'Description',
          pubDate: '2024-01-01',
          relatedBlogPost: 'blog-post',
          category: 'Test',
          tags: ['test'],
          difficulty: 'beginner',
          estimatedTime: 30,
          totalSlides: 5,
          author: 'Author',
          languages: ['en'],
        },
      ];

      (mockRepository.findByRelatedBlogPost as any).mockResolvedValue(mockListItems);

      const result = await service.getRelatedPresentations('blog-post', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('test-1');
      expect(mockRepository.findByRelatedBlogPost).toHaveBeenCalledWith('blog-post', 'en');
    });
  });

  describe('getFeaturedPresentations', () => {
    it('should return only published presentations', async () => {
      const publishedPresentation = createMockPresentation('published', {
        pubDate: '2020-01-01',
      });

      const futurePresentation = createMockPresentation('future', {
        pubDate: '2099-01-01',
      });

      (mockRepository.findAll as any).mockResolvedValue([
        publishedPresentation,
        futurePresentation,
      ]);

      const result = await service.getFeaturedPresentations('en', 3);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('published');
    });

    it('should limit results to specified count', async () => {
      const presentations = [
        createMockPresentation('p1', { pubDate: '2020-01-01' }),
        createMockPresentation('p2', { pubDate: '2020-01-02' }),
        createMockPresentation('p3', { pubDate: '2020-01-03' }),
        createMockPresentation('p4', { pubDate: '2020-01-04' }),
      ];

      (mockRepository.findAll as any).mockResolvedValue(presentations);

      const result = await service.getFeaturedPresentations('en', 2);

      expect(result).toHaveLength(2);
    });
  });

  describe('getPresentationsByTag', () => {
    it('should filter presentations by tag', async () => {
      const withTag = createMockPresentation('with-tag', { tags: ['javascript', 'test'] });
      const withoutTag = createMockPresentation('without-tag', { tags: ['python'] });

      (mockRepository.findAll as any).mockResolvedValue([withTag, withoutTag]);

      const result = await service.getPresentationsByTag('javascript', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('with-tag');
    });
  });

  describe('getPresentationsByDifficulty', () => {
    it('should filter presentations by difficulty', async () => {
      const beginner = createMockPresentation('beginner', { difficulty: 'beginner' });
      const advanced = createMockPresentation('advanced', { difficulty: 'advanced' });

      (mockRepository.findAll as any).mockResolvedValue([beginner, advanced]);

      const result = await service.getPresentationsByDifficulty('beginner', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('beginner');
    });
  });

  describe('getPresentationsByCategory', () => {
    it('should filter presentations by category (case insensitive)', async () => {
      const category1 = createMockPresentation('cat1', { category: 'JavaScript' });
      const category2 = createMockPresentation('cat2', { category: 'Python' });

      (mockRepository.findAll as any).mockResolvedValue([category1, category2]);

      const result = await service.getPresentationsByCategory('javascript', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('cat1');
    });
  });

  describe('getSimilarPresentations', () => {
    it('should return presentations with shared tags', async () => {
      const target = createMockPresentation('target', { tags: ['javascript', 'testing'] });
      const similar1 = createMockPresentation('similar1', { tags: ['javascript', 'react'] });
      const similar2 = createMockPresentation('similar2', { tags: ['testing', 'jest'] });
      const different = createMockPresentation('different', { tags: ['python', 'django'] });

      (mockRepository.findBySlug as any).mockResolvedValue(target);
      (mockRepository.findAll as any).mockResolvedValue([
        target,
        similar1,
        similar2,
        different,
      ]);

      const result = await service.getSimilarPresentations('target', 'en', 3);

      expect(result.length).toBeGreaterThan(0);
      expect(result.some((p) => p.id === 'target')).toBe(false); // Target should not be in results
    });

    it('should return empty array if target not found', async () => {
      (mockRepository.findBySlug as any).mockResolvedValue(null);

      const result = await service.getSimilarPresentations('non-existent', 'en', 3);

      expect(result).toEqual([]);
    });

    it('should limit results to specified count', async () => {
      const target = createMockPresentation('target', { tags: ['test'] });
      const similar = Array.from({ length: 5 }, (_, i) =>
        createMockPresentation(`similar${i}`, { tags: ['test'] })
      );

      (mockRepository.findBySlug as any).mockResolvedValue(target);
      (mockRepository.findAll as any).mockResolvedValue([target, ...similar]);

      const result = await service.getSimilarPresentations('target', 'en', 2);

      expect(result).toHaveLength(2);
    });
  });
});
