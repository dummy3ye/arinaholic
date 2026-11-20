import { Marked } from "marked";
import type { Token } from "marked";
import katex from "katex";

export type TocEntry = { id: string; text: string; depth: 2 | 3 };
export type RenderedMarkdown = { html: string; toc: TocEntry[] };

// Math is extracted before marked runs so that `$` inside prose does not get
// mistaken for inline code delimiters. Code spans and fences are excluded from
// the extraction so math written inside code is left untouched.
const codeSegment = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/g;

const MATH_TOKEN = (index: number) => `@@research-math-${index}@@`;

function pushMath(
  math: { tex: string; display: boolean }[],
  tex: string,
  display: boolean,
): string {
  math.push({ tex: tex.trim(), display });
  return MATH_TOKEN(math.length - 1);
}

function extractMath(source: string) {
  const math: { tex: string; display: boolean }[] = [];
  const masked = source
    .split(codeSegment)
    .map((part, index) => {
      if (index % 2 === 1) {
        return part; // inside code: leave untouched
      }
      return part
        .replace(/\$\$([\s\S]+?)\$\$/g, (_match, tex: string) =>
          pushMath(math, tex, true),
        )
        .replace(/\$([^$\n]+?)\$/g, (_match, tex: string) =>
          pushMath(math, tex, false),
        );
    })
    .join("");
  return { masked, math };
}

function slugify(text: string, seen: Map<string, number>): string {
  let stripped = text;
  let previous: string;
  do {
    previous = stripped;
    stripped = stripped.replace(/<[^>]*>/g, "");
  } while (stripped !== previous);

  const base =
    stripped
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s-]/gu, "")
      .trim()
      .replace(/\s+/g, "-") || "section";
  const count = seen.get(base) ?? 0;
  seen.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function inlineText(tokens: Token[] | undefined): string {
  if (!tokens) return "";
  return tokens
    .map((token) => {
      switch (token.type) {
        case "text":
        case "escape":
          return token.text;
        case "codespan":
          return token.text;
        case "strong":
        case "em":
        case "del":
          return inlineText(token.tokens);
        case "link":
          return inlineText(token.tokens);
        case "html":
        case "tag":
          return "";
        default:
          return "text" in token && typeof token.text === "string"
            ? token.text
            : "";
      }
    })
    .join("");
}

export function renderMarkdown(source: string): RenderedMarkdown {
  const { masked, math } = extractMath(source);
  const toc: TocEntry[] = [];
  const seen = new Map<string, number>();

  const instance = new Marked({ gfm: true });
  instance.use({
    renderer: {
      heading({ tokens, depth }) {
        const inner = this.parser.parseInline(tokens);
        if (depth === 2 || depth === 3) {
          const text = inlineText(tokens);
          const id = slugify(text, seen);
          toc.push({ id, text, depth });
          return `<h${depth} id="${id}">${inner}</h${depth}>\n`;
        }
        return `<h${depth}>${inner}</h${depth}>\n`;
      },
      link({ href, tokens }) {
        const inner = this.parser.parseInline(tokens);
        const external = /^https?:\/\//i.test(href);
        const attrs = external
          ? ' target="_blank" rel="noopener noreferrer"'
          : "";
        return `<a href="${href}"${attrs}>${inner}</a>`;
      },
    },
  });

  let html = instance.parse(masked, { async: false }) as string;

  // Restore math with KaTeX. Block math becomes a scrollable centered block.
  math.forEach(({ tex, display }, index) => {
    const token = MATH_TOKEN(index);
    const rendered = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: "ignore",
    });
    if (display) {
      html = html.replace(
        new RegExp(`<p>\\s*${token}\\s*</p>`, "g"),
        `<div class="math">${rendered}</div>`,
      );
    }
    html = html.split(token).join(rendered);
  });

  // Tables scroll inside their own wrapper on narrow screens.
  html = html.replace(
    /<table[\s\S]*?<\/table>/g,
    (table) => `<div class="table-wrap">${table}</div>`,
  );

  return { html, toc };
}
