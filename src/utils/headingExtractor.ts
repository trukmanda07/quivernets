/**
 * Heading Extractor Utility
 * Extracts headings from rendered content to build table of contents
 */

export interface Heading {
	id: string;
	text: string;
	level: number;
	children?: Heading[];
}

export interface FlatHeading {
	id: string;
	text: string;
	level: number;
}

/**
 * Extract headings from HTML content
 * This should be called on the rendered HTML to get all headings with their IDs
 */
export function extractHeadingsFromHTML(html: string): FlatHeading[] {
	const headings: FlatHeading[] = [];

	// Match heading tags with their content and optional ID
	const headingRegex = /<h([1-6])([^>]*)>(.*?)<\/h\1>/gi;
	let match;

	while ((match = headingRegex.exec(html)) !== null) {
		const level = parseInt(match[1]);
		const attributes = match[2];
		const content = match[3];

		// Extract ID from attributes
		const idMatch = attributes.match(/id=["']([^"']+)["']/);
		const id = idMatch ? idMatch[1] : generateId(stripHTML(content));

		// Strip HTML tags from content to get plain text
		const text = stripHTML(content);

		if (text.trim()) {
			headings.push({ id, text, level });
		}
	}

	return headings;
}

/**
 * Strip HTML tags from a string
 */
function stripHTML(html: string): string {
	return html
		.replace(/<[^>]+>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.trim();
}

/**
 * Generate a URL-safe ID from text
 */
function generateId(text: string): string {
	return text
		.toLowerCase()
		.replace(/[^\w\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/--+/g, '-')
		.replace(/^-+|-+$/g, '');
}

/**
 * Build a hierarchical tree from flat headings
 * Supports proper nesting (e.g., h2 > h3 > h4)
 */
export function buildHeadingTree(flatHeadings: FlatHeading[]): Heading[] {
	if (flatHeadings.length === 0) return [];

	const root: Heading[] = [];
	const stack: Heading[] = [];

	for (const heading of flatHeadings) {
		const newHeading: Heading = {
			id: heading.id,
			text: heading.text,
			level: heading.level,
			children: []
		};

		// Find the correct parent in the stack
		while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
			stack.pop();
		}

		if (stack.length === 0) {
			// This is a root level heading
			root.push(newHeading);
		} else {
			// Add as a child of the last item in stack
			const parent = stack[stack.length - 1];
			if (!parent.children) {
				parent.children = [];
			}
			parent.children.push(newHeading);
		}

		stack.push(newHeading);
	}

	return root;
}

/**
 * Get headings with a specific level range
 */
export function filterHeadingsByLevel(
	headings: FlatHeading[],
	minLevel: number = 1,
	maxLevel: number = 6
): FlatHeading[] {
	return headings.filter(h => h.level >= minLevel && h.level <= maxLevel);
}

/**
 * Ensure all headings have unique IDs
 */
export function ensureUniqueIds(headings: FlatHeading[]): FlatHeading[] {
	const seenIds = new Map<string, number>();

	return headings.map(heading => {
		let id = heading.id;
		const count = seenIds.get(id) || 0;

		if (count > 0) {
			id = `${id}-${count}`;
		}

		seenIds.set(heading.id, count + 1);

		return { ...heading, id };
	});
}
