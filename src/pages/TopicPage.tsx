import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CONTENT } from "../lib/content";
import { MODULES, neighbours, topicById } from "../lib/topics";
import { useProgress } from "../lib/progress";
import { QuestionCard } from "../components/QuestionCard";
import { FigureDrill, LatinDrill } from "../components/drills";

export function TopicPage() {
  const { topic: topicId = "" } = useParams();
  const meta = topicById(topicId);
  const content = CONTENT[topicId];
  const { state, setLastTopic, setTopicComplete, recordTopicAnswer } = useProgress();

  useEffect(() => {
    if (meta) setLastTopic(meta.id);
    window.scrollTo(0, 0);
  }, [meta?.id]);

  if (!meta || !content) return <Navigate to="/" replace />;

  const moduleLabel = MODULES.find((m) => m.id === meta.module)?.label ?? "";
  const completed = Boolean(state.completedTopics[meta.id]);
  const answers = state.topicAnswers[meta.id] ?? {};
  const { prev, next } = neighbours(meta.id);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">{moduleLabel}</div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {meta.title} <span className="chip">{meta.tag}</span>
        </h1>
      </div>

      {/* 1. Concept — mental model, not textbook */}
      <div className="concept">
        <p>{content.intro}</p>
        {content.bullets.length > 0 && (
          <ul>
            {content.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. Sample dMAT-style questions */}
      <h2 style={{ fontSize: "1.2rem" }}>Practice — dMAT style</h2>
      {content.drill === "figures" && <FigureDrill topicId={meta.id} />}
      {content.drill === "latin" && <LatinDrill topicId={meta.id} />}
      {content.questions.map((q, i) => (
        <QuestionCard
          key={i}
          index={i}
          q={q}
          chosen={answers[i]}
          onChoose={(pick) => recordTopicAnswer(meta.id, i, pick)}
        />
      ))}

      {/* 3. Mark as complete */}
      <div
        className="card"
        style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 22, flexWrap: "wrap" }}
      >
        <button
          type="button"
          className={`btn ${completed ? "" : "primary"}`}
          onClick={() => setTopicComplete(meta.id, !completed)}
        >
          {completed ? "✓ Completed — click to unmark" : "Mark topic as complete"}
        </button>
        {completed && (
          <span style={{ fontSize: "0.8rem", color: "var(--ink-soft)" }} className="mono">
            done {new Date(state.completedTopics[meta.id]).toLocaleDateString()}
          </span>
        )}
        <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
          {prev && <Link className="btn small ghost" to={`/learn/${prev.id}`}>← {prev.title}</Link>}
          {next && <Link className="btn small" to={`/learn/${next.id}`}>{next.title} →</Link>}
        </span>
      </div>
    </div>
  );
}
