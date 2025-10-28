# Presentation Routing Architecture

## How Astro Routes Work

### Routing Priority in Astro

Astro follows this routing priority (highest to lowest):

1. **Static routes** - Exact file paths like `src/pages/en/presentations/how-computers-represent-information.astro`
2. **Dynamic routes** - Pattern-based paths like `src/pages/[lang]/presentations/[...slug].astro`

**When both exist, static routes ALWAYS win.**

## Current Setup

### 1. Dynamic Route (Fallback - JSON-based)
**File:** `src/pages/[lang]/presentations/[...slug].astro`

**How it works:**
```javascript
// Scans for JSON files
const enPresentations = import.meta.glob('/src/content/presentations-en/*.json');
const idPresentations = import.meta.glob('/src/content/presentations-id/*.json');

// Generates routes dynamically
// If it finds "ftc.json" → creates /en/presentations/ftc
```

**Current Status:**
- ✅ Still exists in codebase
- ⚠️ No JSON files to generate from (moved to backup)
- ✅ Will automatically work if new JSON files are added

### 2. Static Routes (Primary - Astro-based)
**Files:**
```
src/pages/en/presentations/
├── fundamental-theorem-calculus.astro
└── how-computers-represent-information.astro

src/pages/id/presentations/
└── how-computers-represent-information.astro
```

**How it works:**
```astro
// Each file is a self-contained presentation
// Directly renders the presentation with embedded slide data
```

**Current Status:**
- ✅ Active and working
- ✅ Takes precedence over dynamic route
- ✅ Rendered during build

## What Happens When a User Visits

### Scenario 1: `/en/presentations/how-computers-represent-information`

```
1. Astro checks: Does `src/pages/en/presentations/how-computers-represent-information.astro` exist?
   → YES ✓

2. Serves the static route (Astro file)

3. Dynamic route is NEVER checked
```

### Scenario 2: `/en/presentations/some-new-presentation`

```
1. Astro checks: Does `src/pages/en/presentations/some-new-presentation.astro` exist?
   → NO ✗

2. Astro checks dynamic routes: Does `[lang]/presentations/[...slug].astro` match?
   → YES ✓

3. Checks if JSON exists: Does `presentations-en/some-new-presentation.json` exist?
   → If YES: Serves from JSON
   → If NO: 404 error
```

## Build Warnings Explained

During build, you saw:
```
[WARN] Could not render `/en/presentations/fundamental-theorem-calculus`
from route `/[lang]/presentations/[...slug]` as it conflicts with
higher priority route `/en/presentations/fundamental-theorem-calculus`.
```

**This is EXPECTED and GOOD:**
- Astro tried to generate the route from the dynamic file
- It found a static route with the same path
- It skipped the dynamic route in favor of the static one
- This prevents duplicate routes

## Migration Strategy

### Completed ✅
1. Created static Astro files for all presentations
2. Moved JSON files to backup (`backups/pre-revealjs-migration/json-presentations/`)
3. Both routing methods coexist peacefully

### Benefits
- ✅ **Flexibility**: Can use either JSON or Astro files
- ✅ **Easy maintenance**: Slide content is now in version-controlled `.astro` files
- ✅ **Type safety**: Can use TypeScript in Astro components
- ✅ **Better DX**: Syntax highlighting and autocompletion for slide content
- ✅ **Backward compatible**: Dynamic route still works if you add JSON files back

### To Add New Presentations

**Option A: Static Astro File (Recommended)**
```bash
# Create new file
src/pages/en/presentations/my-new-topic.astro

# Copy structure from existing presentation
# Add your slides directly in the file
```

**Option B: Dynamic JSON File (Legacy)**
```bash
# Create new file
src/content/presentations-en/my-new-topic.json

# Dynamic route will automatically pick it up
```

## Directory Structure

```
src/
├── pages/
│   ├── [lang]/
│   │   └── presentations/
│   │       ├── [...slug].astro          # Dynamic route (JSON fallback)
│   │       └── index.astro              # Presentations list page
│   ├── en/
│   │   └── presentations/
│   │       ├── fundamental-theorem-calculus.astro          # Static route
│   │       └── how-computers-represent-information.astro   # Static route
│   └── id/
│       └── presentations/
│           └── how-computers-represent-information.astro   # Static route
│
├── content/
│   ├── presentations-en/                # Empty (JSON moved to backup)
│   └── presentations-id/                # Empty (JSON moved to backup)
│
└── components/
    ├── RevealPresentation.astro         # Main presentation component
    └── PresentationHeader.astro         # Header component

backups/
└── pre-revealjs-migration/
    └── json-presentations/              # Old JSON files (backup)
        ├── fundamental-theorem-calculus.json
        ├── how-computers-represent-information.json (en)
        └── how-computers-represent-information.json (id)
```

## Key Takeaways

1. **Static and dynamic routes DON'T "see" each other** - they're independent
2. **Static always wins** when paths conflict
3. **Dynamic route** scans `src/content/presentations-*/` for JSON files
4. **Static route** is a standalone `.astro` file with embedded data
5. **Both can coexist** - use whichever is most appropriate for each presentation

## Testing

All presentations are now accessible at:
- `/en/presentations/fundamental-theorem-calculus` (static Astro)
- `/en/presentations/how-computers-represent-information` (static Astro)
- `/id/presentations/how-computers-represent-information` (static Astro)

The dynamic route `[...slug].astro` remains as a fallback for any future JSON-based presentations.
