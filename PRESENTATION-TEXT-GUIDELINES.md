# Presentation Text Size Guidelines

## Overview
This document defines the standard text sizing for all presentation slides to ensure consistency and readability across the QuiverLearn platform.

## Text Size Standards

### HTML Tag and Tailwind Class Combinations (Responsive)

| Element Type | HTML Tag | Tailwind Class (Mobile → Desktop) | Usage |
|-------------|----------|-----------------------------------|-------|
| Main Slide Title | `<h4>` | `text-2xl md:text-3xl lg:text-3xl` | Primary heading for each slide |
| Section Headings | `<h5>` | `text-2xl md:text-3xl lg:text-4xl` | Subsection titles (Hardware, Software, etc.) |
| Body Paragraphs | `<p>` | `text-lg md:text-xl lg:text-2xl` | All main content text |
| List Items | `<ul>` | `text-base md:text-lg lg:text-xl` | Bullet lists (inherits to `<li>` children) |
| Inline Text | `<span>` | `text-base md:text-lg lg:text-xl` | Checkmarks, inline emphasis |

**Breakpoints:**
- Default (mobile): < 768px
- `md:` (tablet): ≥ 768px
- `lg:` (desktop): ≥ 1024px

**Important:** Mobile sizes are kept large (or equal to desktop) because mobile screens are smaller and need larger text for readability.

## Examples

### Main Title
```html
<h4 class="text-2xl md:text-3xl lg:text-3xl font-bold mb-4 text-center">From 0 and 1 to Everything</h4>
```

### Section Heading
```html
<h5 class="font-bold text-2xl md:text-3xl lg:text-4xl mb-2">The Hardware 💾</h5>
```

### Body Text
```html
<p class="text-lg md:text-xl lg:text-2xl">Transistors: billions of tiny switches</p>
<p class="text-lg md:text-xl lg:text-2xl mt-2">ON = 1, OFF = 0</p>
```

### List Items
```html
<ul class="list-disc ml-6 space-y-2 text-base md:text-lg lg:text-xl">
  <li>Text: "Hello, World!"</li>
  <li>Numbers: 1, 2, 3, 1234, 1 million</li>
  <li>Images: colorful photos</li>
  <li>Sound: music, voices</li>
  <li>Video: movies, animations</li>
</ul>
```

### Inline Elements
```html
<span class="text-green-500 text-base md:text-lg lg:text-xl">✓</span>
<span class="text-base md:text-lg lg:text-xl">Binary (0,1) matches transistor states</span>
```

## Important Notes

### Why Different HTML Tags Matter

Even with the same Tailwind class, different HTML tags render slightly differently:
- `<h2>`, `<h3>`, `<h4>`, `<h5>` have browser default styles (font-weight, line-height, letter-spacing)
- `<p>` and `<span>` are more neutral elements
- Using consistent HTML tags ensures predictable rendering

### Tailwind Classes Override

Tailwind CSS classes **override** browser defaults:
- `text-sm` = 14px (0.875rem)
- `text-base` = 16px (1rem)
- `text-lg` = 18px (1.125rem)
- `text-xl` = 20px (1.25rem)
- `text-2xl` = 24px (1.5rem)
- `text-3xl` = 30px (1.875rem)

So `<h5 class="text-xl md:text-2xl lg:text-3xl">` will be:
- **20px on mobile** (< 768px)
- **24px on tablet** (≥ 768px)
- **30px on desktop** (≥ 1024px)

### List Items Inheritance

List items (`<li>`) don't need individual classes. Apply `text-2xl` to the parent `<ul>` or `<ol>` tag:
- ✅ Good: `<ul class="list-disc text-2xl"><li>Item</li></ul>`
- ❌ Avoid: `<ul class="list-disc"><li class="text-2xl">Item</li></ul>`

The `text-2xl` class on the `<ul>` will automatically apply to all child `<li>` elements, keeping code clean and maintainable.

## Spacing Guidelines (Extreme Compact Mode)

To maximize content density while maintaining readability, especially for mobile landscape:

### Container Spacing
- **Main container**: `space-y-1.5` (6px) for normal slides
- **For slides with 10+ `<p>` tags**: `space-y-1` (4px) or `space-y-0.5` (2px)
- **Between subsections**: `space-y-0.5` (2px)

### Padding (Adaptive Based on Slide Density)
- **Normal slides (< 10 `<p>` tags)**:
  - Outer boxes: `p-2.5` or `p-3` (10-12px)
  - Inner boxes: `p-1.5` or `p-2` (6-8px)
- **High-density slides (15+ `<p>` tags or 6+ components)**:
  - Outer boxes: `p-1` (4px) or `p-0.5` (2px)
  - Inner boxes: `p-0.5` (2px)
  - Grid items: `p-1` (4px)

### Margins
- **After headings (h5)**: `mb-0` (no margin)
- **After paragraphs**: `mb-0` (no margin)
- **Before sections**: `mt-0` or `mt-0.5` (0-2px)

### Gaps (for grids)
- **Normal slides**: `gap-1.5` or `gap-2` (6-8px)
- **High-density slides**: `gap-1` (4px) or `gap-0.5` (2px)

### Line Height
- **Always use**: `leading-tight` (line-height: 1.25) for maximum density
- **Avoid**: `leading-snug` or default line-height on dense slides

## Critical Optimization: Use `<br>` Instead of Multiple `<p>` Tags

**Why**: Each `<p>` tag gets its own line-height box. With `text-2xl` + `leading-tight`, each `<p>` = 30px height.

**❌ BAD - Wastes 50px+ per section:**
```html
<div class="space-y-0">
  <p>Line 1</p>  <!-- 30px height -->
  <p>Line 2</p>  <!-- 30px height -->
  <p>Line 3</p>  <!-- 30px height -->
  <p>Line 4</p>  <!-- 30px height -->
  <p>Line 5</p>  <!-- 30px height -->
</div>
<!-- Total: 5 × 30px = 150px -->
```

**✅ GOOD - Saves ~50px:**
```html
<p class="text-2xl leading-tight">
Line 1<br>
Line 2<br>
Line 3<br>
Line 4<br>
Line 5
</p>
<!-- Total: ~100px (5 lines in single paragraph) -->
```

### Mobile Landscape Threshold Analysis

**Mobile landscape viewport**: ~640×360px
**Available height after header**: ~300-350px

**Calculate slide height before building:**
```
Total Space = (Sections × Padding) + (P_tags × 30px) + Margins + Gaps

Example (Finale slide):
= (8 sections × 4px) + (20 <p> tags × 30px) + 20px margins + 10px gaps
= 32px + 600px + 20px + 10px
= 662px ❌ TOO BIG!

After optimization (using <br>):
= (8 sections × 2px) + (8 <p> tags × 30px) + 0px margins + 2px gaps
= 16px + 240px + 0px + 2px
= 258px ✅ FITS!
```

**If total exceeds 350px:**
1. Replace multiple `<p>` tags with single `<p>` + `<br>`
2. Reduce all padding to `p-0.5` (2px)
3. Use `gap-0.5` (2px) for grids
4. Set `space-y-0.5` (2px) for containers
5. Eliminate all margins (`mb-0`, `mt-0`)

### Example Pattern (High-Density Slide)
```html
<div class="space-y-0.5">
  <div class="bg-white p-0.5 rounded-lg">
    <h5 class="text-3xl font-bold mb-0">Heading</h5>
    <div class="bg-gray-50 p-0.5 rounded">
      <p class="text-2xl mb-0">Subheading:</p>
      <p class="font-mono text-2xl leading-tight">
        23 ÷ 2 = 11 remainder 1<br>
        11 ÷ 2 = 5 remainder 1<br>
        5 ÷ 2 = 2 remainder 1<br>
        2 ÷ 2 = 1 remainder 0<br>
        1 ÷ 2 = 0 remainder 1
      </p>
    </div>
  </div>
</div>
```

## Implementation Checklist

When creating or updating presentation slides:

- [ ] Replace all main titles with `<h4 class="text-sm">`
- [ ] Replace all section headings with `<h5 class="text-3xl">`
- [ ] Update all `<p>` tags to `text-2xl`
- [ ] Update all `<ul>` tags to include `text-2xl`
- [ ] Update all `<span>` tags to `text-xl`
- [ ] Remove any `text-base`, `text-lg`, or other inconsistent sizes
- [ ] Test on dev server after changes
- [ ] Clear browser cache to see updates

## Files Affected

- `src/pages/en/presentations/how-computers-represent-information.astro`
- `src/pages/id/presentations/how-computers-represent-information.astro`
- Any future presentation files

## Component Files

The slide titles are rendered in the component, not in content:
- `src/components/RevealPresentation.astro` - Contains `<h4>{slide.title}</h4>` on line 105

## Last Updated
2025-10-27 (Updated with extreme compact spacing, `<br>` optimization, and mobile landscape threshold analysis)
