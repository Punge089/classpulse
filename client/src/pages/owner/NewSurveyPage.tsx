import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiClientError, apiFetch, type FieldError } from "../../api";
import { PulseLine } from "../../components/pulse/PulseLine";
import type { Course, QuestionType, SurveyDetail } from "./surveyTypes";

interface QuestionDraft {
  prompt: string;
  type: QuestionType;
  required: boolean;
  options: string[];
}

const newQuestion = (): QuestionDraft => ({ prompt: "", type: "RATING", required: true, options: ["", ""] });

export function NewSurveyPage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch<{ courses: Course[] }>("/api/owner/courses")
      .then(result => {
        if (cancelled) return;
        setCourses(result.courses);
        if (result.courses.length === 1) setCourseId(String(result.courses[0].id));
      })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof ApiClientError ? caught.message : "Could not load your courses.");
      });
    return () => { cancelled = true; };
  }, []);

  const details: FieldError[] = error?.details ?? [];
  const messageFor = (field: string) => details.find(d => d.field === field)?.message;
  const invalid = (field: string) => (messageFor(field) ? " is-invalid" : "");
  const feedback = (field: string, id: string) =>
    messageFor(field) ? <div id={id} className="invalid-feedback d-block">{messageFor(field)}</div> : null;

  function updateQuestion(index: number, change: Partial<QuestionDraft>) {
    setQuestions(current => current.map((q, i) => (i === index ? { ...q, ...change } : q)));
  }
  function updateOption(qIndex: number, oIndex: number, label: string) {
    setQuestions(current => current.map((q, i) =>
      i === qIndex ? { ...q, options: q.options.map((o, j) => (j === oIndex ? label : o)) } : q));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>("/api/owner/surveys", {
        method: "POST",
        body: JSON.stringify({
          courseId: courseId === "" ? null : Number(courseId),
          title,
          description: description.trim() === "" ? undefined : description,
          questions: questions.map(q => ({
            prompt: q.prompt,
            type: q.type,
            required: q.required,
            ...(q.type === "SINGLE_CHOICE" ? { options: q.options } : {})
          }))
        })
      });
      navigate(`/owner/surveys/${result.survey.id}`);
    } catch (caught) {
      setError(caught instanceof ApiClientError
        ? caught
        : new ApiClientError(0, "NETWORK_ERROR", "Could not reach the server. Please try again."));
    } finally {
      setSending(false);
    }
  }

  if (loadError) return <div role="alert" className="alert alert-danger">{loadError}</div>;
  if (courses === null) {
    return (
      <div role="status" aria-live="polite">
        <span className="visually-hidden">Loading…</span>
        <PulseLine width={240} animate />
      </div>
    );
  }

  return (
    <>
      <h1>New survey</h1>
      <PulseLine width={240} />
      <form className="cp-card p-3 p-sm-4 mt-3" onSubmit={submit} noValidate>
        {error && <div role="alert" className="alert alert-danger">{error.message}</div>}

        <div className="mb-3">
          <label htmlFor="survey-course" className="form-label">Course</label>
          <select
            id="survey-course" className={"form-select" + invalid("courseId")} value={courseId}
            aria-describedby={messageFor("courseId") ? "survey-course-error" : undefined}
            onChange={event => setCourseId(event.target.value)}
          >
            <option value="">Choose a course</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.code} — {course.title}</option>
            ))}
          </select>
          {feedback("courseId", "survey-course-error")}
        </div>

        <div className="mb-3">
          <label htmlFor="survey-title" className="form-label">Title</label>
          <input
            id="survey-title" className={"form-control" + invalid("title")} value={title}
            aria-describedby={messageFor("title") ? "survey-title-error" : undefined}
            onChange={event => setTitle(event.target.value)}
          />
          {feedback("title", "survey-title-error")}
        </div>

        <div className="mb-4">
          <label htmlFor="survey-description" className="form-label">Description (optional)</label>
          <textarea
            id="survey-description" rows={2} className={"form-control" + invalid("description")} value={description}
            aria-describedby={messageFor("description") ? "survey-description-error" : undefined}
            onChange={event => setDescription(event.target.value)}
          />
          {feedback("description", "survey-description-error")}
        </div>

        <h2 className="h5">Questions</h2>
        {feedback("questions", "survey-questions-error")}
        {questions.map((question, index) => (
          <fieldset key={index} className="border rounded p-3 mb-3">
            <legend className="h6 px-1 float-none w-auto">Question {index + 1}</legend>
            <div className="mb-3">
              <label htmlFor={`q${index}-prompt`} className="form-label">Question {index + 1} text</label>
              <input
                id={`q${index}-prompt`} className={"form-control" + invalid(`questions[${index}].prompt`)} value={question.prompt}
                aria-describedby={messageFor(`questions[${index}].prompt`) ? `q${index}-prompt-error` : undefined}
                onChange={event => updateQuestion(index, { prompt: event.target.value })}
              />
              {feedback(`questions[${index}].prompt`, `q${index}-prompt-error`)}
            </div>
            <div className="row g-3 align-items-end mb-2">
              <div className="col-sm-6">
                <label htmlFor={`q${index}-type`} className="form-label">Question {index + 1} type</label>
                <select
                  id={`q${index}-type`} className={"form-select" + invalid(`questions[${index}].type`)} value={question.type}
                  onChange={event => updateQuestion(index, { type: event.target.value as QuestionType })}
                >
                  <option value="RATING">Rating (1 to 5)</option>
                  <option value="SINGLE_CHOICE">Single choice</option>
                </select>
              </div>
              <div className="col-sm-6 form-check ms-sm-0 ps-sm-4">
                <input
                  id={`q${index}-required`} type="checkbox" className="form-check-input" checked={question.required}
                  onChange={event => updateQuestion(index, { required: event.target.checked })}
                />
                <label htmlFor={`q${index}-required`} className="form-check-label">Question {index + 1} is required</label>
              </div>
            </div>

            {question.type === "SINGLE_CHOICE" && (
              <div className="mt-3">
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className="input-group mb-2">
                    <input
                      aria-label={`Question ${index + 1} option ${oIndex + 1}`} className="form-control" value={option}
                      onChange={event => updateOption(index, oIndex, event.target.value)}
                    />
                    <button
                      type="button" className="btn btn-outline-secondary"
                      aria-label={`Remove option ${oIndex + 1} of question ${index + 1}`}
                      onClick={() => updateQuestion(index, { options: question.options.filter((_o, j) => j !== oIndex) })}
                    >
                      Remove
                    </button>
                  </div>
                ))}
                {feedback(`questions[${index}].options`, `q${index}-options-error`)}
                <button
                  type="button" className="btn btn-sm btn-outline-secondary"
                  onClick={() => updateQuestion(index, { options: [...question.options, ""] })}
                >
                  Add option
                </button>
              </div>
            )}

            {questions.length > 1 && (
              <div className="mt-3">
                <button
                  type="button" className="btn btn-sm btn-link text-danger p-0"
                  onClick={() => setQuestions(current => current.filter((_q, i) => i !== index))}
                >
                  Remove question {index + 1}
                </button>
              </div>
            )}
          </fieldset>
        ))}

        <div className="d-flex gap-2 flex-wrap">
          <button type="button" className="btn btn-outline-secondary" onClick={() => setQuestions(c => [...c, newQuestion()])}>
            Add question
          </button>
          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? "Creating…" : "Create survey"}
          </button>
          <Link to="/owner" className="btn btn-link">Cancel</Link>
        </div>
      </form>
    </>
  );
}
