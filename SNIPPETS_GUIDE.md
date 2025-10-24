# Snippet Shortcuts Guide

VS Code snippets have been created to make writing blog posts super fast!

## How to Use Snippets

1. **Open any `.mdx` file** in `src/content/blog/`
2. **Type the shortcut** (listed below)
3. **Press Tab** to expand
4. **Use Tab** to jump between placeholders

## Available Shortcuts

### 🚀 Quick Start

| Shortcut | What It Does |
|----------|--------------|
| `!blogpost` | Full blog post template with imports |
| `!imports` | Just the component imports |
| `!meta` | Meta info line (category, read time, date) |

### 📦 Component Shortcuts

| Shortcut | Component | Color |
|----------|-----------|-------|
| `!def` | DefinitionBox | 🔵 Blue |
| `!example` | ExampleBox | 🟣 Purple |
| `!insight` | InsightBox | 🟠 Orange |
| `!warning` | WarningBox | 🔴 Red |
| `!success` | SuccessBox | 🟢 Green |
| `!callout` | CalloutBox | 🟡 Yellow |
| `!practice` | PracticeProblem | Practice box with hints/solution |
| `!split` | SplitView with 2 panels | Side-by-side comparison |

### 🔧 Utility Shortcuts

| Shortcut | What It Does |
|----------|--------------|
| `!step` | Step with arrow indicator |
| `!math` | Display math block ($$) |
| `!$` | Inline math ($) |
| `!details` | Collapsible details/summary |

## Examples

### Creating a New Post

1. Create file: `src/content/blog/new-post.mdx`
2. Type: `!blogpost` + **Tab**
3. Fill in the placeholders (Title, Description, etc.)
4. Start writing!

### Adding a Definition

Type: `!def` + **Tab**

Expands to:
```mdx
<DefinitionBox title="Title">
Content
</DefinitionBox>
```

### Adding a Practice Problem

Type: `!practice` + **Tab**

Expands to:
```mdx
<PracticeProblem level="Level 1">
Problem statement

<details>
<summary>Click for hint</summary>
Hint here
</details>

<details>
<summary>Click for solution</summary>
Solution here
</details>
</PracticeProblem>
```

### Adding Math

**Display Math:**
- Type: `!math` + **Tab**
- Enter your equation between the `$$` signs

**Inline Math:**
- Type: `!$` + **Tab**
- Enter your equation between the `$` signs

### Creating a Comparison

Type: `!split` + **Tab**

Expands to:
```mdx
<SplitView>
  <SplitPanel side="left" title="Left Title">
    Left content
  </SplitPanel>

  <SplitPanel side="right" title="Right Title">
    Right content
  </SplitPanel>
</SplitView>
```

## Tab Navigation

After expanding a snippet:
- **Tab** = Move to next placeholder
- **Shift + Tab** = Move to previous placeholder
- **Esc** = Exit snippet mode

## Pro Tips

### Workflow for a New Post

1. `!blogpost` - Get full template
2. Fill in frontmatter (title, description, date)
3. Write intro
4. Use `!def`, `!example`, `!insight` as you go
5. Add `!practice` problems at the end
6. Preview with `npm run dev`

### Common Patterns

**Definition → Example:**
```
!def → explain concept
!example → show worked example
```

**Warning → Success:**
```
!warning → common mistake
!success → correct approach
```

**Example → Practice:**
```
!example → show solution
!practice → let reader try
```

### Speed Writing

Instead of typing full components, you can write an entire section in seconds:

```
!def [Tab] → fill in definition
!example [Tab] → add example
!insight [Tab] → add key takeaway
!practice [Tab] → add exercise
```

## Customizing Snippets

To modify snippets:
1. Open `.vscode/quiverlearn.code-snippets`
2. Edit the `body` array for any snippet
3. Save (changes apply immediately)

## All Shortcuts at a Glance

```
!blogpost   - Full post template
!imports    - Component imports
!meta       - Meta info

!def        - Definition box
!example    - Example box
!insight    - Insight box
!warning    - Warning box
!success    - Success box
!callout    - Callout box
!practice   - Practice problem
!split      - Split view

!step       - Step indicator
!math       - Display math
!$          - Inline math
!details    - Collapsible content
```

## Video Demo

**To see snippets in action:**

1. Open `src/content/blog/test.mdx` (create if needed)
2. Type `!blogpost` and press Tab
3. Watch it expand!
4. Press Tab to jump through placeholders
5. Try other shortcuts like `!def`, `!example`, etc.

---

**Now you can write beautiful blog posts 10x faster!** 🚀

Just type the shortcut, press Tab, and keep writing.
