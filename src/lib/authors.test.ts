import { describe, expect, it } from "vitest";
import { formatAuthors } from "./authors";

describe("formatAuthors", () => {
  it("falls back to sage when no authors are given", () => {
    expect(formatAuthors([])).toBe("sage");
  });

  it("prints a single author as-is", () => {
    expect(formatAuthors(["Sage"])).toBe("Sage");
  });

  it("joins two authors with and", () => {
    expect(formatAuthors(["Sage", "Tasrif Alam"])).toBe("Sage and Tasrif Alam");
  });

  it("uses commas and a final and for three or more authors", () => {
    expect(formatAuthors(["Sage", "Claude Mythos 5.2", "Tasrif Alam"])).toBe(
      "Sage, Claude Mythos 5.2 and Tasrif Alam",
    );
  });
});
