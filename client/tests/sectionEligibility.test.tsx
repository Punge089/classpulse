// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { ApiClientError, apiFetch } from "../src/api";
import { SurveyDetailPage } from "../src/pages/owner/SurveyDetailPage";
import { SurveySummaryPage } from "../src/pages/owner/SurveySummaryPage";

vi.mock("../src/api", async importOriginal => ({
  ...await importOriginal<typeof import("../src/api")>(), apiFetch: vi.fn()
}));
const fetch = vi.mocked(apiFetch);
const draft = {
  id: 1, courseId: 7, courseCode: "CPE334", title: "Section feedback", description: null,
  mode: "IDENTIFIED", status: "DRAFT", statusVersion: 0, updatedAt: "2026-11-28T00:00:00.000Z",
  createdAt: "2026-11-28T00:00:00.000Z", publishedAt: null, closedAt: null, questions: [], sectionIds: [] as number[]
};
const sections = [{ id: 11, code: "A", label: "Alpha" }, { id: 22, code: "B", label: "Beta" }];
const detailPath = "/api/owner/surveys/1";
const coursePath = "/api/owner/courses";
const summaryPath = detailPath + "/summary";
const savePath = detailPath + "/sections";

beforeEach(() => { fetch.mockReset(); });
afterEach(cleanup);

function renderRoute(summary = false) {
  return render(<MemoryRouter initialEntries={[summary ? "/owner/surveys/1/summary" : "/owner/surveys/1"]}>
    <Routes>
      <Route path="/owner/surveys/:id" element={<SurveyDetailPage />} />
      <Route path="/owner/surveys/:id/summary" element={<SurveySummaryPage />} />
    </Routes>
  </MemoryRouter>);
}

function draftApi(
  current: () => typeof draft,
  load: () => Promise<typeof sections>,
  save: () => Promise<{ survey: typeof draft }> = async () => { throw new Error("unexpected write"); }
) {
  fetch.mockImplementation(async path => {
    if (path === detailPath) return { survey: current() };
    if (path === detailPath + "/lifecycle") return { events: [], nextCursor: null };
    if (path === coursePath) return { courses: [{ id: 8, sections }, { id: draft.courseId, sections: await load() }] };
    if (path === savePath) return save();
    throw new Error("unexpected request");
  });
}

test("TEST-211 announces loading, retries the course read and disables selected mode for a course without sections", async () => {
  const user = userEvent.setup();
  let rejectLoad!: (reason: Error) => void;
  const pending = new Promise<typeof sections>((_, reject) => { rejectLoad = reject; });
  const load = vi.fn<() => Promise<typeof sections>>().mockReturnValueOnce(pending).mockResolvedValueOnce([]);
  draftApi(() => draft, load);
  renderRoute();
  const audience = await screen.findByRole("region", { name: "Survey audience" });
  expect(within(audience).getByRole("status").textContent).toContain("Loading course sections");
  expect(within(audience).queryByRole("button", { name: "Save audience" })).toBeNull();
  rejectLoad(new Error("offline"));
  expect((await within(audience).findByRole("alert")).textContent).toContain("Could not load course sections");
  await user.click(within(audience).getByRole("button", { name: "Retry sections" }));
  expect(await within(audience).findByText("This course has no sections.")).toBeTruthy();
  expect((within(audience).getByRole("radio", { name: "All sections" }) as HTMLInputElement).checked).toBe(true);
  expect((within(audience).getByRole("radio", { name: "Selected sections" }) as HTMLInputElement).disabled).toBe(true);
  expect(fetch.mock.calls.filter(([path]) => path === coursePath)).toHaveLength(2);
  expect(fetch.mock.calls.some(([path]) => path === savePath)).toBe(false);
});

test("TEST-211 preserves selections during validation, pending requests and retry, and restores stored state on cancel", async () => {
  const user = userEvent.setup();
  const stored = { ...draft, sectionIds: [22], updatedAt: "2026-11-28T00:00:01.000Z" };
  let rejectWrite!: (reason: Error) => void;
  const firstWrite = new Promise<{ survey: typeof draft }>((_, reject) => { rejectWrite = reject; });
  const save = vi.fn<() => Promise<{ survey: typeof draft }>>()
    .mockReturnValueOnce(firstWrite)
    .mockRejectedValueOnce(new ApiClientError(400, "VALIDATION_ERROR", "Invalid target", [
      { field: "sectionIds", message: "Section selection is invalid" }
    ]))
    .mockResolvedValueOnce({ survey: stored });
  draftApi(() => draft, async () => sections, save);
  renderRoute();

  await user.click(await screen.findByRole("radio", { name: "Selected sections" }));
  await user.click(screen.getByRole("button", { name: "Save audience" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Choose at least one section");
  expect(save).not.toHaveBeenCalled();
  await user.click(screen.getByRole("checkbox", { name: "A · Alpha" }));
  await user.click(screen.getByRole("button", { name: "Cancel audience changes" }));
  expect((screen.getByRole("radio", { name: "All sections" }) as HTMLInputElement).checked).toBe(true);
  expect(screen.queryByRole("checkbox", { name: "A · Alpha" })).toBeNull();

  await user.click(screen.getByRole("radio", { name: "Selected sections" }));
  await user.click(screen.getByRole("checkbox", { name: "B · Beta" }));
  await user.click(screen.getByRole("button", { name: "Save audience" }));
  const pending = screen.getByRole("button", { name: "Saving audience…" });
  expect(pending.closest("fieldset")?.disabled).toBe(true);
  await user.click(pending);
  expect(save).toHaveBeenCalledTimes(1);
  rejectWrite(new Error("offline"));
  expect((await screen.findByRole("alert")).textContent).toContain("Could not save the audience");
  expect((screen.getByRole("checkbox", { name: "B · Beta" }) as HTMLInputElement).checked).toBe(true);
  await user.click(screen.getByRole("button", { name: "Save audience" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Section selection is invalid");
  expect((screen.getByRole("checkbox", { name: "B · Beta" }) as HTMLInputElement).checked).toBe(true);
  await user.click(screen.getByRole("button", { name: "Save audience" }));
  expect((await screen.findByRole("checkbox", { name: "B · Beta" }) as HTMLInputElement).checked).toBe(true);
  expect(screen.queryByRole("alert")).toBeNull();

  const writes = fetch.mock.calls.filter(([path]) => path === savePath);
  expect(writes).toHaveLength(3);
  for (const [, options] of writes) {
    expect(options?.method).toBe("PUT");
    expect(JSON.parse(options?.body as string)).toEqual({ expectedUpdatedAt: draft.updatedAt, sectionIds: [22] });
  }
});

test("TEST-211 retains a stale draft selection until explicit reload and then reads the server selection", async () => {
  const user = userEvent.setup();
  let current = draft;
  const save = vi.fn(async () => {
    throw new ApiClientError(409, "STALE_SURVEY", "Survey changed");
  });
  draftApi(() => current, async () => sections, save);
  renderRoute();
  await user.click(await screen.findByRole("radio", { name: "Selected sections" }));
  await user.click(screen.getByRole("checkbox", { name: "A · Alpha" }));
  await user.click(screen.getByRole("button", { name: "Save audience" }));
  expect((await screen.findByRole("alert")).textContent).toContain("Survey changed");
  expect((screen.getByRole("checkbox", { name: "A · Alpha" }) as HTMLInputElement).checked).toBe(true);
  expect((screen.getByRole("button", { name: "Save audience" }) as HTMLButtonElement).disabled).toBe(true);
  current = { ...draft, sectionIds: [22], updatedAt: "2026-11-28T00:00:01.000Z" };
  await user.click(screen.getByRole("button", { name: "Reload audience" }));
  expect((await screen.findByRole("checkbox", { name: "B · Beta" }) as HTMLInputElement).checked).toBe(true);
  expect((screen.getByRole("checkbox", { name: "A · Alpha" }) as HTMLInputElement).checked).toBe(false);
  expect(screen.queryByRole("alert")).toBeNull();
  expect(save).toHaveBeenCalledTimes(1);
});

test.each([
  [{ respondedEligible: 0, eligible: 2, percent: 0 }, "0% · 0 of 2"],
  [{ respondedEligible: 0, eligible: 0, percent: null }, "No eligible respondents"]
])("TEST-211 displays the current roster rate independently of the saved count", async (responseRate, display) => {
  fetch.mockImplementation(async path => {
    if (path === summaryPath) return { summary: { surveyId: 1, status: "PUBLISHED", responseCount: 3, responseRate, questions: [] } };
    throw new Error("unexpected request");
  });
  renderRoute(true);
  expect(await screen.findByLabelText("Response count: 3")).toBeTruthy();
  const rate = screen.getByRole("region", { name: "Current roster response rate" });
  expect(within(rate).getByText(display)).toBeTruthy();
});
