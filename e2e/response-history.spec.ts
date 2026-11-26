import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 45_000 });

test("TEST-179 respondent can read and revisit a saved response after survey closure", async ({ page, playwright, baseURL }) => {
  const title = "F-09 history " + Date.now();
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill("History answer");
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  const surveyId = Number(page.url().match(/\/owner\/surveys\/(\d+)$/)?.[1]);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await signIn(page, "student1@classpulse.test", seedPassword());
  await page.goto(`/surveys/${surveyId}`);
  await expect(page.getByText("Identified survey — your name is stored with your answers", { exact: true })).toBeVisible();
  await page.getByLabel("Rating 4 of 5").locator("xpath=..").click();
  await page.getByRole("button", { name: "Submit" }).click();
  await expect(page).toHaveURL(/\/responses\/\d+$/);
  const responseId = Number(page.url().match(/\/responses\/(\d+)$/)?.[1]);
  await page.getByRole("link", { name: /my responses/i }).click();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await page.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(new RegExp(`/my-responses/${responseId}$`));
  await expect(page.getByText("History answer", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /back to my responses/i }).click();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
});
