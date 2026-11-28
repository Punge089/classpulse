import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { RatingDots } from "../../components/pulse/RatingDots";
import { PulseLine } from "../../components/pulse/PulseLine";

type RatingQuestionSummary = {
  questionId: number;
  prompt: string;
  type: "RATING";
  rating: {
    average: number | null;
    distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
  };
};

type ChoiceQuestionSummary = {
  questionId: number;
  prompt: string;
  type: "SINGLE_CHOICE";
  choice: { options: Array<{ optionId: number; label: string; count: number }> };
};
type MultiChoiceQuestionSummary = {
  questionId: number;
  prompt: string;
  type: "MULTI_CHOICE";
  multiChoice: { answeredCount: number; options: Array<{ optionId: number; label: string; count: number }> };
};
type TextQuestionSummary = { questionId: number; prompt: string; type: "TEXT"; text: { answeredCount: number } };

type Summary = {
  surveyId: number;
  status: string;
  responseCount: number;
  responseRate?: { respondedEligible: number; eligible: number; percent: number | null };
  questions: Array<RatingQuestionSummary | ChoiceQuestionSummary | MultiChoiceQuestionSummary | TextQuestionSummary>;
};

function IdentifiedCsvDownload({ surveyId }: { surveyId: number }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const activeRequest = useRef<AbortController | null>(null);
  useEffect(() => () => activeRequest.current?.abort(), []);

  async function download() {
    if (activeRequest.current) return;
    const controller = new AbortController();
    activeRequest.current = controller;
    setPending(true);
    setError("");
    const fallback = "Could not download the CSV. Try again.";
    try {
      const result = await fetch(`/api/owner/surveys/${surveyId}/export.csv`, {
        credentials: "include",
        headers: { Accept: "text/csv" },
        signal: controller.signal
      });
      if (!result.ok) {
        const failure = await result.json().catch(() => null) as { error?: { message?: string } } | null;
        throw new Error(failure?.error?.message || fallback);
      }
      if (!(result.headers.get("content-type") ?? "").startsWith("text/csv")) throw new Error(fallback);
      const file = await result.blob();
      if (controller.signal.aborted) return;
      const downloadUrl = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = `classpulse-survey-${surveyId}.csv`;
      document.body.append(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
    } catch (reason) {
      if (!controller.signal.aborted) {
        setError(reason instanceof Error && !(reason instanceof TypeError) ? reason.message : fallback);
      }
    } finally {
      activeRequest.current = null;
      if (!controller.signal.aborted) setPending(false);
    }
  }

  return (
    <section className="cp-card p-3 mt-3" aria-label="CSV export">
      <p>This CSV includes respondent names and emails.</p>
      <button type="button" className="btn btn-outline-primary" onClick={() => void download()} disabled={pending}>
        Download CSV
      </button>
      {pending && <p className="mt-2 mb-0" role="status">Preparing CSV…</p>}
      {error && <p className="alert alert-danger mt-2 mb-0" role="alert">{error}</p>}
    </section>
  );
}

export function SurveySummaryPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    apiFetch<{ summary: Summary }>(`/api/owner/surveys/${id}/summary`)
      .then(result => { if (!cancelled) setSummary(result.summary); })
      .catch((reason: unknown) => {
        if (!cancelled) {
          setError(reason instanceof ApiClientError ? reason.message : "Could not load the survey summary.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <section aria-labelledby="summary-heading">
      <h1 id="summary-heading">Survey summary</h1>
      {loading && <PulseLine width={240} animate />}
      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {!loading && summary && (
        <>
          <p className="cp-card p-3 mt-3" aria-label={`Response count: ${summary.responseCount}`}>
            <strong>Responses:</strong> {summary.responseCount}
          </p>
          {summary.responseRate && (
            <section className="cp-card p-3 mb-3" aria-labelledby="rate-heading">
              <h2 id="rate-heading" className="h5">Current roster response rate</h2>
              {summary.responseRate.percent === null ? <p>No eligible respondents</p> : (
                <p>{summary.responseRate.percent}% · {summary.responseRate.respondedEligible} of {summary.responseRate.eligible}</p>
              )}
              <p className="cp-muted mb-0">Roster changes can change this rate. Saved responses remain in the totals above.</p>
            </section>
          )}
          {summary.responseCount === 0 && <p className="cp-muted">No responses yet</p>}
          {summary.status !== "DRAFT" && (
            summary.questions.some(question => question.type === "TEXT" || question.type === "MULTI_CHOICE")
              ? <p className="cp-muted">CSV download currently supports rating and single-choice surveys.</p>
              : <IdentifiedCsvDownload key={summary.surveyId} surveyId={summary.surveyId} />
          )}
          <div className="d-grid gap-3">
            {summary.questions.map(question => (
              <article className="cp-card p-3 p-sm-4" key={question.questionId}>
                <h2 className="h4">{question.prompt}</h2>
                {question.type === "RATING" ? (
                  <div>
                    <p className="mb-1">
                      Average: <strong>{question.rating.average === null ? "—" : question.rating.average.toFixed(2)}</strong>
                    </p>
                    <div role="group" aria-label={`Rating summary for ${question.prompt}`}>
                      <RatingDots value={question.rating.average} name={`summary-${question.questionId}`} readOnly />
                    </div>
                    <dl className="row mb-0 mt-2">
                      {(["1", "2", "3", "4", "5"] as const).map(rating => (
                        <div className="col-4 col-sm-2" key={rating}>
                          <dt>Rating {rating}</dt>
                          <dd>{question.rating.distribution[rating]}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : question.type === "TEXT" ? (
                  <p className="mb-0">Answered: <strong>{question.text.answeredCount}</strong></p>
                ) : (
                  (() => {
                    const choice = question.type === "MULTI_CHOICE" ? question.multiChoice : question.choice;
                    const denominator = question.type === "MULTI_CHOICE" ? question.multiChoice.answeredCount : summary.responseCount;
                    return <ul className="list-unstyled mb-0">
                      {choice.options.map(option => {
                        const width = denominator === 0 ? 0 : Math.min(100, Math.round((option.count / denominator) * 100));
                        return (
                          <li className="mb-3" key={option.optionId}>
                            <div className="d-flex justify-content-between gap-3">
                              <span>{option.label}</span><strong>{option.count}</strong>
                            </div>
                            <div className="progress" role="img" aria-label={`${option.label}: ${option.count} responses` }>
                              <div className="progress-bar" style={{ width: `${width}%` }} />
                            </div>
                          </li>
                        );
                      })}
                      {question.type === "MULTI_CHOICE" && <li className="cp-muted small">Answered: {question.multiChoice.answeredCount}</li>}
                    </ul>;
                  })()
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
