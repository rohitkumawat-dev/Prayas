"""Theory + module quizzes: Advanced CSS & Animation."""

LESSONS = {
"CSS Grid Advanced Patterns": """# CSS Grid Advanced Patterns

## Grid in one sentence
CSS Grid is a **two-dimensional** layout system: you define rows and columns, then place items into the cells they create.

## Defining tracks
```css
.layout {
  display: grid;
  grid-template-columns: 240px 1fr 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 1rem;
}
```
The `fr` unit distributes free space; `minmax(min, max)` sets flexible limits; `repeat()` avoids repetition.

## Responsive without media queries
```css
.cards {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
}
```
`auto-fit` creates as many columns as fit; each is at least 240px and shares leftover space.

## Named areas
```css
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
.page > header { grid-area: header; }
.page > aside  { grid-area: sidebar; }
```
Named areas make layouts readable and easy to rearrange at breakpoints.

## Placement and spanning
`grid-column: 1 / 3;` or `grid-column: span 2;` lets an item cover multiple tracks. Negative lines count from the end (`-1` is the last line).

## Subgrid
`grid-template-columns: subgrid;` lets a nested grid share its parent's tracks, keeping card contents aligned across cards.

## Alignment
`justify-items`, `align-items`, `place-items: center;` align items inside cells; `justify-content`/`align-content` align the whole grid in its container.

> **Key takeaway:** define the structure on the container, and let items flow or span; `auto-fit` with `minmax` gives responsive grids with no breakpoints.""",

"Flexbox vs Grid Decision Guide": """# Flexbox vs Grid Decision Guide

## The core difference
- **Flexbox** is **one-dimensional**: it lays items out along a single axis (a row or a column).
- **Grid** is **two-dimensional**: it controls rows and columns together.

## Content-out vs layout-in
Flexbox is **content-first**: item sizes influence the layout. Grid is **layout-first**: you define the structure and place content into it.

## Use Flexbox for
- Navigation bars and toolbars.
- Centring one thing or aligning icon + label.
- Distributing space between a group of items (`justify-content: space-between`).
- Components that wrap naturally (`flex-wrap`).

## Use Grid for
- Overall page layouts (header, sidebar, content, footer).
- Card galleries where rows and columns must align.
- Dashboards with items spanning several cells.
- Overlapping elements.

## Side by side
| Need | Better choice |
|---|---|
| Row of buttons | Flexbox |
| Page skeleton | Grid |
| Centre a single element | Either (`place-items: center` on grid) |
| Equal-height cards in aligned rows | Grid |
| Unknown number of tags wrapping | Flexbox |

## Combine them
```css
.page { display: grid; grid-template-columns: 240px 1fr; }
.toolbar { display: flex; gap: .5rem; align-items: center; }
```
Grid for the macro layout, Flexbox for micro layouts inside each area.

## Rule of thumb
If you are thinking about only a row or a column, use Flexbox. If you are thinking about both, use Grid.

> **Key takeaway:** they are complementary, not competitors: Grid for structure, Flexbox for alignment inside components.""",

"Responsive Design Strategies": """# Responsive Design Strategies

## The foundation
Responsive design makes one codebase adapt to any screen. It needs the viewport meta tag:
```html
<meta name="viewport" content="width=device-width, initial-scale=1">
```

## Mobile-first
Write base styles for small screens, then add `min-width` media queries for larger ones. This keeps CSS smaller and prioritises content.
```css
.grid { display: grid; gap: 1rem; }
@media (min-width: 768px)  { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 1024px) { .grid { grid-template-columns: repeat(3, 1fr); } }
```
Choose breakpoints where **the content breaks**, not for specific devices.

## Fluid techniques
- Relative units: `%`, `rem`, `vw`.
- **`clamp()`** for fluid type and spacing:
```css
h1 { font-size: clamp(1.75rem, 1rem + 3vw, 3rem); }
```
- `max-width: 100%; height: auto;` for images.

## Responsive images
```html
<img src="hero-800.jpg"
     srcset="hero-400.jpg 400w, hero-800.jpg 800w, hero-1600.jpg 1600w"
     sizes="(min-width: 1024px) 50vw, 100vw" alt="Learners in class" loading="lazy">
```

## Other media features
`prefers-color-scheme`, `prefers-reduced-motion`, `hover: none` (touch devices), `orientation`.

## Testing
Use browser device emulation and real devices; test with zoom and large text.

## Common mistakes
Fixed pixel widths, hiding important content on mobile, tiny tap targets and horizontal scrolling.

> **Key takeaway:** start small, use fluid units and let content decide breakpoints.""",

"CSS Transitions": """# CSS Transitions

## What a transition does
A transition animates a property **smoothly from one value to another** when it changes (for example on hover or focus), instead of jumping instantly.

## Syntax
```css
.button {
  background: #6d28d9;
  transform: translateY(0);
  transition: background-color 200ms ease, transform 200ms ease;
}
.button:hover {
  background: #7c3aed;
  transform: translateY(-2px);
}
```
`transition: <property> <duration> <timing-function> <delay>`

## Timing functions
- `ease` (default), `linear`, `ease-in`, `ease-out`, `ease-in-out`
- `cubic-bezier(x1, y1, x2, y2)` for custom curves
- `steps(n)` for stepwise motion

Use **ease-out** for elements entering (fast start, gentle stop) and **ease-in** for elements leaving.

## What can be transitioned?
Properties with numeric or colour values (opacity, transform, colour, width). `display` cannot be transitioned directly and `height: auto` is problematic; animate `opacity`/`transform`, or use `max-height`, `grid-template-rows` tricks or the newer `@starting-style`.

## Durations
Small UI feedback: **100 to 200ms**. Larger moves: **200 to 400ms**. Over 500ms usually feels slow.

## Accessibility
Respect users who prefer less motion:
```css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0.01ms !important; }
}
```

## Triggers
`:hover`, `:focus-visible`, `:active`, class toggles with JavaScript.

> **Key takeaway:** transitions add polish to state changes; keep them short, purposeful and motion-safe.""",

"Keyframe Animations": """# Keyframe Animations

## When to use keyframes
Transitions go from state A to state B. **Keyframe animations** define multi-step sequences, can run automatically and can loop.

## Defining an animation
```css
@keyframes fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fade-up 400ms ease-out both;
}
```
Percent steps allow more control:
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.08); }
}
```

## Animation properties
| Property | Purpose |
|---|---|
| `animation-name` | Which `@keyframes` |
| `animation-duration` | Length |
| `animation-timing-function` | Easing |
| `animation-delay` | Wait before starting |
| `animation-iteration-count` | `infinite` or a number |
| `animation-direction` | `normal`, `reverse`, `alternate` |
| `animation-fill-mode` | `forwards`, `backwards`, `both` |
| `animation-play-state` | `running` / `paused` |

`animation-fill-mode: both` applies the first frame during the delay and keeps the last frame afterwards.

## Staggering
```css
.item { animation: fade-up 400ms both; animation-delay: calc(var(--i) * 80ms); }
```

## Scroll-driven animations
Modern CSS can tie animation progress to scrolling (`animation-timeline: scroll()` / `view()`), without JavaScript.

## Design cautions
Avoid infinite, attention-grabbing motion near text, keep animations meaningful, and honour `prefers-reduced-motion`.

> **Key takeaway:** use keyframes for sequences and loops; combine with fill-mode and delays for polished entrances.""",

"Performance Optimization": """# Performance Optimization (CSS & Animation)

## How the browser renders
Pipeline: **Style → Layout → Paint → Composite**. Changing a property triggers work from a certain stage onward:
- **Layout** properties (width, height, margin, top, left) are the most expensive: they force the browser to recompute geometry.
- **Paint** properties (colour, box-shadow, background) require repainting.
- **Composite-only** properties (`transform`, `opacity`) can be handled by the GPU without layout or paint.

## Animate the cheap properties
```css
/* Avoid */
.box { transition: left 300ms; }
/* Prefer */
.box { transition: transform 300ms; }
.box:hover { transform: translateX(20px); }
```

## will-change
```css
.modal { will-change: transform, opacity; }
```
Hints that a property will change so the browser can prepare a layer. Use sparingly and remove it when not needed; overuse wastes memory.

## Target 60fps
Each frame has roughly **16.7ms**. Long-running JavaScript or expensive style recalculation causes jank. Use the Chrome **Performance panel** and the **Rendering** tab (paint flashing) to find problems.

## Other CSS performance tips
- Keep selectors simple; avoid deeply nested rules.
- Use `content-visibility: auto` to skip rendering off-screen sections.
- Load fonts with `font-display: swap`.
- Inline critical CSS and defer the rest; remove unused CSS.
- Avoid layout thrashing in JavaScript (batch reads, then writes) or use `requestAnimationFrame`.

## Reduced motion
Always provide reduced-motion alternatives.

> **Key takeaway:** animate `transform` and `opacity`, measure with DevTools and never guess about performance.""",

"CSS Custom Properties": """# CSS Custom Properties

## What they are
Custom properties (CSS variables) store reusable values, are **live in the browser** (unlike preprocessor variables) and **follow the cascade**.

## Syntax
```css
:root {
  --color-primary: #6d28d9;
  --space-3: 1rem;
  --radius: 0.5rem;
}
.button {
  background: var(--color-primary);
  padding: var(--space-3);
  border-radius: var(--radius);
}
```
Provide a fallback: `var(--color-accent, #f59e0b)`.

## Scope and inheritance
Variables defined on an element are available to its descendants and can be overridden locally:
```css
.card.danger { --color-primary: #dc2626; }
```

## Theming
```css
:root { --bg: #ffffff; --text: #0f172a; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #0b1120; --text: #e2e8f0; }
}
[data-theme="dark"] { --bg: #0b1120; --text: #e2e8f0; }
body { background: var(--bg); color: var(--text); }
```

## Changing from JavaScript
```javascript
document.documentElement.style.setProperty("--color-primary", "#0ea5e9");
```
Great for user theme pickers and dynamic values such as mouse position or scroll progress.

## With calc()
```css
.grid { gap: calc(var(--space-3) * 2); }
```

## `@property`
Registers a typed custom property so it can be **animated** and validated: `@property --angle { syntax: "<angle>"; inherits: false; initial-value: 0deg; }`.

> **Key takeaway:** custom properties power design tokens and theming with a single source of truth.""",

"Container Queries": """# Container Queries

## The limitation of media queries
Media queries respond to the **viewport**. But a component (a card) may appear in a narrow sidebar on a wide screen. Container queries let a component respond to the **size of its container** instead, making it truly reusable.

## Defining a container
```css
.card-wrapper {
  container-type: inline-size;
  container-name: card;
}
```
`inline-size` tracks width (the inline dimension).

## Querying it
```css
.card { display: grid; gap: 1rem; }

@container card (min-width: 420px) {
  .card { grid-template-columns: 160px 1fr; }
}
```
Below 420px the card stacks; at 420px and above it becomes two columns, wherever it is placed.

## Container query units
`cqw`, `cqh`, `cqi`, `cqb`: percentages of the container's size, useful for fluid type inside components.
```css
.card h3 { font-size: clamp(1rem, 4cqi, 1.5rem); }
```

## Media vs container queries
| Use | Query |
|---|---|
| Page-level layout (sidebar appears) | Media |
| Component adapting to available space | Container |
| User preference (dark mode, reduced motion) | Media |

## Style queries
`@container style(--variant: compact)` lets components react to custom property values (support is still growing).

## Tips
An element cannot query itself; the query targets an **ancestor container**. Containment can affect layout, so apply `container-type` deliberately.

> **Key takeaway:** design components that adapt to their context, and keep media queries for page-level and user-preference changes.""",

"CSS Nesting and Layers": """# CSS Nesting and Layers

## Native nesting
CSS now supports nesting without a preprocessor:
```css
.card {
  padding: 1rem;
  border: 1px solid var(--border);

  h3 { margin: 0; }
  &:hover { border-color: var(--primary); }
  &.featured { background: var(--surface-2); }

  @media (min-width: 768px) { padding: 2rem; }
}
```
`&` refers to the parent selector. Keep nesting shallow (2 to 3 levels) to avoid high specificity and unreadable code.

## The specificity problem
In large projects, overrides turn into specificity battles and `!important`. **Cascade layers** solve this by letting you control priority explicitly.

## `@layer`
```css
@layer reset, base, components, utilities;

@layer reset      { * { box-sizing: border-box; margin: 0; } }
@layer base       { body { font-family: system-ui; } }
@layer components { .btn { padding: .5rem 1rem; } }
@layer utilities  { .mt-4 { margin-top: 1rem; } }
```
Layers listed **later win**, regardless of selector specificity. A simple utility in a later layer overrides a more specific selector in an earlier one. Unlayered styles beat layered styles.

## Practical uses
- Put third-party CSS in a low-priority layer so your styles always win.
- Organise design-system tiers: tokens, base, components, utilities.

## Other modern features
`:has()` (parent selector), `:is()` and `:where()` (zero specificity), `@scope`, `color-mix()`.

## Browser support
Check current support (caniuse.com) and use progressive enhancement.

> **Key takeaway:** nesting improves readability and layers make cascade order predictable; together they replace many preprocessor tricks and `!important` hacks.""",
}

QUIZZES = {
"Advanced Layouts": [
 ("CSS Grid is best described as...", "One-dimensional", "Two-dimensional", "Only for text", "A JavaScript API", "b"),
 ("What does `repeat(auto-fit, minmax(240px, 1fr))` create?", "A fixed 3-column grid", "As many flexible columns of at least 240px as fit", "A single column", "A flex container", "b"),
 ("Which layout system is generally better for a row of navigation links?", "Flexbox", "Grid areas only", "Tables", "Floats", "a"),
 ("Which is a mobile-first media query style?", "max-width queries only", "min-width queries that add rules for larger screens", "Queries for specific phone models", "No queries at all", "b"),
 ("What does `clamp(1.75rem, 1rem + 3vw, 3rem)` provide?", "Fixed size", "Fluid size with a minimum and maximum", "A colour", "An animation", "b"),
],
"CSS Animations": [
 ("Which properties are cheapest to animate?", "width and height", "transform and opacity", "margin and top", "font-size", "b"),
 ("Which timing function is typically best for elements entering the screen?", "ease-out", "ease-in", "steps(1)", "linear only", "a"),
 ("What does `animation-fill-mode: both` do?", "Loops forever", "Applies first frame during delay and keeps last frame after", "Reverses direction", "Pauses the animation", "b"),
 ("Which media query respects users who prefer less motion?", "prefers-color-scheme", "prefers-reduced-motion", "hover: none", "orientation", "b"),
 ("Roughly how long is each frame at 60fps?", "1ms", "16.7ms", "100ms", "1s", "b"),
],
"Modern CSS": [
 ("How do you read a custom property in CSS?", "$var", "var(--name)", "get(--name)", "@name", "b"),
 ("What do container queries respond to?", "The viewport width only", "The size of an ancestor container", "The user's location", "The device battery", "b"),
 ("Which declaration makes an element a size-query container?", "container-type: inline-size", "display: container", "query: on", "position: container", "a"),
 ("In `@layer reset, base, components, utilities;` which layer has the highest priority?", "reset", "base", "components", "utilities", "d"),
 ("What does `&` mean in native CSS nesting?", "The parent selector", "A comment", "The root element", "An animation", "a"),
],
}
