# sagittarius — arinaholic

Personal site and writing archive for **arinaholic**: Linux kernel driver
patches, embedded systems, small simulations, and fast terminal tools.

Live at [arinaholic.me](https://arinaholic.me).

|          |                                                          |
| -------- | -------------------------------------------------------- |
| Works    | [arinaholic.me/works](https://arinaholic.me/works)       |
| Research | [arinaholic.me/research](https://arinaholic.me/research) |
| Setup    | [arinaholic.me/setup](https://arinaholic.me/setup)       |
| Contact  | [arinaholic.me/contact](https://arinaholic.me/contact)   |

## What's here

- **Home** — a short overview with paths into the work, kernel notes, and setup.
- **Works** — projects and smaller tools, plus a dedicated
  [/works/kernel](https://arinaholic.me/works/kernel) page about patching and
  testing.
- **Research** — a searchable, filterable gallery of markdown articles with
  covers, tables of contents, math, captioned figures, side-by-side figure
  grids, and optional PDF links. Drafts are visible in development only.
- **Setup** — interactive SVG pipeline diagrams for the toolchain and the
  kernel patch loop.
- **Contact** — email and social links, with no tracking or contact form.

Everything is statically generated from local files. There is no CMS, database,
or required application environment variable.

## Stack

| Layer      | Tools                                                    |
| ---------- | -------------------------------------------------------- |
| Framework  | Next.js 16 App Router, React 19, TypeScript 7            |
| Styling    | Tailwind CSS 4, Sass, CSS modules                        |
| Content    | Markdown via `gray-matter` and `marked`, KaTeX math      |
| Icons      | `lucide-react`, Simple Icons                             |
| Tests      | Vitest, Playwright (Chromium + axe), Lighthouse CI       |
| Tooling    | Biome, Oxlint, Stylelint, Knip, commitlint, Storybook    |
| Automation | GitHub Actions, CodeQL, Renovate via the Mend GitHub App |
| Hosting    | Vercel, with Speed Insights enabled only on Vercel       |

## Quick start

Requirements: **Node 26** and **Bun 1.4.2** or newer.

```sh
bun install
bun run dev
```

The site runs at `http://localhost:3000`; Storybook runs separately on port
`6006`:

```sh
bun run storybook
```

A devcontainer is provided, along with a single-root VS Code workspace
(`arinaholic.code-workspace`). Zed users get project-local settings, tasks, and
debug configurations under `.zed/`.

## Scripts

| Command                                   | Purpose                                       |
| ----------------------------------------- | --------------------------------------------- |
| `bun run dev`                             | Start the Next.js dev server on port 3000     |
| `bun run build`                           | Build the production site                     |
| `bun run start`                           | Serve the production build                    |
| `bun run lint`                            | Biome lint check                              |
| `bun run lint:fix`                        | Apply Biome fixes                             |
| `bun run lint:oxlint`                     | Oxlint check, failing on warnings too         |
| `bun run lint:oxlint:fix`                 | Apply Oxlint safe fixes                       |
| `bun run lint:styles`                     | Stylelint for SCSS/CSS                        |
| `bun run format` / `bun run format:check` | Format with Biome / verify formatting         |
| `bun run typecheck`                       | `tsc --noEmit`                                |
| `bun run test`                            | Vitest unit and component tests               |
| `bun run test:coverage`                   | Vitest with Istanbul coverage                 |
| `bun run test:e2e`                        | Playwright end-to-end and accessibility tests |
| `bun run knip`                            | Find unused files, exports, and dependencies  |
| `bun run check`                           | Full local suite (except Playwright)          |

## Project layout

```text
content/research/   Markdown articles; filenames become URLs
public/             Images, favicon, manifest, OG image, llms.txt
src/app/            App Router pages, route handlers, error UI
src/components/     Layout, content, research, and setup components
src/lib/            Research loader, markdown renderer, pipeline engine, SEO
src/styles/         Global CSS and SCSS
e2e/                Playwright specs
.storybook/         Storybook configuration
.github/workflows/  CI workflows
.githooks/          Local Git hooks
```

## Writing research

Articles live in `content/research/`. Copy `_example.md` to a lowercase
kebab-case filename (without `.md`) and fill in the frontmatter: `title`,
`summary`, `date`, `category`, `tags`, `status`, `span`, `offset`, `cover`, and
`links`. Use `authors: [...]` for multiple authors; the older single `author`
field is still supported. Set `status: draft` to keep an article visible only
in development.

Covers can use generated shapes or a local image under `public/` via
`cover.image`; image ratios are detected automatically. Body images accept an
optional caption and alignment:

```markdown
![Alt text](/images/2007/example.jpg "Caption | right")
```

Wrap consecutive captioned images in `<!-- grid -->` and `<!-- /grid -->` to
display them side by side. A link labelled `pdf` becomes the article's download
button. See [`content/research/_example.md`](content/research/_example.md) for
the complete template.

## Quality gates

Local hooks run Biome, Oxlint, Stylelint, Knip, formatting, TypeScript, and
Vitest; `commit-msg` enforces Conventional Commits and `pre-push` runs the test
suite. CI repeats those checks and additionally runs the Next.js and Storybook
builds, Playwright, Lighthouse accessibility, CodeQL, and commitlint. All checks
must pass before a pull request is merged.

Oxlint is configured in [`.oxlintrc.json`](.oxlintrc.json). It complements
Biome with JavaScript/TypeScript correctness and performance rules; a small set
of rules that conflict with project conventions or duplicate other checks are
disabled there. The VS Code workspace recommends the Oxc extension and enables
its safe-fix action on save.

## Deployment

Vercel installs with `bun install --frozen-lockfile` and builds with
`bun run build`. Response headers are configured in `vercel.json`; there is no
strict CSP. `CODECOV_TOKEN` is the only CI secret, and coverage upload is
skipped when it is absent.

## Contributing and security

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, commit conventions, and the
pull-request checklist. Report vulnerabilities privately as described in
[SECURITY.md](SECURITY.md).
