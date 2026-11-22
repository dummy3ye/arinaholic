---

name: Project checks
description: 'Run and interpret Arinaholic verification checks. Use whenever the user asks to check, test, lint, typecheck, verify, or confirm a change is ready, before proposing a merge, or after fixing a failure, even if they only say "is it green?".'
license: MIT
compatibility: opencode

---

# Project checks

## Choose a lane

1. Read `AGENTS.md` for the dev-server rule.
2. If a dev server is running on port 3000, use the individual scripts:
   `bun run lint`, `bun run lint:oxlint`, `bun run lint:styles`, `bun run knip`,
   `bun run format:check`, `bun run typecheck`, and `bun run test`. Do not run
   `bun run check` or any build script in this lane.
3. If no dev server is running, run `bun run check`, then `bun run build`,
   `bun run build-storybook`, and `bun run test:e2e` when the change can affect
   routes, pages, or the production build.

Playwright reuses an existing local server, so `bun run test:e2e` is safe in
either lane. In CI it builds and starts the production server itself.

## Interpret failures

- Group failures by tool: Biome, Oxlint, Stylelint, Knip, TypeScript, Vitest,
  Playwright, or builds.
- Fix the root cause, rerun the smallest failing command, then rerun the whole
  lane.
- Treat Knip's `.sass compiled extension` hint as non-fatal unless it points at
  a real unused file.
- Storybook Vite `[MODULE_LEVEL_DIRECTIVE]` warnings are expected; leave them
  alone.

## Completion

Report the exact commands run and their outcomes. Say "green" only when every
command in the chosen lane exited zero. If a command was skipped, name it and
why.
