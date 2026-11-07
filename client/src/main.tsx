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
import { NewSurveyPage } from "./pages/owner/NewSurveyPage";
import { OwnerSurveysPage } from "./pages/owner/OwnerSurveysPage";
import { SurveyDetailPage } from "./pages/owner/SurveyDetailPage";
import { SurveySummaryPage } from "./pages/owner/SurveySummaryPage";
import { AnswerSurveyPage } from "./pages/respondent/AnswerSurveyPage";
import { ConfirmationPage } from "./pages/respondent/ConfirmationPage";
import { SurveyListPage } from "./pages/respondent/SurveyListPage";

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
          <Route path="/owner" element={<RequireRole role="OWNER"><OwnerSurveysPage /></RequireRole>} />
          <Route path="/owner/surveys/new" element={<RequireRole role="OWNER"><NewSurveyPage /></RequireRole>} />
          <Route path="/owner/surveys/:id" element={<RequireRole role="OWNER"><SurveyDetailPage /></RequireRole>} />
          <Route path="/owner/surveys/:id/summary" element={<RequireRole role="OWNER"><SurveySummaryPage /></RequireRole>} />
          <Route path="/surveys" element={<RequireRole role="RESPONDENT"><SurveyListPage /></RequireRole>} />
          <Route path="/surveys/:id" element={<RequireRole role="RESPONDENT"><AnswerSurveyPage /></RequireRole>} />
          <Route path="/responses/:id" element={<RequireRole role="RESPONDENT"><ConfirmationPage /></RequireRole>} />
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
