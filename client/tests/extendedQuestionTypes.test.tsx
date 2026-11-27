// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiClientError, apiFetch } from "../src/api";
import { AnswerSurveyPage } from "../src/pages/respondent/AnswerSurveyPage";
import { MyResponsesPage } from "../src/pages/respondent/MyResponsesPage";
import { SurveySummaryPage } from "../src/pages/owner/SurveySummaryPage";
import { EditSurveyPage } from "../src/pages/owner/EditSurveyPage";

vi.mock("../src/api", async importOriginal => ({
  ...await importOriginal<typeof import("../src/api")>(), apiFetch: vi.fn()
}));
afterEach(cleanup);

test("TEST-149 owner editor round-trips TEXT and ordered MULTI_CHOICE options", async () => {
  const user = userEvent.setup();
  const draft = { id: 1, courseId: 5, courseCode: "CPE334", title: "Draft", description: null, mode: "IDENTIFIED", status: "DRAFT", statusVersion: 0,
    updatedAt: "2026-11-28T00:00:00.000Z", publishedAt: null, closedAt: null, createdAt: "2026-11-28T00:00:00.000Z", questions: [
      { id: 10, position: 1, prompt: "What helped?", type: "TEXT", required: true, options: [] },
      { id: 11, position: 2, prompt: "Which formats?", type: "MULTI_CHOICE", required: false, options: [
        { id: 21, position: 1, label: "Practice" }, { id: 22, position: 2, label: "Examples" }
      ] }
    ] };
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ survey: draft }).mockResolvedValueOnce({ survey: draft });
  render(<MemoryRouter initialEntries={["/owner/surveys/1/edit"]}><Routes>
    <Route path="/owner/surveys/:id/edit" element={<EditSurveyPage />} />
    <Route path="/owner/surveys/:id" element={<div>Draft saved</div>} />
  </Routes></MemoryRouter>);
  expect(await screen.findByLabelText("Question 1 type")).toHaveProperty("value", "TEXT");
  expect(screen.getByLabelText("Question 2 type")).toHaveProperty("value", "MULTI_CHOICE");
  await user.click(screen.getByRole("button", { name: "Save questions" }));
  expect(await screen.findByText("Draft saved")).toBeTruthy();
  const [path, init] = vi.mocked(apiFetch).mock.calls[1];
  expect(path).toBe("/api/owner/surveys/1/questions");
  expect(JSON.parse(init?.body as string)).toEqual({ expectedUpdatedAt: draft.updatedAt, questions: [
    { prompt: "What helped?", type: "TEXT", required: true },
    { prompt: "Which formats?", type: "MULTI_CHOICE", required: false, options: ["Practice", "Examples"] }
  ] });
});

test("TEST-149 respondent submits text and a multi-choice selection without losing the controls", async () => {
  const user = userEvent.setup();
  vi.mocked(apiFetch).mockReset()
    .mockResolvedValueOnce({ survey: { id: 1, title: "Pulse", description: null, courseCode: "CPE334", mode: "IDENTIFIED", status: "PUBLISHED", questions: [
      { id: 10, position: 1, prompt: "What helped?", type: "TEXT", required: true, options: [] },
      { id: 11, position: 2, prompt: "Which formats?", type: "MULTI_CHOICE", required: false, options: [
        { id: 21, position: 1, label: "Practice" }, { id: 22, position: 2, label: "Examples" }
      ] }
    ] } })
    .mockRejectedValueOnce(new ApiClientError(400, "VALIDATION_ERROR", "Please correct the answers."))
    .mockResolvedValueOnce({ response: { id: 99 } });
  render(<MemoryRouter initialEntries={["/surveys/1"]}><Routes>
    <Route path="/surveys/:id" element={<AnswerSurveyPage />} />
    <Route path="/responses/:id" element={<div>Saved response</div>} />
  </Routes></MemoryRouter>);
  await user.type(await screen.findByLabelText("What helped?"), "Practice examples");
  await user.click(screen.getByLabelText("Practice"));
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect((screen.getByLabelText("What helped?") as HTMLTextAreaElement).value).toBe("Practice examples");
  expect((screen.getByLabelText("Practice") as HTMLInputElement).checked).toBe(true);
  await user.click(screen.getByRole("button", { name: "Submit" }));
  expect(await screen.findByText("Saved response")).toBeTruthy();
  const [path, init] = vi.mocked(apiFetch).mock.calls[2];
  expect(path).toBe("/api/surveys/1/responses");
  expect(JSON.parse(init?.body as string)).toEqual({ answers: [
    { questionId: 10, textValue: "Practice examples" }, { questionId: 11, optionIds: [21] }
  ] });
});

test("TEST-149 owner summary displays text answered counts and multi-choice totals", async () => {
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ summary: { surveyId: 1, status: "PUBLISHED", responseCount: 2, questions: [
    { questionId: 10, prompt: "What helped?", type: "TEXT", text: { answeredCount: 1 } },
    { questionId: 11, prompt: "Which formats?", type: "MULTI_CHOICE", multiChoice: { answeredCount: 1, options: [{ optionId: 21, label: "Practice", count: 1 }] } }
  ] } });
  render(<MemoryRouter initialEntries={["/owner/surveys/1/summary"]}><Routes>
    <Route path="/owner/surveys/:id/summary" element={<SurveySummaryPage />} />
  </Routes></MemoryRouter>);
  expect(await screen.findByText("What helped?")).toBeTruthy();
  expect(screen.getByText(/Answered:\s*1/).textContent).toContain("1");
  expect(screen.getByText("Practice").parentElement?.textContent).toContain("1");
  expect(screen.getByRole("img", { name: "Practice: 1 responses" }).querySelector(".progress-bar")?.getAttribute("style")).toContain("100%");
  expect(screen.queryByText("private free text")).toBeNull();
});

test("TEST-149 saved history shows text and selected multi-choice labels", async () => {
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ response: { id: 99, surveyId: 1, submittedAt: "2026-11-28T00:00:00.000Z", answers: [
    { questionId: 10, prompt: "What helped?", type: "TEXT", textValue: "Practice examples" },
    { questionId: 11, prompt: "Which formats?", type: "MULTI_CHOICE", selectedOptions: [{ optionId: 21, label: "Practice" }, { optionId: 22, label: "Examples" }] }
  ] } });
  render(<MemoryRouter initialEntries={["/my-responses/99"]}><Routes>
    <Route path="/my-responses/*" element={<MyResponsesPage />} />
  </Routes></MemoryRouter>);
  expect(await screen.findByText("Practice examples")).toBeTruthy();
  expect(screen.getByText("Practice")).toBeTruthy();
  expect(screen.getByText("Examples")).toBeTruthy();
});
