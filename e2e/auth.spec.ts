import { expect, test } from "@playwright/test";
import { expectNavbar, seedPassword, signIn } from "./helpers";

// Needs the development database seeded with `npm run prisma:seed` (README) using the same SEED_PASSWORD.
test.use({ actionTimeout: 5_000 });
test.describe.configure({ timeout: 20_000 });

test("TEST-08 bad credentials show the server's error and stay on /login", async ({ page }) => {
  await signIn(page, "ann.lee@classpulse.test", "definitely-not-the-password");
  await expect(page.getByRole("alert")).toContainText(/invalid email or password/i, { timeout: 5_000 });
  await expect(page).toHaveURL(/\/login$/);
});

test("TEST-09 owner lands on /owner, keeps identity on reload, and Logout returns to /login", async ({ page }) => {
  await signIn(page, "ann.lee@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/owner$/, { timeout: 5_000 });
  await expectNavbar(page, "Dr. Ann Lee · OWNER");

  await page.reload();
  await expect(page).toHaveURL(/\/owner$/);
  await expectNavbar(page, "Dr. Ann Lee · OWNER");

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 5_000 });
});

test("TEST-09 respondent lands on /surveys, keeps identity on reload, and Logout returns to /login", async ({ page }) => {
  await signIn(page, "student1@classpulse.test", seedPassword());
  await expect(page).toHaveURL(/\/surveys$/, { timeout: 5_000 });
  await expectNavbar(page, "Student 1 · RESPONDENT");

  await page.reload();
  await expect(page).toHaveURL(/\/surveys$/);
  await expectNavbar(page, "Student 1 · RESPONDENT");

  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page).toHaveURL(/\/login$/, { timeout: 5_000 });
});
