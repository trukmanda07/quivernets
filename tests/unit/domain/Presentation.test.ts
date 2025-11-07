/**
 * Unit tests for Presentation domain model
 */

import { describe, it, expect } from 'vitest';
import { Presentation } from '../../../src/domain/presentation/Presentation';
import type { PresentationMetadata } from '../../../src/domain/presentation/Presentation';
import type { SlideData } from '../../../src/domain/presentation/Slide';

describe('Presentation', () => {
  const createValidMetadata = (): PresentationMetadata => ({
    title: 'Test Presentation',
    description: 'A test presentation',
    pubDate: '2024-01-01',
    category: 'Testing',
    tags: ['test', 'javascript'],
    difficulty: 'beginner',
    language: 'en',
    estimatedTime: 30,
    totalSlides: 5,
    author: 'Test Author',
  });

  const createValidSlides = (): SlideData[] => [
    {
      title: 'Introduction',
      time: '00:30',
      content: '<h1>Welcome</h1>',
    },
    {
      title: 'Main Content',
      time: '01:00',
      content: '<p>Content here</p>',
    },
  ];

  describe('constructor', () => {
    it('should create a valid presentation', () => {
      const metadata = createValidMetadata();
      const slides = createValidSlides();

      const presentation = new Presentation('test-slug', metadata, slides);

      expect(presentation.id).toBe('test-slug');
      expect(presentation.metadata).toEqual(metadata);
      expect(presentation.slides.length).toBe(2);
    });

    it('should throw error for empty title', () => {
      const metadata = { ...createValidMetadata(), title: '' };
      const slides = createValidSlides();

      expect(() => new Presentation('test', metadata, slides)).toThrow(
        'Presentation title is required'
      );
    });

    it('should throw error for empty description', () => {
      const metadata = { ...createValidMetadata(), description: '' };
      const slides = createValidSlides();

      expect(() => new Presentation('test', metadata, slides)).toThrow(
        'Presentation description is required'
      );
    });

    it('should throw error for invalid difficulty', () => {
      const metadata = { ...createValidMetadata(), difficulty: 'invalid' as any };
      const slides = createValidSlides();

      expect(() => new Presentation('test', metadata, slides)).toThrow(
        'Invalid presentation difficulty level'
      );
    });

    it('should warn for slide count mismatch', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const metadata = { ...createValidMetadata(), totalSlides: 10 };
      const slides = createValidSlides();

      new Presentation('test', metadata, slides);

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Slide count mismatch')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('isPublished', () => {
    it('should return true for past dates', () => {
      const metadata = { ...createValidMetadata(), pubDate: '2020-01-01' };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.isPublished()).toBe(true);
    });

    it('should return false for future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const metadata = { ...createValidMetadata(), pubDate: futureDate.toISOString() };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.isPublished()).toBe(false);
    });
  });

  describe('hasRelatedBlogPost', () => {
    it('should return true when relatedBlogPost is set', () => {
      const metadata = { ...createValidMetadata(), relatedBlogPost: 'blog-post-slug' };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.hasRelatedBlogPost()).toBe(true);
    });

    it('should return false when relatedBlogPost is not set', () => {
      const metadata = createValidMetadata();
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.hasRelatedBlogPost()).toBe(false);
    });
  });

  describe('getSlideCount', () => {
    it('should return the correct number of slides', () => {
      const presentation = new Presentation('test', createValidMetadata(), createValidSlides());

      expect(presentation.getSlideCount()).toBe(2);
    });
  });

  describe('hasTag', () => {
    it('should return true for existing tag (case insensitive)', () => {
      const presentation = new Presentation('test', createValidMetadata(), createValidSlides());

      expect(presentation.hasTag('test')).toBe(true);
      expect(presentation.hasTag('TEST')).toBe(true);
      expect(presentation.hasTag('JavaScript')).toBe(true);
    });

    it('should return false for non-existing tag', () => {
      const presentation = new Presentation('test', createValidMetadata(), createValidSlides());

      expect(presentation.hasTag('python')).toBe(false);
    });
  });

  describe('sharesTagsWith', () => {
    it('should return true for presentations with shared tags', () => {
      const presentation1 = new Presentation('test1', createValidMetadata(), createValidSlides());

      const metadata2 = { ...createValidMetadata(), tags: ['test', 'python'] };
      const presentation2 = new Presentation('test2', metadata2, createValidSlides());

      expect(presentation1.sharesTagsWith(presentation2)).toBe(true);
    });

    it('should return false for presentations with no shared tags', () => {
      const presentation1 = new Presentation('test1', createValidMetadata(), createValidSlides());

      const metadata2 = { ...createValidMetadata(), tags: ['python', 'go'] };
      const presentation2 = new Presentation('test2', metadata2, createValidSlides());

      expect(presentation1.sharesTagsWith(presentation2)).toBe(false);
    });
  });

  describe('difficulty checks', () => {
    it('should correctly identify beginner level', () => {
      const metadata = { ...createValidMetadata(), difficulty: 'beginner' as const };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.isBeginner()).toBe(true);
      expect(presentation.isIntermediate()).toBe(false);
      expect(presentation.isAdvanced()).toBe(false);
    });

    it('should correctly identify intermediate level', () => {
      const metadata = { ...createValidMetadata(), difficulty: 'intermediate' as const };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.isBeginner()).toBe(false);
      expect(presentation.isIntermediate()).toBe(true);
      expect(presentation.isAdvanced()).toBe(false);
    });

    it('should correctly identify advanced level', () => {
      const metadata = { ...createValidMetadata(), difficulty: 'advanced' as const };
      const presentation = new Presentation('test', metadata, createValidSlides());

      expect(presentation.isBeginner()).toBe(false);
      expect(presentation.isIntermediate()).toBe(false);
      expect(presentation.isAdvanced()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const presentation = new Presentation('test', createValidMetadata(), createValidSlides());
      const json = presentation.toJSON();

      expect(json.id).toBe('test');
      expect(json.metadata).toBeDefined();
      expect(json.slides).toBeInstanceOf(Array);
      expect(json.slides.length).toBe(2);
    });
  });
});
