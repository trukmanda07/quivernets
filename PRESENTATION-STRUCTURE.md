# Presentation File Structure

## Overview

Presentations now use a **file-based structure** where each slide is a separate HTML file. This makes content much easier to read, edit, and maintain.

## Directory Structure

```
src/
├── content/
│   ├── presentations-en/           # English presentations
│   │   ├── fundamental-theorem-calculus/
│   │   │   ├── metadata.json       # Presentation metadata
│   │   │   ├── slide-metadata.json # Index of all slides
│   │   │   ├── slide-01.html       # Individual slide content
│   │   │   ├── slide-02.html
│   │   │   └── ...
│   │   ├── gradient-descent-linear-regression/
│   │   └── ...
│   │
│   └── presentations-id/           # Indonesian presentations
│       └── (same structure as -en)
│
├── pages/
│   └── [lang]/
│       └── presentations/
│           └── [...slug].astro     # Single dynamic route for ALL presentations
│
└── utils/
    └── loadPresentation.ts         # Utility functions to load presentation data
```

## File Formats

### metadata.json
Contains presentation-level information:
```json
{
  "title": "The Fundamental Theorem of Calculus",
  "description": "...",
  "pubDate": "2025-10-21T00:00:00.000Z",
  "relatedBlogPost": "fundamental-theorem-calculus",
  "category": "Calculus",
  "tags": ["calculus", "mathematics"],
  "difficulty": "intermediate",
  "language": "en",
  "estimatedTime": 45,
  "totalSlides": 11,
  "author": "QuiverLearn"
}
```

### slide-metadata.json
Index of all slides with titles and timing:
```json
[
  {
    "slideNumber": 1,
    "title": "Opening Image",
    "time": "0:00-2:00",
    "fileName": "slide-01.html"
  },
  {
    "slideNumber": 2,
    "title": "Theme Stated",
    "time": "2:00-3:00",
    "fileName": "slide-02.html"
  }
]
```

### slide-XX.html
Individual slide HTML content with comment header:
```html
<!--
  Slide 1: Opening Image
  Time: 0:00-2:00
-->
<div class="space-y-1.5">
  <!-- Your slide HTML content here -->
</div>
```

## How It Works

1. **Automatic Discovery**: System automatically scans `src/content/presentations-{lang}/` at build time
2. **Dynamic Routing**: `src/pages/[lang]/presentations/[...slug].astro` handles ALL presentation routes
3. **Static Path Generation**: `getStaticPaths()` uses `getAllPresentationSlugs()` to find all presentations
4. **Content Loading**: `loadPresentation()` utility loads metadata and slides from files
5. **Index Page**: `getAllPresentations()` dynamically generates the presentations list
6. **Rendering**: RevealPresentation component renders the slides

**No Manual Registry!** The system automatically discovers presentations from the filesystem - no need to update `presentations.ts` or any registry file.

## Adding a New Presentation

1. Create a new directory: `src/content/presentations-en/{slug}/`
2. Add `metadata.json` with presentation info
3. Add `slide-metadata.json` with slide index
4. Add `slide-01.html`, `slide-02.html`, etc. for each slide
5. Repeat for other languages (e.g., `presentations-id/`)
6. Build → **Automatically discovered and added to the site!**

**That's it!** No need to:
- ❌ Update `presentations.ts` registry (doesn't exist anymore!)
- ❌ Create individual `.astro` files
- ❌ Manually register presentations anywhere

The system automatically:
- ✅ Discovers your presentation from the filesystem
- ✅ Generates routes for all languages
- ✅ Adds it to the presentations index page
- ✅ Links it to related blog posts

## Migration

To convert old inline presentations to this structure:
```bash
node scripts/migrate-presentations.js
```

This script:
- Reads old `.astro` files with inline content
- Extracts metadata and slide content
- Creates the directory structure
- Saves each slide as a separate HTML file

## Benefits

✅ **Easy to Read**: Each slide is a separate file you can open and read directly
✅ **Easy to Edit**: Modify one slide without touching others
✅ **Better Version Control**: Git diffs show exactly which slides changed
✅ **Single Route**: One dynamic route file handles all presentations
✅ **Automatic Discovery**: New presentations are automatically found and added
✅ **No Manual Registry**: No need to update `presentations.ts` (it's gone!)
✅ **Type-Safe**: TypeScript utilities ensure correct data structure
✅ **Language Support**: Same structure works for all languages
✅ **Zero Configuration**: Just create files, everything else is automatic

## URL Structure

Presentations are accessible at:
- English: `/en/presentations/{slug}`
- Indonesian: `/id/presentations/{slug}`

Examples:
- `/en/presentations/fundamental-theorem-calculus`
- `/id/presentations/gradient-descent-linear-regression`
