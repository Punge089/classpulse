import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { PulseLine } from "../components/pulse/PulseLine";
import { homePath, useAuth, type Role } from "./AuthProvider";

/**
 * Convenience guard only: it redirects, it does not protect data.
 * Every API route enforces its own role and ownership checks on the server.
 */
export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div role="status" aria-live="polite">
        <span className="visually-hidden">Loading…</span>
        <PulseLine width={240} animate />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={homePath(user.role)} replace />;
  return <>{children}</>;
}
