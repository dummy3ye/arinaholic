import { expect, test } from "@playwright/test";

test("the site header hides on scroll down and returns on scroll up", async ({
  page,
}) => {
  await page.goto("/works");

  const siteHeader = page.locator("body > header");
  await expect(siteHeader).toBeVisible();

  const scrollTo = async (top: number) => {
    await page.evaluate(
      (y) => window.scrollTo({ top: y, behavior: "instant" }),
      top,
    );
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(top);
  };

  await scrollTo(500);
  await expect(siteHeader).not.toHaveAttribute("data-hidden", "true");

  await scrollTo(700);
  await expect(siteHeader).toHaveAttribute("data-hidden", "true");

  await scrollTo(680);
  await expect(siteHeader).not.toHaveAttribute("data-hidden", "true");
});

test("the main navigation exposes only the primary routes", async ({
  page,
}) => {
  await page.goto("/works");

  const nav = page.getByRole("navigation", { name: "Main" });
  for (const name of ["works", "research", "setup", "contact"]) {
    await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
  }

  await expect(
    nav.getByRole("link", { name: "works", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "kernel" })).toHaveCount(0);
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("primary links fit and navigate without horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/research");

    const nav = page.getByRole("navigation", { name: "Main" });
    for (const name of ["works", "research", "setup", "contact"]) {
      await expect(nav.getByRole("link", { name, exact: true })).toBeVisible();
    }

    await nav.getByRole("link", { name: "contact", exact: true }).click();
    await expect(page).toHaveURL(/\/contact$/);
    await expect(
      page
        .getByRole("navigation", { name: "Main" })
        .getByRole("link", { name: "contact", exact: true }),
    ).toHaveAttribute("aria-current", "page");

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflows).toBe(false);
  });
});
