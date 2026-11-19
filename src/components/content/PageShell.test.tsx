import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageShell } from "@/components/content/PageShell";
import { routes } from "@/lib/navigation/routes";

describe("PageShell", () => {
  it("renders the shapes on the home and contact pages", () => {
    for (const route of ["home", "contact"] as const) {
      const { container, unmount } = render(
        <PageShell route={route}>
          <p>page content</p>
        </PageShell>,
      );
      expect(container.querySelector(".shapes")).toHaveAttribute(
        "data-route",
        route,
      );
      expect(screen.getByRole("main")).toHaveTextContent("page content");
      unmount();
    }
  });

  it("does not render the shapes on other pages", () => {
    for (const route of routes.map((r) => r.key)) {
      if (route === "home" || route === "contact") continue;
      const { container, unmount } = render(
        <PageShell route={route}>
          <p>page content</p>
        </PageShell>,
      );
      expect(container.querySelector(".shapes")).toBeNull();
      expect(screen.getByRole("main")).toHaveTextContent("page content");
      unmount();
    }
  });
});
