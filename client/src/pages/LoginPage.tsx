import { useState, type FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { ApiClientError } from "../api";
import { homePath, useAuth } from "../auth/AuthProvider";
import { PulseLine } from "../components/pulse/PulseLine";

export function LoginPage() {
  const { user, loading, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);

  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <span className="visually-hidden">Loading…</span>
        <PulseLine width={240} animate />
      </div>
    );
  }
  if (user) return <Navigate to={homePath(user.role)} replace />;

  const fieldMessage = (field: string) => error?.details?.find(d => d.field === field)?.message;

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setError(null);
    try {
      await login(email, password);
    } catch (caught) {
      setError(caught instanceof ApiClientError
        ? caught
        : new ApiClientError(0, "NETWORK_ERROR", "Could not reach the server. Please try again."));
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <h1>Sign in</h1>
      <PulseLine width={240} />
      <form className="cp-card p-3 p-sm-4 mt-3" onSubmit={submit} noValidate>
        {error && <div role="alert" className="alert alert-danger">{error.message}</div>}
        <div className="mb-3">
          <label htmlFor="login-email" className="form-label">Email</label>
          <input
            id="login-email" type="email" autoComplete="username" value={email}
            className={"form-control" + (fieldMessage("email") ? " is-invalid" : "")}
            aria-describedby={fieldMessage("email") ? "login-email-error" : undefined}
            onChange={event => setEmail(event.target.value)}
          />
          {fieldMessage("email") && (
            <div id="login-email-error" className="invalid-feedback d-block">{fieldMessage("email")}</div>
          )}
        </div>
        <div className="mb-3">
          <label htmlFor="login-password" className="form-label">Password</label>
          <input
            id="login-password" type="password" autoComplete="current-password" value={password}
            className={"form-control" + (fieldMessage("password") ? " is-invalid" : "")}
            aria-describedby={fieldMessage("password") ? "login-password-error" : undefined}
            onChange={event => setPassword(event.target.value)}
          />
          {fieldMessage("password") && (
            <div id="login-password-error" className="invalid-feedback d-block">{fieldMessage("password")}</div>
          )}
        </div>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </>
  );
}
