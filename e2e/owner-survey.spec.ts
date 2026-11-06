import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

// Needs the development database seeded with `npm run prisma:seed` (README). Each run creates a survey with a
// unique title, so repeated runs never collide; there is no delete route in Sprint 1, so these accumulate.
test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 30_000 });

test("TEST-21 an owner creates a two-question survey, sees it as Draft, publishes it and sees Published", async ({ page }) => {
  const title = "E2E feedback " + Date.now();
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/, { timeout: 5_000 });

  await page.getByRole("link", { name: "New survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/new$/);
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);

  await page.getByLabel("Question 1 text").fill("How was the pace of the lectures?");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByLabel("Question 2 text").fill("Would you recommend this course?");
  await page.getByLabel("Question 2 type").selectOption("SINGLE_CHOICE");
  await page.getByLabel("Question 2 option 1").fill("Yes");
  await page.getByLabel("Question 2 option 2").fill("No");
  await page.getByRole("button", { name: "Create survey" }).click();

  // Detail page: shows the new survey as Draft.
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/, { timeout: 5_000 });
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText("Draft", { exact: true })).toBeVisible();
  await expect(page.getByText("How was the pace of the lectures?")).toBeVisible();
  await expect(page.getByText("Would you recommend this course?")).toBeVisible();

  // The list shows it as Draft too.
  await page.getByRole("link", { name: "Back to your surveys" }).first().click();
  const row = page.getByRole("listitem").filter({ hasText: title });
  await expect(row.getByText("Draft", { exact: true })).toBeVisible();

  // Publish from the detail page.
  await row.getByRole("link", { name: title }).click();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible({ timeout: 5_000 });
  await expect(page.getByRole("button", { name: "Publish" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Close" })).toBeVisible();
});

test("TEST-21 an empty title shows a message under the title field and creates nothing", async ({ page }) => {
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Question 1 text").fill("A question");
  await page.getByRole("button", { name: "Create survey" }).click();

  await expect(page.locator("#survey-title-error")).toContainText(/title/i, { timeout: 5_000 });
  await expect(page).toHaveURL(/\/owner\/surveys\/new$/);
});
