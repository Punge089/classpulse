import { StrictMode, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";
import { AuthProvider } from "./auth/AuthProvider";
import { RequireRole } from "./auth/RequireRole";
import { NavBar } from "./components/NavBar";
import { PulseLine } from "./components/pulse/PulseLine";
import { LoginPage } from "./pages/LoginPage";

// Placeholder screens for the feature Issues (I-07 owner pages, I-08 respondent pages, I-09 summary).
const ownerPages = [
  ["/owner", "Your surveys"],
  ["/owner/surveys/new", "New survey"],
  ["/owner/surveys/:id", "Survey details"],
  ["/owner/surveys/:id/summary", "Survey summary"]
];
const respondentPages = [
  ["/surveys", "Available surveys"],
  ["/surveys/:id", "Answer survey"],
  ["/responses/:id", "Response submitted"]
];

function ShellPage({ title }: { title: string }) {
  return (
    <>
      <h1>{title}</h1>
      <PulseLine width={240} />
      <section className="cp-card p-3 p-sm-4 mt-3">
        <p className="cp-muted mb-0">This screen will be connected as part of Sprint 1.</p>
      </section>
    </>
  );
}

function App() {
  const guarded = (role: "OWNER" | "RESPONDENT", pages: string[][]): ReactNode[] =>
    pages.map(([path, title]) => (
      <Route
        key={path} path={path}
        element={<RequireRole role={role}><ShellPage title={title} /></RequireRole>}
      />
    ));

  return (
    <AuthProvider>
      <NavBar />
      <main className="container cp-shell py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />
          {guarded("OWNER", ownerPages)}
          {guarded("RESPONDENT", respondentPages)}
          <Route path="*" element={<ShellPage title="Page not found" />} />
        </Routes>
      </main>
    </AuthProvider>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </StrictMode>
);
