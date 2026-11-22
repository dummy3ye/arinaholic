---

name: E2E and accessibility
description: 'Work on Arinaholic Playwright and axe coverage. Use when editing e2e/, changing routes or navigation, adding interactive UI, or when the user mentions Playwright, accessibility, axe, or browser tests.'
license: MIT
compatibility: opencode

---

# E2E and accessibility

- Playwright uses Chromium only. Do not add other browser projects.
- `playwright.config.ts` reuses an existing dev server locally, so leave the
  user's server running. In CI it builds and starts the production server
  itself.
- `bun run test:e2e:install` installs Chromium only when it is missing.
- Research gallery assertions must expect at least one markdown result, never
  an exact count.
- Prefer role, label, and text queries. Add axe checks on pages whose
  accessibility surface changed.
- Keep tests independent; no shared mutable state between specs.

## Verify

Run `bun run test:e2e`. If it fails, distinguish product bugs from selector or
timing issues before changing code.

## Completion

All specs pass in Chromium; no browser projects or test dependencies were
added.
