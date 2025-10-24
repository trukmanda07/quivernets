/**
 * Explorer Tree Data Structure
 * Organizes blog posts into a hierarchical tree structure for navigation
 */

export interface TreeNode {
	id: string;
	label: string;
	type: 'folder' | 'file';
	children?: TreeNode[];
	slug?: string; // For file nodes
	href?: string; // Full URL for navigation
}

export interface Post {
	id: string;
	data: {
		title: string;
		category?: string;
		tags?: string[];
		[key: string]: any;
	};
}

/**
 * Determines the content type based on tags
 */
function getContentType(tags: string[] = []): string {
	const lowerTags = tags.map(t => t.toLowerCase());

	if (lowerTags.some(t => ['course', 'tutorial', 'lesson'].includes(t))) {
		return 'Courses';
	}
	if (lowerTags.some(t => ['book', 'textbook', 'reading'].includes(t))) {
		return 'Books';
	}
	if (lowerTags.some(t => ['paper', 'research', 'publication'].includes(t))) {
		return 'Papers';
	}

	return 'General';
}

/**
 * Builds a hierarchical tree structure from blog posts
 */
export function buildExplorerTree(posts: Post[], lang: string): TreeNode[] {
	const tree: TreeNode[] = [];
	const categoryMap = new Map<string, Map<string, Post[]>>();

	// Group posts by category and content type
	posts.forEach(post => {
		const category = post.data.category || 'Uncategorized';
		const contentType = getContentType(post.data.tags);

		if (!categoryMap.has(category)) {
			categoryMap.set(category, new Map());
		}

		const typeMap = categoryMap.get(category)!;
		if (!typeMap.has(contentType)) {
			typeMap.set(contentType, []);
		}

		typeMap.get(contentType)!.push(post);
	});

	// Build tree structure
	categoryMap.forEach((typeMap, category) => {
		const categoryNode: TreeNode = {
			id: `category-${category.toLowerCase().replace(/\s+/g, '-')}`,
			label: category,
			type: 'folder',
			children: []
		};

		typeMap.forEach((posts, contentType) => {
			const typeNode: TreeNode = {
				id: `${categoryNode.id}-${contentType.toLowerCase().replace(/\s+/g, '-')}`,
				label: contentType,
				type: 'folder',
				children: posts.map((post, index) => ({
					id: `${categoryNode.id}-${contentType}-${index}`,
					label: post.data.title,
					type: 'file' as const,
					slug: post.id,
					href: `/${lang}/blog/${post.id}/`
				}))
			};

			categoryNode.children!.push(typeNode);
		});

		tree.push(categoryNode);
	});

	return tree;
}

/**
 * Flattens the tree to get all file nodes
 */
export function getAllFiles(tree: TreeNode[]): TreeNode[] {
	const files: TreeNode[] = [];

	function traverse(nodes: TreeNode[]) {
		nodes.forEach(node => {
			if (node.type === 'file') {
				files.push(node);
			} else if (node.children) {
				traverse(node.children);
			}
		});
	}

	traverse(tree);
	return files;
}
