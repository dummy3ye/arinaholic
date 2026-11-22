import { describe, expect, it } from "vitest";
import { mainProjects, smallProjects } from "@/lib/works-projects";

describe("works projects", () => {
  it("lists non-empty sets of main and smaller projects without duplicate names", () => {
    expect(mainProjects.length).toBeGreaterThan(0);
    expect(smallProjects.length).toBeGreaterThan(0);

    const names = [...mainProjects, ...smallProjects].map((project) =>
      project.name.trim(),
    );
    expect(names.every((name) => name.length > 0)).toBe(true);
    expect(new Set(names).size).toBe(names.length);
  });

  it("gives every project a name, a GitHub link and a description", () => {
    for (const project of mainProjects) {
      expect(project.href).toMatch(
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/,
      );
      expect(project.title.trim().length).toBeGreaterThan(0);
    }

    for (const project of smallProjects) {
      expect(project.href).toMatch(
        /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/,
      );
      expect(project.summary.trim().length).toBeGreaterThan(0);
    }
  });

  it("has at most five languages per main project, with a color and no stars or forks", () => {
    for (const project of mainProjects) {
      expect(project.languages.length).toBeGreaterThan(0);
      expect(project.languages.length).toBeLessThanOrEqual(5);
      expect(project).not.toHaveProperty("stars");
      expect(project).not.toHaveProperty("forks");

      for (const language of project.languages) {
        expect(language.name).toBeTruthy();
        expect(language.color).toMatch(/^#[0-9a-fA-F]{6}$/);
      }
    }
  });
});
