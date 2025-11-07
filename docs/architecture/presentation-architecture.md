# Presentation Architecture

## Overview

The presentation system follows a **Domain-Driven Design (DDD)** architecture with clear separation between domain models, infrastructure, and application services. This architecture provides testability, flexibility, and maintainability.

## Architecture Layers

### 1. Domain Layer (`src/domain/presentation/`)

Contains the core business logic and domain models.

#### **Presentation Domain Model** (`Presentation.ts`)

Rich domain model that encapsulates presentation behavior and validation.

**Key Features:**
- Validates presentation data (title, description, difficulty, etc.)
- Provides behavior methods (`isPublished()`, `hasTag()`, `sharesTagsWith()`)
- Encapsulates business rules
- Type-safe difficulty levels

**Example Usage:**
```typescript
const presentation = new Presentation(slug, metadata, slideData);

if (presentation.isPublished() && presentation.hasTag('javascript')) {
  console.log(`${presentation.getTitle()} is live!`);
}
```

#### **Slide Domain Model** (`Slide.ts`)

Represents individual slides with validation and behavior.

**Key Features:**
- Validates slide data (title, content, time)
- Parses time formats (`MM:SS` or `HH:MM:SS`)
- Detects content type (math, code)
- Calculates word count

**Example Usage:**
```typescript
const slide = new Slide(slideData, slideNumber);

if (slide.hasMath()) {
  console.log('This slide contains mathematical formulas');
}

console.log(`Estimated time: ${slide.getEstimatedTimeInMinutes()} minutes`);
```

#### **PresentationRepository Interface** (`PresentationRepository.ts`)

Defines the contract for data access. Abstracts the data source (filesystem, database, API, etc.).

**Methods:**
- `findBySlug(slug, language)` - Get a presentation by slug
- `findAll(language)` - Get all presentations for a language
- `findByRelatedBlogPost(blogPostSlug, language)` - Find related presentations
- `getSlugs(language)` - Get all presentation slugs

### 2. Infrastructure Layer (`src/infrastructure/presentation/`)

Implements data access and external integrations.

#### **FileSystemPresentationRepository** (`FileSystemPresentationRepository.ts`)

Concrete implementation that loads presentations from the filesystem.

**Key Features:**
- Reads JSON metadata and HTML slides from `src/content/presentations-{lang}/{slug}/`
- Built-in caching to avoid repeated filesystem reads
- Converts raw data to domain models
- Handles multi-language support

**Example Usage:**
```typescript
import { getDefaultPresentationRepository } from '@infrastructure/presentation/FileSystemPresentationRepository';

const repository = getDefaultPresentationRepository();
const presentation = await repository.findBySlug('intro-to-javascript', 'en');
```

**Caching:**
The repository uses an internal cache to improve performance:
- Presentation data is cached after first load
- Cache is maintained in memory during build
- Use `clearCache()` for testing or development

### 3. Service Layer (`src/services/presentation/`)

Orchestrates business logic and provides view models for presentation.

#### **PresentationService** (`PresentationService.ts`)

Application service that handles complex operations and data transformations.

**Key Features:**
- Converts domain models to view models (for serialization)
- Provides filtering and searching capabilities
- Handles related presentations
- Supports featured presentations

**Methods:**
- `getPresentationsForLanguage(language)` - Get all presentations as view models
- `getPresentationBySlug(slug, language)` - Get presentation detail view model
- `getRelatedPresentations(blogPostSlug, language)` - Find related presentations
- `getFeaturedPresentations(language, limit)` - Get featured presentations
- `getPresentationsByTag(tag, language)` - Filter by tag
- `getPresentationsByDifficulty(difficulty, language)` - Filter by difficulty
- `getSimilarPresentations(slug, language, limit)` - Find similar presentations

**Example Usage:**
```typescript
import { getDefaultPresentationService } from '@services/presentation/PresentationService';

const service = getDefaultPresentationService();

// Get all presentations for English
const presentations = await service.getPresentationsForLanguage('en');

// Get featured presentations
const featured = await service.getFeaturedPresentations('en', 3);

// Find similar presentations
const similar = await service.getSimilarPresentations('intro-to-js', 'en', 5);
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                       Astro Pages                           │
│              (index.astro, [...slug].astro)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                  PresentationService                        │
│           (Business logic & orchestration)                  │
│  • getPresentationsForLanguage()                            │
│  • getPresentationBySlug()                                  │
│  • getRelatedPresentations()                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Uses
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              PresentationRepository                         │
│              (Data access interface)                        │
│  • findBySlug()                                             │
│  • findAll()                                                │
│  • findByRelatedBlogPost()                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Implemented by
                     ▼
┌─────────────────────────────────────────────────────────────┐
│        FileSystemPresentationRepository                     │
│           (Filesystem implementation)                       │
│  • Reads from src/content/presentations-{lang}/             │
│  • Caches results                                           │
│  • Returns domain models                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ Creates
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Domain Models                                  │
│  • Presentation (rich model with behavior)                  │
│  • Slide (validated slide data)                             │
└─────────────────────────────────────────────────────────────┘
```

## Benefits of This Architecture

### 1. **Testability**
- Domain models can be tested in isolation
- Repository can be mocked for service tests
- Service layer can be tested with mock repository

### 2. **Flexibility**
- Easy to switch data sources (filesystem → database)
- Just implement a new repository (e.g., `DatabasePresentationRepository`)
- No changes needed in domain or service layers

### 3. **Maintainability**
- Clear separation of concerns
- Business logic in domain models, not in pages
- Infrastructure details isolated from business logic

### 4. **Type Safety**
- Strong typing throughout the system
- Domain models enforce validation rules
- View models ensure correct data serialization

### 5. **Performance**
- Built-in caching in repository layer
- Efficient data loading strategies
- Minimal filesystem reads

## File Structure

```
src/
├── domain/
│   └── presentation/
│       ├── Presentation.ts           # Presentation domain model
│       ├── Slide.ts                  # Slide domain model
│       └── PresentationRepository.ts # Repository interface
│
├── infrastructure/
│   └── presentation/
│       └── FileSystemPresentationRepository.ts # Filesystem implementation
│
├── services/
│   └── presentation/
│       └── PresentationService.ts    # Application service
│
└── pages/
    └── [lang]/
        └── presentations/
            ├── index.astro           # Presentations list page
            └── [...slug].astro       # Presentation detail page
```

## Usage in Astro Pages

### Presentation List Page

```astro
---
import { getDefaultPresentationService } from '@services/presentation/PresentationService';

const service = getDefaultPresentationService();
const presentations = await service.getPresentationsForLanguage('en');
---

<div>
  {presentations.map(p => (
    <a href={`/en/presentations/${p.id}`}>
      <h2>{p.title}</h2>
      <p>{p.description}</p>
    </a>
  ))}
</div>
```

### Presentation Detail Page

```astro
---
import { getDefaultPresentationService } from '@services/presentation/PresentationService';

const { slug } = Astro.params;
const service = getDefaultPresentationService();
const presentation = await service.getPresentationBySlug(slug, 'en');
---

<div>
  <h1>{presentation.title}</h1>
  {presentation.slides.map(slide => (
    <section>
      <h2>{slide.title}</h2>
      <div set:html={slide.content} />
    </section>
  ))}
</div>
```

## Testing

### Domain Model Tests

```typescript
import { Presentation } from '@domain/presentation/Presentation';

describe('Presentation', () => {
  it('should validate required fields', () => {
    expect(() => new Presentation('test', { title: '' }, [])).toThrow();
  });

  it('should check if presentation is published', () => {
    const p = new Presentation('test', { pubDate: '2020-01-01' }, []);
    expect(p.isPublished()).toBe(true);
  });
});
```

### Service Tests

```typescript
import { PresentationService } from '@services/presentation/PresentationService';

describe('PresentationService', () => {
  it('should filter presentations by tag', async () => {
    const service = new PresentationService(mockRepository);
    const results = await service.getPresentationsByTag('javascript', 'en');
    expect(results).toHaveLength(2);
  });
});
```

## Migration from Old System

The old system used direct filesystem reads in pages:

```typescript
// OLD WAY (before Phase 5)
import { loadPresentation, getAllPresentations } from '@utils/loadPresentation';

const { metadata, slides } = loadPresentation(slug, lang);
const presentations = getAllPresentations();
```

The new system uses repository pattern and domain models:

```typescript
// NEW WAY (after Phase 5)
import { getDefaultPresentationService } from '@services/presentation/PresentationService';

const service = getDefaultPresentationService();
const presentation = await service.getPresentationBySlug(slug, lang);
const presentations = await service.getPresentationsForLanguage(lang);
```

**Benefits:**
- No direct filesystem access in pages
- Testable without accessing filesystem
- Easy to add caching, validation, or business logic
- Type-safe with domain models

## Future Enhancements

Potential improvements to consider:

1. **Database Backend**
   - Implement `DatabasePresentationRepository`
   - No changes needed in service or domain layers

2. **Search Functionality**
   - Add `searchPresentations(query, language)` to service
   - Use existing repository methods

3. **Analytics**
   - Add view tracking in service layer
   - Track popular presentations

4. **Multi-tenancy**
   - Add organization/tenant support to domain models
   - Filter by tenant in repository

5. **Advanced Caching**
   - Implement Redis-based caching
   - Replace in-memory cache in repository

## Conclusion

The new presentation architecture provides a solid foundation for maintaining and extending the presentation system. By following DDD principles and separating concerns, the codebase is more testable, flexible, and maintainable.

For questions or improvements, see:
- `/docs/architecture/phase-5-migration-completed.md` - Migration details
- `/tests/unit/domain/Presentation.test.ts` - Domain model tests
- `/tests/unit/services/PresentationService.test.ts` - Service tests
