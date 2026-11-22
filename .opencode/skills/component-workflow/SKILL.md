---

name: Component workflow
description: 'Add or change Arinaholic React components with tests and Storybook stories. Use whenever creating or editing files in src/components, adding a story or test, or when the user asks for a new UI piece, even if they do not mention Storybook.'
license: MIT
compatibility: opencode

---

# Component workflow

1. Find the closest existing component in `src/components/` that serves the
   same role and mirror its file set: `Component.tsx`, `Component.module.scss`
   when styling is needed, `Component.test.tsx`, and `Component.stories.tsx`.
2. Keep data loading in `src/app/` or `src/lib/`. Components stay presentational
   unless the existing pattern says otherwise.
3. Use Testing Library and accessible queries. Test behavior and states, not
   implementation details or snapshots.
4. Stories use the pinned Storybook setup. Do not add Storybook addons or
   packages.
5. Run `bun run lint`, `bun run lint:styles`, `bun run typecheck`, and
   `bun run test`. Run `bun run build-storybook` when the story set changes.

## Completion

Component, test, and story exist and follow the local pattern. All chosen
checks pass; no new dependencies.
