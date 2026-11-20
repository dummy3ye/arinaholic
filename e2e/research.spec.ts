import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/research");
  await expect(page.getByRole("button", { name: "filter" })).toBeVisible();
});

test("category filtering updates the results and URL", async ({ page }) => {
  await expect(page.getByText("04 papers", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "filter" }).click();
  await page
    .getByRole("listbox", { name: "filter by category" })
    .getByRole("option", { name: /kernel/ })
    .click();

  await expect(page.getByText("01 paper", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "example research two" }),
  ).toBeVisible();
  await expect(page).toHaveURL(/[?&]cat=kernel/);
});

test("search empty state can be cleared", async ({ page }) => {
  await page
    .getByRole("searchbox", { name: "search research" })
    .fill("no-such-topic");

  await expect(page.getByText("nothing matches that.")).toBeVisible();
  await page.getByRole("button", { name: "clear filters" }).click();

  await expect(page.getByText("04 papers", { exact: true })).toBeVisible();
  await expect(page).not.toHaveURL(/q=/);
});

test("sort and view choices survive a reload", async ({ page }) => {
  await page.getByRole("button", { name: /^sort:/ }).click();
  await page
    .getByRole("listbox", { name: "sort papers" })
    .getByRole("option", { name: "a to z" })
    .click();

  await expect(page).toHaveURL(/sort=az/);
  await page.getByRole("button", { name: "list" }).click();
  await expect(page).toHaveURL(/view=list/);

  await expect(page.locator("main ol > li")).toHaveCount(4);
  await expect(page.locator("main ol li h2")).toHaveText([
    "example research four",
    "example research one",
    "example research three",
    "example research two",
  ]);

  await page.reload();
  await expect(page.getByRole("button", { name: "list" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByText("04 papers", { exact: true })).toBeVisible();
});
