import { expect, test, type APIRequestContext, type Page } from "@playwright/test";
import { expectNavbar, seedPassword, signIn } from "./helpers";

// Needs the development database seeded with `npm --prefix server run prisma:seed` (README). Each run creates surveys
// with run-unique titles, so repeated runs never collide; Sprint 1 has no delete route, so they accumulate.
test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 45_000 });

const RATING_PROMPT = "How was the pace of the lectures?";
const CHOICE_PROMPT = "Would you recommend this course?";

async function logout(page: Page): Promise<void> {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);
}

/** The aggregate shown for the rating and the choice question of the journey survey. */
async function expectSummary(page: Page, expected: {
  count: number; average: string; ratingCounts: Record<string, string>; choice: Record<string, number>;
}): Promise<void> {
  await expect(page.getByLabel(`Response count: ${expected.count}`)).toBeVisible();
  const rating = page.locator("article").filter({ hasText: RATING_PROMPT });
  await expect(rating.getByText("Average:")).toContainText(expected.average);
  for (const [star, count] of Object.entries(expected.ratingCounts)) {
    await expect(rating.getByText(`Rating ${star}`, { exact: true }).locator("xpath=following-sibling::dd")).toHaveText(count);
  }
  const choice = page.locator("article").filter({ hasText: CHOICE_PROMPT });
  for (const [label, count] of Object.entries(expected.choice)) {
    await expect(choice.getByRole("img", { name: `${label}: ${count} responses` })).toBeVisible();
  }
}

test("TEST-40 full Sprint 1 journey: owner publishes, student answers once, owner reads the aggregate", async ({ page }) => {
  const title = "Lecture feedback W10 " + Date.now();
  const password = seedPassword();

  // 1. The owner creates the survey and publishes it.
  await signIn(page, "ann.lee@classpulse.test", password);
  await expect(page).toHaveURL(/\/owner$/);
  await expectNavbar(page, "Dr. Ann Lee · OWNER");
  await page.getByRole("link", { name: "New survey" }).click();
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill(RATING_PROMPT);
  await page.getByRole("button", { name: "Add question" }).click();
  await page.getByLabel("Question 2 text").fill(CHOICE_PROMPT);
  await page.getByLabel("Question 2 type").selectOption("SINGLE_CHOICE");
  await page.getByLabel("Question 2 option 1").fill("Yes");
  await page.getByLabel("Question 2 option 2").fill("No");
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  const surveyId = Number(page.url().match(/\/owner\/surveys\/(\d+)$/)?.[1]);
  expect(Number.isInteger(surveyId)).toBe(true);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();

  // 2. Nothing has been answered yet: the summary says so.
  await page.getByRole("link", { name: "View summary" }).click();
  await expect(page).toHaveURL(new RegExp(`/owner/surveys/${surveyId}/summary$`));
  await expect(page.getByText("No responses yet")).toBeVisible();
  await expect(page.getByLabel("Response count: 0")).toBeVisible();
  await logout(page);

  // 3. The student finds the survey, reads the notice, answers once and sees the confirmation.
  await signIn(page, "student1@classpulse.test", password);
  await expect(page).toHaveURL(/\/surveys$/);
  await expectNavbar(page, "Student 1 · RESPONDENT");
  const listRow = page.getByRole("listitem").filter({ hasText: title });
  await expect(listRow).toBeVisible();
  await expect(listRow.getByText("Submitted", { exact: true })).toHaveCount(0);
  await listRow.getByRole("link", { name: title }).click();
  await expect(page).toHaveURL(new RegExp(`/surveys/${surveyId}$`));
  await expect(page.getByText("Identified survey — your name is stored with your answers", { exact: true })).toBeVisible();
  const ratingFour = page.getByLabel("Rating 4 of 5");
  await ratingFour.locator("xpath=..").click();
  await expect(ratingFour).toBeChecked();
  await page.getByLabel("Yes", { exact: true }).check();
  await page.getByRole("button", { name: "Submit", exact: true }).click();
  await expect(page).toHaveURL(/\/responses\/\d+$/);
  await expect(page.getByText("Thanks — your response is in.", { exact: true })).toBeVisible();
  await expect(page.locator("time")).toBeVisible();
  await page.getByRole("link", { name: "Back to surveys" }).first().click();
  await expect(page.getByRole("listitem").filter({ hasText: title }).getByText("Submitted", { exact: true })).toBeVisible();
  await logout(page);

  // 4. The owner reads the aggregate; a reload shows the same stored numbers; no respondent identity is on the page.
  await signIn(page, "ann.lee@classpulse.test", password);
  await page.getByRole("listitem").filter({ hasText: title }).getByRole("link", { name: title }).click();
  await page.getByRole("link", { name: "View summary" }).click();
  await expect(page).toHaveURL(new RegExp(`/owner/surveys/${surveyId}/summary$`));
  const expected = { count: 1, average: "4.00", ratingCounts: { "4": "1", "5": "0" }, choice: { Yes: 1, No: 0 } };
  await expectSummary(page, expected);
  await page.reload();
  await expectSummary(page, expected);
  await expect(page.getByText("No responses yet")).toHaveCount(0);
  const pageText = await page.locator("main").innerText();
  expect(pageText).not.toMatch(/student1@classpulse\.test|Student 1/);
});

// ---- TEST-38: the owner summary page (AC-34). The survey and the answers are set up through the API; the page is the UI under test.

async function apiLogin(context: APIRequestContext, email: string, password: string): Promise<void> {
  const response = await context.post("/api/auth/login", { data: { email, password } });
  expect(response.status(), `login as ${email}`).toBe(200);
}

type ApiQuestion = { id: number; type: string; options: Array<{ id: number; label: string }> };

async function submit(context: APIRequestContext, surveyId: number, rating: number, choiceLabel: string): Promise<void> {
  const detail = await (await context.get(`/api/surveys/${surveyId}`)).json();
  const questions: ApiQuestion[] = detail.survey.questions;
  const ratingQuestion = questions.find(q => q.type === "RATING")!;
  const choiceQuestion = questions.find(q => q.type === "SINGLE_CHOICE")!;
  const option = choiceQuestion.options.find(o => o.label === choiceLabel)!;
  const response = await context.post(`/api/surveys/${surveyId}/responses`, {
    data: { answers: [{ questionId: ratingQuestion.id, ratingValue: rating }, { questionId: choiceQuestion.id, optionId: option.id }] }
  });
  expect(response.status()).toBe(201);
}

test("TEST-38 the owner summary page shows the empty state, then counts and averages from two respondents", async ({ page, playwright, baseURL }) => {
  const title = "Summary check " + Date.now();
  const password = seedPassword();
  const owner = await playwright.request.newContext({ baseURL });
  const student1 = await playwright.request.newContext({ baseURL });
  const student2 = await playwright.request.newContext({ baseURL });
  try {
    await apiLogin(owner, "ann.lee@classpulse.test", password);
    await apiLogin(student1, "student1@classpulse.test", password);
    await apiLogin(student2, "student2@classpulse.test", password);

    const courses = (await (await owner.get("/api/owner/courses")).json()).courses as Array<{ id: number; code: string }>;
    const created = await owner.post("/api/owner/surveys", {
      data: {
        courseId: courses.find(c => c.code === "CPE334")!.id,
        title,
        questions: [
          { prompt: RATING_PROMPT, type: "RATING" },
          { prompt: CHOICE_PROMPT, type: "SINGLE_CHOICE", options: ["Yes", "No"] }
        ]
      }
    });
    expect(created.status()).toBe(201);
    const surveyId: number = (await created.json()).survey.id;
    expect((await owner.post(`/api/owner/surveys/${surveyId}/publish`)).status()).toBe(200);

    // Empty state, seen in the browser as the owner.
    await signIn(page, "ann.lee@classpulse.test", password);
    await expect(page).toHaveURL(/\/owner$/);
    await page.goto(`/owner/surveys/${surveyId}/summary`);
    await expect(page.getByRole("heading", { name: "Survey summary" })).toBeVisible();
    await expect(page.getByText("No responses yet")).toBeVisible();
    await expect(page.getByLabel("Response count: 0")).toBeVisible();
    await expect(page.locator("article").filter({ hasText: RATING_PROMPT }).getByText("Average:")).toContainText("—");

    // Two students answer (4 / Yes and 5 / No); the same page now shows the aggregate.
    await submit(student1, surveyId, 4, "Yes");
    await submit(student2, surveyId, 5, "No");
    await page.reload();
    await expectSummary(page, { count: 2, average: "4.50", ratingCounts: { "4": "1", "5": "1", "1": "0" }, choice: { Yes: 1, No: 1 } });
    await expect(page.getByText("No responses yet")).toHaveCount(0);
  } finally {
    await Promise.all([owner.dispose(), student1.dispose(), student2.dispose()]);
  }
});
