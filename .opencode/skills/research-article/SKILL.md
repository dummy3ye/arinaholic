---

name: Research article
description: 'Create or edit Arinaholic research articles. Use when the user asks for a new research post, frontmatter, cover image, figures, captions, grids, authors, draft status, or when touching files under content/research, even if they do not say "article".'
license: MIT
compatibility: opencode

---

# Research articles

## Before editing

Read `content/research/_example.md` and the "Writing research" section of
`README.md`. Use the example as the template instead of inventing a new shape.

## Frontmatter

- Required fields: `title`, `summary`, `date`, `category`, `tags`, `status`,
  `span`, `offset`, `cover`, and `links`.
- Use `authors: [...]` for multiple authors. Keep the legacy `author` field only
  for older single-author posts and never combine the two.
- `cover.image` must be a local path under `public/`. Ratios are detected from
  the file; add no dependency.
- Set `status: draft` to keep the post development-only.

## Body

- Caption figures as `![alt](/path "caption | left|right|center")`.
- Wrap consecutive captioned images in `<!-- grid -->` and `<!-- /grid -->` for
  a side-by-side layout.
- Keep the linear scanner in `src/lib/markdown.ts` intact; do not replace it
  with regex parsing.
- Do not invent sources. If a claim needs a citation and none was supplied, ask.

## Verify

Run `bun run test` and inspect the research/loader test output. Run
`bun run test:e2e` when the gallery or article route is affected.

## Completion

The article file, its local assets, and its frontmatter are consistent; the
chosen checks pass; no dependencies were added.
