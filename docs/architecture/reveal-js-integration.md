# Reveal.js Integration Architecture

**Document Version**: 1.0
**Last Updated**: November 1, 2025
**Status**: Active

---

## Table of Contents

1. [Decision Context](#decision-context)
2. [Architecture Overview](#architecture-overview)
3. [Integration Points](#integration-points)
4. [Component Responsibilities](#component-responsibilities)
5. [Data Flow](#data-flow)
6. [Customization Guide](#customization-guide)
7. [Trade-offs & Limitations](#trade-offs--limitations)
8. [Future Considerations](#future-considerations)
9. [Migration Guide](#migration-guide)

---

## Decision Context

### Problem Statement

QuiverLearn needed a robust presentation system that could:
- Display educational content in slide format
- Support mobile and desktop devices
- Provide keyboard and touch navigation
- Allow deep linking to specific slides
- Track user progress through presentations
- Support mathematical formulas (KaTeX)
- Maintain consistent styling across presentations

### Alternatives Considered

| Solution | Pros | Cons | Decision |
|----------|------|------|----------|
| **Custom Implementation** | Full control, no dependencies | High development cost, reinventing wheel, maintenance burden | ❌ Rejected |
| **Reveal.js** | Battle-tested, rich features, active community | External dependency, some constraints | ✅ **Selected** |
| **Impress.js** | CSS3 animations, lightweight | Less feature-rich, smaller community | ❌ Rejected |
| **Spectacle** | React-based, modern | React dependency, overkill for static site | ❌ Rejected |
| **Remark** | Markdown-based, simple | Limited customization, basic features | ❌ Rejected |

### Why Reveal.js?

**Key Factors:**

1. **Feature Completeness**
   - Keyboard navigation (arrows, Home, End)
   - Touch gestures for mobile
   - URL hash navigation for deep linking
   - Progress indicators
   - Speaker notes support
   - PDF export capability

2. **Proven Track Record**
   - 67k+ GitHub stars
   - Used by major conferences and companies
   - Active development since 2011
   - Extensive documentation

3. **Mobile Optimization**
   - Touch gesture support out of the box
   - Responsive layouts
   - Optimized for various screen sizes

4. **Extensibility**
   - Plugin system for custom functionality
   - Configurable via JavaScript
   - Can be integrated with any framework

5. **Integration with Astro**
   - Works well with Astro's island architecture
   - Can be initialized client-side
   - No conflicts with Astro's build process

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Astro Page: [lang]/presentations/[...slug].astro      │
│  - Loads presentation data from file system            │
│  - Passes data to layout and components                │
└────────────────┬────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────┐
│  RevealLayout.astro (113 lines)                         │
│  - HTML boilerplate and meta tags                       │
│  - KaTeX CSS/JS dependencies                            │
│  - Reveal.js CSS imports                                │
│  - Mobile viewport optimization                         │
└────────────────┬────────────────────────────────────────┘
                 │
                 ├─────────────────────────────────────────┐
                 │                                         │
                 ▼                                         ▼
┌────────────────────────────────┐  ┌──────────────────────────────┐
│  PresentationHeader.astro      │  │  RevealPresentation.astro    │
│  - Navigation menu              │  │  - Renders slides from data  │
│  - Share functionality          │  │  - Configures Reveal.js      │
│  - Language switcher            │  │  - Passes config to client   │
└────────────────────────────────┘  └───────────┬──────────────────┘
                                                 │
                                                 ▼
                                    ┌────────────────────────────────┐
                                    │  reveal-init.ts (Client-side)  │
                                    │  - Initializes Reveal.js       │
                                    │  - Progress tracking           │
                                    │  - KaTeX rendering             │
                                    │  - Event listeners             │
                                    └───────────┬────────────────────┘
                                                │
                                                ▼
                                    ┌────────────────────────────────┐
                                    │  Reveal.js Library (External)  │
                                    │  - Slide navigation            │
                                    │  - Keyboard/touch controls     │
                                    │  - Hash navigation             │
                                    └────────────────────────────────┘
```

### Separation of Concerns

| Layer | Responsibility | Files |
|-------|----------------|-------|
| **Data Layer** | Load presentation content | `loadPresentation.ts` |
| **Layout Layer** | HTML structure, dependencies | `RevealLayout.astro` |
| **Component Layer** | UI components, rendering | `PresentationHeader.astro`, `RevealPresentation.astro` |
| **Client Layer** | Browser interactions, Reveal.js init | `reveal-init.ts` |
| **Library Layer** | Presentation engine | Reveal.js (external) |

---

## Integration Points

### 1. RevealLayout.astro

**File**: `src/layouts/RevealLayout.astro` (113 lines)

**Purpose**: Provides HTML structure and loads dependencies

**Key Responsibilities**:
- Load Reveal.js CSS
- Load KaTeX for math rendering
- Set up mobile viewport
- Define page metadata (SEO, Open Graph)
- Provide slots for header and content

**Code Structure**:
```astro
---
interface Props {
  title: string;
  description: string;
  // ... other props
}
---

<!DOCTYPE html>
<html lang={lang}>
<head>
  <!-- Meta tags -->
  <BaseHead title={title} description={description} />

  <!-- KaTeX CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" />

  <!-- Reveal.js CSS -->
  <link rel="stylesheet" href="/reveal.js/dist/reveal.css" />
  <link rel="stylesheet" href="/reveal.js/dist/theme/white.css" />
</head>
<body>
  <!-- Header slot -->
  <slot name="header" />

  <!-- Presentation content -->
  <slot />

  <!-- KaTeX JS -->
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
</body>
</html>
```

**Dependencies Loaded**:
- Reveal.js core CSS (`/reveal.js/dist/reveal.css`)
- Reveal.js theme (`/reveal.js/dist/theme/white.css`)
- KaTeX CSS and JS for math rendering

---

### 2. RevealPresentation.astro

**File**: `src/components/RevealPresentation.astro` (134 lines)

**Purpose**: Renders slides and configures Reveal.js

**Key Responsibilities**:
- Map presentation data to Reveal.js HTML structure
- Configure Reveal.js options (transitions, controls, etc.)
- Pass configuration to client-side script
- Support different display modes (fullscreen, instagram)

**Interface**:
```typescript
interface Slide {
  title: string;
  time: string;
  content: string;
  notes?: string;
  fragments?: boolean;
  transition?: string;
  background?: string;
}

interface RevealConfig {
  controls?: boolean;
  progress?: boolean;
  slideNumber?: boolean | string;
  hash?: boolean;
  // ... other Reveal.js options
}

interface Props {
  slides: Slide[];
  title: string;
  config?: RevealConfig;
  displayMode?: 'fullscreen' | 'instagram';
}
```

**Slide Rendering**:
```astro
<div class="reveal">
  <div class="slides">
    {slides.map((slide, index) => (
      <section
        data-timing={slide.time}
        data-slide-index={index}
        data-transition={slide.transition}
        data-background={slide.background}
      >
        <h4>{slide.title}</h4>
        <div class="slide-content" set:html={slide.content}></div>
        {slide.notes && (
          <aside class="notes">{slide.notes}</aside>
        )}
      </section>
    ))}
  </div>
</div>
```

**Configuration Passing**:
```astro
<script define:vars={{ config, slug }}>
  window.revealConfig = config;
  window.presentationSlug = slug;
</script>
```

---

### 3. reveal-init.ts

**File**: `src/scripts/reveal-init.ts` (152 lines)

**Purpose**: Initialize Reveal.js and handle client-side interactions

**Key Responsibilities**:
- Initialize Reveal.js with configuration
- Load and restore progress from localStorage
- Render math with KaTeX on slide changes
- Listen to Reveal.js events
- Expose Reveal instance to window for debugging

**Initialization Flow**:
```typescript
// 1. Import Reveal.js
import Reveal from 'reveal.js';

// 2. Get configuration from page
const config = window.revealConfig || {};
const slug = window.presentationSlug;

// 3. Load saved progress
const progress = loadProgress(slug);

// 4. Initialize Reveal.js
const deck = new Reveal({
  ...config,
  // Default options
  hash: true,
  controls: true,
  progress: true,
  slideNumber: true,
  // Mobile optimizations
  viewDistance: 3,
  mobileViewDistance: 2,
});

await deck.initialize();

// 5. Restore progress
if (progress && progress.currentSlide > 0 && !progress.completed) {
  deck.slide(progress.currentSlide);
}

// 6. Set up event listeners
deck.on('slidechanged', (event) => {
  renderKaTeX(event.currentSlide);
  saveProgress(slug, event.indexh, deck.getTotalSlides());
});

// 7. Expose for debugging
window.Reveal = deck;
```

**Progress Tracking**:
```typescript
interface Progress {
  currentSlide: number;
  totalSlides: number;
  lastVisited: string;
  completed: boolean;
}

function saveProgress(slug: string, slideIndex: number, totalSlides: number) {
  const data = localStorage.getItem('presentationProgress');
  const allProgress = data ? JSON.parse(data) : {};

  allProgress[slug] = {
    currentSlide: slideIndex,
    totalSlides: totalSlides,
    lastVisited: new Date().toISOString(),
    completed: slideIndex >= totalSlides - 1,
  };

  localStorage.setItem('presentationProgress', JSON.stringify(allProgress));
}
```

---

## Component Responsibilities

### Responsibility Matrix

| Component | Reveal.js Integration | Custom Logic | Styling |
|-----------|----------------------|--------------|---------|
| **RevealLayout** | Load CSS/JS | Mobile viewport setup | Layout structure |
| **RevealPresentation** | Render HTML structure | Map data to slides | Display modes |
| **reveal-init.ts** | Initialize library | Progress tracking, KaTeX | None |
| **PresentationHeader** | None | Navigation, sharing | Header styles |

### Clear Boundaries

```
┌─────────────────────────────────────┐
│  Custom Components                  │
│  (PresentationHeader, navigation)   │
│  - No knowledge of Reveal.js        │
│  - Independent functionality        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Integration Layer                  │
│  (RevealPresentation, reveal-init)  │
│  - Knows about Reveal.js            │
│  - Handles data mapping             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Reveal.js Library                  │
│  - Core presentation engine         │
│  - No knowledge of our app          │
└─────────────────────────────────────┘
```

**Key Principle**: Only 2 files directly interact with Reveal.js:
1. `RevealPresentation.astro` - HTML structure
2. `reveal-init.ts` - JavaScript initialization

All other components are Reveal.js-agnostic.

---

## Data Flow

### From File to Screen

```
1. Page Load
   ↓
2. loadPresentation(slug, lang)
   └─→ Read metadata.json
   └─→ Parse presentation data
   ↓
3. RevealLayout receives data
   └─→ Sets up HTML structure
   └─→ Loads dependencies
   ↓
4. RevealPresentation receives slides
   └─→ Maps to Reveal.js HTML
   └─→ Passes config to client
   ↓
5. reveal-init.ts executes
   └─→ Initializes Reveal.js
   └─→ Restores progress
   └─→ Sets up event listeners
   ↓
6. User Interaction
   └─→ Keyboard/Touch → Reveal.js
   └─→ Reveal.js → slidechanged event
   └─→ reveal-init.ts → Save progress
   └─→ reveal-init.ts → Render math
```

### State Management

| State | Storage | Owner |
|-------|---------|-------|
| **Current slide index** | Reveal.js internal | Reveal.js |
| **Slide history** | Browser history (hash) | Reveal.js |
| **Progress** | localStorage | reveal-init.ts |
| **Configuration** | Window object | RevealPresentation |

---

## Customization Guide

### Adding Custom Reveal.js Options

**Option 1: Per-presentation configuration**

```astro
<!-- In page file -->
---
const customConfig = {
  transition: 'fade',
  transitionSpeed: 'slow',
  backgroundTransition: 'zoom',
  autoSlide: 5000,
};
---

<RevealPresentation
  slides={slides}
  config={customConfig}
/>
```

**Option 2: Global defaults**

Edit `src/scripts/reveal-init.ts`:
```typescript
const deck = new Reveal({
  ...config,
  // Add your global defaults here
  autoSlide: 0,
  loop: false,
  rtl: false,
  navigationMode: 'default',
  shuffle: false,
});
```

### Adding Reveal.js Plugins

1. Install plugin via npm:
```bash
npm install reveal.js-plugin-name
```

2. Import in `reveal-init.ts`:
```typescript
import SomePlugin from 'reveal.js-plugin-name';

const deck = new Reveal({
  plugins: [SomePlugin],
  // Plugin-specific config
  somePluginOption: true,
});
```

3. Use plugin features in slides

### Custom Slide Transitions

**Option 1: Per-slide transition**

In `metadata.json`:
```json
{
  "slides": [
    {
      "title": "Introduction",
      "transition": "zoom",
      "content": "..."
    }
  ]
}
```

**Option 2: Custom CSS transitions**

Add to `RevealLayout.astro`:
```css
.reveal .slides section[data-transition="custom"] {
  /* Custom transition styles */
}
```

### Customizing Theme

**Option 1**: Use built-in Reveal.js themes

Edit `RevealLayout.astro`:
```astro
<link rel="stylesheet" href="/reveal.js/dist/theme/black.css" />
<!-- Options: black, white, league, beige, sky, night, serif, simple, solarized -->
```

**Option 2**: Create custom theme

1. Create `public/reveal.js/dist/theme/custom.css`
2. Load in `RevealLayout.astro`:
```astro
<link rel="stylesheet" href="/reveal.js/dist/theme/custom.css" />
```

---

## Trade-offs & Limitations

### What We Gain ✅

1. **Rich Feature Set**
   - Keyboard navigation
   - Touch gestures
   - Deep linking
   - Progress tracking
   - Speaker notes
   - PDF export

2. **Reduced Development Time**
   - No need to implement navigation logic
   - No need to handle mobile gestures
   - No need to manage slide state

3. **Battle-Tested**
   - Used by thousands of presentations
   - Edge cases already handled
   - Regular security updates

4. **Community Support**
   - Extensive documentation
   - Active GitHub community
   - Plugins and extensions available

### What We Sacrifice ❌

1. **External Dependency**
   - Must keep Reveal.js updated
   - Breaking changes in major versions
   - Bundle size increase (~500KB)

2. **Some Constraints**
   - Must follow Reveal.js HTML structure
   - Limited control over internal behavior
   - Some CSS specificity conflicts possible

3. **Learning Curve**
   - Developers need to learn Reveal.js API
   - Configuration options can be overwhelming
   - Plugin system adds complexity

4. **Customization Limits**
   - Core behavior not easily modified
   - Must work within Reveal.js patterns
   - Some features require plugins

### Mitigation Strategies

**For Dependency Risk**:
- Pin Reveal.js version in package.json
- Test thoroughly before upgrading
- Keep integration layer thin (only 2 files)

**For Constraints**:
- Document workarounds for common issues
- Keep custom code separate from Reveal.js
- Use configuration over modification

**For Customization Needs**:
- Use plugins for extensions
- Leverage Reveal.js events for custom behavior
- Create abstraction only when truly needed

---

## Future Considerations

### When to Abstract Reveal.js

**Consider abstraction if:**
1. Need to support multiple presentation engines
2. Reveal.js no longer meets requirements
3. Custom presentation features not possible with Reveal.js
4. Performance issues with Reveal.js

**Abstraction Approach**:

```typescript
// Define interface
export interface PresentationEngine {
  initialize(config: PresentationConfig): Promise<void>;
  navigateToSlide(index: number): void;
  getCurrentSlide(): number;
  onSlideChange(callback: (index: number) => void): void;
  destroy(): void;
}

// Implement for Reveal.js
export class RevealJsEngine implements PresentationEngine {
  private deck: Reveal;

  async initialize(config: PresentationConfig): Promise<void> {
    this.deck = new Reveal({
      // Map PresentationConfig to Reveal.js config
    });
    await this.deck.initialize();
  }

  // ... implement other methods
}

// Implement for alternative
export class CustomEngine implements PresentationEngine {
  // Custom implementation
}
```

### Migration Path

If we ever need to move away from Reveal.js:

1. **Assessment Phase**
   - Identify all Reveal.js dependencies
   - List required features
   - Evaluate alternatives

2. **Abstraction Phase**
   - Create `PresentationEngine` interface
   - Implement `RevealJsEngine` adapter
   - Update integration layer to use interface

3. **Implementation Phase**
   - Implement new engine
   - Test side-by-side with Reveal.js
   - Gradual migration

4. **Cleanup Phase**
   - Remove Reveal.js dependency
   - Clean up unused code
   - Update documentation

**Estimated Effort**: 1-2 weeks for complete migration

---

## Best Practices

### DO ✅

1. **Keep integration layer thin**
   - Only touch Reveal.js in 2 files
   - Keep business logic separate

2. **Use Reveal.js events**
   - Hook into slidechanged, fragmentshown, etc.
   - Don't override Reveal.js internals

3. **Configure, don't modify**
   - Use Reveal.js configuration options
   - Avoid patching Reveal.js code

4. **Test after upgrades**
   - Run E2E tests after Reveal.js updates
   - Check for breaking changes in changelog

### DON'T ❌

1. **Don't modify Reveal.js source**
   - Makes upgrades difficult
   - Creates maintenance burden

2. **Don't tightly couple**
   - Keep custom components Reveal.js-agnostic
   - Avoid Reveal.js APIs outside integration layer

3. **Don't over-configure**
   - Stick to defaults when possible
   - Only configure what's necessary

4. **Don't ignore updates**
   - Keep Reveal.js reasonably up-to-date
   - Security patches are important

---

## Troubleshooting

### Common Issues

**Issue**: Reveal.js not initializing
```
Solution:
1. Check browser console for errors
2. Verify Reveal.js scripts are loaded
3. Check reveal-init.ts is executing
4. Ensure window.revealConfig exists
```

**Issue**: Slides not rendering
```
Solution:
1. Verify HTML structure matches Reveal.js requirements
2. Check slides data is passed correctly
3. Inspect .reveal .slides in DevTools
4. Ensure CSS is loaded
```

**Issue**: Progress not saving
```
Solution:
1. Check localStorage is enabled
2. Verify presentation slug is set
3. Check browser console for errors
4. Clear localStorage and try again
```

**Issue**: Math not rendering
```
Solution:
1. Verify KaTeX is loaded
2. Check renderKaTeX is called on slide change
3. Ensure math delimiters are correct
4. Check browser console for KaTeX errors
```

---

## References

- [Reveal.js Official Documentation](https://revealjs.com/)
- [Reveal.js GitHub Repository](https://github.com/hakimel/reveal.js)
- [Reveal.js API Reference](https://revealjs.com/api/)
- [Reveal.js Plugin Development](https://revealjs.com/plugins/)

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-11-01 | Initial documentation | Architecture Review |

---

**Next Review Date**: 2026-05-01 (6 months)

**Maintainer**: Development Team

**Status**: ✅ Active and Current
