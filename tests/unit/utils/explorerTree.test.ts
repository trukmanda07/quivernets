import { describe, it, expect } from 'vitest';
import {
	buildExplorerTree,
	getAllFiles,
	type Post,
	type TreeNode,
} from '@/utils/explorerTree';

describe('explorerTree.ts', () => {
	describe('buildExplorerTree', () => {
		it('should build tree structure from posts', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Calculus Basics',
						category: 'Mathematics',
						tags: ['calculus'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree).toHaveLength(1);
			expect(tree[0].label).toBe('Mathematics');
			expect(tree[0].type).toBe('folder');
		});

		it('should group posts by category', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: { title: 'Calculus', category: 'Mathematics' },
				},
				{
					id: 'post-2',
					data: { title: 'JavaScript', category: 'Programming' },
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree).toHaveLength(2);
			const categories = tree.map((node) => node.label);
			expect(categories).toContain('Mathematics');
			expect(categories).toContain('Programming');
		});

		it('should categorize posts as "Uncategorized" when no category', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: { title: 'Test Post' },
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree).toHaveLength(1);
			expect(tree[0].label).toBe('Uncategorized');
		});

		it('should group posts by content type based on tags', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Course 1',
						category: 'Mathematics',
						tags: ['course', 'calculus'],
					},
				},
				{
					id: 'post-2',
					data: {
						title: 'Book 1',
						category: 'Mathematics',
						tags: ['book', 'algebra'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree).toHaveLength(1);
			expect(tree[0].children).toHaveLength(2);
			const contentTypes = tree[0].children!.map((node) => node.label);
			expect(contentTypes).toContain('Courses');
			expect(contentTypes).toContain('Books');
		});

		it('should detect course content type from tags', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Tutorial',
						category: 'Programming',
						tags: ['tutorial'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree[0].children![0].label).toBe('Courses');
		});

		it('should detect book content type from tags', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Textbook',
						category: 'Mathematics',
						tags: ['textbook'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree[0].children![0].label).toBe('Books');
		});

		it('should detect paper content type from tags', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Research Paper',
						category: 'Science',
						tags: ['research'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree[0].children![0].label).toBe('Papers');
		});

		it('should default to General content type', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Article',
						category: 'General',
						tags: ['article'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree[0].children![0].label).toBe('General');
		});

		it('should create file nodes with correct properties', () => {
			const posts: Post[] = [
				{
					id: 'calculus-intro',
					data: {
						title: 'Introduction to Calculus',
						category: 'Mathematics',
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');
			const fileNode = tree[0].children![0].children![0];

			expect(fileNode.type).toBe('file');
			expect(fileNode.label).toBe('Introduction to Calculus');
			expect(fileNode.slug).toBe('calculus-intro');
			expect(fileNode.href).toBe('/en/blog/calculus-intro/');
		});

		it('should generate correct href for different languages', () => {
			const posts: Post[] = [
				{
					id: 'test-post',
					data: { title: 'Test', category: 'Test' },
				},
			];

			const treeEn = buildExplorerTree(posts, 'en');
			const treeId = buildExplorerTree(posts, 'id');

			expect(treeEn[0].children![0].children![0].href).toBe('/en/blog/test-post/');
			expect(treeId[0].children![0].children![0].href).toBe('/id/blog/test-post/');
		});

		it('should handle empty posts array', () => {
			const tree = buildExplorerTree([], 'en');

			expect(tree).toEqual([]);
		});

		it('should generate unique IDs for nodes', () => {
			const posts: Post[] = [
				{
					id: 'post-1',
					data: {
						title: 'Post 1',
						category: 'Test Category',
						tags: ['course'],
					},
				},
			];

			const tree = buildExplorerTree(posts, 'en');

			expect(tree[0].id).toBe('category-test-category');
			expect(tree[0].children![0].id).toBe('category-test-category-courses');
		});
	});

	describe('getAllFiles', () => {
		it('should extract all file nodes from tree', () => {
			const tree: TreeNode[] = [
				{
					id: 'cat-1',
					label: 'Category 1',
					type: 'folder',
					children: [
						{
							id: 'type-1',
							label: 'Type 1',
							type: 'folder',
							children: [
								{
									id: 'file-1',
									label: 'File 1',
									type: 'file',
									slug: 'file-1',
									href: '/en/blog/file-1/',
								},
								{
									id: 'file-2',
									label: 'File 2',
									type: 'file',
									slug: 'file-2',
									href: '/en/blog/file-2/',
								},
							],
						},
					],
				},
			];

			const files = getAllFiles(tree);

			expect(files).toHaveLength(2);
			expect(files.every((node) => node.type === 'file')).toBe(true);
		});

		it('should handle empty tree', () => {
			const files = getAllFiles([]);

			expect(files).toEqual([]);
		});

		it('should handle tree with only folders', () => {
			const tree: TreeNode[] = [
				{
					id: 'folder-1',
					label: 'Folder 1',
					type: 'folder',
					children: [
						{
							id: 'folder-2',
							label: 'Folder 2',
							type: 'folder',
							children: [],
						},
					],
				},
			];

			const files = getAllFiles(tree);

			expect(files).toEqual([]);
		});

		it('should traverse nested folders', () => {
			const tree: TreeNode[] = [
				{
					id: 'cat-1',
					label: 'Category 1',
					type: 'folder',
					children: [
						{
							id: 'type-1',
							label: 'Type 1',
							type: 'folder',
							children: [
								{
									id: 'file-1',
									label: 'File 1',
									type: 'file',
									slug: 'file-1',
									href: '/en/blog/file-1/',
								},
							],
						},
						{
							id: 'type-2',
							label: 'Type 2',
							type: 'folder',
							children: [
								{
									id: 'file-2',
									label: 'File 2',
									type: 'file',
									slug: 'file-2',
									href: '/en/blog/file-2/',
								},
							],
						},
					],
				},
			];

			const files = getAllFiles(tree);

			expect(files).toHaveLength(2);
		});

		it('should preserve file node properties', () => {
			const tree: TreeNode[] = [
				{
					id: 'cat',
					label: 'Category',
					type: 'folder',
					children: [
						{
							id: 'type',
							label: 'Type',
							type: 'folder',
							children: [
								{
									id: 'file',
									label: 'Test File',
									type: 'file',
									slug: 'test-file',
									href: '/en/blog/test-file/',
								},
							],
						},
					],
				},
			];

			const files = getAllFiles(tree);

			expect(files[0].label).toBe('Test File');
			expect(files[0].slug).toBe('test-file');
			expect(files[0].href).toBe('/en/blog/test-file/');
		});
	});
});
