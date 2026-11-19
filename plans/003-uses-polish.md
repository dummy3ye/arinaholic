# Setup Page Polish Guide

**Target:** the `/setup` page of the sagittarius portfolio site.
**Goal:** keep the concept and personality, but make the page calm, legible, and comfortable to look at. Fix collisions, contrast, spacing, and rough edges. No redesign from scratch.

---

## 0. Read this first

### Rules of engagement
- **Inspect before editing.** Find out how the page is built (plain HTML + SVG, D3, React, Svelte, Astro, etc.) and where the diagram data and layout code live. Work within the existing stack. Do not add new dependencies unless a step says so.
- **Do not change the concept.** The page is a "source to silicon" pipeline diagram (source → toolchain → ir → backend → machine) plus a "kernel loop" diagram plus a six-block text grid. Keep all three.
- **Do not rewrite copy**, except for the explicit copy fixes in section 7.
- **Work in small commits**, one per section below, so changes are easy to review and revert.
- **After each section, look at the result** in the browser at 1440px, 1024px, 768px and 390px widths. Do not trust the code alone.
- **Everything colour-related goes through CSS variables** (section 1). No new hard-coded hex values in components.

### Current visual language (keep it)
Warm cream background, near-black ink, a single saturated blue (through LLVM), black (own native compiler), muted sage green (runtime or interpreter), and a red accent (debug loop). Lowercase, geometric sans-serif. Thin hairline frames around diagrams.

---

## 1. Design tokens

Create or update tokens in one place (`:root` in the global stylesheet). Replace scattered colours with these. Values are starting points, tune by eye but keep contrast ratios.

```css
:root {
  /* surfaces */
  --bg:          #f7f4ec;   /* page */
  --bg-raised:   #faf8f2;   /* diagram frames, pills */
  --line:        #e3ddcf;   /* hairlines, frames */
  --line-strong: #cfc8b6;

  /* text */
  --ink:         #15151d;   /* headings, node labels */
  --ink-body:    #3a3a45;   /* body copy (>= 9:1 on --bg) */
  --ink-muted:   #5f5f6b;   /* captions, hints (>= 5:1 on --bg) */

  /* diagram semantics */
  --llvm:        #3a5bc7;   /* through llvm */
  --native:      #15151d;   /* own native compiler */
  --runtime:     #6f8f63;   /* runtime or interpreter (darker than the old sage) */
  --runtime-soft:#b9cbae;   /* fills for runtime nodes */
  --debug:       #c23b52;   /* debug loop */

  /* type scale */
  --fs-label:  12px;   /* diagram labels, column headers */
  --fs-small:  13px;   /* captions, legend */
  --fs-body:   16px;   /* body copy */
  --fs-lede:   clamp(18px, 1.6vw, 22px);
  --fs-h2:     clamp(26px, 2.6vw, 34px);
  --fs-h1:     clamp(64px, 12vw, 160px);

  /* spacing (8px rhythm) */
  --s-1: 8px;  --s-2: 16px;  --s-3: 24px;
  --s-4: 32px; --s-5: 48px;  --s-6: 72px;  --s-7: 112px;

  /* layout */
  --page-pad: clamp(20px, 4vw, 64px);
  --content-max: 1200px;
  --radius: 10px;
}
```

**Dark mode (optional, only if the site already supports it):** redefine the same variables under `@media (prefers-color-scheme: dark)`. Do not hard-code colours anywhere else.

**Why these changes:** the old sage green and the light-gray body text were the two biggest "tired eyes" problems. The new `--runtime` is darker for strokes and text, and `--runtime-soft` is used only for large fills.

---

## 2. Page layout and global typography

### 2.1 Align the nav and content
The logo currently sits at about 60px from the left while the content column starts at about 165px. Make this one system:
- Put nav and content in the same container: `max-width: var(--content-max); margin-inline: auto; padding-inline: var(--page-pad);`
- Logo left edge = content left edge. The nav links can sit next to the logo as they do now.
- Bump the logo and nav links up slightly (nav links ~16px, logo ~24px) so they balance against the huge "setup." heading.
- Keep the red underline on the active page link.

### 2.2 Tighten the hero
- Reduce the space between the subtitle and the first diagram from ~100px+ to `var(--s-5)` (48px). Remove the faint horizontal divider above the diagram frame, or keep it only if the frame has no top border.
- Subtitle ("from source to silicon. hover anything.") uses `--fs-lede` and `--ink-muted`.
- `h1` uses `--fs-h1`, `letter-spacing: -0.03em`, `line-height: 0.95`.

### 2.3 Vertical rhythm between sections
Use consistent gaps:
- Hero to diagram 1: `--s-5`
- Diagram 1 controls/legend to "kernel loop" heading: `--s-6`
- "kernel loop" block to the text grid: `--s-6`
- Heading to its description: `--s-1`
- Description to its frame: `--s-3`

### 2.4 Body text defaults
```css
body {
  background: var(--bg);
  color: var(--ink-body);
  font-size: var(--fs-body);
  line-height: 1.6;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3 { color: var(--ink); }
```

---

## 3. Main diagram (source → silicon)

This is where most of the work is. Treat it as a layout problem first, a styling problem second.

### 3.1 Frame and canvas
- Frame: `background: var(--bg-raised); border: 1px solid var(--line); border-radius: var(--radius);`
- **Remove the dead space at the bottom.** There is about 100px of empty frame under "sh / fish". Reduce the SVG `viewBox` height (or the computed height) so the bottom padding equals the top padding.
- Add **right padding** inside the frame (at least 100px of SVG space beyond the machine column) so labels like "archlinux" and "bare metal" are never clipped or hugging the frame edge.
- Make the SVG responsive: `width: 100%; height: auto;` with a fixed `viewBox`. No fixed pixel sizes.

### 3.2 Column headers (source, toolchain, ir, backend, machine)
- Font size `var(--fs-label)`, `letter-spacing: 0.08em`, `text-transform: lowercase` (keep lowercase), colour `--ink-muted`, weight 500.
- Add ~16px more space between the header text and the horizontal rule, and ~24px between the rule and the first row of nodes.
- Rule colour `--line-strong`.

### 3.3 Row spacing (vertical rhythm)
Rows are currently uneven: compiled languages are airy, interpreted ones are cramped (vite, bun, next.js nearly touch; typescript and javascript are tight).
- Define a single row pitch constant, e.g. `ROW_GAP = 72`, and compute each node's y from its row index instead of hand-placed values.
- Group rows with a slightly larger gap between groups:
  - Group A (compiled): c, c++, rust, go
  - Group B (interpreted): python, typescript, javascript, shell
  - Group gap = `ROW_GAP * 1.4`
- Toolchain nodes for the interpreted group (cpython, vite, bun, next.js, sh / fish) must have **at least 56px** between node centres. If they cannot fit, increase the overall height. The diagram is allowed to be taller.
- Node radii: keep the size encoding but set a **minimum radius of 8px** so no node looks like a speck.

### 3.4 Node label placement (be consistent)
Pick one rule per column and apply it everywhere:
- **source column:** label to the **left** of the node, right-aligned (`text-anchor: end`).
- **toolchain / ir / backend columns:** label **below** the node, centred, 10 to 12px gap from the node edge.
- **machine column:** label to the **right**, left-aligned, with the right padding from 3.1.

Label style:
```css
.node-label {
  font-size: var(--fs-label);
  fill: var(--ink);
  font-weight: 500;
  paint-order: stroke;
  stroke: var(--bg-raised);
  stroke-width: 4px;
  stroke-linejoin: round;
}
```
The halo (`paint-order: stroke`) keeps text readable when a line passes behind it.

### 3.5 Fix the label collisions
**Edge labels** (`make · cmake`, `make · ninja`, `cargo`, `gdb · lldb`):
1. **Hidden by default.** Show an edge label only when its path or either endpoint node is hovered, focused, or selected via a language pill.
2. When shown, place the label at the path midpoint, **offset perpendicular to the path by 10 to 14px**, and apply the halo style above.
3. If more than one label would be visible at once (for example, "gdb · lldb" repeated across several debug paths), **render a single label** at the first path's midpoint instead of one per path.
4. For the `make · cmake` / `make · ninja` pair in the c/c++ rows, put one label above its path and the other below, so they never overlap the particles or each other.

**Particles (the small dots moving along paths):**
- Keep them, but make them smaller (r ≈ 2 to 2.5px), evenly spaced, and slow (about 6 to 10s per full traverse).
- Particles should never draw above labels. Render order: paths, particles, nodes, labels (labels last).
- Remove the **stray red dot** near win11 / bare metal. Every red particle must travel on a red debug path with a short fading trail. If it cannot be tied to a path, delete it.

### 3.6 Make the colours read as intentional
- **Runtime or interpreter nodes (python, typescript, javascript, shell, cpython, vite, bun, next.js, sh / fish):** fill `--runtime-soft`, stroke `--runtime` at 1.5px, opacity 1. They currently look disabled. They should look calm, not broken.
- Runtime **paths**: stroke `--runtime`, `stroke-dasharray: 2 5`, `stroke-linecap: round`, opacity 0.55. Dotted is fine, but it must be visible.
- LLVM paths: `--llvm` at ~0.35 opacity at rest. Native paths: `--ink` at ~0.3 opacity at rest.
- Nodes: no drop shadows. Flat fills only.

### 3.7 Tame the debug loop (red)
The red dashed line cuts across the entire diagram and crosses the interpreted nodes, making the chart noisy.
- **At rest:** debug paths are `--debug` at opacity **0.18**, thin (1px).
- **On hover or focus of a language, debug node, or the legend item:** raise to opacity 0.9 and 1.5px, and dim everything else to 0.2.
- Optional but recommended: add a small **"show debug loop" toggle** (a pill, same style as the language pills) in the controls row. Default off.
- Route debug curves so they leave the source column from the right side of the node and do not pass through other nodes' label boxes. If a curve must cross a label, the halo handles it.

### 3.8 Hover, focus, and selection states
Implement three states for every node and path group: **rest**, **active** (hovered, focused, or in the selected language's chain), **dimmed** (everything else when something is active).
- Active: opacity 1, stroke width +0.5px, label weight 600.
- Dimmed: opacity 0.2, transition `opacity 160ms ease`.
- Keep the highlight to the full chain: language → toolchain → ir (if applicable) → backend → machine.
- **Keyboard and touch:**
  - Each node gets `tabindex="0"`, `role="button"`, and an `aria-label` such as "rust, compiled through rustc and llvm".
  - `:focus-visible` outline: `2px solid var(--llvm); outline-offset: 3px`.
  - Tap a node to select (same as hover). Tap on empty space to clear.
  - Escape clears the selection.
- Respect reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  .particle { display: none; }
  * { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

### 3.9 Tooltips (if hover currently shows details)
- Small card: `background: var(--bg-raised); border: 1px solid var(--line-strong); border-radius: 8px; padding: 8px 12px; font-size: var(--fs-small); color: var(--ink);`
- Never let it clip at the frame edge. Flip the side when near the edge.

---

## 4. Controls and legend

### 4.1 Language pills
Current pills are very pale with faint borders and no obvious active state.
```css
.pill {
  font-size: var(--fs-small);
  padding: 8px 16px;           /* >= 40px tall touch target */
  min-height: 40px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  background: var(--bg-raised);
  color: var(--ink-body);
  transition: background 140ms, color 140ms, border-color 140ms;
}
.pill:hover { border-color: var(--ink); color: var(--ink); }
.pill:focus-visible { outline: 2px solid var(--llvm); outline-offset: 2px; }
.pill[aria-pressed="true"] {
  background: var(--ink);
  color: var(--bg);
  border-color: var(--ink);
}
```
- Pills are real `<button>` elements with `aria-pressed`.
- Clicking an active pill again clears the selection.
- Gap between pills: 8px. Allow wrapping on small screens.

### 4.2 Hint text
- Merge the hint into the controls row, to the right of the pills (or below on narrow screens): `hover a node, or pick a language.` in `--ink-muted`, `--fs-small`.
- On touch devices swap the copy to `tap a node, or pick a language.` (detect with `@media (hover: none)` or a small JS check).

### 4.3 Legend
- One compact row directly under the pills, with 24px gaps between items, vertically centred.
- Use **identical 10px markers** for all four items:
  - through llvm: filled `--llvm` circle
  - own native compiler: filled `--native` circle
  - runtime or interpreter: filled `--runtime-soft` circle with `--runtime` ring (not a faint dotted line)
  - debug loop: `--debug` short dashed line, 2px, clearly visible
- Text: `--fs-small`, `--ink-body`.
- Make legend items interactive: hovering one highlights matching nodes and paths and dims the rest. Same behaviour as language hover. Make them focusable buttons.

---

## 5. Kernel loop section

Currently this uses a different visual language (a wavy path) and has a lot of empty padding.

- Use the **same frame, tokens, node label rules, and hover states** as the main diagram so the two feel like one system. Keeping the wavy path is fine, but use the same stroke colours and node sizes.
- **Reduce the frame height** so vertical padding matches the main diagram's (about 48 to 56px above and below the path).
- **Labels:** alternate above/below as now, but apply the halo style and a consistent 12px gap from nodes. Nothing should touch the path.
- **Fix the loop-back arc ("v2, v3 ..."):**
  - Put the label at the **apex** of the arc, centred, with the halo, in `--debug`, `--fs-label`.
  - Add a small arrowhead at the end of the arc (at "mailing list") so direction is clear.
  - At rest opacity 0.5, full opacity on hover of the arc, "patch", or "mailing list".
- **Remove the two tiny dots next to "patch"** unless they are particles on the path. If they are particles, start them on the path with the same size and speed as the main diagram's particles.
- **Hint text:** there are no language pills for this chart. Change `hover a node, or pick a language.` to `hover a node.` (`tap a node.` on touch).
- Node colours: patch to mailing list are ink (your own tools and process), linux-next, mainline, stable are blue (shipped). Add a one-line legend below if the meaning is not obvious.
- Optional: add a one-line description in the tooltip for each step (for example, "b4: apply and manage patch series from lists").
- Mobile: let the frame scroll horizontally with `overflow-x: auto` and a min-width of ~720px on the SVG, plus a subtle fade at the right edge to hint at scroll.

---

## 6. Bottom text grid (languages, compilers and build, debug and kernel, runtimes, systems, hardware)

### 6.1 Layout
```css
.setup-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: var(--s-5);
  row-gap: var(--s-5);
}
@media (max-width: 900px) { .setup-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 600px) { .setup-grid { grid-template-columns: 1fr; row-gap: var(--s-4); } }
```
- All six blocks use the same markup and the same classes, so heading sizes, body sizes and offsets are identical. The "hardware" block is currently smaller. Fix that.
- Heading: `--fs-h2` scaled down (about 22 to 26px here), `--ink`, margin-bottom 8px.
- Body: `--fs-body` (16px), `--ink-body`, `line-height: 1.65`, `max-width: 38ch`.
- Row gap should be noticeably tighter than now. The gap between rows is large compared to the heading-to-body gap. Target `--s-5` between rows, `8px` between heading and body.
- Make sure the right column's text starts on the same grid line as the others.

### 6.2 Link wrapping
"and a few more on github" currently wraps with a broken underline across two lines.
- Wrap the link text in a single inline element with `white-space: nowrap`, or reword so the link sits on one line, for example: `c, c++, rust, go, typescript, javascript, python, shell, plus a few more [on github].`
- Link style: `color: var(--ink); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px;` and on hover `text-decoration-color: var(--llvm)`.

---

## 7. Copy fixes (the only content changes allowed)

1. **`TODO(user): laptop or desktop, cpu, gpu, boards`** in the hardware block must not ship. Ask the owner for the real values. If they are not available, hide the hardware block entirely, or replace with a neutral placeholder the owner approves. **Do not invent specs.**
2. Hint text changes in sections 4.2 and 5.
3. Nothing else. If you spot typos, list them in your final report instead of changing them.

---

## 8. Responsive behaviour

- **>= 1024px:** layout as described.
- **600 to 1023px:** diagram scales down via `viewBox`. If node labels render below **10px effective size**, switch to the scroll approach below.
- **< 600px:** the main diagram cannot stay readable as a full-width SVG.
  - Give the SVG a `min-width: 760px` inside a wrapper with `overflow-x: auto; -webkit-overflow-scrolling: touch;` and show a small hint "swipe to explore".
  - Language pills become a horizontally scrollable row (no wrapping), with `scroll-snap-type: x proximity`.
  - Tapping a language pill highlights its chain and auto-scrolls the diagram so the source node is in view.
  - Page gutters: `--page-pad` (20px).
  - `h1` clamps down so "setup." never overflows.
- Test at 390px, 768px, 1024px, 1440px and 1920px. No horizontal page scroll (only inside the diagram wrapper).

---

## 9. Accessibility checklist

- [ ] All body and caption text meets WCAG AA contrast (4.5:1) against `--bg` and `--bg-raised`.
- [ ] Diagram label text is at least 12px at the default viewBox scale.
- [ ] Every interactive element is reachable and operable by keyboard, with a visible `:focus-visible` ring.
- [ ] Pills use `aria-pressed`; the diagram has a `<title>` and `<desc>` summarising it; nodes have `aria-label`.
- [ ] Colour is never the only signal: runtime paths are dotted, debug paths are dashed, native nodes are black. Keep these distinctions.
- [ ] `prefers-reduced-motion` disables particle animation.
- [ ] Touch targets are at least 40px.
- [ ] Add a visually hidden text summary of the pipeline for screen readers (a short list of "language → toolchain → backend → machine" lines).

---

## 10. Performance and polish

- Limit simultaneous animated particles (cap around 60 total). Pause animation when the diagram is off-screen (`IntersectionObserver`) or the tab is hidden.
- Use `will-change: opacity` only on hover-transitioned groups, not globally.
- Avoid layout thrash: compute node positions once, not per frame.
- Fonts: preload the main font, `font-display: swap`, ensure a sane fallback stack.
- Set `<meta name="theme-color">` to `--bg`.

---

## 11. Acceptance criteria (verify visually before finishing)

1. No two text labels overlap in any default or hover state, at 1440px and 1024px.
2. No label touches or is clipped by the frame edge.
3. The red debug loop is subtle at rest and clear on interaction. No stray red dots.
4. Interpreted/runtime nodes look intentional (visible fills and strokes), not disabled.
5. Row spacing in the main diagram is visibly even, with a clear gap between the compiled and interpreted groups.
6. Bottom padding of both diagram frames equals their top padding.
7. Nav logo and content share the same left edge.
8. Pills show clear hover, focus, and active states; legend markers are consistent in size.
9. All six text blocks have identical type styles; the "link" in the languages block is not split across lines.
10. The `TODO(user)` text is gone from the rendered page.
11. Body and caption text is darker than before and at least 16px (body) / 13px (captions).
12. Page works with keyboard only and on a 390px-wide screen.
13. Lighthouse accessibility score >= 95.

---

## 12. Suggested order of work

1. Tokens and global type (sections 1, 2)
2. Main diagram layout: spacing, frame, padding, label placement (3.1 to 3.4)
3. Collisions and particles (3.5)
4. Colours and debug loop (3.6, 3.7)
5. States and accessibility (3.8, 3.9, 4)
6. Kernel loop (5)
7. Text grid and copy (6, 7)
8. Responsive pass (8)
9. Final accessibility, performance and acceptance check (9, 10, 11)

## 13. Final report

When finished, reply with:
- A short summary of what changed per section.
- Before and after screenshots at 1440px and 390px.
- Any copy typos or content questions you noticed but did not change.
- Anything you could not do, and why.
