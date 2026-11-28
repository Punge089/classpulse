import { expect, test } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ timezoneId: "Asia/Bangkok" });

test("TEST-193 saves local closing time, preserves it at publication and clears it before reopening", async ({ page }) => {
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  const courses = await page.request.get("/api/owner/courses");
  expect(courses.ok()).toBe(true);
  const { courses: owned } = await courses.json();
  const course = (owned as { id: number; code: string }[]).find(row => row.code === "CPE334");
  expect(course).toBeDefined();
  const created = await page.request.post("/api/owner/surveys", { data: {
    courseId: course!.id,
    title: `Scheduled survey ${Date.now()}`,
    questions: [{ prompt: "How was this class?", type: "RATING" }]
  } });
  expect(created.status()).toBe(201);
  const { survey } = await created.json();
  await page.goto(`/owner/surveys/${survey.id}`);

  await page.getByLabel("Closing time").fill("2030-11-28T01:25");
  await page.getByRole("button", { name: "Save closing time" }).click();
  await expect.poll(async () => {
    const result = await page.request.get(`/api/owner/surveys/${survey.id}`);
    return (await result.json()).survey.closesAt;
  }).toBe("2030-11-27T18:25:00.000Z");
  await page.reload();
  await expect(page.getByLabel("Closing time")).toHaveValue("2030-11-28T01:25");
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Close this survey before changing its deadline")).toBeVisible();
  await expect(page.getByLabel("Closing time")).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByLabel("Closing time")).toHaveValue("2030-11-28T01:25");
  await page.getByRole("button", { name: "Clear closing time" }).click();
  await page.getByRole("button", { name: "Save closing time" }).click();
  await expect.poll(async () => {
    const result = await page.request.get(`/api/owner/surveys/${survey.id}`);
    return (await result.json()).survey.closesAt;
  }).toBeNull();
  await page.getByRole("button", { name: "Reopen", exact: true }).click();
  await page.getByLabel("Reason for reopening").fill("Open with no scheduled cutoff");
  await page.getByRole("button", { name: "Confirm reopen" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
});
