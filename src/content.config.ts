import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Shared schema for both English and Indonesian blog collections
const blogSchema = ({ image }: { image: any }) =>
	z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: image().optional(),
		// Educational content fields
		author: z.string().default('QuiverLearn'),
		tags: z.array(z.string()).default([]),
		category: z.string().optional(),
		difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
		hasMath: z.boolean().default(false),
		hasCode: z.boolean().default(false),
		estimatedReadingTime: z.number().optional(), // in minutes
		featured: z.boolean().default(false),
		draft: z.boolean().default(false),
		// i18n fields
		language: z.enum(['en', 'id']),
		translationId: z.string().optional(), // Links related translations
		translatedVersions: z.object({
			en: z.string().optional(), // slug of English version
			id: z.string().optional(), // slug of Indonesian version
		}).optional(),
	});

// Legacy blog collection (will be deprecated after migration)
const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: blogSchema,
});

// English blog collection
const blogEn = defineCollection({
	loader: glob({ base: './src/content/blog-en', pattern: '**/*.{md,mdx}' }),
	schema: blogSchema,
});

// Indonesian blog collection
const blogId = defineCollection({
	loader: glob({ base: './src/content/blog-id', pattern: '**/*.{md,mdx}' }),
	schema: blogSchema,
});

export const collections = {
	blog, // Keep for backward compatibility during migration
	'blog-en': blogEn,
	'blog-id': blogId,
};
