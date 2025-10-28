# QuiverLearn - Interactive Learning Platform

An educational platform featuring blog posts and interactive presentations for computer science and mathematics topics, built with Astro.

## ✨ Features

- 📝 **Bilingual Content** - English and Indonesian support
- 📊 **Interactive Presentations** - Reveal.js-powered mobile-optimized presentations
- 🔄 **Automatic Discovery** - File-based system with zero configuration
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- 📱 **Mobile-First** - Optimized for both landscape and portrait orientations
- 🚀 **Performance** - SEO-friendly with canonical URLs and OpenGraph data
- 📰 **RSS Feed** - Automatic feed generation for blog posts
- 🗺️ **Sitemap** - Automatic sitemap generation

## 🚀 Project Structure

```text
quiverlearn/
├── public/                          # Static assets
├── src/
│   ├── components/                  # Reusable components
│   │   ├── boxes/                  # Content boxes (Definition, Example, etc.)
│   │   ├── PresentationHeader.astro
│   │   └── RevealPresentation.astro
│   ├── content/                     # Content collections
│   │   ├── blog-en/                # English blog posts (MDX)
│   │   ├── blog-id/                # Indonesian blog posts (MDX)
│   │   ├── presentations-en/       # English presentations
│   │   │   └── {slug}/
│   │   │       ├── metadata.json   # Presentation metadata
│   │   │       ├── slide-metadata.json  # Slide index
│   │   │       └── slide-*.html    # Individual slide files
│   │   └── presentations-id/       # Indonesian presentations
│   ├── layouts/                     # Layout components
│   │   ├── BlogPost.astro
│   │   └── RevealLayout.astro
│   ├── pages/                       # Route pages
│   │   └── [lang]/
│   │       ├── blog/
│   │       └── presentations/
│   │           ├── [...slug].astro # Dynamic presentation route
│   │           └── index.astro     # Presentations listing
│   ├── scripts/                     # Client-side scripts
│   │   └── reveal-init.ts          # Reveal.js initialization
│   ├── styles/                      # Global styles
│   │   └── reveal-custom-theme.css
│   └── utils/                       # Utility functions
│       └── loadPresentation.ts     # Presentation loader
├── scripts/
│   └── migrate-presentations.js    # Migration utility
├── PRESENTATION-STRUCTURE.md       # Presentation system docs
├── PRESENTATION-TEXT-GUIDELINES.md # Styling guidelines
└── .claude/
    └── agents/                      # Claude Code agents
        ├── blog-to-presentation-converter.md
        ├── en-to-id-translator.md
        └── html-snippet-converter.md
```

## 🎯 Presentation System

### File-Based Structure
Presentations use a file-based structure where each slide is a separate HTML file:

```text
src/content/presentations-en/{slug}/
├── metadata.json           # Title, description, tags, etc.
├── slide-metadata.json     # Index of all slides
├── slide-01.html          # Individual slide content
├── slide-02.html
└── ...
```

### Key Features
- ✅ **Automatic Discovery** - No manual registry needed
- ✅ **Single Source of Truth** - Content files are the only source
- ✅ **Easy Editing** - Each slide is readable and editable separately
- ✅ **Better Version Control** - Granular diffs per slide
- ✅ **Zero Configuration** - Just create files and they appear

### Adding a New Presentation

1. Create directory: `src/content/presentations-en/{slug}/`
2. Add `metadata.json` with presentation info
3. Add `slide-metadata.json` with slide index
4. Add `slide-01.html`, `slide-02.html`, etc.
5. Build → Automatically discovered! 🎉

See [PRESENTATION-STRUCTURE.md](./PRESENTATION-STRUCTURE.md) for detailed documentation.

## 🧞 Commands

All commands are run from the root of the project:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### Utility Scripts

```bash
# Migrate old presentations to file-based structure
node scripts/migrate-presentations.js
```

## 📚 Content Collections

### Blog Posts
- Location: `src/content/blog-{lang}/`
- Format: MDX with frontmatter
- Components: DefinitionBox, ExampleBox, InsightBox, WarningBox, etc.

### Presentations
- Location: `src/content/presentations-{lang}/{slug}/`
- Format: HTML files + JSON metadata
- Framework: Reveal.js
- Optimization: Mobile-first, Instagram-ready (1080x1080)

## 🤖 Claude Code Agents

### blog-to-presentation-converter
Converts blog posts to interactive presentations automatically:
- Extracts key concepts and examples
- Creates mobile-optimized slides
- Follows styling guidelines
- **No manual registry updates needed** - automatically discovered!

### en-to-id-translator
Translates English content to Indonesian:
- Preserves technical terminology
- Maintains file structure
- Handles MDX components

### html-snippet-converter
Converts markdown notes to MDX blog format using project snippets.

## 🌐 URLs

Presentations are accessible at:
- English: `/en/presentations/{slug}`
- Indonesian: `/id/presentations/{slug}`

Blog posts are accessible at:
- English: `/en/blog/{slug}`
- Indonesian: `/id/blog/{slug}`

## 🛠️ Technologies

- **Framework**: [Astro](https://astro.build)
- **Styling**: [Tailwind CSS](https://tailwindcss.com)
- **Presentations**: [Reveal.js](https://revealjs.com)
- **Math Rendering**: KaTeX
- **Languages**: TypeScript, MDX

## 📖 Documentation

- [PRESENTATION-STRUCTURE.md](./PRESENTATION-STRUCTURE.md) - Presentation system architecture
- [PRESENTATION-TEXT-GUIDELINES.md](./PRESENTATION-TEXT-GUIDELINES.md) - Text sizing and spacing standards

## 🔄 Recent Changes

### File-Based Presentation System (Latest)
- Migrated from inline content to file-based structure
- Implemented automatic discovery system
- Removed manual `presentations.ts` registry
- Each slide is now a separate, readable HTML file
- Zero configuration - presentations automatically discovered

## 👀 Want to learn more?

Check out [Astro documentation](https://docs.astro.build) or the [Reveal.js documentation](https://revealjs.com).

## 📝 License

This project is built with Astro's blog template and enhanced with custom features for educational content delivery.
