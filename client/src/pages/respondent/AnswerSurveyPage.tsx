import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { PulseLine } from "../../components/pulse/PulseLine";
import { RatingDots } from "../../components/pulse/RatingDots";

type QuestionType = "RATING" | "SINGLE_CHOICE";
type DraftAnswer = number | string;

interface SurveyQuestion {
  id: number;
  position: number;
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: Array<{ id: number; position: number; label: string }>;
}

interface RespondentSurveyDetail {
  id: number;
  title: string;
  description: string | null;
  courseCode: string;
  mode: "IDENTIFIED";
  status: "PUBLISHED";
  questions: SurveyQuestion[];
}

export function AnswerSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<RespondentSurveyDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [answers, setAnswers] = useState<Record<number, DraftAnswer>>({});
  const [sending, setSending] = useState(false);
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSurvey(null);
    setLoadError(null);
    setAnswers({});
    apiFetch<{ survey: RespondentSurveyDetail }>(`/api/surveys/${id}`)
      .then(result => { if (!cancelled) setSurvey(result.survey); })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setLoadError(caught instanceof ApiClientError ? caught.message : "Could not load this survey.");
        }
      });
    return () => { cancelled = true; };
  }, [id]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!survey || sending || locked) return;
    setSending(true);
    setError(null);

    const payloadAnswers: Array<{ questionId: number; ratingValue?: number; optionId?: number }> = [];
    for (const question of survey.questions) {
      const answer = answers[question.id];
      if (answer === undefined) continue;
      if (question.type === "RATING") {
        payloadAnswers.push({ questionId: question.id, ratingValue: answer as number });
      } else {
        payloadAnswers.push({ questionId: question.id, optionId: answer as number });
      }
    }
    const payload = { answers: payloadAnswers };

    try {
      const result = await apiFetch<{ response: { id: number } }>(`/api/surveys/${survey.id}/responses`, {
        method: "POST",
        body: JSON.stringify(payload)
      });
      navigate(`/responses/${result.response.id}`);
    } catch (caught) {
      const apiError = caught instanceof ApiClientError
        ? caught
        : new ApiClientError(0, "NETWORK_ERROR", "Could not reach the server. Please try again.");
      setError(apiError);
      if (apiError.status === 409) setLocked(true);
    } finally {
      setSending(false);
    }
  }

  if (loadError) {
    return (
      <>
        <div role="alert" className="alert alert-danger">{loadError}</div>
        <Link to="/surveys">Back to surveys</Link>
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
          <div className="cp-muted">{survey.courseCode}</div>
        </div>
        <Link to="/surveys" className="btn btn-link">Back to surveys</Link>
      </div>
      <PulseLine width={240} />
      <div className="alert alert-info mt-3" role="note">
        Identified survey — your name is stored with your answers
      </div>
      {survey.description && <p>{survey.description}</p>}

      <form className="cp-card p-3 p-sm-4 mt-3" onSubmit={submit} noValidate>
        {error && (
          <div role="alert" className="alert alert-danger">
            <p className="mb-0">{error.message}</p>
            {error.details && error.details.length > 0 && (
              <ul className="mb-0 mt-2">
                {error.details.map((detail, index) => <li key={`${detail.field}-${index}`}>{detail.message}</li>)}
              </ul>
            )}
          </div>
        )}

        {survey.questions.map(question => (
          <fieldset key={question.id} className="border rounded p-3 mb-3">
            <legend className="h5 px-1 float-none w-auto">{question.prompt}</legend>
            {question.type === "RATING" ? (
              <>
                <RatingDots
                  name={`question-${question.id}`}
                  value={typeof answers[question.id] === "number" ? answers[question.id] as number : null}
                  onChange={value => setAnswers(current => ({ ...current, [question.id]: value }))}
                />
                <div className="d-flex justify-content-between cp-muted small" aria-hidden="true">
                  <span>1 — Not at all</span><span>5 — Very much</span>
                </div>
              </>
            ) : (
              <div className="d-grid gap-2">
                {question.options.map(option => {
                  const inputId = `question-${question.id}-option-${option.id}`;
                  return (
                    <div className="form-check" key={option.id}>
                      <input
                        className="form-check-input" type="radio" id={inputId}
                        name={`question-${question.id}`} value={option.id}
                        checked={answers[question.id] === option.id}
                        onChange={() => setAnswers(current => ({ ...current, [question.id]: option.id }))}
                      />
                      <label className="form-check-label" htmlFor={inputId}>{option.label}</label>
                    </div>
                  );
                })}
              </div>
            )}
            {!question.required && <div className="cp-muted small mt-2">Optional</div>}
          </fieldset>
        ))}

        <button type="submit" className="btn btn-primary" disabled={sending || locked}>
          {sending ? "Submitting…" : "Submit"}
        </button>
      </form>
    </>
  );
}
