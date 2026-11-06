import type { Course, Prisma, QuestionType, SurveyStatus, User } from "@prisma/client";
import { seedAccounts } from "../../prisma/seed";
import { getPrisma } from "../../src/prisma";

export type Fixture = {
  owner1: User;
  owner2: User;
  student1: User;
  student2: User;
  student3: User;
  cpe334: Course;
  cpe231: Course;
};

export type QuestionSpec = {
  prompt: string;
  type: QuestionType;
  required?: boolean;
  options?: string[];
};

export type SurveyWithQuestions = Prisma.SurveyGetPayload<{
  include: { questions: { include: { options: true } } };
}>;

const defaultQuestions: QuestionSpec[] = [
  { prompt: "Pace of lectures", type: "RATING" },
  { prompt: "Would you recommend it?", type: "SINGLE_CHOICE", options: ["Yes", "No"] }
];

export async function resetDb(): Promise<void> {
  const prisma = getPrisma();
  const [target] = await prisma.$queryRaw<{ name: string }[]>
    `SELECT current_database() AS name`;
  if (target?.name !== "classpulse_test") {
    throw new Error("Refusing to clear a database other than classpulse_test");
  }

  await prisma.$transaction([
    prisma.answer.deleteMany(),
    prisma.response.deleteMany(),
    prisma.questionOption.deleteMany(),
    prisma.question.deleteMany(),
    prisma.survey.deleteMany(),
    prisma.enrollment.deleteMany(),
    prisma.course.deleteMany(),
    prisma.session.deleteMany(),
    prisma.user.deleteMany()
  ]);
}

export async function seedFixture(): Promise<Fixture> {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("Set the test SEED_PASSWORD before seeding fixtures");
  return getPrisma().$transaction(db => seedAccounts(db, password));
}

export function makeSurvey(opts: {
  course: Course;
  owner: User;
  status?: SurveyStatus;
  questions?: QuestionSpec[];
}): Promise<SurveyWithQuestions> {
  const { course, owner, status = "PUBLISHED", questions = defaultQuestions } = opts;
  const now = new Date();
  return getPrisma().survey.create({
    data: {
      courseId: course.id,
      ownerId: owner.id,
      title: "Fixture survey",
      status,
      publishedAt: status === "DRAFT" ? null : now,
      closedAt: status === "CLOSED" ? now : null,
      questions: {
        create: questions.map(({ options = [], ...question }, questionIndex) => ({
          ...question,
          position: questionIndex + 1,
          options: {
            create: options.map((label, optionIndex) => ({ label, position: optionIndex + 1 }))
          }
        }))
      }
    },
    include: {
      questions: { orderBy: { position: "asc" }, include: { options: { orderBy: { position: "asc" } } } }
    }
  });
}
