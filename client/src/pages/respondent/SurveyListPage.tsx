import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { PulseLine } from "../../components/pulse/PulseLine";

interface RespondentSurvey {
  id: number;
  title: string;
  courseCode: string;
  mode: "IDENTIFIED";
  status: "PUBLISHED";
  hasResponded: boolean;
}

export function SurveyListPage() {
  const [surveys, setSurveys] = useState<RespondentSurvey[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ surveys: RespondentSurvey[] }>("/api/surveys")
      .then(result => { if (!cancelled) setSurveys(result.surveys); })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof ApiClientError ? caught.message : "Could not load available surveys.");
        }
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <>
      <h1>Available surveys</h1>
      <PulseLine width={240} />

      {error && <div role="alert" className="alert alert-danger mt-3">{error}</div>}
      {!error && surveys === null && (
        <div role="status" aria-live="polite" className="mt-3">
          <span className="visually-hidden">Loading available surveys…</span>
          <PulseLine width={240} animate />
        </div>
      )}
      {surveys !== null && surveys.length === 0 && (
        <section className="cp-card p-3 p-sm-4 mt-3">
          <p className="cp-muted mb-0">No surveys available right now.</p>
        </section>
      )}
      {surveys !== null && surveys.length > 0 && (
        <ul className="list-unstyled mt-3 mb-0 d-grid gap-2">
          {surveys.map(survey => (
            <li key={survey.id} className="cp-card p-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <Link to={`/surveys/${survey.id}`} className="fw-semibold">{survey.title}</Link>
                <div className="cp-muted small">{survey.courseCode} · Identified survey</div>
              </div>
              {survey.hasResponded && <span className="badge rounded-pill text-bg-success">Submitted</span>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
