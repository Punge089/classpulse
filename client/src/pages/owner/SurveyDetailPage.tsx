import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { StatusBadge } from "../../components/StatusBadge";
import { PulseLine } from "../../components/pulse/PulseLine";
import type { SurveyDetail } from "./surveyTypes";

export function SurveyDetailPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSurvey(null);
    setLoadError(null);
    apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}`)
      .then(result => { if (!cancelled) setSurvey(result.survey); })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof ApiClientError ? caught.message : "Could not load this survey.");
      });
    return () => { cancelled = true; };
  }, [id]);

  async function changeStatus(action: "publish" | "close") {
    setSending(true);
    setActionError(null);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}/${action}`, { method: "POST" });
      setSurvey(result.survey);
    } catch (caught) {
      setActionError(caught instanceof ApiClientError ? caught.message : "The change could not be made.");
    } finally {
      setSending(false);
    }
  }

  if (loadError) {
    return (
      <>
        <div role="alert" className="alert alert-danger">{loadError}</div>
        <Link to="/owner">Back to your surveys</Link>
      </>
    );
  }
  if (!survey) {
    return (
      <div role="status" aria-live="polite">
        <span className="visually-hidden">Loading survey…</span>
        <PulseLine width={240} animate />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">{survey.title}</h1>
          <div className="cp-muted">{survey.courseCode} · Identified survey</div>
        </div>
        <StatusBadge status={survey.status} />
      </div>
      <PulseLine width={240} />
      {survey.description && <p className="mt-3">{survey.description}</p>}

      {actionError && <div role="alert" className="alert alert-danger mt-3">{actionError}</div>}
      <div className="d-flex gap-2 flex-wrap my-3">
        {survey.status === "DRAFT" && (
          <button type="button" className="btn btn-primary" disabled={sending} onClick={() => changeStatus("publish")}>
            Publish
          </button>
        )}
        {survey.status === "PUBLISHED" && (
          <button type="button" className="btn btn-outline-secondary" disabled={sending} onClick={() => changeStatus("close")}>
            Close
          </button>
        )}
        {survey.status !== "DRAFT" && (
          <Link to={`/owner/surveys/${survey.id}/summary`} className="btn btn-outline-secondary">View summary</Link>
        )}
        <Link to="/owner" className="btn btn-link">Back to your surveys</Link>
      </div>

      <ol className="list-unstyled d-grid gap-2 mb-0">
        {survey.questions.map(question => (
          <li key={question.id} className="cp-card p-3">
            <div className="fw-semibold">{question.position}. {question.prompt}</div>
            <div className="cp-muted small">
              {question.type === "RATING" ? "Rating, 1 to 5" : "Single choice"}
              {question.required ? " · required" : " · optional"}
            </div>
            {question.options.length > 0 && (
              <ul className="mb-0 mt-2">
                {question.options.map(option => <li key={option.id}>{option.label}</li>)}
              </ul>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}
