/**
 * Unit tests for Slide domain model
 */

import { describe, it, expect } from 'vitest';
import { Slide, type SlideData } from '../../../src/domain/presentation/Slide';

describe('Slide', () => {
  const createValidSlideData = (): SlideData => ({
    title: 'Test Slide',
    time: '01:30',
    content: '<h1>Test Content</h1>',
  });

  describe('constructor', () => {
    it('should create a valid slide', () => {
      const data = createValidSlideData();
      const slide = new Slide(data, 1);

      expect(slide.title).toBe('Test Slide');
      expect(slide.time).toBe('01:30');
      expect(slide.content).toBe('<h1>Test Content</h1>');
      expect(slide.slideNumber).toBe(1);
    });

    it('should throw error for empty title', () => {
      const data = { ...createValidSlideData(), title: '' };

      expect(() => new Slide(data, 1)).toThrow('Slide title is required');
    });

    it('should throw error for empty content', () => {
      const data = { ...createValidSlideData(), content: '' };

      expect(() => new Slide(data, 1)).toThrow('Slide content is required');
    });

    it('should throw error for empty time', () => {
      const data = { ...createValidSlideData(), time: '' };

      expect(() => new Slide(data, 1)).toThrow('Slide time is required');
    });

    it('should handle optional properties', () => {
      const data = {
        ...createValidSlideData(),
        notes: 'Some notes',
        fragments: true,
        transition: 'fade',
        background: '#fff',
      };
      const slide = new Slide(data, 1);

      expect(slide.notes).toBe('Some notes');
      expect(slide.fragments).toBe(true);
      expect(slide.transition).toBe('fade');
      expect(slide.background).toBe('#fff');
    });
  });

  describe('getEstimatedTime', () => {
    it('should parse MM:SS format correctly', () => {
      const data = { ...createValidSlideData(), time: '02:30' };
      const slide = new Slide(data, 1);

      expect(slide.getEstimatedTime()).toBe(150); // 2 * 60 + 30
    });

    it('should parse HH:MM:SS format correctly', () => {
      const data = { ...createValidSlideData(), time: '01:02:30' };
      const slide = new Slide(data, 1);

      expect(slide.getEstimatedTime()).toBe(3750); // 1 * 3600 + 2 * 60 + 30
    });

    it('should return 0 for invalid format', () => {
      const data = { ...createValidSlideData(), time: 'invalid' };
      const slide = new Slide(data, 1);

      expect(slide.getEstimatedTime()).toBe(0);
    });
  });

  describe('getEstimatedTimeInMinutes', () => {
    it('should return time in minutes', () => {
      const data = { ...createValidSlideData(), time: '02:30' };
      const slide = new Slide(data, 1);

      expect(slide.getEstimatedTimeInMinutes()).toBe(3); // ceil(150/60)
    });
  });

  describe('hasNotes', () => {
    it('should return true when notes are present', () => {
      const data = { ...createValidSlideData(), notes: 'Some notes' };
      const slide = new Slide(data, 1);

      expect(slide.hasNotes()).toBe(true);
    });

    it('should return false when notes are not present', () => {
      const slide = new Slide(createValidSlideData(), 1);

      expect(slide.hasNotes()).toBe(false);
    });
  });

  describe('hasMath', () => {
    it('should detect KaTeX delimiters', () => {
      const data1 = { ...createValidSlideData(), content: 'Formula: $$x^2 + y^2 = z^2$$' };
      const slide1 = new Slide(data1, 1);
      expect(slide1.hasMath()).toBe(true);

      const data2 = { ...createValidSlideData(), content: 'Inline: \\(x = 5\\)' };
      const slide2 = new Slide(data2, 1);
      expect(slide2.hasMath()).toBe(true);

      const data3 = { ...createValidSlideData(), content: 'Display: \\[x = 5\\]' };
      const slide3 = new Slide(data3, 1);
      expect(slide3.hasMath()).toBe(true);
    });

    it('should return false when no math is present', () => {
      const slide = new Slide(createValidSlideData(), 1);

      expect(slide.hasMath()).toBe(false);
    });
  });

  describe('hasCode', () => {
    it('should detect code blocks', () => {
      const data1 = { ...createValidSlideData(), content: '<pre><code>console.log("test")</code></pre>' };
      const slide1 = new Slide(data1, 1);
      expect(slide1.hasCode()).toBe(true);

      const data2 = { ...createValidSlideData(), content: 'Inline <code>code</code> here' };
      const slide2 = new Slide(data2, 1);
      expect(slide2.hasCode()).toBe(true);
    });

    it('should return false when no code is present', () => {
      const slide = new Slide(createValidSlideData(), 1);

      expect(slide.hasCode()).toBe(false);
    });
  });

  describe('getWordCount', () => {
    it('should count words correctly', () => {
      const data = { ...createValidSlideData(), content: '<h1>Hello World</h1><p>This is a test.</p>' };
      const slide = new Slide(data, 1);

      expect(slide.getWordCount()).toBeGreaterThan(0);
    });
  });

  describe('isTitleSlide', () => {
    it('should return true for slide number 1', () => {
      const slide = new Slide(createValidSlideData(), 1);

      expect(slide.isTitleSlide()).toBe(true);
    });

    it('should return false for other slide numbers', () => {
      const slide = new Slide(createValidSlideData(), 2);

      expect(slide.isTitleSlide()).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should serialize to plain object', () => {
      const data = createValidSlideData();
      const slide = new Slide(data, 1);
      const json = slide.toJSON();

      expect(json.title).toBe(data.title);
      expect(json.time).toBe(data.time);
      expect(json.content).toBe(data.content);
    });
  });
});
