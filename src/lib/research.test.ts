import { describe, expect, it } from "vitest";
import { formatResearchDate } from "./dates";
import { getAllResearch, getAllSlugs, getResearch } from "./research";
import { COVER_BGS, COVER_SHAPE_NAMES } from "./research-covers";

describe("research loader", () => {
  it("returns every item sorted by date, most recent first", () => {
    const items = getAllResearch();
    expect(items.length).toBeGreaterThan(0);

    const dates = items.map((item) => item.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it("exposes kebab-case slugs", () => {
    for (const slug of getAllSlugs()) {
      expect(slug).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    }
  });

  it("ignores underscore-prefixed template files", () => {
    expect(getAllResearch().some((item) => item.slug.startsWith("_"))).toBe(
      false,
    );
  });

  it("validates each item against the research meta contract", () => {
    for (const item of getAllResearch()) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.summary.length).toBeGreaterThan(0);
      expect(item.category.length).toBeGreaterThan(0);
      expect([1, 2]).toContain(item.span);
      expect([0, 1, 2, 3]).toContain(item.offset);
      expect(["published", "draft"]).toContain(item.status);
      expect(COVER_BGS).toContain(item.cover.bg);
      for (const shape of item.cover.shapes) {
        expect(COVER_SHAPE_NAMES).toContain(shape);
      }
    }
  });

  it("parses author entries into separate, non-empty names", () => {
    for (const item of getAllResearch()) {
      if (!item.authors) continue;
      expect(item.authors.length).toBeGreaterThan(0);
      for (const name of item.authors) {
        expect(name.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("returns full items with content for a known slug, null otherwise", () => {
    const [first] = getAllResearch();
    const item = getResearch(first.slug);
    expect(item).not.toBeNull();
    expect(item?.content.length).toBeGreaterThan(0);
    expect(item?.slug).toBe(first.slug);

    expect(getResearch("definitely-not-a-slug")).toBeNull();
    expect(getResearch("../escape")).toBeNull();
  });

  it("formats dates lowercase in the site style", () => {
    expect(formatResearchDate("2026-11-05")).toBe("nov 5, 2026");
  });
});
