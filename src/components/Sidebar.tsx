import { NavLink } from "react-router-dom";
import { MODULES, topicsOfModule } from "../lib/topics";
import { useProgress } from "../lib/progress";
import { firebaseEnabled } from "../lib/firebase";

export function Sidebar() {
  const { state, sync, overallPct } = useProgress();

  return (
    <aside className="sidebar">
      <div className="brand">
        dMAT Portal
        <small>CS Prep · {overallPct}% covered</small>
      </div>

      <div className="navgroup">
        <NavLink to="/" end className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Dashboard
        </NavLink>
        <NavLink to="/exam-details" className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Exam Details
        </NavLink>
        <NavLink to="/tracker" className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
          Coverage Tracker
        </NavLink>
        <NavLink to="/mock-exam" className={({ isActive }) => `navlink${isActive ? " active" : ""}`}>
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
