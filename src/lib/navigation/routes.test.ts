import { describe, expect, it } from "vitest";
import { navRoutes, routes } from "@/lib/navigation/routes";

describe("routes", () => {
  it("lists the six routes in order", () => {
    expect(routes.map((route) => route.path)).toEqual([
      "/",
      "/works",
      "/works/kernel",
      "/research",
      "/setup",
      "/contact",
    ]);
  });

  it("uses unique keys, paths and labels", () => {
    expect(new Set(routes.map((route) => route.key)).size).toBe(routes.length);
    expect(new Set(routes.map((route) => route.path)).size).toBe(routes.length);
    expect(new Set(routes.map((route) => route.label)).size).toBe(
      routes.length,
    );
  });

  it("starts every path with a slash", () => {
    expect(routes.every((route) => route.path.startsWith("/"))).toBe(true);
  });

  it("excludes the homepage and the nested kernel route from the nav", () => {
    expect(navRoutes.map((route) => route.key)).toEqual([
      "works",
      "research",
      "setup",
      "contact",
    ]);
  });
});
