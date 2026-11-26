// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

const { apiFetch, currentUser } = vi.hoisted(() => ({ apiFetch: vi.fn(), currentUser: { id: 2, email: "student1@classpulse.test", fullName: "Alex Lee", role: "RESPONDENT" as "OWNER" | "RESPONDENT" } }));
vi.mock("../src/api", () => ({
  apiFetch: (...args: unknown[]) => apiFetch(...args),
  ApiClientError: class ApiClientError extends Error {}
}));
vi.mock("../src/auth/AuthProvider", () => ({
  homePath: (role: string) => role === "OWNER" ? "/owner" : "/surveys",
  useAuth: () => ({ user: currentUser, logout: vi.fn() })
}));
import { MyResponsesPage } from "../src/pages/respondent/MyResponsesPage";
import { NavBar } from "../src/components/NavBar";

afterEach(cleanup);
beforeEach(() => { apiFetch.mockReset(); currentUser.role = "RESPONDENT"; });
const row = (id: number, surveyTitle = `Saved ${id}`) => ({ id, surveyId: 10 + id, surveyTitle, surveyStatus: "CLOSED", courseCode: "CPE334", courseTitle: "Software Engineering", submittedAt: "2026-11-20T10:00:00.000Z" });
const deferred = <T,>() => {
  let resolve!: (value: T) => void; let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
function page(path = "/my-responses") {
  return render(<MemoryRouter initialEntries={[path]}><NavBar /><Routes>
    <Route path="/my-responses/*" element={<MyResponsesPage />} />
  </Routes></MemoryRouter>);
}

test("TEST-179 loading is announced before data and an empty history stays empty", async () => {
  const first = deferred<{ responses: ReturnType<typeof row>[]; nextCursor: null }>();
  apiFetch.mockReturnValueOnce(first.promise);
  page();
  expect(screen.getByRole("status")).toBeTruthy();
  expect(screen.queryByText("Saved 1")).toBeNull();
  first.resolve({ responses: [], nextCursor: null });
  await waitFor(() => expect(screen.getByText(/no saved responses/i)).toBeTruthy());
  expect(screen.queryByRole("alert")).toBeNull();
});

test("TEST-179 initial failure offers retry and does not invent history rows", async () => {
  const user = userEvent.setup();
  apiFetch.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ responses: [row(1)], nextCursor: null });
  page();
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Saved 1")).toBeNull();
  await user.click(screen.getByRole("button", { name: /retry/i }));
  expect(await screen.findByText("Saved 1")).toBeTruthy();
  expect(apiFetch).toHaveBeenCalledTimes(2);
});

test("TEST-179 a failed next-page retry preserves rows and appends the next row exactly once", async () => {
  const user = userEvent.setup();
  apiFetch.mockResolvedValueOnce({ responses: [row(1), row(2)], nextCursor: "cursor-one" })
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ responses: [row(3)], nextCursor: null });
  page();
  expect(await screen.findByText("Saved 1")).toBeTruthy();
  await user.click(screen.getByRole("button", { name: /load more/i }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getByText("Saved 1")).toBeTruthy();
  expect(screen.getByText("Saved 2")).toBeTruthy();
  expect(screen.queryByText("Saved 3")).toBeNull();
  await user.click(screen.getByRole("button", { name: /retry/i }));
  await waitFor(() => expect(screen.getByText("Saved 3")).toBeTruthy());
  expect(screen.getAllByText("Saved 1")).toHaveLength(1);
});

test("TEST-178 respondent navigation offers My responses and scoped detail can return", async () => {
  const user = userEvent.setup();
  apiFetch.mockResolvedValueOnce({ responses: [row(7)], nextCursor: null })
    .mockResolvedValueOnce({ response: { ...row(7), answers: [{ questionId: 1, prompt: "Pace", type: "RATING", ratingValue: 4 }] } })
    .mockResolvedValueOnce({ responses: [row(7)], nextCursor: null });
  page();
  const navigation = await screen.findByRole("link", { name: /my responses/i });
  expect(navigation.getAttribute("href")).toBe("/my-responses");
  await user.click(screen.getByRole("link", { name: "Saved 7" }));
  expect(await screen.findByText("Pace")).toBeTruthy();
  await user.click(screen.getByRole("link", { name: /back to my responses/i }));
  expect(await screen.findByText("Saved 7")).toBeTruthy();
});

test("TEST-178 owner navigation remains unchanged", () => {
  currentUser.role = "OWNER";
  render(<MemoryRouter><NavBar /></MemoryRouter>);
  expect(screen.queryByRole("link", { name: /my responses/i })).toBeNull();
});

test("TEST-179 navigation while a page is pending resets pagination loading on return", async () => {
  const user = userEvent.setup();
  const nextPage = deferred<{ responses: ReturnType<typeof row>[]; nextCursor: null }>();
  apiFetch.mockResolvedValueOnce({ responses: [row(8)], nextCursor: "cursor-next" })
    .mockReturnValueOnce(nextPage.promise)
    .mockResolvedValueOnce({ response: { ...row(8), answers: [] } })
    .mockResolvedValueOnce({ responses: [row(8)], nextCursor: "cursor-next" });
  page();
  await user.click(await screen.findByRole("button", { name: /load more/i }));
  expect(screen.getByRole("button", { name: /loading more/i }).hasAttribute("disabled")).toBe(true);
  await user.click(screen.getByRole("link", { name: "Saved 8" }));
  await screen.findByRole("heading", { name: "Saved response" });
  await user.click(screen.getByRole("link", { name: /back to my responses/i }));
  const loadMore = await screen.findByRole("button", { name: /load more/i });
  expect(loadMore.hasAttribute("disabled")).toBe(false);
  nextPage.resolve({ responses: [row(9)], nextCursor: null });
});
