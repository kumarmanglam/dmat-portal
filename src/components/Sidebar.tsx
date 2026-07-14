import { NavLink } from "react-router-dom";
import { MODULES, topicsOfModule } from "../lib/topics";
import { useProgress } from "../lib/progress";
import { useAuth } from "../lib/auth";
import { firebaseEnabled } from "../lib/firebase";

export function Sidebar({
  open = false,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const { state, sync, overallPct } = useProgress();
  const { user, displayName, logout } = useAuth();

  return (
    <aside className={`sidebar${open ? " open" : ""}`}>
      <button
        type="button"
        className="drawer-close"
        aria-label="Close navigation"
        onClick={onClose}
      >
        ✕
      </button>
      <div className="brand">
        dMAT Portal
        <small>CS Prep · {overallPct}% covered</small>
      </div>

      <div className="userbox">
        <div>
          <div style={{ fontSize: "0.8rem", fontWeight: 600 }}>{displayName}</div>
          <div className="mono" style={{ fontSize: "0.62rem", color: "var(--ink-soft)" }}>{user}</div>
        </div>
        <button type="button" className="btn small ghost" onClick={logout}>
          Sign out
        </button>
      </div>

      <div className="navgroup">
        <NavLink to="/" end onClick={onClose} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/exam-details" onClick={onClose} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Exam Details
        </NavLink>
        <NavLink to="/tracker" onClick={onClose} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Coverage Tracker
        </NavLink>
        <NavLink to="/mock-exam" onClick={onClose} className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Mock Exam
        </NavLink>
      </div>

      {MODULES.map((m) => (
        <div className="navgroup" key={m.id}>
          <div className="navlabel">{m.label}</div>
          {topicsOfModule(m.id).map((t) => (
            <NavLink
              key={t.id}
              to={`/learn/${t.id}`}
              onClick={onClose}
              className={({ isActive }) => `navlink${isActive ? " active" : ""}`}
            >
              {t.title}
              {state.completedTopics[t.id] && <span className="done">✓</span>}
            </NavLink>
          ))}
        </div>
      ))}

      <div className="sync-badge">
        {firebaseEnabled
          ? sync === "synced"
            ? <>firebase: <b>synced</b></>
            : sync === "connecting"
              ? "firebase: connecting…"
              : "firebase: offline · using local"
          : "progress: saved locally"}
      </div>
    </aside>
  );
}
