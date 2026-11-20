import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { COVER_BGS, COVER_SHAPE_NAMES } from "./research-covers";

export type ResearchMeta = {
  slug: string;
  title: string;
  summary: string;
  date: string; // ISO
  category: string;
  tags: string[];
  status: "published" | "draft";
  span: 1 | 2;
  offset: 0 | 1 | 2 | 3;
  cover: {
    bg: "cream" | "blue" | "sage" | "red";
    shapes: string[];
    image?: string;
  };
  author?: string;
  links: { label: string; href: string }[];
};

export type ResearchItem = ResearchMeta & { content: string };

const CONTENT_DIR = path.join(process.cwd(), "content", "research");
const COVER_BG_SET = new Set<string>(COVER_BGS);
const COVER_SHAPE_SET = new Set<string>(COVER_SHAPE_NAMES);
const STATUSES = new Set(["published", "draft"]);
const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fail(file: string, message: string): never {
  throw new Error(`research: ${file}: ${message}`);
}

function expectString(
  data: Record<string, unknown>,
  key: string,
  file: string,
): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `frontmatter "${key}" must be a non-empty string`);
  }
  return value.trim();
}

function expectStringArray(
  value: unknown,
  key: string,
  file: string,
): string[] {
  if (
    !Array.isArray(value) ||
    value.some((entry) => typeof entry !== "string")
  ) {
    fail(file, `frontmatter "${key}" must be an array of strings`);
  }
  return value as string[];
}

function parseResearchFile(fileName: string): ResearchItem {
  const file = `content/research/${fileName}`;
  const slug = fileName.replace(/\.md$/, "");
  if (!KEBAB.test(slug)) {
    fail(
      file,
      `slug "${slug}" derived from the filename must be lowercase kebab-case`,
    );
  }

  let raw: string;
  try {
    raw = fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8");
  } catch {
    fail(file, "could not read the file");
  }

  const { data, content } = matter(raw) as {
    data: Record<string, unknown>;
    content: string;
  };

  for (const key of [
    "title",
    "summary",
    "date",
    "category",
    "tags",
    "status",
    "span",
    "offset",
    "cover",
    "links",
  ]) {
    if (data[key] === undefined || data[key] === null) {
      fail(file, `missing required frontmatter field "${key}"`);
    }
  }

  const title = expectString(data, "title", file);
  const summary = expectString(data, "summary", file);
  const category = expectString(data, "category", file);
  const date = expectString(data, "date", file);
  if (Number.isNaN(Date.parse(date))) {
    fail(file, `frontmatter "date" is not a valid date: "${date}"`);
  }

  const tags = expectStringArray(data.tags, "tags", file);

  const status = data.status;
  if (typeof status !== "string" || !STATUSES.has(status)) {
    fail(file, `frontmatter "status" must be "published" or "draft"`);
  }

  const span = data.span;
  if (span !== 1 && span !== 2) {
    fail(file, `frontmatter "span" must be 1 or 2`);
  }

  const offset = data.offset;
  if (
    typeof offset !== "number" ||
    !Number.isInteger(offset) ||
    offset < 0 ||
    offset > 3
  ) {
    fail(file, `frontmatter "offset" must be an integer between 0 and 3`);
  }

  const cover = data.cover;
  if (typeof cover !== "object" || cover === null || Array.isArray(cover)) {
    fail(file, `frontmatter "cover" must be an object with "bg" and "shapes"`);
  }
  const coverRecord = cover as Record<string, unknown>;
  const bg = coverRecord.bg;
  if (typeof bg !== "string" || !COVER_BG_SET.has(bg)) {
    fail(file, `frontmatter "cover.bg" must be one of cream, blue, sage, red`);
  }
  const shapes = expectStringArray(coverRecord.shapes, "cover.shapes", file);
  for (const shape of shapes) {
    if (!COVER_SHAPE_SET.has(shape)) {
      fail(
        file,
        `frontmatter "cover.shapes" contains unknown preset "${shape}" (known: ${COVER_SHAPE_NAMES.join(", ")})`,
      );
    }
  }
  const image = coverRecord.image;
  if (image !== undefined && typeof image !== "string") {
    fail(file, `frontmatter "cover.image" must be a string when set`);
  }

  const linksRaw = data.links;
  if (!Array.isArray(linksRaw)) {
    fail(file, `frontmatter "links" must be an array of { label, href }`);
  }
  const links = linksRaw.map((entry, index) => {
    if (typeof entry !== "object" || entry === null) {
      fail(file, `frontmatter "links[${index}]" must be an object`);
    }
    const link = entry as Record<string, unknown>;
    if (typeof link.label !== "string" || typeof link.href !== "string") {
      fail(
        file,
        `frontmatter "links[${index}]" needs string "label" and "href"`,
      );
    }
    return { label: link.label, href: link.href };
  });

  const author = data.author;
  if (author !== undefined && typeof author !== "string") {
    fail(file, `frontmatter "author" must be a string when set`);
  }

  return {
    slug,
    title,
    summary,
    date,
    category,
    tags,
    status: status as ResearchMeta["status"],
    span: span as ResearchMeta["span"],
    offset: offset as ResearchMeta["offset"],
    cover: {
      bg: bg as ResearchMeta["cover"]["bg"],
      shapes,
      ...(image !== undefined ? { image } : {}),
    },
    ...(author !== undefined ? { author: author.trim() } : {}),
    links,
    content,
  };
}

function listItems(): ResearchItem[] {
  if (!fs.existsSync(CONTENT_DIR)) {
    return [];
  }
  return (
    fs
      .readdirSync(CONTENT_DIR)
      // Underscore-prefixed files are templates, not publishable entries.
      .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
      .map(parseResearchFile)
  );
}

function visibleInProduction(items: ResearchItem[]): ResearchItem[] {
  if (process.env.NODE_ENV !== "production") {
    return items;
  }
  return items.filter((item) => item.status === "published");
}

export function getAllResearch(): ResearchMeta[] {
  return visibleInProduction(listItems())
    .map(({ content: _content, ...meta }) => meta)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getResearch(slug: string): ResearchItem | null {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return null;
  }
  const fileName = `${slug}.md`;
  if (!fs.existsSync(path.join(CONTENT_DIR, fileName))) {
    return null;
  }
  const item = parseResearchFile(fileName);
  if (process.env.NODE_ENV === "production" && item.status === "draft") {
    return null;
  }
  return item;
}

export function getAllSlugs(): string[] {
  return getAllResearch().map((item) => item.slug);
}

export { formatResearchDate } from "./dates";
