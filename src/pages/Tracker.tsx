import { Link } from "react-router-dom";
import { MODULES, TOPICS, topicsOfModule } from "../lib/topics";
import { useProgress } from "../lib/progress";
import { ProgressBar, SectionHeading } from "../components/bits";

export function Tracker() {
  const { state, setTopicComplete, overallPct, completedCount } = useProgress();

  return (
    <div>
      <SectionHeading
        eyebrow="Syllabus coverage"
        title="Coverage Tracker"
        sub="Tick topics as you master them — state persists across visits (and syncs to Firebase when configured)."
      />

      <div className="card" style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
          <span className="mono" style={{ fontSize: "1.7rem", fontWeight: 600 }}>{overallPct}%</span>
          <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
            overall · {completedCount} / {TOPICS.length} topics
          </span>
        </div>
        <ProgressBar pct={overallPct} />
      </div>

      {MODULES.map((m) => {
        const ts = topicsOfModule(m.id);
        const done = ts.filter((t) => state.completedTopics[t.id]).length;
        const pct = Math.round((done / ts.length) * 100);
        return (
          <div className="card" style={{ marginBottom: 16 }} key={m.id}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <h3 style={{ fontSize: "1.05rem", margin: 0 }}>{m.label}</h3>
              <span className="mono" style={{ fontSize: "0.72rem", color: "var(--ink-soft)" }}>
                {done}/{ts.length}
              </span>
              <div style={{ flex: 1, maxWidth: 220, marginLeft: "auto" }}>
                <ProgressBar pct={pct} color="blue" />
              </div>
            </div>
            {ts.map((t) => {
              const when = state.completedTopics[t.id];
              return (
                <div className={`trackrow${when ? " done" : ""}`} key={t.id}>
                  <input
                    type="checkbox"
                    checked={Boolean(when)}
                    onChange={(e) => setTopicComplete(t.id, e.target.checked)}
                    aria-label={`Mark ${t.title} complete`}
                  />
                  <Link to={`/learn/${t.id}`}>{t.title}</Link>
                  <span className="mono" style={{ fontSize: "0.66rem", color: "var(--ink-soft)" }}>{t.tag}</span>
                  {when && <span className="when">{new Date(when).toLocaleDateString()}</span>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
