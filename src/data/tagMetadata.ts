/**
 * Tag Metadata Configuration
 *
 * Centralized tag metadata including descriptions, categories, icons, and learning paths.
 * This data structure enhances tag browsing and provides additional context for users.
 */

export type TagCategory = 'mathematics' | 'computer-science' | 'programming' | 'tools' | 'general';
export type LearningLevel = 'basics' | 'intermediate' | 'advanced';

export interface TagMetadata {
  name: string;
  slug: string;
  description?: string;
  category: TagCategory;
  icon?: string;
  color?: string;
  relatedTags?: string[];
  learningPath?: LearningLevel;
  aliases?: string[]; // Alternative names for the tag
}

/**
 * Centralized tag metadata registry
 */
export const tagMetadata: Record<string, TagMetadata> = {
  // Mathematics Tags
  'calculus': {
    name: 'Calculus',
    slug: 'calculus',
    description: 'Differential and integral calculus topics including limits, derivatives, and integrals',
    category: 'mathematics',
    icon: '📐',
    relatedTags: ['derivatives', 'integration', 'limits', 'differentiation'],
    learningPath: 'intermediate',
  },
  'derivatives': {
    name: 'Derivatives',
    slug: 'derivatives',
    description: 'The derivative as a rate of change and slope of tangent lines',
    category: 'mathematics',
    icon: '📈',
    relatedTags: ['calculus', 'differentiation', 'limits'],
    learningPath: 'intermediate',
  },
  'integration': {
    name: 'Integration',
    slug: 'integration',
    description: 'Techniques and applications of integration',
    category: 'mathematics',
    icon: '∫',
    relatedTags: ['calculus', 'differentiation', 'area'],
    learningPath: 'intermediate',
  },
  'differentiation': {
    name: 'Differentiation',
    slug: 'differentiation',
    description: 'Process of finding derivatives and rates of change',
    category: 'mathematics',
    icon: '∂',
    relatedTags: ['calculus', 'derivatives', 'limits'],
    learningPath: 'intermediate',
  },
  'algebra': {
    name: 'Algebra',
    slug: 'algebra',
    description: 'Algebraic structures, equations, and manipulations',
    category: 'mathematics',
    icon: '🔢',
    relatedTags: ['linear-algebra', 'mathematics'],
    learningPath: 'basics',
  },
  'linear-algebra': {
    name: 'Linear Algebra',
    slug: 'linear-algebra',
    description: 'Vector spaces, matrices, linear transformations, and eigenvalues',
    category: 'mathematics',
    icon: '📊',
    relatedTags: ['algebra', 'mathematics'],
    learningPath: 'intermediate',
  },
  'mathematics': {
    name: 'Mathematics',
    slug: 'mathematics',
    description: 'General mathematical concepts and theories',
    category: 'mathematics',
    icon: '∑',
    relatedTags: ['calculus', 'algebra', 'geometry', 'statistics'],
    learningPath: 'basics',
  },
  'geometry': {
    name: 'Geometry',
    slug: 'geometry',
    description: 'Study of shapes, spaces, and their properties',
    category: 'mathematics',
    icon: '△',
    relatedTags: ['mathematics', 'area'],
    learningPath: 'basics',
  },
  'statistics': {
    name: 'Statistics',
    slug: 'statistics',
    description: 'Data analysis, probability, and statistical inference',
    category: 'mathematics',
    icon: '📊',
    relatedTags: ['probability', 'mathematics'],
    learningPath: 'intermediate',
  },
  'probability': {
    name: 'Probability',
    slug: 'probability',
    description: 'Theory and applications of random events and distributions',
    category: 'mathematics',
    icon: '🎲',
    relatedTags: ['statistics', 'mathematics'],
    learningPath: 'intermediate',
  },
  'limits': {
    name: 'Limits',
    slug: 'limits',
    description: 'Limits of functions, continuity, and foundational concepts in calculus',
    category: 'mathematics',
    icon: '→',
    relatedTags: ['calculus', 'derivatives', 'differentiation'],
    learningPath: 'intermediate',
  },
  'area': {
    name: 'Area',
    slug: 'area',
    description: 'Calculating areas under curves, between curves, and geometric regions',
    category: 'mathematics',
    icon: '▭',
    relatedTags: ['integration', 'calculus', 'geometry'],
    learningPath: 'intermediate',
  },

  // Computer Science Tags
  'algorithms': {
    name: 'Algorithms',
    slug: 'algorithms',
    description: 'Algorithm design, analysis, and complexity theory',
    category: 'computer-science',
    icon: '⚙️',
    relatedTags: ['data-structures'],
    learningPath: 'intermediate',
  },
  'data-structures': {
    name: 'Data Structures',
    slug: 'data-structures',
    description: 'Arrays, trees, graphs, hash tables, and other data organization methods',
    category: 'computer-science',
    icon: '🗂️',
    relatedTags: ['algorithms'],
    learningPath: 'intermediate',
  },
  'complexity': {
    name: 'Complexity Theory',
    slug: 'complexity',
    description: 'Time and space complexity, Big-O notation, NP-completeness',
    category: 'computer-science',
    icon: '⏱️',
    relatedTags: ['algorithms'],
    learningPath: 'advanced',
  },
  'machine-learning': {
    name: 'Machine Learning',
    slug: 'machine-learning',
    description: 'Neural networks, supervised/unsupervised learning, deep learning',
    category: 'computer-science',
    icon: '🤖',
    relatedTags: ['artificial-intelligence', 'python', 'statistics'],
    learningPath: 'advanced',
    aliases: ['ml', 'deep-learning'],
  },
  'artificial-intelligence': {
    name: 'Artificial Intelligence',
    slug: 'artificial-intelligence',
    description: 'AI algorithms, reasoning, planning, and knowledge representation',
    category: 'computer-science',
    icon: '🧠',
    relatedTags: ['machine-learning', 'algorithms'],
    learningPath: 'advanced',
    aliases: ['ai'],
  },
  'computer-science': {
    name: 'Computer Science',
    slug: 'computer-science',
    description: 'Fundamental computer science concepts and theory',
    category: 'computer-science',
    icon: '💻',
    relatedTags: ['algorithms'],
    learningPath: 'basics',
    aliases: ['cs'],
  },
  'operating-systems': {
    name: 'Operating Systems',
    slug: 'operating-systems',
    description: 'OS design, processes, memory management, file systems',
    category: 'computer-science',
    icon: '🖥️',
    relatedTags: ['computer-science'],
    learningPath: 'advanced',
    aliases: ['os'],
  },
  'databases': {
    name: 'Databases',
    slug: 'databases',
    description: 'Database design, SQL, NoSQL, transactions, and optimization',
    category: 'computer-science',
    icon: '🗄️',
    relatedTags: ['data-structures'],
    learningPath: 'intermediate',
    aliases: ['db'],
  },

  // Programming Tags
  'python': {
    name: 'Python',
    slug: 'python',
    description: 'Python programming language, libraries, and best practices',
    category: 'programming',
    icon: '🐍',
    relatedTags: ['machine-learning'],
    learningPath: 'basics',
  },
  'javascript': {
    name: 'JavaScript',
    slug: 'javascript',
    description: 'JavaScript language, ES6+, async programming, and web development',
    category: 'programming',
    icon: '📜',
    relatedTags: ['web-development', 'typescript'],
    learningPath: 'basics',
    aliases: ['js'],
  },
  'typescript': {
    name: 'TypeScript',
    slug: 'typescript',
    description: 'TypeScript superset of JavaScript with static typing',
    category: 'programming',
    icon: '🔷',
    relatedTags: ['javascript', 'web-development'],
    learningPath: 'intermediate',
    aliases: ['ts'],
  },
  'react': {
    name: 'React',
    slug: 'react',
    description: 'React library for building user interfaces',
    category: 'programming',
    icon: '⚛️',
    relatedTags: ['javascript', 'web-development', 'frontend'],
    learningPath: 'intermediate',
  },
  'web-development': {
    name: 'Web Development',
    slug: 'web-development',
    description: 'Building websites and web applications',
    category: 'programming',
    icon: '🌐',
    relatedTags: ['javascript', 'frontend', 'backend'],
    learningPath: 'basics',
  },
  'frontend': {
    name: 'Frontend Development',
    slug: 'frontend',
    description: 'Client-side web development, UI/UX implementation',
    category: 'programming',
    icon: '🎨',
    relatedTags: ['web-development', 'javascript', 'react'],
    learningPath: 'intermediate',
  },
  'backend': {
    name: 'Backend Development',
    slug: 'backend',
    description: 'Server-side development, APIs, databases',
    category: 'programming',
    icon: '⚡',
    relatedTags: ['web-development', 'databases'],
    learningPath: 'intermediate',
  },
  'programming': {
    name: 'Programming',
    slug: 'programming',
    description: 'General programming concepts and best practices',
    category: 'programming',
    icon: '💻',
    relatedTags: ['algorithms', 'data-structures'],
    learningPath: 'basics',
  },

  // Tools Tags
  'git': {
    name: 'Git',
    slug: 'git',
    description: 'Version control with Git, workflows, and best practices',
    category: 'tools',
    icon: '🔀',
    relatedTags: [],
    learningPath: 'basics',
  },
  'docker': {
    name: 'Docker',
    slug: 'docker',
    description: 'Containerization with Docker, Docker Compose, orchestration',
    category: 'tools',
    icon: '🐳',
    relatedTags: ['linux'],
    learningPath: 'intermediate',
  },
  'linux': {
    name: 'Linux',
    slug: 'linux',
    description: 'Linux operating system, command line, shell scripting',
    category: 'tools',
    icon: '🐧',
    relatedTags: ['operating-systems'],
    learningPath: 'intermediate',
  },
  'vim': {
    name: 'Vim',
    slug: 'vim',
    description: 'Vim text editor, commands, and productivity tips',
    category: 'tools',
    icon: '📝',
    relatedTags: ['linux'],
    learningPath: 'intermediate',
  },

  // General Tags
  'tutorial': {
    name: 'Tutorial',
    slug: 'tutorial',
    description: 'Step-by-step guides and tutorials',
    category: 'general',
    icon: '📚',
    relatedTags: ['beginner'],
    learningPath: 'basics',
  },
  'beginner': {
    name: 'Beginner',
    slug: 'beginner',
    description: 'Content suitable for beginners',
    category: 'general',
    icon: '🌱',
    relatedTags: ['tutorial'],
    learningPath: 'basics',
  },
  'advanced': {
    name: 'Advanced',
    slug: 'advanced',
    description: 'Advanced topics for experienced learners',
    category: 'general',
    icon: '🚀',
    relatedTags: ['theory'],
    learningPath: 'advanced',
  },
  'theory': {
    name: 'Theory',
    slug: 'theory',
    description: 'Theoretical concepts and foundations',
    category: 'general',
    icon: '📖',
    relatedTags: ['mathematics', 'computer-science'],
    learningPath: 'intermediate',
  },
  'practice': {
    name: 'Practice',
    slug: 'practice',
    description: 'Practical exercises and hands-on learning',
    category: 'general',
    icon: '✍️',
    relatedTags: ['tutorial'],
    learningPath: 'basics',
  },
};

/**
 * Category metadata for organizing tags
 */
export const categoryMetadata: Record<TagCategory, { name: string; description: string; icon: string }> = {
  'mathematics': {
    name: 'Mathematics',
    description: 'Mathematical concepts, theories, and applications',
    icon: '📐',
  },
  'computer-science': {
    name: 'Computer Science',
    description: 'CS fundamentals, algorithms, and theoretical concepts',
    icon: '💻',
  },
  'programming': {
    name: 'Programming',
    description: 'Programming languages, frameworks, and development',
    icon: '⌨️',
  },
  'tools': {
    name: 'Tools',
    description: 'Development tools, editors, and utilities',
    icon: '🛠️',
  },
  'general': {
    name: 'General',
    description: 'General topics and meta content',
    icon: '📚',
  },
};

/**
 * Learning level metadata
 */
export const learningLevelMetadata: Record<LearningLevel, { name: string; description: string; icon: string; color: string }> = {
  'basics': {
    name: 'Basics',
    description: 'Fundamental concepts for beginners',
    icon: '⭐',
    color: 'green',
  },
  'intermediate': {
    name: 'Intermediate',
    description: 'Intermediate topics building on fundamentals',
    icon: '⭐⭐',
    color: 'orange',
  },
  'advanced': {
    name: 'Advanced',
    description: 'Advanced topics for experienced learners',
    icon: '⭐⭐⭐',
    color: 'red',
  },
};
