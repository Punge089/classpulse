import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { StatusBadge } from "../../components/StatusBadge";
import { PulseLine } from "../../components/pulse/PulseLine";
import type { SurveyListItem } from "./surveyTypes";

export function OwnerSurveysPage() {
  const [surveys, setSurveys] = useState<SurveyListItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ surveys: SurveyListItem[] }>("/api/owner/surveys")
      .then(result => { if (!cancelled) setSurveys(result.surveys); })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof ApiClientError ? caught.message : "Could not load your surveys.");
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <h1 className="mb-0">Your surveys</h1>
        <Link to="/owner/surveys/new" className="btn btn-primary">New survey</Link>
      </div>
      <PulseLine width={240} />

      {error && <div role="alert" className="alert alert-danger mt-3">{error}</div>}
      {!error && surveys === null && (
        <div role="status" aria-live="polite" className="mt-3">
          <span className="visually-hidden">Loading your surveys…</span>
          <PulseLine width={240} animate />
        </div>
      )}
      {surveys !== null && surveys.length === 0 && (
        <section className="cp-card p-3 p-sm-4 mt-3">
          <p className="cp-muted mb-0">No surveys yet — create your first one.</p>
        </section>
      )}
      {surveys !== null && surveys.length > 0 && (
        <ul className="list-unstyled mt-3 mb-0 d-grid gap-2">
          {surveys.map(survey => (
            <li key={survey.id} className="cp-card p-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <Link to={`/owner/surveys/${survey.id}`} className="fw-semibold">{survey.title}</Link>
                <div className="cp-muted small">
                  {survey.courseCode} · {survey.responseCount} {survey.responseCount === 1 ? "response" : "responses"}
                </div>
              </div>
              <StatusBadge status={survey.status} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
