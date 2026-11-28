import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test("TEST-247 downloads a saved identified response and recovers from a failed request", async ({ page, browser }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  const coursesResponse = await page.request.get("/api/owner/courses");
  expect(coursesResponse.ok()).toBeTruthy();
  const { courses } = await coursesResponse.json();
  const course = (courses as { id: number; code: string }[]).find(item => item.code === "CPE334");
  expect(course).toBeDefined();
  const questionText = "CSV export browser check";
  const created = await page.request.post("/api/owner/surveys", { data: {
    courseId: course!.id,
    title: `Identified CSV ${Date.now()}`,
    questions: [{ prompt: questionText, type: "RATING" }]
  } });
  expect(created.status()).toBe(201);
  const { survey } = await created.json();
  expect((await page.request.post(`/api/owner/surveys/${survey.id}/publish`)).ok()).toBeTruthy();

  const studentContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const student = await studentContext.newPage();
    await signIn(student, "student1@classpulse.test", seedPassword());
    await expect(student).toHaveURL(/\/surveys$/);
    const submitted = await student.request.post(`/api/surveys/${survey.id}/responses`, { data: {
      answers: [{ questionId: survey.questions[0].id, ratingValue: 4 }]
    } });
    expect(submitted.status()).toBe(201);
  } finally {
    await studentContext.close();
  }

  await page.goto(`/owner/surveys/${survey.id}/summary`);
  await expect(page.getByLabel("Response count: 1")).toBeVisible();
  await expect(page.getByText("This CSV includes respondent names and emails.")).toBeVisible();
  const downloadButton = page.getByRole("button", { name: "Download CSV" });
  const exportPath = `**/api/owner/surveys/${survey.id}/export.csv`;
  let releaseRequest!: () => void;
  const held = new Promise<void>(resolve => { releaseRequest = resolve; });
  await page.route(exportPath, async route => {
    await held;
    await route.fulfill({ status: 503, json: { error: { message: "CSV is temporarily unavailable." } } });
  }, { times: 1 });

  await downloadButton.focus();
  await downloadButton.press("Enter");
  await expect(downloadButton).toBeDisabled();
  await expect(page.getByRole("status")).toContainText("Preparing CSV");
  releaseRequest();
  await expect(page.getByRole("alert")).toContainText("CSV is temporarily unavailable.");
  await expect(page.getByLabel("Response count: 1")).toBeVisible();

  const downloaded = page.waitForEvent("download");
  await downloadButton.focus();
  await downloadButton.press("Enter");
  const file = await downloaded;
  expect(file.suggestedFilename()).toBe(`classpulse-survey-${survey.id}.csv`);
  const savedCsv = await readFile((await file.path())!, "utf8");
  expect(savedCsv).toContain("student1@classpulse.test");
  expect(savedCsv).toContain(`,${questionText},RATING,4\r\n`);
});
