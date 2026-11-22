# AGENTS.md

Project instructions for coding agents in this repository.

## Project

- Arinaholic is a statically generated Next.js personal site and writing
  archive.
- Content and assets are local: Markdown in `content/research/`, images in
  `public/`.
- `README.md` documents the stack, scripts, writing conventions, and deployment.
  `CONTRIBUTING.md` documents setup and the pull-request checklist.

## Local workflow

- Use Bun 1.4.2 and Node 26. `bun install`, then `bun run dev` on port 3000 or
  `bun run storybook` on port 6006.
- Do not stop a running dev server. Do not run `bun run check` while it is
  running; it writes to `.next`.
- While the dev server is running, use the individual scripts (`lint`,
  `lint:oxlint`, `lint:styles`, `knip`, `format:check`, `typecheck`, `test`)
  instead of `bun run check`.
- Run the full suite and builds before proposing a merge.

## Git workflow

- Default branch: `master`.
- Branch, push, wait for all checks, squash-merge, delete the branch.
- Conventional Commits. `.githooks/` runs checks locally.

## Working in the repo

- Make small, focused changes and follow the patterns already in `src/` and
  `content/`.
- Keep build output out of commits.
