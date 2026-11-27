// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi, type Mock } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { ApiClientError, apiFetch } from "../src/api";
import { SurveyDetailPage } from "../src/pages/owner/SurveyDetailPage";

vi.mock("../src/api", async importOriginal => ({
  ...await importOriginal<typeof import("../src/api")>(), apiFetch: vi.fn()
}));
const fetchMock = vi.mocked(apiFetch) as unknown as Mock<(path: string, init?: RequestInit) => Promise<unknown>>;
const closed = {
  id: 1, courseId: 1, courseCode: "CPE334", title: "Reopen class feedback", description: null,
  mode: "IDENTIFIED", status: "CLOSED", statusVersion: 2,
  publishedAt: "2026-11-01T00:00:00.000Z", closedAt: "2026-11-02T00:00:00.000Z",
  createdAt: "2026-11-01T00:00:00.000Z", questions: []
};
const reason = "Extra class collection";
function page() {
  return render(<MemoryRouter initialEntries={["/owner/surveys/1"]}>
    <Routes><Route path="/owner/surveys/:id" element={<SurveyDetailPage />} /></Routes>
  </MemoryRouter>);
}
beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(async path => path.includes("/lifecycle")
    ? { events: [], nextCursor: null } : { survey: closed });
});
afterEach(cleanup);

test("TEST-112 server validation keeps reason and shows its field error without retrying", async () => {
  fetchMock.mockImplementation(async path => {
    if (path.endsWith("/reopen")) throw new ApiClientError(400, "VALIDATION_ERROR", "Check the highlighted fields", [
      { field: "reason", message: "Synthetic server reason rejection" }
    ]);
    return path.includes("/lifecycle") ? { events: [], nextCursor: null } : { survey: closed };
  });
  const user = userEvent.setup(); page();
  await user.click(await screen.findByRole("button", { name: "Reopen" }));
  await user.type(screen.getByLabelText("Reason for reopening"), reason);
  await user.click(screen.getByRole("button", { name: "Confirm reopen" }));
  expect(await screen.findByText("Synthetic server reason rejection")).toBeTruthy();
  expect((screen.getByLabelText("Reason for reopening") as HTMLTextAreaElement).value).toBe(reason);
  expect(screen.getByLabelText("Reason for reopening").getAttribute("aria-invalid")).toBe("true");
  expect(fetchMock.mock.calls.filter(([path]) => path.endsWith("/reopen"))).toHaveLength(1);
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
});

test("TEST-112 loading history cannot be mistaken for a legacy empty history", async () => {
  let resolveHistory!: (value: unknown) => void;
  const pending = new Promise(resolve => { resolveHistory = resolve; });
  fetchMock.mockImplementation(async path => path.includes("/lifecycle") ? pending : { survey: closed });
  page();
  await screen.findByRole("button", { name: "Reopen" });
  expect(screen.getByText("Loading lifecycle history…")).toBeTruthy();
  expect(screen.queryByText("No lifecycle events recorded for this version")).toBeNull();
  await act(async () => resolveHistory({ events: [], nextCursor: null }));
  expect(await screen.findByText("No lifecycle events recorded for this version")).toBeTruthy();
  expect(screen.queryByText("Loading lifecycle history…")).toBeNull();
});

test("TEST-112 confirms reopen with reason/current version then refreshes durable history", async () => {
  let reopened = false;
  fetchMock.mockImplementation(async path => {
    if (path.endsWith("/reopen")) { reopened = true; return { survey: { ...closed, status: "PUBLISHED", statusVersion: 3, closedAt: null } }; }
    if (path.includes("/lifecycle")) return { events: reopened ? [{ id: 3, version: 3, action: "REOPEN", fromStatus: "CLOSED", toStatus: "PUBLISHED", reason, occurredAt: "2026-11-03T00:00:00.000Z", previousClosedAt: closed.closedAt }] : [], nextCursor: null };
    return { survey: closed };
  });
  const user = userEvent.setup(); page();
  await user.click(await screen.findByRole("button", { name: "Reopen" }));
  await user.type(screen.getByLabelText("Reason for reopening"), reason);
  await user.click(screen.getByRole("button", { name: "Confirm reopen" }));
  expect(await screen.findByRole("button", { name: "Close" })).toBeTruthy();
  expect(fetchMock).toHaveBeenCalledWith("/api/owner/surveys/1/reopen", { method: "POST", body: JSON.stringify({ reason, expectedVersion: 2 }) });
  expect(await screen.findByText(reason)).toBeTruthy();
});

test("TEST-112 invalid reason and cancel never submit a mutation", async () => {
  const user = userEvent.setup(); page();
  await user.click(await screen.findByRole("button", { name: "Reopen" }));
  await user.type(screen.getByLabelText("Reason for reopening"), "too short");
  await user.click(screen.getByRole("button", { name: "Confirm reopen" }));
  expect(await screen.findByText("Enter a reason of 10 to 300 characters")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Cancel reopen" }));
  expect(screen.queryByLabelText("Reason for reopening")).toBeNull();
  expect(fetchMock.mock.calls.filter(([p]) => p.endsWith("/reopen"))).toHaveLength(0);
});

test("TEST-112 stale version preserves reason and requires explicit reload without auto retry", async () => {
  fetchMock.mockImplementation(async path => {
    if (path.endsWith("/reopen")) throw new ApiClientError(409, "STALE_SURVEY", "The survey changed; reload and explicitly try again");
    return path.includes("/lifecycle") ? { events: [], nextCursor: null } : { survey: closed };
  });
  const user = userEvent.setup(); page();
  await user.click(await screen.findByRole("button", { name: "Reopen" }));
  await user.type(screen.getByLabelText("Reason for reopening"), reason);
  await user.click(screen.getByRole("button", { name: "Confirm reopen" }));
  expect(await screen.findByText(/The survey changed/)).toBeTruthy();
  expect((screen.getByLabelText("Reason for reopening") as HTMLTextAreaElement).value).toBe(reason);
  expect(screen.getByRole("button", { name: "Reload survey" })).toBeTruthy();
  expect((screen.getByRole("button", { name: "Confirm reopen" }) as HTMLButtonElement).disabled).toBe(true);
  expect(fetchMock.mock.calls.filter(([p]) => p.endsWith("/reopen"))).toHaveLength(1);
});

test("TEST-112 network error preserves reason for an explicit retry", async () => {
  fetchMock.mockImplementation(async path => {
    if (path.endsWith("/reopen")) throw new Error("Synthetic network outage");
    return path.includes("/lifecycle") ? { events: [], nextCursor: null } : { survey: closed };
  });
  const user = userEvent.setup(); page();
  await user.click(await screen.findByRole("button", { name: "Reopen" }));
  await user.type(screen.getByLabelText("Reason for reopening"), reason);
  await user.click(screen.getByRole("button", { name: "Confirm reopen" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect((screen.getByLabelText("Reason for reopening") as HTMLTextAreaElement).value).toBe(reason);
  expect(fetchMock.mock.calls.filter(([p]) => p.endsWith("/reopen"))).toHaveLength(1);
});

test("TEST-112 history pagination renders reasons as text and loads older events", async () => {
  const first = Array.from({ length: 20 }, (_, i) => ({ id: 40 - i, version: 40 - i, action: "CLOSE", fromStatus: "PUBLISHED", toStatus: "CLOSED", reason: null, occurredAt: closed.closedAt, previousClosedAt: null }));
  fetchMock.mockImplementation(async path => {
    if (path.includes("before=21")) return { events: [{ id: 20, version: 20, action: "REOPEN", fromStatus: "CLOSED", toStatus: "PUBLISHED", reason: "<b>Earlier collection</b>", occurredAt: closed.closedAt, previousClosedAt: closed.closedAt }], nextCursor: null };
    return path.includes("/lifecycle") ? { events: first, nextCursor: 21 } : { survey: closed };
  });
  const user = userEvent.setup(); const view = page();
  await user.click(await screen.findByRole("button", { name: "Load older" }));
  expect(await screen.findByText("<b>Earlier collection</b>")).toBeTruthy();
  expect(view.container.querySelector("b")).toBeNull();
  await waitFor(() => expect(screen.queryByRole("button", { name: "Load older" })).toBeNull());
});

test("TEST-112 history errors are visible and do not imply an empty history", async () => {
  fetchMock.mockImplementation(async path => {
    if (path.includes("/lifecycle")) throw new Error("Synthetic history outage");
    return { survey: closed };
  });
  page();
  expect(await screen.findByText("Could not load lifecycle history.")).toBeTruthy();
  expect(screen.queryByText("No lifecycle events recorded for this version")).toBeNull();
});

test("TEST-112 draft keeps Publish and offers no reopen control", async () => {
  fetchMock.mockImplementation(async path => path.includes("/lifecycle") ? { events: [], nextCursor: null } : { survey: { ...closed, status: "DRAFT", publishedAt: null, closedAt: null, statusVersion: 0 } });
  page();
  expect(await screen.findByRole("button", { name: "Publish" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Reopen" })).toBeNull();
});
