import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { PulseLine } from "../../components/pulse/PulseLine";
import { RatingDots } from "../../components/pulse/RatingDots";

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

export function ConfirmationPage() {
  const { id } = useParams();
  const [response, setResponse] = useState<SavedResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setResponse(null);
    setError(null);
    apiFetch<{ response: SavedResponse }>(`/api/responses/${id}`)
      .then(result => { if (!cancelled) setResponse(result.response); })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof ApiClientError ? caught.message : "Could not load your saved response.");
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  if (error) {
    return (
      <>
        <div role="alert" className="alert alert-danger">{error}</div>
        <Link to="/surveys">Back to surveys</Link>
      </>
    );
  }
  if (!response) {
    return (
      <div role="status" aria-live="polite">
        <span className="visually-hidden">Loading your response…</span>
        <PulseLine width={240} animate />
      </div>
    );
  }

  return (
    <>
      <h1>Response submitted</h1>
      <PulseLine width={240} />
      <section className="cp-card p-3 p-sm-4 mt-3">
        <p className="h5">Thanks — your response is in.</p>
        <p className="mb-3">Submitted on <time dateTime={response.submittedAt}>{new Date(response.submittedAt).toLocaleString()}</time></p>
        <h2 className="h5">Your answers</h2>
        <ol className="list-unstyled d-grid gap-3 mb-0">
          {response.answers.map(answer => (
            <li key={answer.questionId}>
              <div className="fw-semibold">{answer.prompt}</div>
              {answer.type === "RATING" ? (
                <RatingDots name={`response-${response.id}-question-${answer.questionId}`} value={answer.ratingValue ?? null} readOnly />
              ) : (
                <div>{answer.optionLabel}</div>
              )}
            </li>
          ))}
        </ol>
      </section>
      <Link to="/surveys" className="btn btn-primary mt-3">Back to surveys</Link>
    </>
  );
}
