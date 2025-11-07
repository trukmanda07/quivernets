/**
 * Unit tests for Category value object
 */

import { describe, it, expect } from 'vitest';
import { Category } from '../../../src/domain/blog/Category';

describe('Category Value Object', () => {
	describe('Constructor and Validation', () => {
		it('should create a valid category', () => {
			const category = new Category('mathematics');

			expect(category).toBeDefined();
			expect(category.getValue()).toBe('mathematics');
		});

		it('should throw error for invalid category', () => {
			expect(() => new Category('invalid' as any)).toThrow('Invalid category');
		});
	});

	describe('Property Accessors', () => {
		it('should access category name', () => {
			const category = new Category('mathematics');

			expect(category.name).toBeDefined();
			expect(typeof category.name).toBe('string');
		});

		it('should access category description', () => {
			const category = new Category('programming');

			expect(category.description).toBeDefined();
			expect(typeof category.description).toBe('string');
		});

		it('should access category icon', () => {
			const category = new Category('mathematics');

			expect(category.icon).toBeDefined();
		});

		it('should access category color', () => {
			const category = new Category('programming');

			if (category.color) {
				expect(typeof category.color).toBe('string');
			}
		});
	});

	describe('equals()', () => {
		it('should return true for equal categories', () => {
			const cat1 = new Category('mathematics');
			const cat2 = new Category('mathematics');

			expect(cat1.equals(cat2)).toBe(true);
		});

		it('should return false for different categories', () => {
			const cat1 = new Category('mathematics');
			const cat2 = new Category('programming');

			expect(cat1.equals(cat2)).toBe(false);
		});
	});

	describe('Type Check Methods', () => {
		it('should identify mathematics category', () => {
			const category = new Category('mathematics');

			expect(category.isMathematics()).toBe(true);
			expect(category.isProgramming()).toBe(false);
		});

		it('should identify computer science category', () => {
			const category = new Category('computer-science');

			expect(category.isComputerScience()).toBe(true);
			expect(category.isMathematics()).toBe(false);
		});

		it('should identify programming category', () => {
			const category = new Category('programming');

			expect(category.isProgramming()).toBe(true);
			expect(category.isTools()).toBe(false);
		});

		it('should identify tools category', () => {
			const category = new Category('tools');

			expect(category.isTools()).toBe(true);
			expect(category.isGeneral()).toBe(false);
		});

		it('should identify general category', () => {
			const category = new Category('general');

			expect(category.isGeneral()).toBe(true);
			expect(category.isProgramming()).toBe(false);
		});
	});

	describe('toString()', () => {
		it('should return category value as string', () => {
			const category = new Category('mathematics');

			expect(category.toString()).toBe('mathematics');
		});
	});

	describe('toJSON()', () => {
		it('should serialize to JSON', () => {
			const category = new Category('programming');
			const json = category.toJSON();

			expect(json).toHaveProperty('value');
			expect(json).toHaveProperty('name');
			expect(json).toHaveProperty('description');
			expect(json.value).toBe('programming');
		});
	});

	describe('Static: tryCreate()', () => {
		it('should create category for valid value', () => {
			const category = Category.tryCreate('mathematics');

			expect(category).toBeInstanceOf(Category);
			expect(category?.getValue()).toBe('mathematics');
		});

		it('should return null for invalid value', () => {
			const category = Category.tryCreate('invalid');

			expect(category).toBeNull();
		});
	});

	describe('Static: getAll()', () => {
		it('should return all available categories', () => {
			const categories = Category.getAll();

			expect(Array.isArray(categories)).toBe(true);
			expect(categories.length).toBeGreaterThan(0);
			expect(categories.every((c) => c instanceof Category)).toBe(true);
		});

		it('should include all standard categories', () => {
			const categories = Category.getAll();
			const values = categories.map((c) => c.getValue());

			expect(values).toContain('mathematics');
			expect(values).toContain('programming');
			expect(values).toContain('computer-science');
			expect(values).toContain('tools');
			expect(values).toContain('general');
		});
	});

	describe('Static: Category Constants', () => {
		it('should have MATHEMATICS constant', () => {
			expect(Category.MATHEMATICS).toBeInstanceOf(Category);
			expect(Category.MATHEMATICS.getValue()).toBe('mathematics');
		});

		it('should have COMPUTER_SCIENCE constant', () => {
			expect(Category.COMPUTER_SCIENCE).toBeInstanceOf(Category);
			expect(Category.COMPUTER_SCIENCE.getValue()).toBe('computer-science');
		});

		it('should have PROGRAMMING constant', () => {
			expect(Category.PROGRAMMING).toBeInstanceOf(Category);
			expect(Category.PROGRAMMING.getValue()).toBe('programming');
		});

		it('should have TOOLS constant', () => {
			expect(Category.TOOLS).toBeInstanceOf(Category);
			expect(Category.TOOLS.getValue()).toBe('tools');
		});

		it('should have GENERAL constant', () => {
			expect(Category.GENERAL).toBeInstanceOf(Category);
			expect(Category.GENERAL.getValue()).toBe('general');
		});

		it('should allow using constants in equals comparison', () => {
			const category = new Category('mathematics');

			expect(category.equals(Category.MATHEMATICS)).toBe(true);
			expect(category.equals(Category.PROGRAMMING)).toBe(false);
		});
	});

	describe('Immutability', () => {
		it('should be immutable (private value property)', () => {
			const category = new Category('mathematics');
			const value = category.getValue();

			// Value is private, so TypeScript prevents direct access
			// Even if we try to override (which TypeScript prevents),
			// the getter should still return the original value
			expect(category.getValue()).toBe('mathematics');
			expect(category.getValue()).toBe(value);
		});
	});
});
