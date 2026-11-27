import { expect, test, type Locator, type Page } from "@playwright/test";
import { seedPassword, signIn } from "./helpers";

async function expectWithinViewport(page: Page, controls: Locator[]): Promise<void> {
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  await expect.poll(() => page.evaluate(() => {
    const root = document.documentElement;
    return root.scrollWidth - root.clientWidth;
  }), { message: "document horizontal overflow in CSS pixels" }).toBeLessThanOrEqual(1);

  const width = await page.evaluate(() => document.documentElement.clientWidth);
  for (const control of controls) {
    await expect(control).toBeVisible();
    const box = await control.boundingBox();
    if (!box) throw new Error("Expected the visible control to have a bounding box");
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
  }
}

for (const width of [375, 1280]) {
  test(`TEST-285 owner can sign in and save a long titled draft at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 812 });
    await page.goto("/login");
    const email = page.getByLabel("Email");
    const password = page.getByLabel("Password");
    const signIn = page.getByRole("button", { name: "Sign in" });
    await expectWithinViewport(page, [email, password, signIn]);

    await email.fill("ann.lee@classpulse.test");
    await password.fill(seedPassword());
    await password.press("Tab");
    await expect(signIn).toBeFocused();
    await signIn.press("Enter");
    await expect(page).toHaveURL(/\/owner$/);
    await expect(page.getByRole("heading", { name: "Your surveys" })).toBeVisible();
    await page.getByRole("link", { name: "New survey" }).click();

    const title = `Feedback on practical exercises, project supervision and assessment instructions for this semester ${width}px`;
    const course = page.getByLabel("Course", { exact: true });
    const titleInput = page.getByLabel("Title", { exact: true });
    const prompt = page.getByLabel("Question 1 text");
    const create = page.getByRole("button", { name: "Create survey" });
    await course.selectOption({ label: "CPE334 — Software Engineering" });
    await titleInput.fill(title);
    await prompt.fill("How well did the assignment instructions explain the assessment criteria?");
    await expectWithinViewport(page, [course, titleInput, prompt, create]);
    await create.click();

    await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
    const heading = page.getByRole("heading", { name: title, exact: true });
    await expectWithinViewport(page, [heading, page.getByRole("button", { name: "Publish" })]);
    await page.reload();
    await expect(heading).toBeVisible();
  });
}

const surveyLists = [
  {
    role: "owner", account: "ann.lee@classpulse.test", url: /\/owner$/,
    api: "**/api/owner/surveys", heading: "Your surveys", loading: "Loading your surveys…",
    empty: "No surveys yet — create your first one."
  },
  {
    role: "respondent", account: "student1@classpulse.test", url: /\/surveys$/,
    api: "**/api/surveys", heading: "Available surveys", loading: "Loading available surveys…",
    empty: "No surveys available right now."
  }
];

for (const list of surveyLists) {
  test(`TEST-286 ${list.role} list presents loading, empty and API failure at 375px`, async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    let releaseResponse!: () => void;
    const pending = new Promise<void>(resolve => { releaseResponse = resolve; });
    await page.route(list.api, async route => {
      await pending;
      await route.fulfill({ json: { surveys: [] } });
    });
    try {
      await signIn(page, list.account, seedPassword());
      await expect(page).toHaveURL(list.url);
      const status = page.getByRole("status");
      await expect(status).toContainText(list.loading);
      await expect(page.getByText(list.empty)).toHaveCount(0);
      await expectWithinViewport(page, [page.getByRole("heading", { name: list.heading }), status]);
    } finally {
      releaseResponse();
    }

    await expectWithinViewport(page, [page.getByText(list.empty)]);
    await expect(page.getByRole("status")).toHaveCount(0);
    await page.unroute(list.api);
    await page.route(list.api, route => route.fulfill({
      status: 503,
      json: { error: { code: "SERVICE_UNAVAILABLE", message: "Survey service temporarily unavailable" } }
    }));
    await page.reload();
    const alert = page.getByRole("alert");
    await expect(alert).toHaveText("Survey service temporarily unavailable");
    await expectWithinViewport(page, [alert]);
    await expect(page.getByText(list.empty)).toHaveCount(0);
  });
}

test("TEST-287 respondent sees the mode and completes an identified form by keyboard at 375px", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  await page.getByRole("link", { name: "New survey" }).click();

  const title = "Keyboard survey validation";
  const question = "How clear were the assignment instructions?";
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Question 1 text").fill(question);
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  const surveyId = new URL(page.url()).pathname.split("/").at(-1);
  await page.getByRole("button", { name: "Publish" }).click();
  await expect(page.getByText("Published", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/);

  await signIn(page, "student1@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/surveys$/);
  await page.goto("/surveys/" + surveyId);
  const notice = page.getByRole("note").filter({ hasText: "Identified survey" });
  const submit = page.getByRole("button", { name: "Submit", exact: true });
  await expect(notice).toHaveText("Identified survey — your name is stored with your answers");
  await expectWithinViewport(page, [notice, submit]);

  await submit.focus();
  await expect(submit).toBeFocused();
  await page.keyboard.press("Enter");
  const alert = page.getByRole("alert");
  await expect(alert).toContainText(/Required question \d+ is missing/);
  await expectWithinViewport(page, [alert]);

  const firstRating = page.getByLabel("Rating 1 of 5");
  const secondRating = page.getByLabel("Rating 2 of 5");
  await firstRating.focus();
  await expect(firstRating).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("ArrowRight");
  await expect(secondRating).toBeChecked();
  await expect(secondRating).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(submit).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/responses\/\d+$/);
  await expect(page.getByText("Thanks — your response is in.", { exact: true })).toBeVisible();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(question, { exact: true })).toBeVisible();
});

test("TEST-285 staged F-06 draft editor fits 375px and preserves save and cancel behavior", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/);
  await page.getByRole("link", { name: "New survey" }).click();
  const initial = "How clear were the instructions?";
  const saved = "How clear were the assignment instructions and the feedback on your practical exercise?";
  await page.getByLabel("Course", { exact: true }).selectOption({ label: "CPE334 — Software Engineering" });
  await page.getByLabel("Title", { exact: true }).fill("Mobile draft changes");
  await page.getByLabel("Question 1 text").fill(initial);
  await page.getByRole("button", { name: "Create survey" }).click();
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  await page.getByRole("link", { name: "Edit questions" }).click();

  const prompt = page.getByLabel("Question 1 text", { exact: true });
  const type = page.getByLabel("Question 1 type", { exact: true });
  const save = page.getByRole("button", { name: "Save questions" });
  const cancel = page.getByRole("link", { name: "Cancel and return" });
  await expect(prompt).toHaveValue(initial);
  await expectWithinViewport(page, [prompt, type, save, cancel]);
  await prompt.fill(saved);
  await save.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  await page.getByRole("link", { name: "Edit questions" }).click();
  await expect(prompt).toHaveValue(saved);
  await prompt.fill("Discard this change");
  await cancel.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/owner\/surveys\/\d+$/);
  await page.reload();
  await page.getByRole("link", { name: "Edit questions" }).click();
  await expect(prompt).toHaveValue(saved);
});
