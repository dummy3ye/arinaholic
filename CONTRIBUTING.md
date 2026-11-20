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

If you use VS Code, open `arinaholic.code-workspace`, then run **Dev Containers:
Open Workspace in Container...**. The dev container installs Bun 1.4.2 and Node
24, installs dependencies, and forwards ports `3000` and `6006`.

If you use Zed, the project-local settings, tasks, and debug configurations are
in `.zed/`. Install the [Biome extension](https://zed.dev/extensions/biome) to
get formatting and organize-imports on save. Run tasks such as `check`,
`test:e2e`, and `storybook` from Zed's task launcher.

## Tests

Vitest specs live beside the code as `*.test.ts(x)`:

```sh
bun run test
```

To generate a coverage report in `coverage/`, run:

```sh
bun run test:coverage
```

CI uploads `coverage/lcov.info` to Codecov using the `CODECOV_TOKEN`
repository secret.

Playwright specs live in `e2e/`. Install the browser once, then run them:

```sh
bun run test:e2e:install
bun run test:e2e
```

Playwright reuses an existing server on port `3000` locally and does not stop it.
CI builds the site first, then runs the same specs against that build.

## Before opening a pull request

Run the full local check suite:

```sh
bun run check
```

This runs Biome, Stylelint, Knip, TypeScript, Vitest, the Next.js build, and
the Storybook build. Playwright specs run separately as described above. The
repository hooks also run the relevant checks automatically.

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

## Dependency updates

Renovate is the sole dependency update bot. Its repository configuration is in
`renovate.json`, and it runs through the Mend Renovate GitHub App. Dependabot
version updates are disabled to avoid duplicate pull requests.

## Security

Please report vulnerabilities privately as described in [SECURITY.md](SECURITY.md).
