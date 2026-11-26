import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 60_000 });

test("TEST-130 edited questions persist, publish and accept a response", async ({ page }) => {
  const title = `F-06 draft ${Date.now()}`;
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill("Original question");
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  const detail = page.url();
  const surveyId = Number(detail.match(/\/owner\/surveys\/(\d+)$/)?.[1]);
  await page.getByRole("link", { name: "Edit questions" }).click();
  await page.getByLabel("Question 1 text").fill("Edited question");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByLabel("Question 2 text").fill("Moved question");
  await page.getByRole("group", { name: "Question 2" }).getByRole("button", { name: "Move up" }).click();
  await page.getByRole("button", { name: "Save questions" }).click();
  await expect(page).toHaveURL(new RegExp(`/owner/surveys/${surveyId}$`));
  await page.reload();
  await expect(page.getByText("Moved question", { exact: true })).toBeVisible();
  await expect(page.getByText("Edited question", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await signIn(page, "student1@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/surveys$/);
  await page.goto(`/surveys/${surveyId}`);
  for (const name of ["Moved question", "Edited question"]) {
    await page.getByRole("group", { name }).getByLabel("Rating 4 of 5").locator("xpath=..").click();
  }
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/responses\/\d+$/);
  await page.getByRole("button", { name: "Logout" }).click();
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  await page.goto(`/owner/surveys/${surveyId}/summary`);
  await expect(page.getByRole("heading", { name: "Survey summary" })).toBeVisible();
  await expect(page.getByText("Moved question", { exact: true })).toBeVisible();
  await expect(page.getByText("Edited question", { exact: true })).toBeVisible();
});
