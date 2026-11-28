import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import type { QuestionType, SurveyDetail } from "./surveyTypes";

type Question = { prompt: string; type: QuestionType; required: boolean; options: string[] };
const blankQuestion = (): Question => ({ prompt: "", type: "RATING", required: true, options: [] });

export function EditSurveyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiClientError | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}`)
      .then(({ survey: result }) => {
        if (!active) return;
        setSurvey(result);
        setQuestions(result.questions.map(q => ({ prompt: q.prompt, type: q.type, required: q.required, options: q.options.map(o => o.label) })));
      })
      .catch((caught: unknown) => { if (active) setError(caught instanceof ApiClientError ? caught : new ApiClientError(0, "NETWORK_ERROR", "Could not load this survey.")); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  function update(index: number, changes: Partial<Question>) {
    setQuestions(current => current.map((q, i) => i === index ? { ...q, ...changes } : q));
  }
  function move(index: number, offset: number) {
    setQuestions(current => {
      const target = index + offset;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    if (!survey || sending) return;
    setSending(true);
    setError(null);
    try {
      await apiFetch(`/api/owner/surveys/${id}/questions`, {
        method: "PUT",
        body: JSON.stringify({ expectedUpdatedAt: survey.updatedAt, questions: questions.map(q => ({
          prompt: q.prompt, type: q.type, required: q.required,
          ...(q.type === "SINGLE_CHOICE" ? { options: q.options } : {})
        })) })
      });
      navigate(`/owner/surveys/${id}`);
    } catch (caught) {
      setError(caught instanceof ApiClientError ? caught : new ApiClientError(0, "NETWORK_ERROR", "Could not save your changes."));
    } finally { setSending(false); }
  }
  const fieldMessage = (field: string) => error?.details?.find(item => item.field === field)?.message;
  const back = `/owner/surveys/${id}`;

  return <>
    <h1>Edit questions</h1>
    {loading && <p role="status">Loading survey…</p>}
    {error && <div role="alert" className="alert alert-danger">{error.message}{error.status === 409 && " Reload the survey before trying again; your unsaved edits are still shown."}</div>}
    {!loading && survey && survey.status !== "DRAFT" && <p>Only draft surveys can be edited.</p>}
    {!loading && survey?.status === "DRAFT" && <form onSubmit={save}>
      <p>Editing {survey.title}</p>
      {fieldMessage("questions") && <p role="alert">{fieldMessage("questions")}</p>}
      {questions.map((question, index) => <fieldset className="cp-card p-3 mb-3" key={index}>
        <legend className="h5">Question {index + 1}</legend>
        <label className="form-label" htmlFor={`prompt-${index}`}>Question {index + 1} text</label>
        <input className="form-control" id={`prompt-${index}`} value={question.prompt} onChange={e => update(index, { prompt: e.target.value })} />
        {fieldMessage(`questions[${index}].prompt`) && <div className="text-danger">{fieldMessage(`questions[${index}].prompt`)}</div>}
        <label className="form-label mt-2" htmlFor={`type-${index}`}>Question {index + 1} type</label>
        <select className="form-select" id={`type-${index}`} value={question.type} onChange={e => {
          const type = e.target.value as QuestionType;
          update(index, { type, options: type === "SINGLE_CHOICE" ? ["", ""] : [] });
        }}><option value="RATING">Rating</option><option value="SINGLE_CHOICE">Single choice</option></select>
        <label className="d-block mt-2"><input type="checkbox" checked={question.required} onChange={e => update(index, { required: e.target.checked })} /> Required</label>
        {question.type === "SINGLE_CHOICE" && <div>
          {question.options.map((option, oi) => <div key={oi} className="my-2">
            <label htmlFor={`option-${index}-${oi}`}>Option {oi + 1}</label>
            <input className="form-control" id={`option-${index}-${oi}`} value={option} onChange={e => update(index, { options: question.options.map((v, i) => i === oi ? e.target.value : v) })} />
            {fieldMessage(`questions[${index}].options[${oi}]`) && <div className="text-danger">{fieldMessage(`questions[${index}].options[${oi}]`)}</div>}
            <button type="button" disabled={question.options.length <= 2} onClick={() => update(index, { options: question.options.filter((_, i) => i !== oi) })}>Remove option {oi + 1}</button>
          </div>)}
          {fieldMessage(`questions[${index}].options`) && <div className="text-danger">{fieldMessage(`questions[${index}].options`)}</div>}
          <button type="button" disabled={question.options.length >= 6} onClick={() => update(index, { options: [...question.options, ""] })}>Add option</button>
        </div>}
        <div className="d-flex gap-2 mt-2">
          <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>Move up</button>
          <button type="button" disabled={index === questions.length - 1} onClick={() => move(index, 1)}>Move down</button>
          <button type="button" disabled={questions.length <= 1} onClick={() => setQuestions(current => current.filter((_, i) => i !== index))}>Remove question</button>
        </div>
      </fieldset>)}
      <button type="button" disabled={questions.length >= 20} onClick={() => setQuestions(current => [...current, blankQuestion()])}>Add question</button>{" "}
      <button className="btn btn-primary" type="submit" disabled={sending}>{sending ? "Saving…" : "Save questions"}</button>
    </form>}
    <Link className="btn btn-link" to={back}>Cancel and return</Link>
  </>;
}
