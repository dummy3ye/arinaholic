import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Shapes } from "@/components/decor/Shapes";

describe("Shapes", () => {
  it("renders the three decorative shapes with the current route", () => {
    const { container } = render(<Shapes route="setup" />);
    const shapes = container.querySelector(".shapes");
    expect(shapes).toHaveAttribute("data-route", "setup");
    expect(shapes).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelectorAll(".shape")).toHaveLength(3);
    expect(container.querySelector(".shape.blue")).not.toBeNull();
    expect(container.querySelector(".shape.red")).not.toBeNull();
    expect(container.querySelector(".shape.sage")).not.toBeNull();
  });
});
