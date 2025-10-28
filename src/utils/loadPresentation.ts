/**
 * Utility functions to load presentations from the file-based structure
 * src/content/presentations-{lang}/{slug}/
 */

import fs from 'fs';
import path from 'path';

export interface SlideMetadata {
  slideNumber: number;
  title: string;
  time: string;
  fileName: string;
}

export interface PresentationMetadata {
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost: string;
  category: string;
  tags: string[];
  difficulty: string;
  language: string;
  estimatedTime: number;
  totalSlides: number;
  author: string;
}

export interface Slide {
  title: string;
  time: string;
  content: string;
  notes?: string;
  fragments?: boolean;
  transition?: string;
  background?: string;
}

/**
 * Load presentation metadata from JSON file
 */
export function loadPresentationMetadata(slug: string, lang: string = 'en'): PresentationMetadata {
  const metadataPath = path.join(
    process.cwd(),
    'src/content',
    `presentations-${lang}`,
    slug,
    'metadata.json'
  );

  const rawData = fs.readFileSync(metadataPath, 'utf-8');
  return JSON.parse(rawData) as PresentationMetadata;
}

/**
 * Load slide metadata (index of all slides)
 */
export function loadSlideMetadata(slug: string, lang: string = 'en'): SlideMetadata[] {
  const slideMetadataPath = path.join(
    process.cwd(),
    'src/content',
    `presentations-${lang}`,
    slug,
    'slide-metadata.json'
  );

  const rawData = fs.readFileSync(slideMetadataPath, 'utf-8');
  return JSON.parse(rawData) as SlideMetadata[];
}

/**
 * Load a single slide's HTML content
 */
export function loadSlideContent(slug: string, fileName: string, lang: string = 'en'): string {
  const slidePath = path.join(
    process.cwd(),
    'src/content',
    `presentations-${lang}`,
    slug,
    fileName
  );

  return fs.readFileSync(slidePath, 'utf-8');
}

/**
 * Load all slides for a presentation
 */
export function loadSlides(slug: string, lang: string = 'en'): Slide[] {
  const slideMetadataList = loadSlideMetadata(slug, lang);

  return slideMetadataList.map(slideMeta => {
    const content = loadSlideContent(slug, slideMeta.fileName, lang);

    // Remove the HTML comment header from content
    const cleanContent = content.replace(/^<!--[\s\S]*?-->\n/, '');

    return {
      title: slideMeta.title,
      time: slideMeta.time,
      content: cleanContent
    };
  });
}

/**
 * Load complete presentation data (metadata + slides)
 */
export function loadPresentation(slug: string, lang: string = 'en') {
  const metadata = loadPresentationMetadata(slug, lang);
  const slides = loadSlides(slug, lang);

  return {
    metadata,
    slides
  };
}

/**
 * Get list of all available presentations for a language
 */
export function getAllPresentationSlugs(lang: string = 'en'): string[] {
  const presentationsDir = path.join(
    process.cwd(),
    'src/content',
    `presentations-${lang}`
  );

  if (!fs.existsSync(presentationsDir)) {
    return [];
  }

  return fs.readdirSync(presentationsDir)
    .filter(item => {
      const itemPath = path.join(presentationsDir, item);
      return fs.statSync(itemPath).isDirectory();
    });
}

/**
 * Interface matching the old presentations.ts format
 */
export interface PresentationMeta {
  id: string;
  title: string;
  description: string;
  pubDate: string;
  relatedBlogPost?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: number;
  totalSlides: number;
  author: string;
  languages: string[];
}

/**
 * Get all presentations with metadata for all languages
 * This replaces the old presentations.ts registry
 */
export function getAllPresentations(): PresentationMeta[] {
  const presentations: PresentationMeta[] = [];
  const processedSlugs = new Set<string>();

  // Scan both language directories
  const languages = ['en', 'id'];

  for (const lang of languages) {
    const slugs = getAllPresentationSlugs(lang);

    for (const slug of slugs) {
      // If we've already processed this slug, just add the language
      if (processedSlugs.has(slug)) {
        const existing = presentations.find(p => p.id === slug);
        if (existing && !existing.languages.includes(lang)) {
          existing.languages.push(lang);
        }
        continue;
      }

      // Load metadata for this presentation
      try {
        const metadata = loadPresentationMetadata(slug, lang);

        // Check which languages this presentation is available in
        const availableLanguages: string[] = [lang];

        // Check if other languages exist
        for (const otherLang of languages) {
          if (otherLang !== lang) {
            const otherLangDir = path.join(
              process.cwd(),
              'src/content',
              `presentations-${otherLang}`,
              slug
            );
            if (fs.existsSync(otherLangDir)) {
              availableLanguages.push(otherLang);
            }
          }
        }

        presentations.push({
          id: slug,
          title: metadata.title,
          description: metadata.description,
          pubDate: metadata.pubDate,
          relatedBlogPost: metadata.relatedBlogPost,
          category: metadata.category,
          tags: metadata.tags,
          difficulty: metadata.difficulty,
          estimatedTime: metadata.estimatedTime,
          totalSlides: metadata.totalSlides,
          author: metadata.author,
          languages: availableLanguages
        });

        processedSlugs.add(slug);
      } catch (error) {
        console.error(`Failed to load presentation ${slug} (${lang}):`, error);
      }
    }
  }

  // Sort by date, newest first
  presentations.sort((a, b) =>
    new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf()
  );

  return presentations;
}

/**
 * Get presentations for a specific language
 */
export function getPresentationsForLang(lang: string): PresentationMeta[] {
  return getAllPresentations().filter(p => p.languages.includes(lang));
}

/**
 * Get a specific presentation by ID
 */
export function getPresentationById(id: string): PresentationMeta | undefined {
  return getAllPresentations().find(p => p.id === id);
}
