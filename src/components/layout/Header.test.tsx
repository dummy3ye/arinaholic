import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header";

const mockPathname = vi.hoisted(() => ({ value: "/works" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.value,
}));

const setScrollY = (y: number) => {
  Object.defineProperty(window, "scrollY", { configurable: true, value: y });
};

const stubMatchMedia = (mobile: boolean) => {
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: mobile && query === "(max-width: 820px)",
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  }));
};

afterEach(() => {
  setScrollY(0);
  mockPathname.value = "/works";
  vi.unstubAllGlobals();
});

describe("Header", () => {
  it("links the logo to the homepage", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "sagittarius" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("renders the main navigation", () => {
    render(<Header />);
    expect(
      screen.getByRole("navigation", { name: "Main" }),
    ).toBeInTheDocument();
  });

  it("hides on downward scroll past the threshold and shows on upward scroll", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");
    expect(header).not.toHaveAttribute("data-hidden");

    setScrollY(500);
    fireEvent.scroll(window);
    expect(header).not.toHaveAttribute("data-hidden");

    setScrollY(700);
    fireEvent.scroll(window);
    expect(header).toHaveAttribute("data-hidden", "true");

    setScrollY(680);
    fireEvent.scroll(window);
    expect(header).not.toHaveAttribute("data-hidden");
  });

  it("stays visible near the top of the page", () => {
    const { container } = render(<Header />);
    const header = container.querySelector("header");

    setScrollY(30);
    fireEvent.scroll(window);
    expect(header).not.toHaveAttribute("data-hidden");
  });

  it("enables the background only when the page is scrollable", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 5000,
    });

    const { container, unmount } = render(<Header />);
    expect(container.querySelector("header")).toHaveAttribute(
      "data-scrollable",
      "true",
    );
    unmount();

    Reflect.deleteProperty(document.documentElement, "scrollHeight");

    const quiet = render(<Header />);
    expect(quiet.container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
    quiet.unmount();
  });

  it("never enables the background on the contact route", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 5000,
    });
    mockPathname.value = "/contact";

    const { container, unmount } = render(<Header />);
    expect(container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
    unmount();

    Reflect.deleteProperty(document.documentElement, "scrollHeight");
  });

  it("enables the background on phones for non-/contact pages even when the page is not scrollable", () => {
    stubMatchMedia(true);
    const { container, unmount } = render(<Header />);
    expect(container.querySelector("header")).toHaveAttribute(
      "data-scrollable",
      "true",
    );
    unmount();

    mockPathname.value = "/contact";
    const contact = render(<Header />);
    expect(contact.container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
    contact.unmount();

    mockPathname.value = "/";
    const home = render(<Header />);
    expect(home.container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
    home.unmount();
  });

  it("keeps the scrollable-only behavior on desktop widths", () => {
    stubMatchMedia(false);
    const { container } = render(<Header />);
    expect(container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
  });

  it("follows the scroll check on desktop for /setup", () => {
    stubMatchMedia(false);
    mockPathname.value = "/setup";
    const { container } = render(<Header />);
    expect(container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
  });

  it("never enables the background on the home route", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", {
      configurable: true,
      get: () => 5000,
    });
    mockPathname.value = "/";

    const { container, unmount } = render(<Header />);
    expect(container.querySelector("header")).not.toHaveAttribute(
      "data-scrollable",
    );
    unmount();

    Reflect.deleteProperty(document.documentElement, "scrollHeight");
  });

  it("morphs the logo into sage on the first scroll and back on scroll up", () => {
    const { container } = render(<Header />);
    const logo = container.querySelector(".logo");
    expect(logo).not.toHaveAttribute("data-compact");

    setScrollY(10);
    fireEvent.scroll(window);
    expect(logo).toHaveAttribute("data-compact", "true");

    setScrollY(5);
    fireEvent.scroll(window);
    expect(logo).not.toHaveAttribute("data-compact");
  });
});
