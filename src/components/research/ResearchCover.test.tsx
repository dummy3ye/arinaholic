import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ResearchMeta } from "@/lib/research";
import { ResearchCover } from "./ResearchCover";

const baseCover: ResearchMeta["cover"] = {
  bg: "blue",
  shapes: ["red-small"],
};

describe("ResearchCover", () => {
  it("uses the image's own ratio when dimensions are known", () => {
    const { container } = render(
      <ResearchCover
        cover={{
          ...baseCover,
          image: "/covers/example.jpg",
          width: 1080,
          height: 810,
        }}
        aspectRatio="16 / 9"
      />,
    );

    expect(container.firstElementChild).toHaveStyle({
      aspectRatio: "1080 / 810",
    });
  });

  it("keeps the requested ratio for shape artwork", () => {
    const { container } = render(
      <ResearchCover cover={baseCover} aspectRatio="4 / 5" />,
    );

    expect(container.firstElementChild).toHaveStyle({ aspectRatio: "4 / 5" });
  });
});
