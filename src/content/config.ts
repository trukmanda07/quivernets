import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	heroImage: z.string().optional(),
	tags: z.array(z.string()).optional(),
	category: z.string().optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
	language: z.enum(['en', 'id']),
	presentationSlug: z.string().optional(), // Link to related presentation
});

const presentationSchema = z.object({
	title: z.string(),
	description: z.string(),
	pubDate: z.coerce.date(),
	updatedDate: z.coerce.date().optional(),
	heroImage: z.string().optional(),
	relatedBlogPost: z.string().optional(), // Slug of related blog post
	category: z.string(),
	tags: z.array(z.string()).optional(),
	difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
	language: z.enum(['en', 'id']),
	estimatedTime: z.number(), // Duration in minutes
	totalSlides: z.number(),
	author: z.string().optional(),
	slides: z.array(z.object({
		title: z.string(),
		time: z.string(),
		content: z.string(),
	})), // Array of slide objects
});

const blogEnCollection = defineCollection({
	type: 'content',
	schema: blogSchema,
});

const blogIdCollection = defineCollection({
	type: 'content',
	schema: blogSchema,
});

// Legacy blog collection (if needed)
const blogCollection = defineCollection({
	type: 'content',
	schema: blogSchema,
});

const presentationsEnCollection = defineCollection({
	loader: glob({
		pattern: '**/*.json',
		base: 'src/content/presentations-en'
	}),
	schema: presentationSchema,
});

const presentationsIdCollection = defineCollection({
	loader: glob({
		pattern: '**/*.json',
		base: 'src/content/presentations-id'
	}),
	schema: presentationSchema,
});

export const collections = {
	'blog': blogCollection,
	'blog-en': blogEnCollection,
	'blog-id': blogIdCollection,
	'presentations-en': presentationsEnCollection,
	'presentations-id': presentationsIdCollection,
};
