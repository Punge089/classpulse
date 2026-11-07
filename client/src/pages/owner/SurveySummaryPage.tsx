import { useEffect, useState } from "react";
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

type Summary = {
  surveyId: number;
  status: string;
  responseCount: number;
  questions: Array<RatingQuestionSummary | ChoiceQuestionSummary>;
};

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
          {summary.responseCount === 0 && <p className="cp-muted">No responses yet</p>}
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
                ) : (
                  <ul className="list-unstyled mb-0">
                    {question.choice.options.map(option => {
                      const width = summary.responseCount === 0
                        ? 0
                        : Math.min(100, Math.round((option.count / summary.responseCount) * 100));
                      return (
                        <li className="mb-3" key={option.optionId}>
                          <div className="d-flex justify-content-between gap-3">
                            <span>{option.label}</span>
                            <strong>{option.count}</strong>
                          </div>
                          <div className="progress" role="img" aria-label={`${option.label}: ${option.count} responses`}>
                            <div className="progress-bar" style={{ width: `${width}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
