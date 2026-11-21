---
# ---------------------------------------------------------------------------
# research entry template
# ---------------------------------------------------------------------------
# copy this file to content/research/your-post.md, then replace every value.
# the filename without ".md" becomes the slug, so it must be lowercase
# kebab-case, e.g. "my-new-paper.md" -> /research/my-new-paper.
# files starting with "_" are templates and are ignored by the loader.
# ---------------------------------------------------------------------------

# required: headline shown on cards, article pages and in metadata
title: "example research entry"

# required: one or two sentences shown on cards and in search/social metadata
summary: "a short example abstract that explains what this entry is about."

# required: ISO date. entries are sorted newest first.
date: "2026-11-21"

# required: free-text category shown above the card cover
category: "simulation"

# required: list of free-text tags used in article metadata
tags: ["graphics", "physics", "method notes"]

# required: "published" or "draft"; drafts are hidden in production
status: "published"

# optional: byline in the article sidebar; defaults to "sage" when omitted
author: "sage"

# required: 1 = normal card, 2 = wide card
span: 1

# required: 0 | 1 | 2 | 3; gallery column offset for visual rhythm
offset: 0

# required: cover preset
cover:
  # required: "cream" | "blue" | "sage" | "red"
  bg: "blue"

  # required, even when an image is set. any subset of:
  # "blue-large" | "blue-small" | "sage-large" | "red-small" | "ink-small"
  shapes: ["sage-large", "red-small"]

  # optional: local path under public/, e.g.
  # public/covers/example-research-entry.webp -> /covers/example-research-entry.webp
  # when set, this replaces the shape artwork on cards and article pages.
  # local images are measured automatically, so the cover keeps the image's
  # own ratio on cards and on the article page instead of being cropped.
  # remote URLs need images.remotePatterns in next.config.ts.
  image: "/covers/example-research-entry.webp"

# required: list of { label, href } links.
# a link labelled "pdf" becomes the "download the pdf" button on the article.
links:
  - label: "github"
    href: "https://github.com/dummy3ye/example-research-entry"
  - label: "pdf"
    href: "/papers/example-research-entry.pdf"
  - label: "notes"
    href: "https://example.com/notes"
---

## summary

This body demonstrates the markdown the research renderer supports. Use `##`
and `###` headings for the table of contents. Text can be **bold**, *italic*,
~~struck through~~ or `inline code`, and links like
[the example site](https://example.com) open in a new tab when external.

Inline math works too: $E = mc^2$.

> A blockquote is useful for a short pull quote or a callout. Keep it short so
> the article column stays readable on phones.

## background

### why this exists

- a plain bullet
- another bullet with **emphasis**
  - a nested bullet

1. a numbered step
2. another numbered step

### what is missing

- [x] a finished task
- [ ] a task still in progress

## method

Fenced code blocks keep their language label in the source:

```ts
function step(value: number): number {
  const damping = 0.92;
  return value * damping;
}
```

Display math is centred and scrolls on narrow screens:

$$
\hat{y} = \arg\max_y \; p(y \mid x)
$$

## results

GFM tables are wrapped so they scroll inside the article column:

| metric | value | note                  |
| ------ | ----- | --------------------- |
| loss   | 0.21  | lower is better       |
| steps  | 1000  | placeholder run length |

Images can be referenced from `public`:

![a labelled diagram](/covers/example-research-entry.webp)

A title adds a caption. Add `| left`, `| right` or `| center` to control the
placement:

![diagram floated left](/covers/example-research-entry.webp "figure 1: the pipeline | left")

Wrap two or more captioned images between grid markers to place them side by
side:

<!-- grid -->

![first view](/covers/example-research-entry.webp "front view | left")
![second view](/covers/example-research-entry.webp "side view | right")

<!-- /grid -->

---

## notes

Use `##` and `###` for every real section; only those two depths appear in the
table of contents. A horizontal rule like the one above separates optional
appendix material.
