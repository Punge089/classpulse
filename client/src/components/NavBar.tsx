import { Link, useNavigate } from "react-router-dom";
import { homePath, useAuth } from "../auth/AuthProvider";

export function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout().catch(() => undefined);
    navigate("/login");
  }

  return (
    <header className="cp-header">
      <div className="container cp-shell py-3 d-flex align-items-center justify-content-between gap-3 flex-wrap">
        <Link to={user ? homePath(user.role) : "/login"} className="cp-brand fs-4 text-decoration-none">
          ClassPulse
        </Link>
        {user && (
          <div className="d-flex align-items-center gap-3">
            <span className="cp-muted">{user.fullName} · {user.role}</span>
            <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
