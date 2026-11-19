# Research Section: Implementation Guide

Instructions for the coding agent. Read the whole document before writing code.

## 0. Goal

Add a `/research` section to arinaholic.me (brand name "sagittarius", shortened to "sage" in the navbar on scroll).

- `/research` is a **gallery page** listing research items as cards in a staggered editorial grid.
- `/research/[slug]` is an **article page** with a three-column layout: sticky table of contents on the left, reading column in the center, metadata panel on the right.
- The navbar becomes: `works · research · kernel · setup · contact`.

The design is **editorial and quiet**: warm cream background, huge lowercase headings, thin 1px lines, small gray text, flat shapes, and no shadows. Everything must feel native to the existing site, not like a pasted-in template.

## 1. Stack and ground rules

- Next.js (app router), React, TypeScript, SCSS, Bun.
- Use `bun` for everything (`bun add`, `bun run dev`). Never use npm or yarn.
- Check the installed Next.js version before writing route code. In Next 15+, `params` in pages is a `Promise` and must be awaited.
- Pages are **server components** by default. Only the interactive parts are client components (`"use client"`): gallery filter/sort/search, TOC scroll-spy.
- Content is **markdown files with frontmatter** in `content/research/`. No CMS and no database.
- Do not add UI libraries (no Tailwind, no component kits, no animation libs). Plain SCSS only.
- Do not change existing pages' appearance. The only edit to existing code is adding the nav link.

## 2. Step zero: learn the existing design system

Before writing any style, **read the existing code** and reuse what is there:

1. Find the SCSS variables, mixins, or CSS custom properties for colors, fonts, spacing, and breakpoints. **Reuse them. Do not hardcode new values** unless nothing suitable exists, and then add them to the existing tokens file.
2. Find the navbar component. Note how the active link is styled (blue outlined rounded box with a thin red underline) and how the logo shortens on scroll.
3. Find the `/works` page and its components. The **list view** in this feature should reuse its row layout (big lowercase title on the left, description on the right).
4. Find the circle decorations (blue, sage, red) and how they are positioned. They will be reused for card covers.
5. Find how markdown plus katex is rendered (if anywhere in this repo) and reuse that approach.

Observed visual language, to be matched via the existing tokens:

| Thing | Value (approximate, use the real tokens) |
|---|---|
| Background | warm cream, about `#f7f4ec` |
| Text | near-black navy, about `#14141f` |
| Secondary text | mid-gray |
| Accents | blue about `#3a5fc4`, sage about `#c3d1b8`, red about `#b8122f` |
| Font | geometric sans (looks like Jost), all lowercase for headings and UI |
| Headings | very large, tight letter-spacing, ending with a period (`work.`, `say hi.`) |
| Links | thin underline, small text |
| Layout | content left-aligned at about 180px from the left on desktop |

## 3. Routes and files

```
content/research/
  example-research-one.md
  example-research-two.md          (create 4 placeholder items total)
lib/research.ts                    (loader + types + helpers)
lib/markdown.ts                    (md → html + toc extraction)
app/research/
  page.tsx                         (server: loads all items → <Gallery />)
  research.module.scss
  Gallery.tsx                      ("use client": filter/sort/search/view toggle)
  [slug]/
    page.tsx                       (server: article page)
    article.module.scss
components/research/
  ResearchCard.tsx
  ResearchCover.tsx                (generated circle covers)
  Toc.tsx                          ("use client": scroll-spy)
  MetaPanel.tsx
```

Adapt folder names to the repo's existing conventions if they differ. Consistency with the repo wins over this layout.

Slugs are **lowercase kebab-case** and derived from the filename (`example-research-one.md` → `/research/example-research-one`). Unknown slugs call `notFound()`.

## 4. Content model

Each item is a markdown file with YAML frontmatter.

```md
---
title: "example research one"
summary: "one or two sentences shown on the card and in meta description."
date: "2026-11-05"
category: "simulation"
tags: ["graphics", "physics"]
status: "published"          # published | draft (drafts are hidden in production)
span: 1                      # 1 or 2: how many grid columns the card takes
offset: 0                    # 0 | 1 | 2 | 3: vertical stagger step
cover:
  bg: "cream"                # cream | blue | sage | red
  shapes: ["blue-large", "red-small"]   # see section 6
links:
  - { label: "github", href: "https://github.com/..." }
  - { label: "pdf", href: "/papers/example.pdf" }
---

## summary
body in markdown...
```

TypeScript type:

```ts
export type ResearchMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string;               // ISO
  category: string;
  tags: string[];
  status: "published" | "draft";
  span: 1 | 2;
  offset: 0 | 1 | 2 | 3;
  cover: { bg: "cream" | "blue" | "sage" | "red"; shapes: string[] };
  links: { label: string; href: string }[];
};
export type ResearchItem = ResearchMeta & { content: string };
```

`lib/research.ts` must export:

- `getAllResearch(): ResearchMeta[]`: reads the directory, parses frontmatter, filters drafts when `NODE_ENV === "production"`, sorts by date descending.
- `getResearch(slug): ResearchItem | null`.
- `getAllSlugs(): string[]`, used for `generateStaticParams`.

Use `gray-matter` for frontmatter (`bun add gray-matter`). Validate required fields and throw a clear error naming the file if any are missing, so build failures are easy to debug.

## 5. Gallery page: `/research`

### 5.1 Header

- Giant lowercase title `research.` using the same component or style as `work.` on `/works`.
- One-line intro underneath in the same style as the works intro, for example: `notes, experiments and write-ups.` (placeholder, which the user will edit).

### 5.2 Control bar

Mirror the archive-page pattern, in the site's own style:

- Top row: a small count on the left, such as `04 papers` (zero-padded, small, gray, monospace or light), with a **1px full-width divider** below it.
- Below the divider, two groups on opposite ends:
  - **Left:** `filter` dropdown, multi-select by category, populated from the data.
  - **Right:** `most recent` sort dropdown (most recent / oldest / a to z), `gallery view` toggle (gallery / list), and a search input with a small magnifier icon on its right.
- All controls: small text, 1px border, slightly rounded corners, transparent fill, tiny chevron on dropdowns. Placeholder text in light gray.
- Implement dropdowns as accessible custom components (button + `aria-expanded` + listbox) or as styled native `<select>`s. Either is fine, but keyboard support is required.
- Search matches against title, summary, category, and tags (case-insensitive).
- Persist state in the URL query string (`?q=&cat=&sort=&view=`) using `useSearchParams` and `router.replace`, so views are shareable. Defaults omit the param.

### 5.3 Gallery view (default): staggered grid

- Container: same max width and left padding as the other pages.
- CSS grid with **4 columns** on desktop, with a consistent `gap`. A generous row gap of about 90 to 110px.
- Each card has `grid-column: span <span>` and `margin-top: calc(var(--offset) * <step>)`, where `<step>` is about 48px. Set `--offset` via an inline style from frontmatter.
- Do **not** use masonry libraries. The stagger comes from the data.
- Empty cells are intentional. Do not try to fill gaps.
- Breakpoints:
  - `≤ 1100px`: 2 columns, `span: 2` cards take the full row, offsets reduced by half.
  - `≤ 640px`: 1 column, no offsets, all spans 1.

### 5.4 List view

Reuses the `/works` row layout: huge lowercase title on the left (with `category · date` beneath it as small gray text), summary and tags on the right. Rows separated by generous vertical space (or a 1px line, matching works). Clicking a row navigates to the article.

### 5.5 Card anatomy (`ResearchCard`)

Top to bottom, with identical spacing across every card:

1. **Meta row**: `category` and `date` in small gray text (`nov 17, 2026`, lowercase), 8 to 12px above the cover.
2. **Cover**: flat, **square corners, no border, no shadow**. Aspect ratio about 4:5 for `span: 1`, and about 21:9 for `span: 2`. Rendered by `ResearchCover` (section 6).
3. **Title**: bold, dark, max two lines, tight leading, lowercase.
4. **Summary**: small, gray, regular weight, max three lines (`-webkit-line-clamp: 3`), narrow measure.

The whole card is one link (`<a>`/`<Link>` wrapping all content, or a stretched pseudo-element link) to `/research/[slug]`. Hover: a subtle title underline and a tiny scale on the cover (`1.01`, 200ms). No other effects. Respect `prefers-reduced-motion`.

### 5.6 Empty state

When filters match nothing, show a quiet line like `nothing matches that.` and a `clear filters` underlined link.

## 6. Generated covers (`ResearchCover`)

There is no artwork yet, so covers are **generated from the site's circles**. Pure CSS or inline SVG, no image files.

- `cover.bg` sets the panel color (cream, blue, sage, or red from the tokens).
- `cover.shapes` is a list of presets. Each is a circle with a fixed color, size, and position inside the panel. Implement a preset map, for example:

```ts
const SHAPES: Record<string, { color: string; r: number; cx: number; cy: number }> = {
  "blue-large": { color: "blue",  r: 46, cx: 78, cy: 22 },
  "blue-small": { color: "blue",  r: 14, cx: 24, cy: 70 },
  "sage-large": { color: "sage",  r: 40, cx: 20, cy: 80 },
  "red-small":  { color: "red",   r: 16, cx: 82, cy: 84 },
  "ink-small":  { color: "ink",   r: 10, cx: 50, cy: 50 },
};
```

Coordinates are percentages of the panel. Use an SVG with `viewBox="0 0 100 100"` and `preserveAspectRatio="xMidYMid slice"` so it fills any aspect ratio.

- Circles may be **cropped by the panel edge** (like the site's page decorations bleeding off screen). Use `overflow: hidden`.
- The component must also accept an optional `image` field later: if `cover.image` exists in frontmatter, render it with `next/image` (`fill`, `object-fit: cover`) instead of the generated art. Build this branch now, but do not require any image.
- Cover is decorative: `aria-hidden="true"`, with the title carrying the meaning.

## 7. Article page: `/research/[slug]`

Use `generateStaticParams` from `getAllSlugs()`. Export `generateMetadata` (title, description from `summary`, OpenGraph basic fields).

### 7.1 Header (centered block at the top)

- Title in the site's huge lowercase heading style, ending with a period if it does not already.
- Optional one-line `summary` below in the intro style.
- A small pill button `download the pdf` **only if** a link labeled `pdf` exists. It is low-contrast (soft gray fill, thin border, fully rounded), reading as a utility. Hide it otherwise.

### 7.2 Three-column layout (desktop ≥ 1100px)

```
| toc (≈220px) | main reading column (≈700px) | meta (≈220px) |
```

- CSS grid with `grid-template-columns: minmax(180px, 220px) minmax(0, 700px) minmax(180px, 220px)`, centered, with `column-gap` of about 64 to 96px.
- All three columns **start on the same top line** (the hero cover's top edge).
- The side columns are narrow and quiet. They must never compete with the center.

### 7.3 Left column: `Toc` (client component)

- Built from the `##` (and optionally `###`) headings of the markdown. See section 8.
- Rows are numbered `01`, `02`, … with the number in small gray text and the label in small dark text. Rows are separated by **1px lines**, including a line above the first row.
- Multi-line labels wrap with a hanging indent so the text aligns.
- `position: sticky; top: <navbar height + 24px>`; `max-height: calc(100vh - top - 24px); overflow: auto`.
- **Scroll-spy** with `IntersectionObserver` (`rootMargin: "-20% 0px -70% 0px"`). The active row's number turns dark (and optionally the label gets a slightly heavier weight). Update `aria-current="true"` on the active link.
- Clicking a row smooth-scrolls to the heading (`scroll-margin-top` on headings so it clears the navbar) and updates the hash. Respect `prefers-reduced-motion` (no smooth scroll).
- Must work with no JS: plain anchor links, with scroll-spy as progressive enhancement.

### 7.4 Center column: hero and body

- **Hero**: the generated cover (or image) at full center-column width, about 16:9, square corners, flat.
- **Authors/credit line** below the hero in small gray italic (`by sage`, from frontmatter `author` if present, defaulting to the site owner). If a footnote is needed, use the same style.
- **Body**:
  - `h2`: bold, noticeably larger than body, but far smaller than the page title. `scroll-margin-top` set.
  - Body text: 17 to 19px, line-height about 1.7, measure around 60 to 75 characters. Try the site sans first. Expose a single SCSS variable `$research-body-font` so switching to a serif is a one-line change, and **leave a short comment** about it. Do not add a serif by default.
  - Lists: bullets with an optional **bold lead-in phrase** (`**what we measure.** text…`), which is just normal markdown strong at the start of an item.
  - Links: thin underline like the rest of the site.
  - Code: inline and block, using a monospace font, subtle cream-darker background, no heavy borders. Block code scrolls horizontally.
  - Blockquote: left 2px line, gray text.
  - Images: `max-width: 100%`, square corners, optional caption in small gray text.
  - Tables: scroll inside their own `overflow-x: auto` wrapper, with 1px row lines only.
  - Math: katex, with block math centered and horizontally scrollable if wide.

### 7.5 Right column: `MetaPanel`

A key/value table with bold small labels on the left and lighter gray values on the right, separated by the same 1px lines as the TOC. Rows:

- `published`: formatted date (`nov 5, 2026`)
- `category`
- `topics`: tags stacked vertically
- `links`: one per line, underlined, opening in a new tab with `rel="noopener noreferrer"` if external

Sticky like the TOC if it fits. If it is taller than the viewport, do not stick.

### 7.6 Below 1100px

- Single column. Order: header → hero → **TOC as a collapsible block** (`<details>` with a `contents` summary) → meta panel as a compact key/value block → body.
- Below 640px, reduce heading sizes with `clamp()`, and keep the body at 17px minimum.

### 7.7 Footer navigation

At the end of the article: a 1px divider, then `← all research` on the left, and `next: <title> →` on the right (next older item), both underlined links in the small style.

## 8. Markdown pipeline (`lib/markdown.ts`)

- Use `marked` (and `katex` for math). If the repo already contains a markdown pipeline, **reuse it**.
- Render the markdown to an HTML string on the server and output it with `dangerouslySetInnerHTML` inside the article container. Content is author-controlled (local files), but still do not render any user-submitted markdown this way.
- **Heading ids**: add stable slug ids to every `h2` and `h3` through a custom renderer (lowercase, spaces to hyphens, strip punctuation, and de-duplicate with `-2`, `-3`). Do not rely on a deprecated marked option, so check the installed marked version's API.
- **TOC extraction**: return `{ html, toc }` where `toc: { id: string; text: string; depth: 2 | 3 }[]`, collected in the same renderer pass so ids always match.
- Math: support `$inline$` and `$$block$$`. Import `katex/dist/katex.min.css` once in the article route only.
- External links in content get `target="_blank" rel="noopener noreferrer"`.

## 9. Navbar change

- Add `research` between `works` and `kernel`, linking to `/research`.
- The active state must also apply on nested routes (`/research/anything`), so use `pathname.startsWith("/research")`.
- Do not change the navbar's spacing system. Verify that the 5-item nav still fits at 360px width, and wrap or condense it using whatever the existing mobile behavior is.

## 10. Accessibility and quality bar

- Semantic landmarks: `<main>`, `<article>`, `<nav aria-label="table of contents">`, `<aside aria-label="details">`.
- Visible focus styles that match the navbar's existing focus ring (blue outline).
- Color contrast: secondary gray text must still meet AA on cream (adjust the token if it does not).
- One `<h1>` per page.
- All interactive controls are keyboard-operable. Dropdowns close on `Esc`.
- Use `<time dateTime>` for dates.
- No layout shift: covers reserve their aspect ratio.
- No console errors or hydration warnings. `bun run build` and `bun run lint` pass with no new warnings. TypeScript has no `any`.

## 11. Placeholder content to create

Create four items so every layout case is exercised:

| File | span | offset | cover |
|---|---|---|---|
| `example-research-one.md` | 1 | 0 | blue bg, `sage-large` + `red-small` |
| `example-research-two.md` | 1 | 2 | cream bg, `blue-large` |
| `example-research-three.md` | 2 | 0 | sage bg, `blue-small` + `red-small` + `ink-small` |
| `example-research-four.md` | 1 | 1 | red bg, `sage-large` |

Each article needs at least 5 `##` sections, a list with bold lead-ins, one code block, one math expression, one table, and one image-less blockquote, so the TOC and typography can be properly checked. Use obviously fake text (`lorem`-style or "placeholder") so the user knows to replace it.

## 12. Acceptance checklist

- [ ] `research` appears in the navbar after `works` and is highlighted on `/research` and `/research/*`.
- [ ] `/research` shows the count, divider, controls, and the staggered grid at ≥ 1100px.
- [ ] Filter, sort, search, and view toggle work and sync to the URL. Reloading restores the state.
- [ ] List view reuses the works-page row style.
- [ ] Generated covers render for every placeholder, cropped circles included.
- [ ] `/research/example-research-one` shows three columns, with sticky TOC and meta panel aligned to the hero top.
- [ ] Scroll-spy highlights the correct section, and clicking a TOC item scrolls with correct offset.
- [ ] Math, code, table, list, and blockquote render correctly.
- [ ] Below 1100px the layout collapses to one column with a collapsible contents block.
- [ ] Unknown slug → 404. Draft items are hidden in production builds.
- [ ] No new dependencies except `gray-matter` (and `marked`/`katex` if not already installed).
- [ ] Build, lint, and typecheck pass.

## 13. Out of scope (do not build)

Comments, analytics, RSS (can come later), pagination, tag pages, CMS, dark mode (unless the site already has it), and any animation beyond the hover scale and smooth scroll above.

## 14. When unsure

Prefer the existing site's patterns over this guide. Prefer fewer dependencies and less code. If a requirement here conflicts with something in the repo, make the smallest sensible choice, then leave a one-line `// NOTE:` comment explaining it and mention it in your final summary.

When done, summarize: files created or changed, new dependencies, any deviations from this guide, and anything the user must fill in (intro copy, real content, real PDFs).
