/**
 * Category Value Object
 *
 * Immutable value object representing a blog post category.
 * Provides type-safety, validation, and equality checks.
 */

import { categoryMetadata, type TagCategory } from '../../data/tagMetadata';

/**
 * Category value object.
 *
 * This is an immutable value object that:
 * - Validates category values
 * - Provides metadata access
 * - Implements value equality
 * - Is immutable (all properties are readonly)
 *
 * @example
 * const category = new Category('mathematics');
 * console.log(category.name); // "Mathematics"
 * console.log(category.icon); // "📐"
 *
 * @example
 * const cat1 = new Category('mathematics');
 * const cat2 = new Category('mathematics');
 * console.log(cat1.equals(cat2)); // true
 */
export class Category {
	private readonly value: TagCategory;

	/**
	 * Create a Category instance
	 *
	 * @param value - Category value
	 * @throws Error if category is invalid
	 */
	constructor(value: TagCategory) {
		if (!this.isValidCategory(value)) {
			throw new Error(`Invalid category: ${value}`);
		}

		this.value = value;
	}

	/**
	 * Validate a category value
	 */
	private isValidCategory(value: string): value is TagCategory {
		return value in categoryMetadata;
	}

	// ===== Accessors =====

	/**
	 * Get the category value (slug)
	 */
	getValue(): TagCategory {
		return this.value;
	}

	/**
	 * Get the category display name
	 */
	get name(): string {
		return categoryMetadata[this.value].name;
	}

	/**
	 * Get the category description
	 */
	get description(): string {
		return categoryMetadata[this.value].description;
	}

	/**
	 * Get the category icon
	 */
	get icon(): string | undefined {
		return categoryMetadata[this.value].icon;
	}

	/**
	 * Get the category color
	 */
	get color(): string | undefined {
		return categoryMetadata[this.value].color;
	}

	// ===== Behavior Methods =====

	/**
	 * Check equality with another category
	 *
	 * @param other - Another category
	 * @returns True if categories are equal
	 */
	equals(other: Category): boolean {
		return this.value === other.value;
	}

	/**
	 * Check if this is a mathematics category
	 */
	isMathematics(): boolean {
		return this.value === 'mathematics';
	}

	/**
	 * Check if this is a computer science category
	 */
	isComputerScience(): boolean {
		return this.value === 'computer-science';
	}

	/**
	 * Check if this is a programming category
	 */
	isProgramming(): boolean {
		return this.value === 'programming';
	}

	/**
	 * Check if this is a tools category
	 */
	isTools(): boolean {
		return this.value === 'tools';
	}

	/**
	 * Check if this is a general category
	 */
	isGeneral(): boolean {
		return this.value === 'general';
	}

	/**
	 * Convert to string (returns value)
	 */
	toString(): string {
		return this.value;
	}

	/**
	 * Convert to JSON representation
	 */
	toJSON() {
		return {
			value: this.value,
			name: this.name,
			description: this.description,
			icon: this.icon,
			color: this.color,
		};
	}

	// ===== Static Factory Methods =====

	/**
	 * Create a Category from a string (factory method)
	 *
	 * @param value - Category value
	 * @returns Category instance or null if invalid
	 */
	static tryCreate(value: string): Category | null {
		try {
			return new Category(value as TagCategory);
		} catch {
			return null;
		}
	}

	/**
	 * Get all available categories
	 *
	 * @returns Array of all Category instances
	 */
	static getAll(): Category[] {
		return Object.keys(categoryMetadata).map((key) => new Category(key as TagCategory));
	}

	/**
	 * Mathematics category constant
	 */
	static readonly MATHEMATICS = new Category('mathematics');

	/**
	 * Computer Science category constant
	 */
	static readonly COMPUTER_SCIENCE = new Category('computer-science');

	/**
	 * Programming category constant
	 */
	static readonly PROGRAMMING = new Category('programming');

	/**
	 * Tools category constant
	 */
	static readonly TOOLS = new Category('tools');

	/**
	 * General category constant
	 */
	static readonly GENERAL = new Category('general');
}
