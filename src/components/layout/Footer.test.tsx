import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "@/components/layout/Footer";

describe("Footer", () => {
  it("renders nothing", () => {
    const { container } = render(<Footer />);
    expect(container).toBeEmptyDOMElement();
  });
});
