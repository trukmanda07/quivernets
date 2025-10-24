import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { postToSearchable } from '../utils/search';

export const GET: APIRoute = async () => {
	try {
		const posts = await getCollection('blog-en');
		const searchablePosts = posts.map(post => postToSearchable(post, 'en'));

		return new Response(JSON.stringify(searchablePosts), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
			},
		});
	} catch (error) {
		console.error('Error generating English search index:', error);
		return new Response(JSON.stringify([]), {
			status: 200,
			headers: {
				'Content-Type': 'application/json',
			},
		});
	}
};

export const prerender = true;
