import { expect, test } from "@playwright/test";

test("contact links match the required row", async ({ page }) => {
  await page.goto("/contact");

  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "say hi." })).toBeVisible();
  await expect(
    main.getByRole("link", { name: "hi@arinaholic.me" }),
  ).toHaveAttribute("href", "mailto:hi@arinaholic.me");

  const links = [
    ["github", "https://github.com/dummy3ye"],
    ["twitter", "https://x.com/3yeonly_"],
    ["instagram", "https://instagram.com/unyerner"],
  ] as const;

  for (const [name, href] of links) {
    const link = main.getByRole("link", { name, exact: true });
    await expect(link).toHaveAttribute("href", href);
    await expect(link).toHaveAttribute("rel", "noopener");
  }

  await expect(main.getByRole("link", { name: "discord" })).toHaveCount(0);
  await expect(main.getByText("discord", { exact: true })).toBeVisible();
});
