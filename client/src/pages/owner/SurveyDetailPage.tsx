import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiClientError, apiFetch } from "../../api";
import { StatusBadge } from "../../components/StatusBadge";
import { PulseLine } from "../../components/pulse/PulseLine";
import type { SurveyDetail, SurveyLifecycleEvent } from "./surveyTypes";

function localClosingTime(closesAt?: string | null): string {
  if (!closesAt) return "";
  const date = new Date(closesAt);
  const datePart = [date.getFullYear(), date.getMonth() + 1, date.getDate()]
    .map((part, index) => String(part).padStart(index === 0 ? 4 : 2, "0")).join("-");
  const [hour, minute, second] = [date.getHours(), date.getMinutes(), date.getSeconds()]
    .map(part => String(part).padStart(2, "0"));
  const milliseconds = String(date.getMilliseconds()).padStart(3, "0").replace(/0+$/, "");
  const seconds = second === "00" && !milliseconds ? "" : `:${second}`;
  const fraction = milliseconds ? `.${milliseconds}` : "";
  return `${datePart}T${hour}:${minute}${seconds}${fraction}`;
}

export function SurveyDetailPage() {
  const { id } = useParams();
  const [survey, setSurvey] = useState<SurveyDetail | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [scheduleValue, setScheduleValue] = useState("");
  const [scheduleError, setScheduleError] = useState<string | null>(null);
  const [scheduleStale, setScheduleStale] = useState(false);
  const [reopenForm, setReopenForm] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [events, setEvents] = useState<SurveyLifecycleEvent[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const historyRequest = useRef(0);

  const loadHistory = useCallback(async (before?: number) => {
    const request = ++historyRequest.current;
    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const result = await apiFetch<{ events: SurveyLifecycleEvent[]; nextCursor: number | null }>(
        `/api/owner/surveys/${id}/lifecycle${before === undefined ? "" : `?before=${before}`}`
      );
      if (request !== historyRequest.current) return;
      setEvents(current => before === undefined ? result.events : [...current, ...result.events]);
      setNextCursor(result.nextCursor);
    } catch {
      if (request === historyRequest.current) setHistoryError("Could not load lifecycle history.");
    } finally {
      if (request === historyRequest.current) setHistoryLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setSurvey(null);
    setLoadError(null);
    setEvents([]);
    setNextCursor(null);
    setReopenForm(false);
    setReason("");
    setReasonError(null);
    setStale(false);
    setActionError(null);
    apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}`)
      .then(result => { if (!cancelled) setSurvey(result.survey); })
      .catch((caught: unknown) => {
        if (!cancelled) setLoadError(caught instanceof ApiClientError ? caught.message : "Could not load this survey.");
      });
    void loadHistory();
    return () => { cancelled = true; historyRequest.current++; };
  }, [id, loadHistory]);

  function resetSchedule(closesAt?: string | null) {
    setScheduleValue(localClosingTime(closesAt));
    setScheduleError(null);
    setScheduleStale(false);
  }

  useEffect(() => {
    resetSchedule(survey?.closesAt);
  }, [survey?.id, survey?.updatedAt, survey?.closesAt]);

  async function saveSchedule(event: FormEvent) {
    event.preventDefault();
    if (!survey || sending || scheduleStale) return;
    const selected = scheduleValue ? new Date(scheduleValue) : null;
    if (selected && (!Number.isFinite(selected.getTime()) || selected.getFullYear() < 2000 || selected.getFullYear() > 9999 ||
        localClosingTime(selected.toISOString()) !== scheduleValue)) {
      setScheduleError("Enter a valid local closing time in years 2000 through 9999.");
      return;
    }
    setSending(true);
    setScheduleError(null);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${survey.id}/schedule`, {
        method: "PUT",
        body: JSON.stringify({ closesAt: selected?.toISOString() ?? null, expectedUpdatedAt: survey.updatedAt })
      });
      setSurvey(result.survey);
    } catch (caught) {
      if (caught instanceof ApiClientError) {
        setScheduleError(caught.details?.find(field => field.field === "closesAt")?.message ?? caught.message);
        if (caught.code === "STALE_SURVEY") setScheduleStale(true);
      } else {
        setScheduleError("Could not save the closing time. Try again.");
      }
    } finally {
      setSending(false);
    }
  }

  async function changeStatus(action: "publish" | "close") {
    setSending(true);
    setActionError(null);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}/${action}`, { method: "POST" });
      setSurvey(result.survey);
      await loadHistory();
    } catch (caught) {
      setActionError(caught instanceof ApiClientError ? caught.message : "The change could not be made.");
    } finally {
      setSending(false);
    }
  }

  async function reopen(event: FormEvent) {
    event.preventDefault();
    if (!survey || sending || stale) return;
    const trimmed = reason.trim();
    setActionError(null);
    if (trimmed.length < 10 || trimmed.length > 300) {
      setReasonError("Enter a reason of 10 to 300 characters");
      return;
    }
    setReasonError(null);
    setSending(true);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}/reopen`, {
        method: "POST", body: JSON.stringify({ reason: trimmed, expectedVersion: survey.statusVersion })
      });
      setSurvey(result.survey);
      setReopenForm(false);
      setReason("");
      await loadHistory();
    } catch (caught) {
      setActionError(caught instanceof ApiClientError ? caught.message : "The change could not be made.");
      if (caught instanceof ApiClientError) {
        setReasonError(caught.details?.find(field => field.field === "reason")?.message ?? null);
        if (caught.code === "STALE_SURVEY") setStale(true);
      }
    } finally {
      setSending(false);
    }
  }

  async function reloadSurvey() {
    setSending(true);
    setActionError(null);
    try {
      const result = await apiFetch<{ survey: SurveyDetail }>(`/api/owner/surveys/${id}`);
      setSurvey(result.survey);
      setStale(false);
      resetSchedule(result.survey.closesAt);
      await loadHistory();
    } catch (caught) {
      setActionError(caught instanceof ApiClientError ? caught.message : "Could not reload this survey.");
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

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const deadlineReached = survey.status === "PUBLISHED" && survey.closesAt && Date.parse(survey.closesAt) <= Date.now();
  return (
    <>
      <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
        <div>
          <h1 className="mb-1">{survey.title}</h1>
          <div className="cp-muted">{survey.courseCode} · Identified survey</div>
        </div>
        {deadlineReached ? <span className="badge rounded-pill text-bg-secondary">Closed - deadline reached</span>
          : <StatusBadge status={survey.status} />}
      </div>
      <PulseLine width={240} />
      {survey.description && <p className="mt-3">{survey.description}</p>}

      {actionError && <div role="alert" className="alert alert-danger mt-3">{actionError}</div>}
      {stale && <button type="button" className="btn btn-outline-secondary" disabled={sending} onClick={() => void reloadSurvey()}>Reload survey</button>}
      <div className="d-flex gap-2 flex-wrap my-3">
          {survey.status === "DRAFT" && <Link to={`/owner/surveys/${survey.id}/edit`} className="btn btn-outline-primary">Edit questions</Link>}
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
        {survey.status === "CLOSED" && !reopenForm && (
          <button type="button" className="btn btn-primary" disabled={sending} onClick={() => { setReopenForm(true); setActionError(null); }}>
            Reopen
          </button>
        )}
        {survey.status !== "DRAFT" && (
          <Link to={`/owner/surveys/${survey.id}/summary`} className="btn btn-outline-secondary">View summary</Link>
        )}
        <Link to="/owner" className="btn btn-link">Back to your surveys</Link>
      </div>

      <section className="cp-card p-3 mb-3" aria-labelledby="schedule-heading">
        <h2 className="h5" id="schedule-heading">Response deadline</h2>
        {survey.closesAt ? (
          <p>Saved closing time: <time dateTime={survey.closesAt}>{new Date(survey.closesAt).toLocaleString(undefined, {
            dateStyle: "medium", timeStyle: "short"
          })} ({timezone})</time></p>
        ) : <p>No closing time set.</p>}
        {survey.status === "PUBLISHED" ? (
          <p className="cp-muted mb-0">Close this survey before changing its deadline</p>
        ) : (
          <form onSubmit={saveSchedule} noValidate>
            <label className="form-label" htmlFor="closing-time">Closing time</label>
            <input id="closing-time" type="datetime-local" className="form-control" step="0.001"
              min="2000-01-01T00:00" max="9999-12-31T23:59:59.999" value={scheduleValue}
              onChange={event => setScheduleValue(event.target.value)} disabled={sending}
              aria-invalid={Boolean(scheduleError)} aria-describedby={scheduleError ? "closing-time-zone closing-time-error" : "closing-time-zone"} />
            <p id="closing-time-zone" className="cp-muted small mt-1">Local time ({timezone}). Leave blank for no deadline.</p>
            {scheduleError && <p id="closing-time-error" role="alert" className="text-danger">{scheduleError}</p>}
            {scheduleStale && <button type="button" className="btn btn-outline-secondary mb-2" disabled={sending}
              onClick={() => void reloadSurvey()}>Reload closing time</button>}
            <div className="d-flex flex-wrap gap-2">
              <button type="submit" className="btn btn-primary" disabled={sending || scheduleStale}>Save closing time</button>
              <button type="button" className="btn btn-outline-secondary" disabled={sending || !scheduleValue}
                onClick={() => setScheduleValue("")}>Clear closing time</button>
              <button type="button" className="btn btn-outline-secondary" disabled={sending}
                onClick={() => { setScheduleValue(localClosingTime(survey.closesAt)); setScheduleError(null); }}>Cancel closing time</button>
            </div>
          </form>
        )}
      </section>

      {survey.status === "CLOSED" && reopenForm && (
        <form className="cp-card p-3 mb-3" noValidate onSubmit={reopen}>
          <p id="reopen-hint">Previous answers remain. Students who already answered cannot submit twice.</p>
          <label className="form-label" htmlFor="reopen-reason">Reason for reopening</label>
          <textarea id="reopen-reason" className={`form-control${reasonError ? " is-invalid" : ""}`} value={reason}
            maxLength={300} disabled={sending} onChange={event => setReason(event.target.value)}
            aria-invalid={Boolean(reasonError)} aria-describedby={`reopen-hint reopen-count${reasonError ? " reopen-error" : ""}`} />
          <div id="reopen-count" className="cp-muted small">{reason.trim().length}/300 characters; at least 10 required</div>
          {reasonError && <div id="reopen-error" className="invalid-feedback d-block">{reasonError}</div>}
          <div className="d-flex gap-2 mt-3">
            <button type="submit" className="btn btn-primary" disabled={sending || stale}>{sending ? "Reopening…" : "Confirm reopen"}</button>
            <button type="button" className="btn btn-outline-secondary" disabled={sending} onClick={() => { setReopenForm(false); setReason(""); setReasonError(null); }}>Cancel reopen</button>
          </div>
        </form>
      )}

      <ol className="list-unstyled d-grid gap-2 mb-0">
        {survey.questions.map(question => (
          <li key={question.id} className="cp-card p-3">
            <div className="fw-semibold">{question.position}. {question.prompt}</div>
            <div className="cp-muted small">
              {question.type === "RATING" ? "Rating, 1 to 5" : question.type === "SINGLE_CHOICE" ? "Single choice" : question.type === "TEXT" ? "Text" : "Multiple choice"}
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

      <section aria-label="Lifecycle history" className="cp-card p-3 mt-3">
        <h2 className="h5">Lifecycle history</h2>
        {historyLoading && <div role="status">Loading lifecycle history…</div>}
        {historyError && <div role="alert" className="alert alert-danger">{historyError}</div>}
        {!historyLoading && !historyError && events.length === 0 && <p className="cp-muted mb-0">No lifecycle events recorded for this version</p>}
        <ol className="list-unstyled mb-0">
          {events.map(event => <li key={event.id} className="mb-3">
            <div><strong>{event.action}</strong> · {event.fromStatus} → {event.toStatus} · Version {event.version}</div>
            <time className="cp-muted small" dateTime={event.occurredAt}>{new Date(event.occurredAt).toLocaleString()}</time>
            {event.reason && <p className="mb-0">{event.reason}</p>}
            {event.previousClosedAt && <div className="cp-muted small">Previous closure: <time dateTime={event.previousClosedAt}>{new Date(event.previousClosedAt).toLocaleString()}</time></div>}
          </li>)}
        </ol>
        {nextCursor !== null && <button type="button" className="btn btn-outline-secondary" disabled={historyLoading} onClick={() => void loadHistory(nextCursor)}>Load older</button>}
        {historyError && <button type="button" className="btn btn-outline-secondary" disabled={historyLoading} onClick={() => void loadHistory()}>Retry history</button>}
      </section>
    </>
  );
}
