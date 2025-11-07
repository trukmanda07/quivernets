/**
 * FileSystem-based implementation of PresentationRepository
 * Wraps the existing loadPresentation.ts utilities with repository pattern
 */

import fs from 'fs';
import path from 'path';
import type {
  PresentationRepository,
  PresentationData,
  PresentationMetadata,
  SlideData,
  SlideMetadata,
  PresentationListItem,
} from '../../domain/presentation/PresentationRepository';
import type { Language } from '../../domain/blog/types';
import { Presentation } from '../../domain/presentation/Presentation';

/**
 * Cache for presentation data to avoid repeated filesystem reads
 */
class PresentationCache {
  private presentationCache = new Map<string, Presentation>();
  private listCache = new Map<string, PresentationListItem[]>();
  private slugsCache = new Map<string, string[]>();
  private domainListCache = new Map<string, Presentation[]>();

  getCacheKey(slug: string, language: Language): string {
    return `${language}:${slug}`;
  }

  getPresentation(slug: string, language: Language): Presentation | undefined {
    return this.presentationCache.get(this.getCacheKey(slug, language));
  }

  setPresentation(slug: string, language: Language, presentation: Presentation): void {
    this.presentationCache.set(this.getCacheKey(slug, language), presentation);
  }

  getDomainList(language: Language): Presentation[] | undefined {
    return this.domainListCache.get(language);
  }

  setDomainList(language: Language, presentations: Presentation[]): void {
    this.domainListCache.set(language, presentations);
  }

  getList(language: Language): PresentationListItem[] | undefined {
    return this.listCache.get(language);
  }

  setList(language: Language, items: PresentationListItem[]): void {
    this.listCache.set(language, items);
  }

  getAllList(): PresentationListItem[] | undefined {
    return this.listCache.get('all');
  }

  setAllList(items: PresentationListItem[]): void {
    this.listCache.set('all', items);
  }

  getSlugs(language: Language): string[] | undefined {
    return this.slugsCache.get(language);
  }

  setSlugs(language: Language, slugs: string[]): void {
    this.slugsCache.set(language, slugs);
  }

  clear(): void {
    this.presentationCache.clear();
    this.listCache.clear();
    this.slugsCache.clear();
    this.domainListCache.clear();
  }
}

/**
 * FileSystem implementation of PresentationRepository
 */
export class FileSystemPresentationRepository implements PresentationRepository {
  private cache = new PresentationCache();
  private readonly contentDir: string;
  private readonly supportedLanguages: Language[] = ['en', 'id'];

  constructor(contentDir?: string) {
    this.contentDir = contentDir || path.join(process.cwd(), 'src/content');
  }

  /**
   * Get the directory path for presentations in a specific language
   */
  private getPresentationsDir(language: Language): string {
    return path.join(this.contentDir, `presentations-${language}`);
  }

  /**
   * Get the path for a specific presentation
   */
  private getPresentationPath(slug: string, language: Language): string {
    return path.join(this.getPresentationsDir(language), slug);
  }

  /**
   * Load metadata from filesystem
   */
  private async loadMetadataFromFS(slug: string, language: Language): Promise<PresentationMetadata | null> {
    try {
      const metadataPath = path.join(this.getPresentationPath(slug, language), 'metadata.json');

      if (!fs.existsSync(metadataPath)) {
        return null;
      }

      const rawData = fs.readFileSync(metadataPath, 'utf-8');
      const metadata = JSON.parse(rawData) as PresentationMetadata;

      return metadata;
    } catch (error) {
      console.error(`Failed to load presentation metadata ${slug} (${language}):`, error);
      return null;
    }
  }

  /**
   * Load slide metadata from filesystem
   */
  private async loadSlideMetadataFromFS(slug: string, language: Language): Promise<SlideMetadata[]> {
    const slideMetadataPath = path.join(
      this.getPresentationPath(slug, language),
      'slide-metadata.json'
    );

    const rawData = fs.readFileSync(slideMetadataPath, 'utf-8');
    return JSON.parse(rawData) as SlideMetadata[];
  }

  /**
   * Load slide content from filesystem
   */
  private loadSlideContent(slug: string, fileName: string, language: Language): string {
    const slidePath = path.join(this.getPresentationPath(slug, language), fileName);
    return fs.readFileSync(slidePath, 'utf-8');
  }

  /**
   * Load all slides for a presentation from filesystem
   */
  private async loadSlidesFromFS(slug: string, language: Language): Promise<SlideData[]> {
    try {
      const slideMetadataList = await this.loadSlideMetadataFromFS(slug, language);

      const slides = slideMetadataList.map((slideMeta) => {
        const content = this.loadSlideContent(slug, slideMeta.fileName, language);

        // Remove the HTML comment header from content
        const cleanContent = content.replace(/^<!--[\s\S]*?-->\n/, '');

        return {
          title: slideMeta.title,
          time: slideMeta.time,
          content: cleanContent,
        };
      });

      return slides;
    } catch (error) {
      console.error(`Failed to load slides for ${slug} (${language}):`, error);
      return [];
    }
  }

  /**
   * Find a presentation by slug and language (returns domain model)
   */
  async findBySlug(slug: string, language: Language): Promise<Presentation | null> {
    // Check cache first
    const cached = this.cache.getPresentation(slug, language);
    if (cached) {
      return cached;
    }

    // Load from filesystem
    const metadata = await this.loadMetadataFromFS(slug, language);
    if (!metadata) {
      return null;
    }

    const slides = await this.loadSlidesFromFS(slug, language);

    // Create domain model
    const presentation = new Presentation(slug, metadata, slides);

    // Cache the domain model
    this.cache.setPresentation(slug, language, presentation);

    return presentation;
  }

  /**
   * Get all available presentation slugs for a language
   */
  async getSlugs(language: Language): Promise<string[]> {
    // Check cache first
    const cached = this.cache.getSlugs(language);
    if (cached) {
      return cached;
    }

    const presentationsDir = this.getPresentationsDir(language);

    if (!fs.existsSync(presentationsDir)) {
      return [];
    }

    const slugs = fs
      .readdirSync(presentationsDir)
      .filter((item) => {
        const itemPath = path.join(presentationsDir, item);
        return fs.statSync(itemPath).isDirectory();
      });

    // Cache the slugs
    this.cache.setSlugs(language, slugs);

    return slugs;
  }

  /**
   * Find all presentations for a specific language (returns domain models)
   */
  async findAll(language: Language): Promise<Presentation[]> {
    // Check cache first
    const cached = this.cache.getDomainList(language);
    if (cached) {
      return cached;
    }

    const presentations: Presentation[] = [];
    const slugs = await this.getSlugs(language);

    for (const slug of slugs) {
      const presentation = await this.findBySlug(slug, language);
      if (presentation) {
        presentations.push(presentation);
      }
    }

    // Sort by date, newest first
    presentations.sort(
      (a, b) => b.getPubDate().valueOf() - a.getPubDate().valueOf()
    );

    // Cache the results
    this.cache.setDomainList(language, presentations);

    return presentations;
  }

  /**
   * Find all presentations across all languages
   */
  async findAllWithLanguages(): Promise<PresentationListItem[]> {
    // Check cache first
    const cached = this.cache.getAllList();
    if (cached) {
      return cached;
    }

    const presentations: PresentationListItem[] = [];
    const processedSlugs = new Set<string>();

    // Scan all language directories
    for (const lang of this.supportedLanguages) {
      const slugs = await this.getSlugs(lang);

      for (const slug of slugs) {
        // If we've already processed this slug, just add the language
        if (processedSlugs.has(slug)) {
          const existing = presentations.find((p) => p.id === slug);
          if (existing && !existing.languages.includes(lang)) {
            existing.languages.push(lang);
          }
          continue;
        }

        // Load metadata for this presentation
        const metadata = await this.loadMetadataFromFS(slug, lang);
        if (!metadata) {
          continue;
        }

        // Check which languages this presentation is available in
        const availableLanguages: string[] = [lang];

        // Check if other languages exist
        for (const otherLang of this.supportedLanguages) {
          if (otherLang !== lang) {
            const otherLangPath = this.getPresentationPath(slug, otherLang);
            if (fs.existsSync(otherLangPath)) {
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
          languages: availableLanguages,
        });

        processedSlugs.add(slug);
      }
    }

    // Sort by date, newest first
    presentations.sort(
      (a, b) => new Date(b.pubDate).valueOf() - new Date(a.pubDate).valueOf()
    );

    // Cache the results
    this.cache.setAllList(presentations);

    return presentations;
  }

  /**
   * Find a presentation by slug (any language)
   */
  async findBySlugAnyLanguage(slug: string): Promise<PresentationListItem | null> {
    const allPresentations = await this.findAllWithLanguages();
    return allPresentations.find((p) => p.id === slug) || null;
  }

  /**
   * Find presentations related to a blog post
   */
  async findByRelatedBlogPost(
    blogPostSlug: string,
    language: Language
  ): Promise<PresentationListItem[]> {
    const allPresentations = await this.findAllWithLanguages();
    return allPresentations.filter(
      (p) => p.relatedBlogPost === blogPostSlug && p.languages.includes(language)
    );
  }

  /**
   * Clear the cache (useful for testing or development)
   */
  clearCache(): void {
    this.cache.clear();
  }
}

/**
 * Default singleton instance
 */
let defaultRepository: FileSystemPresentationRepository | null = null;

/**
 * Get the default presentation repository instance
 */
export function getDefaultPresentationRepository(): FileSystemPresentationRepository {
  if (!defaultRepository) {
    defaultRepository = new FileSystemPresentationRepository();
  }
  return defaultRepository;
}
