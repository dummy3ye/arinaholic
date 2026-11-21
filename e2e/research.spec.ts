import { expect, type Page, test } from "@playwright/test";

async function paperCount(page: Page): Promise<number> {
  const count = page.locator("main").getByText(/^\d+ papers?$/);
  await expect(count).toBeVisible();

  const text = (await count.textContent())?.trim() ?? "";
  const value = Number.parseInt(text, 10);
  expect(value).toBeGreaterThan(0);
  return value;
}

test.beforeEach(async ({ page }) => {
  await page.goto("/research");
  await expect(page.getByRole("button", { name: "filter" })).toBeVisible();
});

test("category filtering updates the results and URL", async ({ page }) => {
  const total = await paperCount(page);

  await page.getByRole("button", { name: "filter" }).click();
  const options = page
    .getByRole("listbox", { name: "filter by category" })
    .getByRole("option");
  await expect(options.first()).toBeVisible();
  await options.first().click();

  const filtered = await paperCount(page);
  expect(filtered).toBeGreaterThan(0);
  expect(filtered).toBeLessThanOrEqual(total);
  await expect(page).toHaveURL(/[?&]cat=/);
});

test("search empty state can be cleared", async ({ page }) => {
  await page
    .getByRole("searchbox", { name: "search research" })
    .fill("no-such-topic");

  await expect(page.getByText("nothing matches that.")).toBeVisible();
  await page.getByRole("button", { name: "clear filters" }).click();

  await paperCount(page);
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

  const rows = page.locator("main ol > li");
  await expect(rows.first()).toBeVisible();

  const titles = await page.locator("main ol li h2").allTextContents();
  expect(titles.length).toBeGreaterThan(0);
  expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));

  await page.reload();
  await expect(page.getByRole("button", { name: "list" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(rows).toHaveCount(titles.length);
  await paperCount(page);
});
