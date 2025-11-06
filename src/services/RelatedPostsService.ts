/**
 * Related Posts Service
 *
 * Extracts the related posts scoring algorithm from the RelatedPosts component.
 * Provides testable, configurable recommendation logic.
 *
 * Phase 4: Now uses rich domain models (BlogPost) and delegates to domain model methods.
 */

import { BlogPost } from '../domain/blog/BlogPost';

/**
 * Configurable weights for scoring related posts
 */
export interface ScoringWeights {
	/**
	 * Weight for each shared tag (default: 3)
	 */
	sharedTag: number;

	/**
	 * Weight for same category (default: 2)
	 */
	sameCategory: number;

	/**
	 * Weight for same difficulty level (default: 1)
	 */
	sameDifficulty: number;
}

/**
 * Options for finding related posts
 */
export interface RelatedPostsOptions {
	/**
	 * Maximum number of related posts to return (default: 3)
	 */
	maxResults?: number;

	/**
	 * Scoring weights (uses defaults if not provided)
	 */
	weights?: Partial<ScoringWeights>;

	/**
	 * Minimum score required for a post to be considered related (default: 1)
	 */
	minScore?: number;
}

/**
 * Scored post with relevance score
 */
export interface ScoredPost {
	post: BlogPost;
	score: number;
	reasons: string[]; // For debugging/explanation
}

/**
 * Default scoring weights
 */
const DEFAULT_WEIGHTS: ScoringWeights = {
	sharedTag: 3,
	sameCategory: 2,
	sameDifficulty: 1,
};

/**
 * Service for finding related blog posts based on content similarity.
 *
 * Uses a scoring algorithm that considers:
 * - Shared tags (highest priority)
 * - Same category
 * - Same difficulty level
 *
 * @example
 * const related = RelatedPostsService.findRelated(currentPost, allPosts, {
 *   maxResults: 3,
 *   weights: { sharedTag: 5, sameCategory: 3 }
 * });
 */
export class RelatedPostsService {
	/**
	 * Find related posts for a given post.
	 *
	 * @param currentPost - The current post to find related posts for
	 * @param allPosts - All available posts to search through
	 * @param options - Options for filtering and scoring
	 * @returns Array of related posts sorted by relevance
	 */
	static findRelated(
		currentPost: BlogPost,
		allPosts: BlogPost[],
		options: RelatedPostsOptions = {},
	): BlogPost[] {
		const {
			maxResults = 3,
			weights = {},
			minScore = 1,
		} = options;

		const finalWeights: ScoringWeights = {
			...DEFAULT_WEIGHTS,
			...weights,
		};

		// Filter out the current post
		const otherPosts = allPosts.filter((post) => post.slug !== currentPost.slug);

		// Score each post
		const scoredPosts = otherPosts.map((post) =>
			this.scorePost(currentPost, post, finalWeights),
		);

		// Filter, sort by score, and return top N
		return scoredPosts
			.filter((item) => item.score >= minScore)
			.sort((a, b) => b.score - a.score)
			.slice(0, maxResults)
			.map((item) => item.post);
	}

	/**
	 * Find related posts with detailed scoring information.
	 * Useful for debugging or explaining recommendations.
	 *
	 * @param currentPost - The current post
	 * @param allPosts - All available posts
	 * @param options - Options for filtering and scoring
	 * @returns Array of scored posts with reasons
	 */
	static findRelatedWithScores(
		currentPost: BlogPost,
		allPosts: BlogPost[],
		options: RelatedPostsOptions = {},
	): ScoredPost[] {
		const {
			maxResults = 3,
			weights = {},
			minScore = 1,
		} = options;

		const finalWeights: ScoringWeights = {
			...DEFAULT_WEIGHTS,
			...weights,
		};

		const otherPosts = allPosts.filter((post) => post.slug !== currentPost.slug);

		const scoredPosts = otherPosts.map((post) =>
			this.scorePost(currentPost, post, finalWeights),
		);

		return scoredPosts
			.filter((item) => item.score >= minScore)
			.sort((a, b) => b.score - a.score)
			.slice(0, maxResults);
	}

	/**
	 * Calculate relevance score between two posts.
	 * Now delegates to domain model methods for tag and category comparisons.
	 *
	 * @param currentPost - The reference post
	 * @param candidatePost - The post to score against the reference
	 * @param weights - Scoring weights
	 * @returns Scored post with reasons
	 */
	private static scorePost(
		currentPost: BlogPost,
		candidatePost: BlogPost,
		weights: ScoringWeights,
	): ScoredPost {
		let score = 0;
		const reasons: string[] = [];

		// Score based on shared tags (highest priority) - delegate to domain model
		const sharedTags = currentPost.getSharedTags(candidatePost);

		if (sharedTags.length > 0) {
			const tagScore = sharedTags.length * weights.sharedTag;
			score += tagScore;
			reasons.push(`${sharedTags.length} shared tag(s): ${sharedTags.join(', ')} (+${tagScore})`);
		}

		// Score based on same category - delegate to domain model
		if (
			currentPost.category &&
			candidatePost.category &&
			currentPost.isInCategory(candidatePost.category)
		) {
			score += weights.sameCategory;
			reasons.push(`Same category: ${currentPost.category} (+${weights.sameCategory})`);
		}

		// Score based on same difficulty level - delegate to domain model
		if (
			currentPost.difficulty &&
			candidatePost.difficulty &&
			currentPost.hasDifficulty(candidatePost.difficulty)
		) {
			score += weights.sameDifficulty;
			reasons.push(
				`Same difficulty: ${currentPost.difficulty} (+${weights.sameDifficulty})`,
			);
		}

		return {
			post: candidatePost,
			score,
			reasons,
		};
	}

	/**
	 * Get default scoring weights.
	 * Useful for showing configuration to users.
	 *
	 * @returns Default weights
	 */
	static getDefaultWeights(): ScoringWeights {
		return { ...DEFAULT_WEIGHTS };
	}

	/**
	 * Explain why a post is considered related.
	 * Useful for debugging recommendation issues.
	 *
	 * @param currentPost - The reference post
	 * @param relatedPost - The related post to explain
	 * @param weights - Scoring weights (optional)
	 * @returns Explanation string
	 */
	static explainRelation(
		currentPost: BlogPost,
		relatedPost: BlogPost,
		weights: Partial<ScoringWeights> = {},
	): string {
		const finalWeights: ScoringWeights = {
			...DEFAULT_WEIGHTS,
			...weights,
		};

		const scored = this.scorePost(currentPost, relatedPost, finalWeights);

		if (scored.score === 0) {
			return 'No relation found (score: 0)';
		}

		return `Score: ${scored.score}\nReasons:\n- ${scored.reasons.join('\n- ')}`;
	}
}
