import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Nav } from "@/components/layout/Nav";

const mockPathname = vi.hoisted(() => ({ value: "/works" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.value,
}));

afterEach(() => {
  mockPathname.value = "/works";
});

describe("Nav", () => {
  it("marks the current route with aria-current", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "works" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "research" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "setup" })).not.toHaveAttribute(
      "aria-current",
    );
    expect(screen.getByRole("link", { name: "contact" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("renders works, research, setup and contact — no kernel link", () => {
    render(<Nav />);
    expect(screen.getByRole("link", { name: "works" })).toHaveAttribute(
      "href",
      "/works",
    );
    expect(screen.getByRole("link", { name: "research" })).toHaveAttribute(
      "href",
      "/research",
    );
    expect(screen.getByRole("link", { name: "setup" })).toHaveAttribute(
      "href",
      "/setup",
    );
    expect(screen.getByRole("link", { name: "contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
    expect(screen.queryByRole("link", { name: "kernel" })).toBeNull();
  });

  it("marks nested research routes as current", () => {
    mockPathname.value = "/research/example-research-one";
    render(<Nav />);
    expect(screen.getByRole("link", { name: "research" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "works" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("marks works as current on the nested kernel route", () => {
    mockPathname.value = "/works/kernel";
    render(<Nav />);
    expect(screen.getByRole("link", { name: "works" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "research" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
