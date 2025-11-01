/**
 * Zod Schema Validation Tests
 * Week 2: Test runtime validation
 */

import { describe, it, expect } from 'vitest';
import {
  SlideSchema,
  PresentationMetadataSchema,
  RevealConfigSchema,
  ProgressDataSchema,
  validatePresentationMetadata,
  validateRevealConfig,
  validateSlide,
  safeValidatePresentationMetadata,
} from '@/utils/presentation/schemas';

describe('SlideSchema', () => {
  it('should validate correct slide data', () => {
    const validSlide = {
      title: 'Introduction',
      time: '2 min',
      content: '<p>Hello world</p>',
    };

    const result = SlideSchema.parse(validSlide);
    expect(result).toEqual(validSlide);
  });

  it('should reject empty title', () => {
    const invalidSlide = {
      title: '',
      time: '2 min',
      content: '<p>Content</p>',
    };

    expect(() => SlideSchema.parse(invalidSlide)).toThrow();
  });

  it('should reject invalid time format', () => {
    const invalidSlide = {
      title: 'Title',
      time: 'invalid',
      content: '<p>Content</p>',
    };

    expect(() => SlideSchema.parse(invalidSlide)).toThrow();
  });

  it('should accept optional fields', () => {
    const slideWithOptionals = {
      title: 'Title',
      time: '3 minutes',
      content: '<p>Content</p>',
      notes: 'Speaker notes',
      fragments: true,
      transition: 'fade' as const,
      background: '#000000',
    };

    const result = SlideSchema.parse(slideWithOptionals);
    expect(result.notes).toBe('Speaker notes');
    expect(result.fragments).toBe(true);
  });
});

describe('PresentationMetadataSchema', () => {
  const validMetadata = {
    title: 'Test Presentation',
    description: 'A test presentation',
    pubDate: '2025-01-01',
    category: 'mathematics',
    difficulty: 'beginner' as const,
    language: 'en' as const,
    estimatedTime: 30,
    totalSlides: 10,
  };

  it('should validate correct metadata', () => {
    const result = PresentationMetadataSchema.parse(validMetadata);
    expect(result.title).toBe('Test Presentation');
  });

  it('should reject empty title', () => {
    const invalid = { ...validMetadata, title: '' };
    expect(() => PresentationMetadataSchema.parse(invalid)).toThrow();
  });

  it('should reject negative estimated time', () => {
    const invalid = { ...validMetadata, estimatedTime: -5 };
    expect(() => PresentationMetadataSchema.parse(invalid)).toThrow();
  });

  it('should reject zero total slides', () => {
    const invalid = { ...validMetadata, totalSlides: 0 };
    expect(() => PresentationMetadataSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid difficulty level', () => {
    const invalid = { ...validMetadata, difficulty: 'expert' };
    expect(() => PresentationMetadataSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid language', () => {
    const invalid = { ...validMetadata, language: 'fr' };
    expect(() => PresentationMetadataSchema.parse(invalid)).toThrow();
  });

  it('should accept optional fields', () => {
    const withOptionals = {
      ...validMetadata,
      updatedDate: '2025-01-15',
      relatedBlogPost: 'test-post',
      author: 'John Doe',
      tags: ['math', 'calculus'],
    };

    const result = PresentationMetadataSchema.parse(withOptionals);
    expect(result.author).toBe('John Doe');
    expect(result.tags).toEqual(['math', 'calculus']);
  });

  it('should default tags to empty array if not provided', () => {
    const result = PresentationMetadataSchema.parse(validMetadata);
    expect(result.tags).toEqual([]);
  });
});

describe('RevealConfigSchema', () => {
  it('should validate empty config (all fields optional)', () => {
    const result = RevealConfigSchema.parse({});

    // Schema is .partial() so all fields are optional
    // Defaults are applied by Reveal.js itself, not the schema
    expect(result).toEqual({});
  });

  it('should validate custom config', () => {
    const customConfig = {
      controls: false,
      progress: false,
      transition: 'fade' as const,
      width: 1920,
      height: 1080,
    };

    const result = RevealConfigSchema.parse(customConfig);
    expect(result.controls).toBe(false);
    expect(result.width).toBe(1920);
  });

  it('should reject invalid transition type', () => {
    const invalid = { transition: 'invalid' };
    expect(() => RevealConfigSchema.parse(invalid)).toThrow();
  });

  it('should reject negative width', () => {
    const invalid = { width: -100 };
    expect(() => RevealConfigSchema.parse(invalid)).toThrow();
  });

  it('should reject margin outside 0-1 range', () => {
    const invalid = { margin: 1.5 };
    expect(() => RevealConfigSchema.parse(invalid)).toThrow();
  });

  it('should accept all valid transition types', () => {
    const transitions = ['none', 'fade', 'slide', 'convex', 'concave', 'zoom'];

    transitions.forEach((transition) => {
      const result = RevealConfigSchema.parse({ transition });
      expect(result.transition).toBe(transition);
    });
  });
});

describe('ProgressDataSchema', () => {
  it('should validate correct progress data', () => {
    const validProgress = {
      currentSlide: 5,
      totalSlides: 10,
      lastVisited: '2025-01-01T12:00:00.000Z',
      completed: false,
    };

    const result = ProgressDataSchema.parse(validProgress);
    expect(result.currentSlide).toBe(5);
  });

  it('should reject negative current slide', () => {
    const invalid = {
      currentSlide: -1,
      totalSlides: 10,
      lastVisited: '2025-01-01T12:00:00.000Z',
      completed: false,
    };

    expect(() => ProgressDataSchema.parse(invalid)).toThrow();
  });

  it('should reject zero total slides', () => {
    const invalid = {
      currentSlide: 0,
      totalSlides: 0,
      lastVisited: '2025-01-01T12:00:00.000Z',
      completed: false,
    };

    expect(() => ProgressDataSchema.parse(invalid)).toThrow();
  });

  it('should reject invalid datetime format', () => {
    const invalid = {
      currentSlide: 0,
      totalSlides: 10,
      lastVisited: 'not a date',
      completed: false,
    };

    expect(() => ProgressDataSchema.parse(invalid)).toThrow();
  });
});

describe('Validation Helper Functions', () => {
  describe('validatePresentationMetadata', () => {
    it('should return parsed data on success', () => {
      const valid = {
        title: 'Test',
        description: 'Description',
        pubDate: '2025-01-01',
        category: 'math',
        difficulty: 'beginner',
        language: 'en',
        estimatedTime: 30,
        totalSlides: 10,
      };

      const result = validatePresentationMetadata(valid);
      expect(result.title).toBe('Test');
    });

    it('should throw on invalid data', () => {
      const invalid = { title: '' };
      expect(() => validatePresentationMetadata(invalid)).toThrow();
    });
  });

  describe('validateRevealConfig', () => {
    it('should return parsed config', () => {
      const config = { width: 1920, height: 1080 };
      const result = validateRevealConfig(config);

      expect(result.width).toBe(1920);
      expect(result.height).toBe(1080);
    });
  });

  describe('validateSlide', () => {
    it('should return parsed slide', () => {
      const slide = {
        title: 'Title',
        time: '2 min',
        content: '<p>Content</p>',
      };

      const result = validateSlide(slide);
      expect(result.title).toBe('Title');
    });
  });

  describe('safeValidatePresentationMetadata', () => {
    it('should return success result for valid data', () => {
      const valid = {
        title: 'Test',
        description: 'Description',
        pubDate: '2025-01-01',
        category: 'math',
        difficulty: 'beginner',
        language: 'en',
        estimatedTime: 30,
        totalSlides: 10,
      };

      const result = safeValidatePresentationMetadata(valid);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Test');
      }
    });

    it('should return error result for invalid data', () => {
      const invalid = { title: '' };
      const result = safeValidatePresentationMetadata(invalid);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});
