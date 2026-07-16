import { lazy, Suspense, useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { CONTENT } from "../lib/content";
import { DIAGRAMS } from "../lib/diagrams";
import { MODULES, neighbours, topicById } from "../lib/topics";
import { useProgress } from "../lib/progress";
import type { TopicQuestion } from "../lib/types";
import { QuestionCard } from "../components/QuestionCard";
import { FigureDrill, LatinDrill } from "../components/drills";

// React Flow is heavy and only used on graph-shaped topics, so it's
// code-split into its own chunk — the initial bundle stays lean.
const TopicDiagram = lazy(() =>
  import("../components/TopicDiagram").then((m) => ({ default: m.TopicDiagram }))
);

// A single retrieval question shown right after the concept. Kept in
// local (non-persisted) state on purpose: it's a formative self-check
// you re-take on every visit — the practice set below is what feeds
// the progress store.
function QuickCheck({ q }: { q: TopicQuestion }) {
  const [chosen, setChosen] = useState<number | undefined>(undefined);
  return (
    <section className="learn-section">
      <div className="learn-kicker">Quick check · answer before scrolling on</div>
      <QuestionCard index={0} q={q} chosen={chosen} onChoose={setChosen} label="Quick check" />
    </section>
  );
}

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
  const diagram = content.diagram ? DIAGRAMS[content.diagram] : undefined;
  const related = (content.related ?? [])
    .map((id) => topicById(id))
    .filter((t): t is NonNullable<typeof t> => Boolean(t) && t!.id !== meta.id);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">{moduleLabel}</div>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          {meta.title} <span className="chip">{meta.tag}</span>
        </h1>
      </div>

      {/* Why it matters — context before the mental model */}
      {content.whyItMatters && (
        <div className="why">
          <span className="why-tag mono">why it matters</span>
          <p>{content.whyItMatters}</p>
        </div>
      )}

      {/* Concept — mental model, analogy, then how it works */}
      <div className="concept">
        <p>{content.intro}</p>
        {content.analogy && (
          <div className="analogy">
            <span className="analogy-tag mono">think of it like</span>
            <p>{content.analogy}</p>
          </div>
        )}
        {content.bullets.length > 0 && (
          <>
            <div className="learn-kicker" style={{ marginTop: 14 }}>How it works</div>
            <ul>
              {content.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* Interactive diagram (graph-shaped topics only) */}
      {diagram && (
        <Suspense fallback={<div className="diagram-loading mono">Loading diagram…</div>}>
          <TopicDiagram data={diagram} topicId={meta.id} />
        </Suspense>
      )}

      {/* Worked example — one concrete case, step by step */}
      {content.workedExample && (
        <div className="worked">
          <div className="learn-kicker">Worked example</div>
          <p className="worked-scenario">{content.workedExample.scenario}</p>
          <ol className="worked-steps">
            {content.workedExample.steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
          <div className="worked-result">{content.workedExample.result}</div>
        </div>
      )}

      {/* Common mistakes / gotchas */}
      {content.gotchas && content.gotchas.length > 0 && (
        <div className="gotchas">
          <div className="learn-kicker gotchas-kicker">Common mistakes</div>
          <ul>
            {content.gotchas.map((g, i) => (
              <li key={i}>{g}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Optional depth, collapsed by default */}
      {content.deepDive?.map((d, i) => (
        <details className="deep" key={i}>
          <summary>{d.title}</summary>
          <p>{d.body}</p>
        </details>
      ))}

      {/* Retrieval check right after learning */}
      {content.quickCheck && <QuickCheck q={content.quickCheck} />}

      {/* Practice — dMAT-style questions */}
      <h2 style={{ fontSize: "1.2rem", marginTop: 26 }}>Practice — dMAT style</h2>
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

      {/* Recap — restate the mental model */}
      {content.recap && (
        <div className="recap">
          <span className="recap-tag mono">recap</span>
          <p>{content.recap}</p>
        </div>
      )}

      {/* Cross-links to related topics */}
      {related.length > 0 && (
        <div className="related">
          <div className="learn-kicker">See also</div>
          <div className="related-chips">
            {related.map((t) => {
              const short = MODULES.find((m) => m.id === t.module)?.short ?? "";
              return (
                <Link className="related-chip" to={`/learn/${t.id}`} key={t.id}>
                  <span className="related-chip-mod mono">{short}</span>
                  {t.title}
                  {state.completedTopics[t.id] && <span className="related-chip-done">✓</span>}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Mark as complete */}
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
