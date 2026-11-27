import { randomUUID } from "node:crypto";
import { expect, test, type APIRequestContext } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 45_000 });

type Survey = { id: number; publishedAt: string; closedAt: string | null; statusVersion: number; questions: { id: number }[] };

async function login(api: APIRequestContext, email: string) {
  expect((await api.post("/api/auth/login", { data: { email, password: seedPassword() } })).status()).toBe(200);
}

async function createPublished(owner: APIRequestContext): Promise<Survey> {
  const courses = (await (await owner.get("/api/owner/courses")).json()).courses as { id: number; code: string }[];
  const created = await owner.post("/api/owner/surveys", { data: {
    courseId: courses.find(course => course.code === "CPE334")!.id,
    title: "Lab7 browser " + randomUUID(),
    questions: [{ prompt: "Reopening preserved rating", type: "RATING" }]
  } });
  expect(created.status()).toBe(201);
  const id = (await created.json()).survey.id as number;
  const published = await owner.post(`/api/owner/surveys/${id}/publish`);
  expect(published.status()).toBe(200);
  return (await published.json()).survey;
}

test("TEST-113 reopening persists history and preserves answers, uniqueness and owner access", async ({ page, playwright, baseURL }, testInfo) => {
  const student1 = await playwright.request.newContext({ baseURL });
  const foreign = await playwright.request.newContext({ baseURL });
  try {
    await signIn(page, "ann.lee@classpulse.test", seedPassword());
    await expect(page).toHaveURL(/\/owner$/);
    await login(student1, "student1@classpulse.test");
    await login(foreign, "ben.kim@classpulse.test");
    const original = await createPublished(page.request);
    const url = `/api/owner/surveys/${original.id}`;
    const body = { answers: [{ questionId: original.questions[0].id, ratingValue: 4 }] };
    const submitted = await student1.post(`/api/surveys/${original.id}/responses`, { data: body });
    expect(submitted.status()).toBe(201);
    const responseId = (await submitted.json()).response.id as number;
    const beforeResponse = await (await student1.get(`/api/responses/${responseId}`)).json();
    const beforeSummary = (await (await page.request.get(`${url}/summary`)).json()).summary;
    const closed = await page.request.post(`${url}/close`);
    expect(closed.status()).toBe(200);
    const priorClosedAt = (await closed.json()).survey.closedAt;

    await page.goto(`/owner/surveys/${original.id}`);
    await expect(page.getByRole("button", { name: "Reopen", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Reopen", exact: true }).click();
    await page.getByLabel("Reason for reopening").fill("short");
    await page.getByRole("button", { name: "Confirm reopen", exact: true }).click();
    await expect(page.getByText("Enter a reason of 10 to 300 characters", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Cancel reopen", exact: true }).click();
    expect((await (await page.request.get(url)).json()).survey.statusVersion).toBe(2);
    await page.getByRole("button", { name: "Reopen", exact: true }).click();
    const reason = "Extra class <b>literal reason</b>";
    await page.getByLabel("Reason for reopening").fill(reason);
    await page.getByRole("button", { name: "Confirm reopen", exact: true }).click();
    await expect(page.getByRole("button", { name: "Close", exact: true })).toBeVisible();
    await page.reload();
    const history = page.getByRole("region", { name: "Lifecycle history" });
    await expect(history.getByText(reason, { exact: true })).toBeVisible();
    await expect(history.locator("b")).toHaveCount(0);
    await expect(history.getByRole("listitem")).toHaveCount(3);
    const reopened = (await (await page.request.get(url)).json()).survey;
    expect(reopened).toMatchObject({ status: "PUBLISHED", statusVersion: 3, publishedAt: original.publishedAt, closedAt: null });
    const events = (await (await page.request.get(`${url}/lifecycle`)).json()).events;
    expect(events[0]).toMatchObject({ action: "REOPEN", version: 3, reason, previousClosedAt: priorClosedAt });
    expect(await (await student1.get(`/api/responses/${responseId}`)).json()).toEqual(beforeResponse);
    expect((await (await page.request.get(`${url}/summary`)).json()).summary).toEqual(beforeSummary);
    const duplicate = await student1.post(`/api/surveys/${original.id}/responses`, { data: body });
    expect(duplicate.status()).toBe(409);
    expect((await duplicate.json()).error.code).toBe("ALREADY_RESPONDED");
    expect((await foreign.get(`${url}/lifecycle`)).status()).toBe(404);
    expect((await foreign.post(`${url}/reopen`, { data: { reason, expectedVersion: 3 } })).status()).toBe(404);
    await page.screenshot({ path: testInfo.outputPath("reopened-owner-history.png"), fullPage: true });

    // A different eligible student can answer through the actual browser/server.
    await page.getByRole("button", { name: "Logout", exact: true }).click();
    await expect(page).toHaveURL(/\/login$/);
    await signIn(page, "student2@classpulse.test", seedPassword());
    await expect(page).toHaveURL(/\/surveys$/);
    await page.goto(`/surveys/${original.id}`);
    await expect(page.getByText("Identified survey — your name is stored with your answers", { exact: true })).toBeVisible();
    await page.getByLabel("Rating 5 of 5").locator("xpath=..").click();
    await page.getByRole("button", { name: "Submit", exact: true }).click();
    await expect(page).toHaveURL(/\/responses\/\d+$/);
    await expect(page.getByText("Thanks — your response is in.", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText("Thanks — your response is in.", { exact: true })).toBeVisible();
    await page.screenshot({ path: testInfo.outputPath("eligible-student-confirmation.png"), fullPage: true });
  } finally {
    await Promise.all([student1.dispose(), foreign.dispose()]);
  }
});

test("TEST-113 stale browser tab keeps reason and requires explicit reload before retry", async ({ page, context }, testInfo) => {
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  const original = await createPublished(page.request);
  const url = `/api/owner/surveys/${original.id}`;
  expect((await page.request.post(`${url}/close`)).status()).toBe(200);
  await page.goto(`/owner/surveys/${original.id}`);
  await page.getByRole("button", { name: "Reopen", exact: true }).click();
  const reason = "Preserve this second-tab intention";
  await page.getByLabel("Reason for reopening").fill(reason);
  const other = await context.newPage();
  try {
    await other.goto(`/owner/surveys/${original.id}`);
    await other.getByRole("button", { name: "Reopen", exact: true }).click();
    await other.getByLabel("Reason for reopening").fill("First tab deliberate reopen");
    await other.getByRole("button", { name: "Confirm reopen", exact: true }).click();
    await expect(other.getByRole("button", { name: "Close", exact: true })).toBeVisible();
    await other.getByRole("button", { name: "Close", exact: true }).click();
    await expect(other.getByRole("button", { name: "Reopen", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Confirm reopen", exact: true }).click();
    await expect(page.getByRole("button", { name: "Reload survey", exact: true })).toBeVisible();
    await expect(page.getByLabel("Reason for reopening")).toHaveValue(reason);
    await expect(page.getByRole("button", { name: "Confirm reopen", exact: true })).toBeDisabled();
    expect((await (await page.request.get(url)).json()).survey).toMatchObject({ status: "CLOSED", statusVersion: 4 });
    expect((await (await page.request.get(`${url}/lifecycle`)).json()).events).toHaveLength(4);
    await page.screenshot({ path: testInfo.outputPath("stale-tab-explicit-reload.png"), fullPage: true });
    await page.getByRole("button", { name: "Reload survey", exact: true }).click();
    await expect(page.getByRole("button", { name: "Confirm reopen", exact: true })).toBeEnabled();
    await expect(page.getByLabel("Reason for reopening")).toHaveValue(reason);
    await page.getByRole("button", { name: "Confirm reopen", exact: true }).click();
    await expect(page.getByRole("button", { name: "Close", exact: true })).toBeVisible();
    expect((await (await page.request.get(url)).json()).survey.statusVersion).toBe(5);
    await page.reload();
    await expect(page.getByRole("region", { name: "Lifecycle history" }).getByText(reason, { exact: true })).toBeVisible();
  } finally {
    await other.close();
  }
});
