import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WorksPage from "@/app/works/page";

describe("WorksPage", () => {
  it("links to the nested kernel page", () => {
    render(<WorksPage />);
    expect(
      screen.getByRole("link", { name: "read about the patches" }),
    ).toHaveAttribute("href", "/works/kernel");
  });
});
