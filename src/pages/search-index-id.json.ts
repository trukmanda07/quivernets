import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { postToSearchable } from '../utils/search';

export const GET: APIRoute = async () => {
	try {
		// Try to get Indonesian blog posts
		const posts = await getCollection('blog-id');
		const searchablePosts = posts.map(post => postToSearchable(post, 'id'));

		return new Response(JSON.stringify(searchablePosts), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
			},
		});
	} catch (error) {
		// If blog-id collection doesn't exist or is empty, return empty array
		console.error('Error generating Indonesian search index:', error);
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};

export const prerender = true;
