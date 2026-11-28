import { expect, test } from "@playwright/test";
import { getPrisma } from "../server/src/prisma";
import { seedPassword, signIn } from "./helpers";

test("TEST-212 an owner restricts a survey and observes the current roster rate", async ({ page, browser }) => {
  const url = new URL(process.env.DATABASE_URL ?? "postgresql://localhost/invalid");
  expect(["localhost", "127.0.0.1", "[::1]"]).toContain(url.hostname);
  expect(url.pathname).toBe("/classpulse_test");
  const db = getPrisma();
  const [database] = await db.$queryRaw<{ name: string }[]>`SELECT current_database() AS name`;
  expect(database.name).toBe("classpulse_test");
  const [owner, first, second] = await Promise.all(
    ["ann.lee@classpulse.test", "student1@classpulse.test", "student2@classpulse.test"].map(email =>
      db.user.findUniqueOrThrow({ where: { email } }))
  );
  const course = await db.course.create({
    data: { code: `TEST212-${Date.now()}`, title: "Section eligibility test", ownerId: owner.id }
  });
  try {
    const [alpha, beta] = await Promise.all([
      db.courseSection.create({ data: { courseId: course.id, code: "A", label: "Alpha" } }),
      db.courseSection.create({ data: { courseId: course.id, code: "B", label: "Beta" } })
    ]);
    await db.$executeRaw`INSERT INTO "Enrollment" ("courseId", "userId", "sectionId") VALUES
      (${course.id}, ${first.id}, ${alpha.id}), (${course.id}, ${second.id}, ${beta.id})`;

    await signIn(page, owner.email, seedPassword());
    await expect(page).toHaveURL(/\/owner$/);
    const created = await page.request.post("/api/owner/surveys", { data: {
      courseId: course.id, title: "Restricted rating survey",
      questions: [{ prompt: "How was this class?", type: "RATING" }]
    } });
    expect(created.status()).toBe(201);
    const { survey } = await created.json();
    await page.goto(`/owner/surveys/${survey.id}`);
    await page.getByLabel("Selected sections", { exact: true }).check();
    await page.getByRole("checkbox", { name: "A · Alpha" }).check();
    await page.getByRole("button", { name: "Save audience" }).click();
    await expect.poll(async () => {
      const response = await page.request.get(`/api/owner/surveys/${survey.id}`);
      return (await response.json()).survey.sectionIds;
    }).toEqual([alpha.id]);
    await page.reload();
    await expect(page.getByRole("checkbox", { name: "A · Alpha" })).toBeChecked();
    await page.getByRole("button", { name: "Publish" }).click();
    await expect(page.getByText("Restricted to selected sections")).toBeVisible();

    const submit = async (email: string) => {
      const context = await browser.newContext({ baseURL: new URL(page.url()).origin });
      try {
        const student = await context.newPage();
        await signIn(student, email, seedPassword());
        await expect(student).toHaveURL(/\/surveys$/);
        return await student.request.post(`/api/surveys/${survey.id}/responses`, { data: {
          answers: [{ questionId: survey.questions[0].id, ratingValue: 4 }]
        } }).then(response => response.status());
      } finally {
        await context.close();
      }
    };
    expect(await submit(second.email)).toBe(403);
    expect(await submit(first.email)).toBe(201);
    await page.getByRole("link", { name: "View summary" }).click();
    await expect(page.getByLabel("Response count: 1")).toBeVisible();
    await expect(page.getByRole("region", { name: "Current roster response rate" })).toContainText("100% · 1 of 1");
  } finally {
    await db.$transaction([
      db.response.deleteMany({ where: { survey: { courseId: course.id } } }),
      db.surveyLifecycleEvent.deleteMany({ where: { survey: { courseId: course.id } } }),
      db.survey.deleteMany({ where: { courseId: course.id } }),
      db.enrollment.deleteMany({ where: { courseId: course.id } }),
      db.course.delete({ where: { id: course.id } })
    ]);
    await db.$disconnect();
  }
});
