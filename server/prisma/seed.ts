import "dotenv/config";
import { PrismaClient, type Prisma, type Role } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

type Account = { email: string; fullName: string; role: Role };

async function upsertUser(db: Prisma.TransactionClient, account: Account, passwordHash: string) {
  const data = { ...account, passwordHash, isActive: true };
  return db.user.upsert({ where: { email: account.email }, create: data, update: data });
}

export async function seedAccounts(db: Prisma.TransactionClient, password: string) {
  if (!password) throw new Error("Set SEED_PASSWORD before seeding ClassPulse");

  const owner1 = await upsertUser(db, {
    email: "ann.lee@classpulse.test", fullName: "Dr. Ann Lee", role: "OWNER"
  }, await hashPassword(password));
  const owner2 = await upsertUser(db, {
    email: "ben.kim@classpulse.test", fullName: "Dr. Ben Kim", role: "OWNER"
  }, await hashPassword(password));
  const [student1, student2, student3] = await Promise.all([1, 2, 3].map(async number => {
    return upsertUser(db, {
      email: "student" + number + "@classpulse.test",
      fullName: "Student " + number,
      role: "RESPONDENT"
    }, await hashPassword(password));
  }));

  const cpe334Data = { code: "CPE334", title: "Software Engineering", ownerId: owner1.id };
  const cpe231Data = { code: "CPE231", title: "Course 231", ownerId: owner2.id };
  const cpe334 = await db.course.upsert({
    where: { code: cpe334Data.code }, create: cpe334Data, update: cpe334Data
  });
  const cpe231 = await db.course.upsert({
    where: { code: cpe231Data.code }, create: cpe231Data, update: cpe231Data
  });

  for (const [userId, courseId] of [
    [student1.id, cpe334.id], [student2.id, cpe334.id], [student3.id, cpe231.id]
  ]) {
    await db.enrollment.upsert({
      where: { courseId_userId: { courseId, userId } },
      create: { courseId, userId },
      update: {}
    });
  }

  return { owner1, owner2, student1, student2, student3, cpe334, cpe231 };
}

export async function seedDevelopment(prisma: PrismaClient, password: string): Promise<void> {
  await prisma.$transaction(async db => {
    const { owner1, cpe334 } = await seedAccounts(db, password);
    const demo = { title: "Week 1 pulse", courseId: cpe334.id, ownerId: owner1.id };
    const existing = await db.survey.findFirst({
      where: { ...demo, status: "CLOSED", mode: "IDENTIFIED" },
      select: { id: true }
    });
    if (existing) return;

    const now = new Date();
    await db.survey.create({
      data: {
        ...demo, status: "CLOSED", mode: "IDENTIFIED", publishedAt: now, closedAt: now,
        questions: { create: [{ position: 1, prompt: "Pace of lectures", type: "RATING" }] }
      }
    });
  });
}

async function main() {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("Set SEED_PASSWORD before seeding ClassPulse");
  const prisma = new PrismaClient();
  try {
    await seedDevelopment(prisma, password);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : "Unable to seed ClassPulse");
    process.exitCode = 1;
  });
}
