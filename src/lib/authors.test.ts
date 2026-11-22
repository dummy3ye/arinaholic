import { describe, expect, it } from "vitest";
import { formatAuthors } from "./authors";

describe("formatAuthors", () => {
  it("falls back to sage when no authors are given", () => {
    expect(formatAuthors([])).toBe("sage");
  });

  it("prints a single author as-is", () => {
    expect(formatAuthors(["one"])).toBe("one");
  });

  it("joins two authors with and", () => {
    expect(formatAuthors(["one", "two"])).toBe("one and two");
  });

  it("uses commas and a final and for three or more authors", () => {
    expect(formatAuthors(["one", "two", "three"])).toBe("one, two and three");
  });
});
