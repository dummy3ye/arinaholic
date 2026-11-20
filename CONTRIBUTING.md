# Contributing

Thanks for helping improve Arinaholic.

## Local setup

You need Bun 1.4.2 and Node 24.

```sh
bun install
bun run dev
```

The site runs at `http://localhost:3000`. Storybook runs separately on port
`6006`:

```sh
bun run storybook
```

## Before opening a pull request

Run the full local check suite:

```sh
bun run check
```

This runs Biome, Stylelint, Knip, TypeScript, Vitest, the Next.js build, and
the Storybook build. The repository hooks also run the relevant checks
automatically.

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/):

```text
fix(navbar): keep the header visible on short pages
```

`commitlint` validates messages in the `commit-msg` hook and in CI.

## Pull requests

- Create a branch from `master`.
- Keep changes focused and explain the motivation in the PR description.
- Link any related issue.
- Make sure all GitHub checks pass before requesting review.

Research posts live in `content/research/`. Use `_example.md` as the template;
files starting with `_` are ignored by the site loader.
