import { describe, expect, it } from "vitest";
import { routes } from "@/lib/navigation/routes";
import sitemap from "@/lib/seo/sitemap";

describe("sitemap", () => {
  it("lists every route once as an absolute URL", () => {
    expect(sitemap().map((entry) => entry.url)).toEqual(
      routes.map((route) => `https://arinaholic.me${route.path}`),
    );
  });

  it("gives the homepage the highest priority", () => {
    const [home, ...rest] = sitemap();
    expect(home.url).toBe("https://arinaholic.me/");
    expect(home.priority).toBe(1);
    expect(rest.every((entry) => entry.priority === 0.8)).toBe(true);
  });
});
