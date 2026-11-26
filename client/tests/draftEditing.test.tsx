// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { apiFetch } from "../src/api";
import { SurveyDetailPage } from "../src/pages/owner/SurveyDetailPage";
import { EditSurveyPage } from "../src/pages/owner/EditSurveyPage";
import { ApiClientError } from "../src/api";
import userEvent from "@testing-library/user-event";

vi.mock("../src/api", async importOriginal => ({
  ...await importOriginal<typeof import("../src/api")>(), apiFetch: vi.fn()
}));
afterEach(cleanup);

test("TEST-127 draft detail exposes a link to edit its questions", async () => {
  vi.mocked(apiFetch).mockImplementation(async path => path.endsWith("/lifecycle")
    ? { events: [], nextCursor: null }
    : { survey: { id: 1, courseId: 1, courseCode: "CPE334", title: "Draft feedback", description: null,
      mode: "IDENTIFIED", status: "DRAFT", statusVersion: 0, updatedAt: "2026-11-26T00:00:00.000Z",
      publishedAt: null, closedAt: null, createdAt: "2026-11-26T00:00:00.000Z", questions: [] } });
  render(<MemoryRouter initialEntries={["/owner/surveys/1"]}>
    <Routes><Route path="/owner/surveys/:id" element={<SurveyDetailPage />} /></Routes>
  </MemoryRouter>);
  const link = await screen.findByRole("link", { name: "Edit questions" });
  expect(link.getAttribute("href")).toBe("/owner/surveys/1/edit");
});

const draft = { id: 1, title: "Draft feedback", status: "DRAFT", updatedAt: "2026-11-26T00:00:00.000Z", questions: [
  { id: 10, prompt: "Original", type: "RATING", required: true, options: [] }
] };
function editor() {
  return render(<MemoryRouter initialEntries={["/owner/surveys/1/edit"]}><Routes>
    <Route path="/owner/surveys/:id/edit" element={<EditSurveyPage />} />
    <Route path="/owner/surveys/:id" element={<div>Returned to detail</div>} />
  </Routes></MemoryRouter>);
}

test("TEST-129 editing and saving sends the original token and replacement questions", async () => {
  const user = userEvent.setup();
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ survey: draft }).mockResolvedValueOnce({ survey: draft });
  editor();
  const prompt = await screen.findByLabelText("Question 1 text");
  await user.clear(prompt);
  await user.type(prompt, "Updated");
  await user.selectOptions(screen.getByLabelText("Question 1 type"), "SINGLE_CHOICE");
  await user.type(screen.getByLabelText("Option 1"), "Yes");
  await user.type(screen.getByLabelText("Option 2"), "No");
  await user.click(screen.getByRole("button", { name: "Save questions" }));
  expect(await screen.findByText("Returned to detail")).toBeTruthy();
  const [path, init] = vi.mocked(apiFetch).mock.calls[1];
  expect(path).toBe("/api/owner/surveys/1/questions");
  expect(init?.method).toBe("PUT");
  expect(JSON.parse(init?.body as string)).toEqual({ expectedUpdatedAt: draft.updatedAt, questions: [
    { prompt: "Updated", type: "SINGLE_CHOICE", required: true, options: ["Yes", "No"] }
  ] });
});

test("TEST-129 validation and stale conflict preserve unsaved edits", async () => {
  const user = userEvent.setup();
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ survey: draft })
    .mockRejectedValueOnce(new ApiClientError(400, "VALIDATION_ERROR", "Invalid", [{ field: "questions[0].prompt", message: "Question is invalid" }]))
    .mockRejectedValueOnce(new ApiClientError(409, "STALE_SURVEY", "Survey changed"));
  editor();
  const prompt = await screen.findByLabelText("Question 1 text") as HTMLInputElement;
  await user.clear(prompt);
  await user.type(prompt, "Unsaved edit");
  await user.click(screen.getByRole("button", { name: "Save questions" }));
  expect(await screen.findByText("Question is invalid")).toBeTruthy();
  expect(prompt.value).toBe("Unsaved edit");
  await user.click(screen.getByRole("button", { name: "Save questions" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Reload the survey");
  expect(prompt.value).toBe("Unsaved edit");
});

test("TEST-129 non-drafts explain the restriction and cannot be saved", async () => {
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ survey: { ...draft, status: "PUBLISHED" } });
  editor();
  expect(await screen.findByText("Only draft surveys can be edited.")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Save questions" })).toBeNull();
  expect(vi.mocked(apiFetch)).toHaveBeenCalledTimes(1);
});

test("TEST-129 cancel discards unsaved edits without a write request", async () => {
  const user = userEvent.setup();
  vi.mocked(apiFetch).mockReset().mockResolvedValueOnce({ survey: draft });
  editor();
  const prompt = await screen.findByLabelText("Question 1 text");
  await user.clear(prompt);
  await user.type(prompt, "Unsaved");
  await user.click(screen.getByRole("link", { name: "Cancel and return" }));
  expect(await screen.findByText("Returned to detail")).toBeTruthy();
  expect(vi.mocked(apiFetch)).toHaveBeenCalledTimes(1);
});
