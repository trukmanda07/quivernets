import { describe, it, expect } from 'vitest';
import {
	extractHeadingsFromHTML,
	buildHeadingTree,
	filterHeadingsByLevel,
	ensureUniqueIds,
	type FlatHeading,
	type Heading,
} from '@/utils/headingExtractor';

describe('headingExtractor.ts', () => {
	describe('extractHeadingsFromHTML', () => {
		it('should extract headings from HTML with IDs', () => {
			const html = `
				<h1 id="title">Title</h1>
				<h2 id="section-1">Section 1</h2>
				<h3 id="subsection">Subsection</h3>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings).toHaveLength(3);
			expect(headings[0]).toEqual({ id: 'title', text: 'Title', level: 1 });
			expect(headings[1]).toEqual({ id: 'section-1', text: 'Section 1', level: 2 });
			expect(headings[2]).toEqual({ id: 'subsection', text: 'Subsection', level: 3 });
		});

		it('should generate IDs for headings without IDs', () => {
			const html = `
				<h1>Introduction to Calculus</h1>
				<h2>Basic Concepts</h2>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings).toHaveLength(2);
			expect(headings[0].id).toBe('introduction-to-calculus');
			expect(headings[0].text).toBe('Introduction to Calculus');
			expect(headings[1].id).toBe('basic-concepts');
			expect(headings[1].text).toBe('Basic Concepts');
		});

		it('should strip HTML tags from heading content', () => {
			const html = `
				<h1 id="title">Title with <strong>bold</strong> and <em>italic</em></h1>
				<h2>Section with <code>code</code></h2>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings[0].text).toBe('Title with bold and italic');
			expect(headings[1].text).toBe('Section with code');
		});

		it('should decode HTML entities', () => {
			const html = `
				<h1>&lt;Programming&gt; &amp; Development</h1>
				<h2>Quotes &quot;here&quot; and &#39;there&#39;</h2>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings[0].text).toBe('<Programming> & Development');
			expect(headings[1].text).toBe('Quotes "here" and \'there\'');
		});

		it('should handle empty HTML', () => {
			const headings = extractHeadingsFromHTML('');

			expect(headings).toEqual([]);
		});

		it('should skip headings with empty text', () => {
			const html = `
				<h1></h1>
				<h2>Valid Heading</h2>
				<h3>   </h3>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings).toHaveLength(1);
			expect(headings[0].text).toBe('Valid Heading');
		});

		it('should handle all heading levels (h1-h6)', () => {
			const html = `
				<h1>Level 1</h1>
				<h2>Level 2</h2>
				<h3>Level 3</h3>
				<h4>Level 4</h4>
				<h5>Level 5</h5>
				<h6>Level 6</h6>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings).toHaveLength(6);
			expect(headings[0].level).toBe(1);
			expect(headings[5].level).toBe(6);
		});

		it('should handle headings with attributes', () => {
			const html = `
				<h1 id="title" class="main-title" data-index="0">Title</h1>
				<h2 id="section" class="section-title">Section</h2>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings).toHaveLength(2);
			expect(headings[0].id).toBe('title');
			expect(headings[1].id).toBe('section');
		});

		it('should generate URL-safe IDs', () => {
			const html = `
				<h1>What's This?</h1>
				<h2>C++ Programming</h2>
				<h3>Multiple   Spaces</h3>
			`;

			const headings = extractHeadingsFromHTML(html);

			expect(headings[0].id).toBe('whats-this');
			expect(headings[1].id).toBe('c-programming');
			expect(headings[2].id).toBe('multiple-spaces');
		});
	});

	describe('buildHeadingTree', () => {
		it('should build a hierarchical tree from flat headings', () => {
			const flatHeadings: FlatHeading[] = [
				{ id: 'h1', text: 'Heading 1', level: 1 },
				{ id: 'h2', text: 'Heading 2', level: 2 },
				{ id: 'h3', text: 'Heading 3', level: 3 },
			];

			const tree = buildHeadingTree(flatHeadings);

			expect(tree).toHaveLength(1);
			expect(tree[0].text).toBe('Heading 1');
			expect(tree[0].children).toHaveLength(1);
			expect(tree[0].children![0].text).toBe('Heading 2');
			expect(tree[0].children![0].children).toHaveLength(1);
			expect(tree[0].children![0].children![0].text).toBe('Heading 3');
		});

		it('should handle multiple root-level headings', () => {
			const flatHeadings: FlatHeading[] = [
				{ id: 'h1-1', text: 'First H1', level: 1 },
				{ id: 'h2-1', text: 'First H2', level: 2 },
				{ id: 'h1-2', text: 'Second H1', level: 1 },
			];

			const tree = buildHeadingTree(flatHeadings);

			expect(tree).toHaveLength(2);
			expect(tree[0].text).toBe('First H1');
			expect(tree[1].text).toBe('Second H1');
		});

		it('should handle skipped levels (h1 -> h3)', () => {
			const flatHeadings: FlatHeading[] = [
				{ id: 'h1', text: 'Heading 1', level: 1 },
				{ id: 'h3', text: 'Heading 3', level: 3 },
			];

			const tree = buildHeadingTree(flatHeadings);

			expect(tree).toHaveLength(1);
			expect(tree[0].children).toHaveLength(1);
			expect(tree[0].children![0].text).toBe('Heading 3');
		});

		it('should return empty array for empty input', () => {
			const tree = buildHeadingTree([]);

			expect(tree).toEqual([]);
		});

		it('should handle complex nesting', () => {
			const flatHeadings: FlatHeading[] = [
				{ id: 'h1', text: 'H1', level: 1 },
				{ id: 'h2-1', text: 'H2-1', level: 2 },
				{ id: 'h3-1', text: 'H3-1', level: 3 },
				{ id: 'h2-2', text: 'H2-2', level: 2 },
				{ id: 'h3-2', text: 'H3-2', level: 3 },
			];

			const tree = buildHeadingTree(flatHeadings);

			expect(tree).toHaveLength(1);
			expect(tree[0].children).toHaveLength(2);
			expect(tree[0].children![0].children).toHaveLength(1);
			expect(tree[0].children![1].children).toHaveLength(1);
		});

		it('should initialize children arrays', () => {
			const flatHeadings: FlatHeading[] = [
				{ id: 'h1', text: 'Heading 1', level: 1 },
				{ id: 'h2', text: 'Heading 2', level: 2 },
			];

			const tree = buildHeadingTree(flatHeadings);

			expect(tree[0].children).toBeDefined();
			expect(Array.isArray(tree[0].children)).toBe(true);
		});
	});

	describe('filterHeadingsByLevel', () => {
		const headings: FlatHeading[] = [
			{ id: 'h1', text: 'H1', level: 1 },
			{ id: 'h2', text: 'H2', level: 2 },
			{ id: 'h3', text: 'H3', level: 3 },
			{ id: 'h4', text: 'H4', level: 4 },
			{ id: 'h5', text: 'H5', level: 5 },
			{ id: 'h6', text: 'H6', level: 6 },
		];

		it('should filter headings by level range', () => {
			const filtered = filterHeadingsByLevel(headings, 2, 4);

			expect(filtered).toHaveLength(3);
			expect(filtered.map((h) => h.level)).toEqual([2, 3, 4]);
		});

		it('should use default min level of 1', () => {
			const filtered = filterHeadingsByLevel(headings, undefined, 3);

			expect(filtered.some((h) => h.level === 1)).toBe(true);
		});

		it('should use default max level of 6', () => {
			const filtered = filterHeadingsByLevel(headings, 5);

			expect(filtered.some((h) => h.level === 6)).toBe(true);
		});

		it('should include boundary levels', () => {
			const filtered = filterHeadingsByLevel(headings, 2, 4);

			expect(filtered.some((h) => h.level === 2)).toBe(true);
			expect(filtered.some((h) => h.level === 4)).toBe(true);
		});

		it('should return empty array if no headings match', () => {
			const filtered = filterHeadingsByLevel(headings, 7, 8);

			expect(filtered).toEqual([]);
		});

		it('should handle single level filter', () => {
			const filtered = filterHeadingsByLevel(headings, 3, 3);

			expect(filtered).toHaveLength(1);
			expect(filtered[0].level).toBe(3);
		});
	});

	describe('ensureUniqueIds', () => {
		it('should keep unique IDs unchanged', () => {
			const headings: FlatHeading[] = [
				{ id: 'intro', text: 'Introduction', level: 1 },
				{ id: 'section-1', text: 'Section 1', level: 2 },
				{ id: 'section-2', text: 'Section 2', level: 2 },
			];

			const unique = ensureUniqueIds(headings);

			expect(unique[0].id).toBe('intro');
			expect(unique[1].id).toBe('section-1');
			expect(unique[2].id).toBe('section-2');
		});

		it('should append suffix to duplicate IDs', () => {
			const headings: FlatHeading[] = [
				{ id: 'section', text: 'Section', level: 2 },
				{ id: 'section', text: 'Section', level: 2 },
				{ id: 'section', text: 'Section', level: 2 },
			];

			const unique = ensureUniqueIds(headings);

			expect(unique[0].id).toBe('section');
			expect(unique[1].id).toBe('section-1');
			expect(unique[2].id).toBe('section-2');
		});

		it('should handle empty array', () => {
			const unique = ensureUniqueIds([]);

			expect(unique).toEqual([]);
		});

		it('should preserve original heading properties', () => {
			const headings: FlatHeading[] = [
				{ id: 'test', text: 'Test Heading', level: 2 },
				{ id: 'test', text: 'Another Test', level: 3 },
			];

			const unique = ensureUniqueIds(headings);

			expect(unique[0].text).toBe('Test Heading');
			expect(unique[0].level).toBe(2);
			expect(unique[1].text).toBe('Another Test');
			expect(unique[1].level).toBe(3);
		});

		it('should handle mix of unique and duplicate IDs', () => {
			const headings: FlatHeading[] = [
				{ id: 'intro', text: 'Intro', level: 1 },
				{ id: 'section', text: 'Section 1', level: 2 },
				{ id: 'section', text: 'Section 2', level: 2 },
				{ id: 'outro', text: 'Outro', level: 1 },
			];

			const unique = ensureUniqueIds(headings);

			expect(unique[0].id).toBe('intro');
			expect(unique[1].id).toBe('section');
			expect(unique[2].id).toBe('section-1');
			expect(unique[3].id).toBe('outro');
		});
	});
});
