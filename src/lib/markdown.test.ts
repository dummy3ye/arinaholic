import { describe, expect, it } from "vitest";
import { renderMarkdown } from "./markdown";

describe("renderMarkdown", () => {
  it("adds stable slug ids to h2 and h3 and collects the toc in order", () => {
    const { html, toc } = renderMarkdown(
      "## hello world\n\n### sub section\n\n## hello world\n\n### sub section\n",
    );

    expect(html).toContain('<h2 id="hello-world">');
    expect(html).toContain('<h3 id="sub-section">');
    expect(html).toContain('<h2 id="hello-world-2">');
    expect(html).toContain('<h3 id="sub-section-2">');

    expect(toc).toEqual([
      { id: "hello-world", text: "hello world", depth: 2 },
      { id: "sub-section", text: "sub section", depth: 3 },
      { id: "hello-world-2", text: "hello world", depth: 2 },
      { id: "sub-section-2", text: "sub section", depth: 3 },
    ]);
  });

  it("ignores headings deeper than h3 when building the toc", () => {
    const { toc } = renderMarkdown("#### too deep\n\n## kept\n");
    expect(toc).toEqual([{ id: "kept", text: "kept", depth: 2 }]);
  });

  it("opens external links in a new tab and leaves internal links alone", () => {
    const { html } = renderMarkdown(
      "[ext](https://example.com/page) and [int](/contact)\n",
    );
    expect(html).toContain(
      '<a href="https://example.com/page" target="_blank" rel="noopener noreferrer">ext</a>',
    );
    expect(html).toContain('<a href="/contact">int</a>');
  });

  it("renders inline and block math via katex", () => {
    const { html } = renderMarkdown("inline $x^2$ done\n\n$$y = mx + b$$\n");
    expect(html).toContain("katex");
    expect(html).toContain('<div class="math">');
  });

  it("does not treat dollar signs inside code as math", () => {
    const { html } = renderMarkdown(
      "use `$notMath$` and\n\n```\n$alsoNotMath$\n```\n",
    );
    expect(html).not.toContain("katex");
    expect(html).toContain("$notMath$");
  });

  it("wraps tables in a scrollable container", () => {
    const { html } = renderMarkdown("| a | b |\n| --- | --- |\n| 1 | 2 |\n");
    expect(html).toContain('<div class="table-wrap">');
  });
});
