import { describe, expect, it } from "vitest";
import { mainProjects, smallProjects } from "@/lib/works-projects";

describe("works projects", () => {
  it("lists the seven main projects in order", () => {
    expect(mainProjects.map((project) => project.name)).toEqual([
      "postharvest",
      "blackholegl",
      "lostdock",
      "yanker",
      "topscreen",
      "anily",
      "flamerjs",
    ]);
  });

  it("has at most five languages per project, with a color and no stars or forks", () => {
    for (const project of mainProjects) {
      expect(project.href).toMatch(/^https:\/\/github\.com\//);
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

  it("links flamerjs to the flamer repository", () => {
    expect(
      mainProjects.find((project) => project.name === "flamerjs")?.href,
    ).toBe("https://github.com/dummy3ye/flamer");
  });

  it("keeps the smaller repos in a separate list", () => {
    expect(smallProjects.map((project) => project.name)).toEqual([
      "notebook",
      "shell",
      "waytosea",
      "libcreate",
      "prism",
      "forest",
    ]);
  });
});
