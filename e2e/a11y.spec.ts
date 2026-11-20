import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// The site's page-entry animation can make axe sample partially faded text.
// Existing reduced-motion CSS disables it, giving deterministic contrast results.
test.use({ reducedMotion: "reduce" });

for (const path of ["/", "/research", "/works"]) {
  test(`${path} has no detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(results.violations).toEqual([]);
  });
}
