import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, type Page } from "@playwright/test";

/** SEED_PASSWORD from the environment or from the local (git-ignored) server/.env. Never hard-coded. */
export function seedPassword(): string {
  if (process.env.SEED_PASSWORD) return process.env.SEED_PASSWORD;
  try {
    const line = readFileSync(resolve(__dirname, "../server/.env"), "utf-8")
      .split(/\r?\n/).find(l => l.startsWith("SEED_PASSWORD="));
    if (line) return line.slice("SEED_PASSWORD=".length).trim().replace(/^["']|["']$/g, "");
  } catch {
    /* fall through to the error below */
  }
  throw new Error("Set SEED_PASSWORD (or server/.env) to the password used when seeding the development database");
}

export async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
}

export async function expectNavbar(page: Page, text: string): Promise<void> {
  await expect(page.getByRole("banner")).toContainText(text);
}
