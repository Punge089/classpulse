import { describe, expect, test } from "vitest";
import { validateSurveyInput } from "../../src/lib/surveyValidation";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Body = any;

/** A valid body; every case below changes one thing in it. */
function validBody(): Body {
  return {
    courseId: 1,
    title: "Lecture feedback W10",
    description: "How was week 10?",
    questions: [
      { prompt: "Pace of lectures", type: "RATING" },
      { prompt: "Would you recommend it?", type: "SINGLE_CHOICE", options: ["Yes", "No"] }
    ]
  };
}

const fieldsOf = (result: ReturnType<typeof validateSurveyInput>): string[] =>
  result.ok ? [] : result.details.map(d => d.field).sort();

const text = (length: number) => "x".repeat(length);

describe("TEST-11 invalid inputs (AC-11), the 18 cases of contract F-03 v1.1", () => {
  const invalid: Array<[string, (b: Body) => void, string]> = [
    ["1 title empty", b => { b.title = ""; }, "title"],
    ["2 title spaces only", b => { b.title = "   "; }, "title"],
    ["3 title of 121 characters", b => { b.title = text(121); }, "title"],
    ["4 description of 1001 characters", b => { b.description = text(1001); }, "description"],
    ["5 questions empty array", b => { b.questions = []; }, "questions"],
    ["6 21 questions", b => { b.questions = Array.from({ length: 21 }, () => ({ prompt: "Q", type: "RATING" })); }, "questions"],
    ["7 questions not an array", b => { b.questions = "x"; }, "questions"],
    ["8 prompt empty", b => { b.questions[0].prompt = ""; }, "questions[0].prompt"],
    ["9 prompt of 301 characters", b => { b.questions[0].prompt = text(301); }, "questions[0].prompt"],
    ["10 unknown type TEXT", b => { b.questions[0].type = "TEXT"; }, "questions[0].type"],
    ["11 RATING with options", b => { b.questions[0].options = ["a", "b"]; }, "questions[0].options"],
    ["12 SINGLE_CHOICE with 1 option", b => { b.questions[1].options = ["Yes"]; }, "questions[1].options"],
    ["13 SINGLE_CHOICE with 7 options", b => { b.questions[1].options = ["1", "2", "3", "4", "5", "6", "7"]; }, "questions[1].options"],
    ["14 SINGLE_CHOICE with an empty option", b => { b.questions[1].options = ["Yes", ""]; }, "questions[1].options"],
    ["15 SINGLE_CHOICE duplicates after trimming and ignoring case", b => { b.questions[1].options = ["Yes", " yes "]; }, "questions[1].options"],
    ["16 SINGLE_CHOICE with an option of 101 characters", b => { b.questions[1].options = ["Yes", text(101)]; }, "questions[1].options"],
    ["17 required is not a boolean", b => { b.questions[0].required = "yes"; }, "questions[0].required"],
    ["18a courseId 'abc'", b => { b.courseId = "abc"; }, "courseId"],
    ["18b courseId 0", b => { b.courseId = 0; }, "courseId"],
    ["18c courseId -1", b => { b.courseId = -1; }, "courseId"],
    ["18d courseId 1.5", b => { b.courseId = 1.5; }, "courseId"]
  ];

  test.each(invalid)("case %s is rejected and names the field", (_name, mutate, field) => {
    const body = validBody();
    mutate(body);
    const result = validateSurveyInput(body);
    expect(result.ok).toBe(false);
    expect(fieldsOf(result)).toEqual([field]);
    if (!result.ok) expect(result.details[0].message.length).toBeGreaterThan(0);
  });

  test("several bad fields are all listed, one entry per field", () => {
    const body = validBody();
    body.title = "";
    body.questions[0].prompt = "";
    body.questions[1].options = ["Yes"];
    expect(fieldsOf(validateSurveyInput(body))).toEqual(["questions[0].prompt", "questions[1].options", "title"]);
  });

  test("a body that is not an object is rejected", () => {
    for (const body of [null, undefined, "x", 5, []]) {
      expect(validateSurveyInput(body as Body).ok).toBe(false);
    }
  });
});

describe("TEST-11 boundaries that are valid (AC-11)", () => {
  test("title of 120, description of 1000, prompt of 300, option of 100, 2 and 6 options", () => {
    const body = validBody();
    body.title = text(120);
    body.description = text(1000);
    body.questions = [
      { prompt: text(300), type: "SINGLE_CHOICE", options: [text(100), "B"] },
      { prompt: "Six options", type: "SINGLE_CHOICE", options: ["1", "2", "3", "4", "5", "6"] }
    ];
    expect(validateSurveyInput(body).ok).toBe(true);
  });

  test("20 questions are accepted", () => {
    const body = validBody();
    body.questions = Array.from({ length: 20 }, (_v, i) => ({ prompt: "Q" + i, type: "RATING" }));
    const result = validateSurveyInput(body);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.questions).toHaveLength(20);
  });

  test("required defaults to true, RATING accepts options: [], and text is trimmed", () => {
    const body = validBody();
    body.title = "  Lecture feedback  ";
    body.questions = [
      { prompt: "  Pace  ", type: "RATING", options: [] },
      { prompt: "Pick", type: "SINGLE_CHOICE", required: false, options: [" Yes ", "No"] }
    ];
    const result = validateSurveyInput(body);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.title).toBe("Lecture feedback");
    expect(result.value.questions[0]).toEqual({ prompt: "Pace", type: "RATING", required: true, options: [] });
    expect(result.value.questions[1]).toEqual({
      prompt: "Pick", type: "SINGLE_CHOICE", required: false, options: ["Yes", "No"]
    });
  });

  test("a missing description is stored as null", () => {
    const body = validBody();
    delete body.description;
    const result = validateSurveyInput(body);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.value.description).toBeNull();
  });
});
