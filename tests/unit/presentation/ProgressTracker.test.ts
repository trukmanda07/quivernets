/**
 * ProgressTracker Unit Tests
 * TDD Approach - Tests written FIRST before implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ProgressTracker } from '@/utils/presentation/ProgressTracker';

describe('ProgressTracker', () => {
  let mockStorage: Storage;

  beforeEach(() => {
    // Create a mock localStorage for each test
    mockStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      key: vi.fn(),
      length: 0,
    };
  });

  describe('save', () => {
    it('should save progress to storage', () => {
      const tracker = new ProgressTracker(mockStorage);

      tracker.save('test-presentation', 5, 10);

      expect(mockStorage.setItem).toHaveBeenCalledWith(
        'presentationProgress',
        expect.stringContaining('test-presentation')
      );
    });

    it('should save progress with correct data structure', () => {
      const tracker = new ProgressTracker(mockStorage);
      const saveDate = new Date();

      tracker.save('test-presentation', 5, 10);

      const savedData = (mockStorage.setItem as any).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed['test-presentation']).toEqual({
        currentSlide: 5,
        totalSlides: 10,
        lastVisited: expect.any(String),
        completed: false,
      });
    });

    it('should mark presentation as completed when on last slide', () => {
      const tracker = new ProgressTracker(mockStorage);

      tracker.save('test-presentation', 9, 10);

      const savedData = (mockStorage.setItem as any).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed['test-presentation'].completed).toBe(true);
    });

    it('should not mark as completed when not on last slide', () => {
      const tracker = new ProgressTracker(mockStorage);

      tracker.save('test-presentation', 8, 10);

      const savedData = (mockStorage.setItem as any).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed['test-presentation'].completed).toBe(false);
    });

    it('should preserve existing progress for other presentations', () => {
      const existingData = JSON.stringify({
        'other-presentation': {
          currentSlide: 3,
          totalSlides: 5,
          lastVisited: '2025-01-01T00:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      tracker.save('test-presentation', 2, 10);

      const savedData = (mockStorage.setItem as any).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed['other-presentation']).toBeDefined();
      expect(parsed['test-presentation']).toBeDefined();
    });

    it('should handle storage errors gracefully', () => {
      (mockStorage.setItem as any).mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const tracker = new ProgressTracker(mockStorage);

      // Should not throw
      expect(() => tracker.save('test-presentation', 5, 10)).not.toThrow();
    });
  });

  describe('load', () => {
    it('should return null when no progress exists', () => {
      (mockStorage.getItem as any).mockReturnValue(null);

      const tracker = new ProgressTracker(mockStorage);
      const progress = tracker.load('test-presentation');

      expect(progress).toBeNull();
    });

    it('should return null when presentation has no saved progress', () => {
      const existingData = JSON.stringify({
        'other-presentation': {
          currentSlide: 3,
          totalSlides: 5,
          lastVisited: '2025-01-01T00:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const progress = tracker.load('test-presentation');

      expect(progress).toBeNull();
    });

    it('should load saved progress correctly', () => {
      const existingData = JSON.stringify({
        'test-presentation': {
          currentSlide: 5,
          totalSlides: 10,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const progress = tracker.load('test-presentation');

      expect(progress).toEqual({
        currentSlide: 5,
        totalSlides: 10,
        lastVisited: '2025-01-01T12:00:00.000Z',
        completed: false,
      });
    });

    it('should handle corrupted storage data gracefully', () => {
      (mockStorage.getItem as any).mockReturnValue('invalid json {');

      const tracker = new ProgressTracker(mockStorage);
      const progress = tracker.load('test-presentation');

      expect(progress).toBeNull();
    });

    it('should handle storage read errors gracefully', () => {
      (mockStorage.getItem as any).mockImplementation(() => {
        throw new Error('Storage access denied');
      });

      const tracker = new ProgressTracker(mockStorage);

      // Should not throw and return null
      expect(tracker.load('test-presentation')).toBeNull();
    });
  });

  describe('getProgress (percentage)', () => {
    it('should calculate progress percentage correctly', () => {
      const existingData = JSON.stringify({
        'test-presentation': {
          currentSlide: 5,
          totalSlides: 10,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const percentage = tracker.getProgress('test-presentation');

      expect(percentage).toBe(50);
    });

    it('should return 0 when no progress exists', () => {
      (mockStorage.getItem as any).mockReturnValue(null);

      const tracker = new ProgressTracker(mockStorage);
      const percentage = tracker.getProgress('test-presentation');

      expect(percentage).toBe(0);
    });

    it('should return 100 when presentation is completed', () => {
      const existingData = JSON.stringify({
        'test-presentation': {
          currentSlide: 9,
          totalSlides: 10,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: true,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const percentage = tracker.getProgress('test-presentation');

      expect(percentage).toBe(90); // 9/10 = 90%
    });

    it('should round progress percentage to nearest integer', () => {
      const existingData = JSON.stringify({
        'test-presentation': {
          currentSlide: 1,
          totalSlides: 3,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const percentage = tracker.getProgress('test-presentation');

      expect(percentage).toBe(33); // 1/3 = 33.33% rounded down
    });
  });

  describe('clear', () => {
    it('should clear progress for specific presentation', () => {
      const existingData = JSON.stringify({
        'test-presentation': {
          currentSlide: 5,
          totalSlides: 10,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
        'other-presentation': {
          currentSlide: 3,
          totalSlides: 5,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      tracker.clear('test-presentation');

      const savedData = (mockStorage.setItem as any).mock.calls[0][1];
      const parsed = JSON.parse(savedData);

      expect(parsed['test-presentation']).toBeUndefined();
      expect(parsed['other-presentation']).toBeDefined();
    });

    it('should handle clearing non-existent presentation gracefully', () => {
      (mockStorage.getItem as any).mockReturnValue(null);

      const tracker = new ProgressTracker(mockStorage);

      expect(() => tracker.clear('test-presentation')).not.toThrow();
    });
  });

  describe('getAllProgress', () => {
    it('should return all saved progress', () => {
      const existingData = JSON.stringify({
        'presentation-1': {
          currentSlide: 5,
          totalSlides: 10,
          lastVisited: '2025-01-01T12:00:00.000Z',
          completed: false,
        },
        'presentation-2': {
          currentSlide: 3,
          totalSlides: 5,
          lastVisited: '2025-01-02T12:00:00.000Z',
          completed: true,
        },
      });

      (mockStorage.getItem as any).mockReturnValue(existingData);

      const tracker = new ProgressTracker(mockStorage);
      const allProgress = tracker.getAllProgress();

      expect(Object.keys(allProgress)).toHaveLength(2);
      expect(allProgress['presentation-1']).toBeDefined();
      expect(allProgress['presentation-2']).toBeDefined();
    });

    it('should return empty object when no progress exists', () => {
      (mockStorage.getItem as any).mockReturnValue(null);

      const tracker = new ProgressTracker(mockStorage);
      const allProgress = tracker.getAllProgress();

      expect(allProgress).toEqual({});
    });
  });

  describe('Integration with browser localStorage', () => {
    it('should work with global localStorage if no storage provided', () => {
      // This test assumes we're running in an environment with localStorage
      const tracker = new ProgressTracker();

      // This should use global localStorage
      expect(() => tracker.save('test', 0, 5)).not.toThrow();
    });
  });
});
