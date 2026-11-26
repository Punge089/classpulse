// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, test, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { apiFetch } from "../src/api";
import { SurveyDetailPage } from "../src/pages/owner/SurveyDetailPage";

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
