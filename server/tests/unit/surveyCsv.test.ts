import { beforeEach, expect, test, vi } from "vitest";
import { readIdentifiedSurveyCsv } from "../../src/lib/surveyCsv";

const prisma = vi.hoisted(() => ({
  survey: { findFirst: vi.fn() },
  response: { count: vi.fn(), findMany: vi.fn() }
}));
vi.mock("../../src/prisma", () => ({
  getPrisma: () => ({ $transaction: (callback: (db: typeof prisma) => unknown) => callback(prisma) })
}));

function decodeRecords(csv: string): string[][] {
  const records: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < csv.length; index++) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        field += '"';
        index++;
      } else quoted = !quoted;
    } else if (!quoted && character === ",") {
      row.push(field);
      field = "";
    } else if (!quoted && character === "\r" && csv[index + 1] === "\n") {
      records.push([...row, field]);
      row = [];
      field = "";
      index++;
    } else field += character;
  }
  expect({ quoted, row, field }).toEqual({ quoted: false, row: [], field: "" });
  return records;
}

const date = new Date("2026-11-28T03:01:00.000Z");
function question(id: number, position: number, type: string, prompt: string, required = true) {
  return { id, position, type, prompt, required };
}
function response(id: number, fullName: string, answers: unknown[]) {
  return { id, submittedAt: date, respondent: { fullName, email: "sample@classpulse.test" }, answers };
}
function setSnapshot(questions: ReturnType<typeof question>[], responses: ReturnType<typeof response>[]) {
  prisma.survey.findFirst.mockResolvedValue({ mode: "IDENTIFIED", status: "PUBLISHED", questions });
  prisma.response.count.mockResolvedValue(responses.length);
  prisma.response.findMany.mockResolvedValue(responses);
}

beforeEach(() => vi.resetAllMocks());

test("TEST-244 orders responses and questions and decodes supported saved values", async () => {
  const rating = { questionId: 1, ratingValue: 4, optionId: null, option: null };
  const choice = { questionId: 2, ratingValue: null, optionId: 27, option: { questionId: 2, label: 'ทางเลือก, "ดี"' } };
  setSnapshot([question(1, 1, "RATING", "Rating"), question(2, 2, "SINGLE_CHOICE", "Choice", false)],
    [response(7, "First", [choice, rating]), response(8, "Second", [rating])]);

  const [header, ...rows] = decodeRecords(await readIdentifiedSurveyCsv(1, 2));
  expect(header).toEqual(["response_id", "respondent_name", "respondent_email", "submitted_at",
    "question_position", "question_text", "question_type", "answer"]);
  expect(prisma.survey.findFirst).toHaveBeenCalledWith(expect.objectContaining({
    where: { id: 2, ownerId: 1 },
    select: expect.objectContaining({
      questions: expect.objectContaining({ orderBy: [{ position: "asc" }, { id: "asc" }] })
    })
  }));
  expect(prisma.response.findMany).toHaveBeenCalledWith(expect.objectContaining({
    orderBy: [{ submittedAt: "asc" }, { id: "asc" }]
  }));
  expect(rows.map(row => [row[0], row[3], row[4], row[7]])).toEqual([
    ["7", date.toISOString(), "1", "4"],
    ["7", date.toISOString(), "2", JSON.stringify(['ทางเลือก, "ดี"'])],
    ["8", date.toISOString(), "1", "4"],
    ["8", date.toISOString(), "2", ""]
  ]);
});

test.each([
  ['ไทย, "ดี"\r\nบรรทัดใหม่', 'ไทย, "ดี"\r\nบรรทัดใหม่'],
  ["=1+1", "'=1+1"],
  [" +2", "' +2"],
  ["\u0001-2", "'\u0001-2"],
  ["\u00a0@sample", "'\u00a0@sample"],
  ["\tplain", "'\tplain"],
  ["\rplain", "'\rplain"],
  ["\nplain", "'\nplain"],
  [" \tplain", "' \tplain"],
  ["\u200b=1+1", "'\u200b=1+1"]
])("TEST-245 decodes Unicode and protects spreadsheet-sensitive prefixes (%j)", async (input, expected) => {
  setSnapshot([question(1, 1, "RATING", input, false)], [response(7, "เจ้าของ", [])]);
  const [, row] = decodeRecords(await readIdentifiedSurveyCsv(1, 2));
  expect(row).toHaveLength(8);
  expect(row[1]).toBe("เจ้าของ");
  expect(row[5]).toBe(expected);
});
