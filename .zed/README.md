# Zed project configuration

- `settings.json` uses the [Biome Zed extension](https://zed.dev/extensions/biome) as the formatter for JavaScript, TypeScript, JSX, TSX, JSON, JSONC, CSS, and SCSS. It also runs Biome's fix-all and organize-imports code actions on save.
- `tasks.json` mirrors the repository's `package.json` scripts. Open the task launcher in Zed and search by label (for example `check`, `test:e2e`, or `storybook`).
- `debug.json` provides Chrome debugging for the Next.js app and an attach configuration for a Node inspector on port 9229. Start the `dev` task before using the Chrome configuration. The attach configuration requires a dev server started with an inspector; Bun's WebKit Inspector Protocol is not supported by Zed's JavaScript debugger.

Zed does not support committed extension recommendations. Install the Biome extension once with `zed://extension/biome` or from the Extensions view.
