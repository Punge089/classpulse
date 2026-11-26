import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { PulseLine } from "../../components/pulse/PulseLine";
import { RatingDots } from "../../components/pulse/RatingDots";

interface ResponseHistoryItem {
  id: number;
  surveyId: number;
  surveyTitle: string;
  surveyStatus: "PUBLISHED" | "CLOSED";
  courseCode: string;
  courseTitle: string;
  submittedAt: string;
}
interface HistoryPage { responses: ResponseHistoryItem[]; nextCursor: string | null }
interface SavedAnswer {
  questionId: number;
  prompt: string;
  type: "RATING" | "SINGLE_CHOICE";
  ratingValue?: number;
  optionId?: number;
  optionLabel?: string;
}
interface SavedResponse {
  id: number;
  surveyId: number;
  submittedAt: string;
  answers: SavedAnswer[];
}

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) return error.message;
  return error instanceof Error ? error.message : fallback;
}

export function MyResponsesPage() {
  const { responseId: routeResponseId } = useParams();
  const location = useLocation();
  const responseId = routeResponseId ?? location.pathname.match(/^\/my-responses\/([^/]+)\/?$/)?.[1];
  const [history, setHistory] = useState<HistoryPage | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [detail, setDetail] = useState<SavedResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);

  useEffect(() => {
    const requestGeneration = ++generation.current;
    setHistory(null);
    setHistoryError(null);
    setHistoryLoading(true);
    setPageError(null);
    setPageLoading(false);
    setDetail(null);
    setDetailError(null);
    setDetailLoading(true);

    if (responseId) {
      apiFetch<{ response: SavedResponse }>(`/api/responses/${encodeURIComponent(responseId)}`)
        .then(result => {
          if (generation.current === requestGeneration) setDetail(result.response);
        })
        .catch((error: unknown) => {
          if (generation.current === requestGeneration) setDetailError(errorMessage(error, "Could not load your saved response."));
        })
        .finally(() => {
          if (generation.current === requestGeneration) setDetailLoading(false);
        });
    } else {
      apiFetch<HistoryPage>("/api/responses/mine")
        .then(result => {
          if (generation.current === requestGeneration) setHistory(result);
        })
        .catch((error: unknown) => {
          if (generation.current === requestGeneration) setHistoryError(errorMessage(error, "Could not load your response history."));
        })
        .finally(() => {
          if (generation.current === requestGeneration) setHistoryLoading(false);
        });
    }
    return () => { generation.current += 1; };
  }, [responseId, retry]);

  async function loadMore() {
    if (!history?.nextCursor || pageLoading) return;
    const requestGeneration = generation.current;
    const cursor = history.nextCursor;
    setPageLoading(true);
    setPageError(null);
    try {
      const page = await apiFetch<HistoryPage>(`/api/responses/mine?cursor=${encodeURIComponent(cursor)}`);
      if (generation.current !== requestGeneration) return;
      setHistory(current => {
        if (!current) return current;
        const existingIds = new Set(current.responses.map(row => row.id));
        const additions = page.responses.filter(row => !existingIds.has(row.id));
        return { responses: [...current.responses, ...additions], nextCursor: page.nextCursor };
      });
    } catch (error) {
      if (generation.current === requestGeneration) setPageError(errorMessage(error, "Could not load the next page."));
    } finally {
      if (generation.current === requestGeneration) setPageLoading(false);
    }
  }

  if (responseId) {
    return (
      <>
        <h1>Saved response</h1>
        <PulseLine width={240} />
        {detailLoading && <div role="status" aria-live="polite"><span className="visually-hidden">Loading saved response…</span><PulseLine width={240} animate /></div>}
        {detailError && (
          <div className="mt-3">
            <div role="alert" className="alert alert-danger">{detailError}</div>
            <button type="button" className="btn btn-outline-primary" onClick={() => setRetry(value => value + 1)}>Retry</button>
          </div>
        )}
        {detail && (
          <section className="cp-card p-3 p-sm-4 mt-3">
            <p>Identified survey — your name is stored with your answers</p>
            <p>Submitted on <time dateTime={detail.submittedAt}>{new Date(detail.submittedAt).toLocaleString()}</time></p>
            <h2 className="h5">Your answers</h2>
            <ol className="list-unstyled d-grid gap-3 mb-0">
              {detail.answers.map(answer => (
                <li key={answer.questionId}>
                  <div className="fw-semibold">{answer.prompt}</div>
                  {answer.type === "RATING" ? (
                    <RatingDots name={`saved-response-${detail.id}-question-${answer.questionId}`} value={answer.ratingValue ?? null} readOnly />
                  ) : <div>{answer.optionLabel}</div>}
                </li>
              ))}
            </ol>
          </section>
        )}
        <Link to="/my-responses" className="btn btn-primary mt-3">Back to my responses</Link>
      </>
    );
  }

  return (
    <>
      <h1>My responses</h1>
      <PulseLine width={240} />
      {historyLoading && <div role="status" aria-live="polite"><span className="visually-hidden">Loading your responses…</span><PulseLine width={240} animate /></div>}
      {historyError && (
        <div className="mt-3">
          <div role="alert" className="alert alert-danger">{historyError}</div>
          <button type="button" className="btn btn-outline-primary" onClick={() => setRetry(value => value + 1)}>Retry</button>
        </div>
      )}
      {!historyLoading && !historyError && history?.responses.length === 0 && (
        <section className="cp-card p-3 p-sm-4 mt-3"><p className="cp-muted mb-0">No saved responses yet.</p></section>
      )}
      {history && history.responses.length > 0 && (
        <ul className="list-unstyled mt-3 mb-0 d-grid gap-2">
          {history.responses.map(response => (
            <li key={response.id} className="cp-card p-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
              <div>
                <Link to={`/my-responses/${response.id}`} className="fw-semibold">{response.surveyTitle}</Link>
                <div className="cp-muted small">{response.courseCode} · {response.courseTitle} · {response.surveyStatus} · Identified survey</div>
                <time dateTime={response.submittedAt}>{new Date(response.submittedAt).toLocaleString()}</time>
              </div>
            </li>
          ))}
        </ul>
      )}
      {pageError && <div role="alert" className="alert alert-danger mt-3">{pageError}</div>}
      {history?.nextCursor && (
        <button type="button" className="btn btn-outline-primary mt-3" onClick={loadMore} disabled={pageLoading}>
          {pageLoading ? "Loading more…" : pageError ? "Retry" : "Load more"}
        </button>
      )}
    </>
  );
}
