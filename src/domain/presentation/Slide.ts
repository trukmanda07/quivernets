/**
 * Slide domain model
 * Encapsulates slide behavior and validation
 */

/**
 * Raw slide data structure
 */
export interface SlideData {
  title: string;
  time: string;
  content: string;
  notes?: string;
  fragments?: boolean;
  transition?: string;
  background?: string;
}

/**
 * Rich domain model for Slide
 */
export class Slide {
  readonly title: string;
  readonly time: string;
  readonly content: string;
  readonly notes?: string;
  readonly fragments: boolean;
  readonly transition?: string;
  readonly background?: string;
  readonly slideNumber: number;

  constructor(data: SlideData, slideNumber: number) {
    this.validateSlideData(data);

    this.title = data.title;
    this.time = data.time;
    this.content = data.content;
    this.notes = data.notes;
    this.fragments = data.fragments ?? false;
    this.transition = data.transition;
    this.background = data.background;
    this.slideNumber = slideNumber;
  }

  /**
   * Validate slide data
   */
  private validateSlideData(data: SlideData): void {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error('Slide title is required');
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error('Slide content is required');
    }

    if (!data.time || data.time.trim().length === 0) {
      throw new Error('Slide time is required');
    }
  }

  /**
   * Get the slide title
   */
  getTitle(): string {
    return this.title;
  }

  /**
   * Get the slide content
   */
  getContent(): string {
    return this.content;
  }

  /**
   * Get the slide notes
   */
  getNotes(): string | undefined {
    return this.notes;
  }

  /**
   * Check if the slide has notes
   */
  hasNotes(): boolean {
    return !!this.notes && this.notes.length > 0;
  }

  /**
   * Check if the slide has fragments
   */
  hasFragments(): boolean {
    return this.fragments;
  }

  /**
   * Get the slide transition effect
   */
  getTransition(): string | undefined {
    return this.transition;
  }

  /**
   * Get the slide background
   */
  getBackground(): string | undefined {
    return this.background;
  }

  /**
   * Get the slide number (1-based)
   */
  getSlideNumber(): number {
    return this.slideNumber;
  }

  /**
   * Parse the time string to get estimated time in seconds
   * Format: "MM:SS" or "HH:MM:SS"
   */
  getEstimatedTime(): number {
    const parts = this.time.split(':').map((p) => parseInt(p, 10));

    if (parts.length === 2) {
      // MM:SS format
      const [minutes, seconds] = parts;
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // HH:MM:SS format
      const [hours, minutes, seconds] = parts;
      return hours * 3600 + minutes * 60 + seconds;
    }

    return 0;
  }

  /**
   * Get formatted time string
   */
  getFormattedTime(): string {
    return this.time;
  }

  /**
   * Get estimated time in minutes
   */
  getEstimatedTimeInMinutes(): number {
    return Math.ceil(this.getEstimatedTime() / 60);
  }

  /**
   * Check if the slide content contains math (KaTeX)
   */
  hasMath(): boolean {
    return this.content.includes('$$') || this.content.includes('\\(') || this.content.includes('\\[');
  }

  /**
   * Check if the slide content contains code blocks
   */
  hasCode(): boolean {
    return this.content.includes('<pre>') || this.content.includes('<code>');
  }

  /**
   * Get the approximate word count of the slide content
   */
  getWordCount(): number {
    // Strip HTML tags and count words
    const text = this.content.replace(/<[^>]*>/g, ' ');
    const words = text.trim().split(/\s+/);
    return words.length;
  }

  /**
   * Check if the slide is a title slide (typically the first slide)
   */
  isTitleSlide(): boolean {
    return this.slideNumber === 1;
  }

  /**
   * Get a summary of the slide
   */
  getSummary(): string {
    const wordCount = this.getWordCount();
    const features: string[] = [];

    if (this.hasMath()) features.push('math');
    if (this.hasCode()) features.push('code');
    if (this.hasNotes()) features.push('notes');
    if (this.hasFragments()) features.push('fragments');

    const featuresStr = features.length > 0 ? ` [${features.join(', ')}]` : '';

    return `Slide ${this.slideNumber}: ${this.title} (${wordCount} words, ${this.time})${featuresStr}`;
  }

  /**
   * Convert to plain object for serialization
   */
  toJSON(): SlideData {
    return {
      title: this.title,
      time: this.time,
      content: this.content,
      notes: this.notes,
      fragments: this.fragments,
      transition: this.transition,
      background: this.background,
    };
  }
}
