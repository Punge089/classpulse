import { expect, test, type Locator, type Page } from "@playwright/test";
import { seedPassword } from "./helpers";

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
