import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 30_000 });

test("TEST-32 a respondent submits an identified survey once and sees confirmation", async ({ page }) => {
  const title = "E2E response " + Date.now();
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/, { timeout: 5_000 });

  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill("How was the pace of the lectures?");
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByLabel("Question 2 text").fill("Would you recommend this course?");
  await page.getByLabel("Question 2 type").selectOption("SINGLE_CHOICE");
  await page.getByLabel("Question 2 option 1").fill("Yes");
  await page.getByLabel("Question 2 option 2").fill("No");
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/, { timeout: 5_000 });
  const surveyId = Number(page.url().match(/\/owner\/surveys\/(\d+)$/)?.[1]);
  expect(Number.isInteger(surveyId)).toBe(true);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible({ timeout: 5_000 });
  await page.getByRole("button", { name: "Logout" }).click();

  await signIn(page, "student1@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/surveys$/, { timeout: 5_000 });
  const surveyRow = page.getByRole("listitem").filter({ hasText: title });
  await expect(surveyRow).toBeVisible();
  await expect(surveyRow.getByText("Submitted", { exact: true })).toHaveCount(0);
  await surveyRow.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(new RegExp(`/surveys/${surveyId}$`));

  const notice = page.getByText("Identified survey — your name is stored with your answers", { exact: true });
  await expect(notice).toBeVisible();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.getByLabel("Rating 4 of 5").check();
  await page.getByLabel("Yes", { exact: true }).check();

  let submitRequests = 0;
  page.on("request", request => {
    if (request.method() === "POST" && request.url().endsWith(`/api/surveys/${surveyId}/responses`)) {
      submitRequests += 1;
    }
  });
  await page.route(`**/api/surveys/${surveyId}/responses`, async route => {
    await new Promise(resolve => setTimeout(resolve, 300));
    await route.continue();
  });

  const submit = page.getByRole("button", { name: "Submit", exact: true });
  await Promise.all([submit.click({ force: true }), submit.click({ force: true })]);
  await expect(submit).toBeDisabled();
  await expect(page).toHaveURL(/\/responses\/\d+$/, { timeout: 5_000 });
  await expect(page.getByText("Thanks — your response is in.", { exact: true })).toBeVisible();
  await expect(page.locator("time")).toBeVisible();
  expect(submitRequests).toBe(1);

  // A later explicit retry receives the API's duplicate response; the page does not auto-resubmit.
  await page.goto(`/surveys/${surveyId}`);
  await page.getByLabel("Rating 4 of 5").check();
  await page.getByLabel("Yes", { exact: true }).check();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("You have already submitted this survey");
  await expect(page.getByRole("button", { name: "Submit", exact: true })).toBeDisabled();
  expect(submitRequests).toBe(2);

  await page.getByRole("link", { name: "Back to surveys" }).click();
  await expect(surveyRow.getByText("Submitted", { exact: true })).toBeVisible({ timeout: 5_000 });
});
