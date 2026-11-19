import { describe, expect, it } from "vitest";
import robots from "@/lib/seo/robots";

describe("robots", () => {
  it("allows all crawlers", () => {
    expect(robots().rules).toEqual([{ userAgent: "*", allow: "/" }]);
  });

  it("points at the sitemap", () => {
    expect(robots().sitemap).toBe("https://arinaholic.me/sitemap.xml");
  });
});
