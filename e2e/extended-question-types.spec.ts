import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 30_000 });

test("TEST-150/151 creates, edits, answers and summarizes TEXT and MULTI_CHOICE", async ({ page }) => {
  const title = "F-07 extended " + Date.now();
  const textAnswer = "Worked examples made the topic clear.";
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/, { timeout: 5_000 });
  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill("What helped you learn?");
  await page.getByLabel("Question 1 type").selectOption("TEXT");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByLabel("Question 2 text").fill("Which formats helped?");
  await page.getByLabel("Question 2 type").selectOption("MULTI_CHOICE");
  await page.getByLabel("Question 2 option 1").fill("Worked examples");
  await page.getByLabel("Question 2 option 2").fill("Discussion");
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  const surveyId = Number(page.url().match(/\/owner\/surveys\/(\d+)$/)?.[1]);
  expect(Number.isInteger(surveyId)).toBe(true);
  await expect(page.getByText("Text · required")).toBeVisible();
  await expect(page.getByText("Multiple choice · required")).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "Logout" }).click();

  await signIn(page, "student1@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/surveys$/);
  await page.getByRole("link", { name: title }).click();
  await page.getByLabel("What helped you learn?").fill(textAnswer);
  await page.getByLabel("Worked examples", { exact: true }).check();
  await page.getByLabel("Discussion", { exact: true }).check();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page).toHaveURL(/\/responses\/\d+$/);
  await expect(page.getByText(textAnswer, { exact: true })).toBeVisible();
  await expect(page.getByText("Worked examples", { exact: true })).toBeVisible();
  await expect(page.getByText("Discussion", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();

  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await page.goto(`/owner/surveys/${surveyId}/summary`);
  await expect(page.getByText("What helped you learn?")).toBeVisible();
  await expect(page.getByText(/Answered:\s*1/).first()).toBeVisible();
  await expect(page.getByText("Which formats helped?")).toBeVisible();
  await expect(page.getByText("Worked examples", { exact: true })).toBeVisible();
  await expect(page.getByText(textAnswer, { exact: true })).toHaveCount(0);
});
