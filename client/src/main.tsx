import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./theme.css";
import { PulseLine } from "./components/pulse/PulseLine";

const pages = [
  ["/login", "Sign in"],
  ["/owner", "Your surveys"],
  ["/owner/surveys/new", "New survey"],
  ["/owner/surveys/:id", "Survey details"],
  ["/owner/surveys/:id/summary", "Survey summary"],
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
  return (
    <>
      <header className="cp-header">
        <div className="container cp-shell py-3">
          <Link to="/login" className="cp-brand fs-4 text-decoration-none">ClassPulse</Link>
        </div>
      </header>
      <main className="container cp-shell py-4">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          {pages.map(([path, title]) => (
            <Route key={path} path={path} element={<ShellPage title={title} />} />
          ))}
          <Route path="*" element={<ShellPage title="Page not found" />} />
        </Routes>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </StrictMode>
);
