import { Link } from "react-router-dom";
import { MODULES, TOPICS, topicById, topicsOfModule } from "../lib/topics";
import { CONTENT } from "../lib/content";
import { useProgress } from "../lib/progress";
import { ProgressBar, SectionHeading } from "../components/bits";
import type { ProgressState } from "../lib/types";

// Topics you've practised but keep getting wrong — the highest-leverage
// thing to revisit. Only counts topics with real multiple-choice
// questions (the generated Core drills store answers differently and
// are skipped). Needs at least 2 answered questions and < 70% correct.
function weakTopics(state: ProgressState) {
  return TOPICS.map((t) => {
    const qs = CONTENT[t.id]?.questions ?? [];
    if (qs.length === 0) return null;
    const ans = state.topicAnswers[t.id] ?? {};
    let answered = 0;
    let correct = 0;
    qs.forEach((q, i) => {
      if (ans[i] !== undefined) {
        answered++;
        if (ans[i] === q.answer) correct++;
      }
    });
    if (answered < 2) return null;
    const pct = Math.round((correct / answered) * 100);
    return pct < 70 ? { t, pct, answered, correct } : null;
  })
    .filter((x): x is NonNullable<typeof x> => x !== null)
    .sort((a, b) => a.pct - b.pct)
    .slice(0, 3);
}

export function Dashboard() {
  const { state, overallPct, completedCount } = useProgress();

  const continueTopic =
    (state.lastTopic && topicById(state.lastTopic)) ||
    TOPICS.find((t) => !state.completedTopics[t.id]) ||
    TOPICS[0];

  const lastAttempt = state.mockAttempts[state.mockAttempts.length - 1];
  const weak = weakTopics(state);

  return (
    <div>
      <SectionHeading
        eyebrow="dMAT · Computer Science track"
        title="Prep Dashboard"
        sub="Digital Master Assessment Test — Core Module (cognitive subtests) plus the Computer Science Subject Module."
      />

      <div className="factstrip">
        <div className="fact"><b>3.5 hrs</b> total, computer-based</div>
        <div className="fact"><b>No</b> negative marking — always guess</div>
        <div className="fact">Score <b>0–200</b>, mean 100</div>
        <div className="fact"><b>No</b> notes, paper or calculator</div>
        <div className="fact">Evaluated centrally in <b>Bochum</b></div>
      </div>

      <div className="timeline" style={{ marginBottom: 26 }}>
        <div className="tl-block tl-core">Core Module<small>90 min</small></div>
        <div className="tl-block tl-break">Break<small>30 min</small></div>
        <div className="tl-block tl-subject">Subject Module<small>90 min</small></div>
      </div>

      <div className="grid2" style={{ marginBottom: 16 }}>
        <div className="card">
          <h3 style={{ fontSize: "1.1rem" }}>Syllabus coverage</h3>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, margin: "6px 0 10px" }}>
            <span className="mono" style={{ fontSize: "1.9rem", fontWeight: 600 }}>{overallPct}%</span>
            <span style={{ color: "var(--ink-soft)", fontSize: "0.85rem" }}>
              {completedCount} / {TOPICS.length} topics complete
            </span>
          </div>
          <ProgressBar pct={overallPct} />
          <div style={{ marginTop: 14, display: "grid", gap: 8 }}>
            {MODULES.map((m) => {
              const ts = topicsOfModule(m.id);
              const done = ts.filter((t) => state.completedTopics[t.id]).length;
              const pct = Math.round((done / ts.length) * 100);
              return (
                <div key={m.id} style={{ display: "grid", gridTemplateColumns: "140px 1fr 40px", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: "0.78rem", color: "var(--ink-soft)" }}>{m.label}</span>
                  <ProgressBar pct={pct} color="blue" />
                  <span className="mono" style={{ fontSize: "0.72rem", color: "var(--ink-soft)", textAlign: "right" }}>{pct}%</span>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14 }}>
            <Link className="btn small" to="/tracker">Open tracker →</Link>
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, alignContent: "start" }}>
          <div className="card">
            <h3 style={{ fontSize: "1.1rem" }}>Continue learning</h3>
            <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", margin: "4px 0 12px" }}>
              {state.lastTopic ? "Pick up where you left off:" : "Start with your first topic:"}{" "}
              <b style={{ color: "var(--ink)" }}>{continueTopic.title}</b>
            </p>
            <Link className="btn blue" to={`/learn/${continueTopic.id}`}>
              Continue → {continueTopic.title}
            </Link>
          </div>

          <div className="card">
            <h3 style={{ fontSize: "1.1rem" }}>Mock exam</h3>
            {lastAttempt ? (
              <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", margin: "4px 0 12px" }}>
                Last attempt: <b className="mono" style={{ color: "var(--ink)" }}>{lastAttempt.totalPct}%</b>{" "}
                (core {lastAttempt.corePct}% · subject {lastAttempt.subjectPct}%) on{" "}
                {new Date(lastAttempt.finishedAt).toLocaleDateString()}
              </p>
            ) : (
              <p style={{ color: "var(--ink-soft)", fontSize: "0.88rem", margin: "4px 0 12px" }}>
                Full run: 56 Core items + 24 Subject questions under real per-subtest timing.
              </p>
            )}
            <Link className="btn primary" to="/mock-exam">Start Mock Exam</Link>
          </div>

          {weak.length > 0 && (
            <div className="card weak-card">
              <h3 style={{ fontSize: "1.1rem" }}>Review weak topics</h3>
              <p style={{ color: "var(--ink-soft)", fontSize: "0.85rem", margin: "4px 0 12px" }}>
                Lowest quiz accuracy so far — revisit these to lock them in before test day.
              </p>
              <div className="weak-list">
                {weak.map(({ t, pct, correct, answered }) => (
                  <Link key={t.id} to={`/learn/${t.id}`} className="weak-row">
                    <span className="weak-name">{t.title}</span>
                    <span className="weak-score mono">{correct}/{answered}</span>
                    <span className={`weak-pct mono${pct < 50 ? " low" : ""}`}>{pct}%</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="note">
        Train like the exam: no notes, no calculator, and never leave an answer blank — there is no
        negative marking. Cross-check registration windows on <span className="mono">d-mat.de</span> before booking.
      </div>
    </div>
  );
}
