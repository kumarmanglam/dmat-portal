// ============================================================
// The single full mock exam.
//
// Phase machine: intro → sections 0..4 (break included) → results.
// Each timed section gets an absolute deadline; expiry force-
// advances. Answers are editable within a section, blanks allowed
// (no negative marking). The attempt is persisted on finish.
// ============================================================
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getExam, SECTIONS } from "../lib/mock/exam";
import { LATIN_OPTIONS } from "../lib/gen/latin";
import { useProgress } from "../lib/progress";
import { Timer } from "../components/Timer";
import { FigureOptionPicker, LatinGrid, MatrixGrid } from "../components/grids";
import { SectionHeading } from "../components/bits";
import type { MockAttempt, SectionResult } from "../lib/types";

type Phase = { kind: "intro" } | { kind: "section"; index: number } | { kind: "results" };

type FigAnswer = [number | null, number | null];

interface AnswerSheet {
  figures: FigAnswer[];
  equations: (number | null)[];
  latin: (number | null)[];
  subject: (number | null)[];
}

const blankSheet = (): AnswerSheet => ({
  figures: Array.from({ length: 20 }, () => [null, null] as FigAnswer),
  equations: Array(20).fill(null),
  latin: Array(16).fill(null),
  subject: Array(24).fill(null),
});

export function MockExam() {
  const exam = useMemo(() => getExam(), []);
  const { state, saveMockAttempt } = useProgress();

  const [phase, setPhase] = useState<Phase>({ kind: "intro" });
  const [sheet, setSheet] = useState<AnswerSheet>(blankSheet);
  const [qIdx, setQIdx] = useState(0);
  const [deadline, setDeadline] = useState(0);
  const startedAtRef = useRef<string>("");
  const savedRef = useRef(false);

  const inProgress = phase.kind === "section";

  // Warn on reload/close mid-exam (in-memory state would be lost).
  useEffect(() => {
    if (!inProgress) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [inProgress]);

  const startSection = useCallback((index: number) => {
    const def = SECTIONS[index];
    setPhase({ kind: "section", index });
    setQIdx(0);
    setDeadline(Date.now() + def.minutes * 60_000);
    window.scrollTo(0, 0);
  }, []);

  const begin = () => {
    setSheet(blankSheet());
    savedRef.current = false;
    startedAtRef.current = new Date().toISOString();
    startSection(0);
  };

  const advance = useCallback(() => {
    setPhase((p) => {
      if (p.kind !== "section") return p;
      const nextIndex = p.index + 1;
      if (nextIndex < SECTIONS.length) {
        const def = SECTIONS[nextIndex];
        setQIdx(0);
        setDeadline(Date.now() + def.minutes * 60_000);
        window.scrollTo(0, 0);
        return { kind: "section", index: nextIndex };
      }
      return { kind: "results" };
    });
  }, []);

  // ---------- scoring ----------
  const results: { sections: SectionResult[]; attempt: MockAttempt } | null = useMemo(() => {
    if (phase.kind !== "results") return null;
    const secResults: SectionResult[] = [];

    const figCorrect = exam.figures.filter(
      (it, i) => sheet.figures[i][0] === it.answer[0] && sheet.figures[i][1] === it.answer[1]
    ).length;
    secResults.push({
      id: "figures", title: "Figure Sequences", total: 20,
      correct: figCorrect,
      answered: sheet.figures.filter(([a, b]) => a !== null && b !== null).length,
    });

    const eqCorrect = exam.equations.filter((it, i) => sheet.equations[i] === it.answer).length;
    secResults.push({
      id: "equations", title: "Mathematical Equations", total: 20,
      correct: eqCorrect,
      answered: sheet.equations.filter((a) => a !== null).length,
    });

    const latCorrect = exam.latin.filter(
      (it, i) => sheet.latin[i] !== null && LATIN_OPTIONS[sheet.latin[i]!] === it.answer
    ).length;
    secResults.push({
      id: "latin", title: "Latin Squares", total: 16,
      correct: latCorrect,
      answered: sheet.latin.filter((a) => a !== null).length,
    });

    const subCorrect = exam.subject.filter((it, i) => sheet.subject[i] === it.answer).length;
    secResults.push({
      id: "subject", title: "Subject Module (CS)", total: 24,
      correct: subCorrect,
      answered: sheet.subject.filter((a) => a !== null).length,
    });

    const core = figCorrect + eqCorrect + latCorrect;
    const attempt: MockAttempt = {
      startedAt: startedAtRef.current || new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      sections: secResults,
      corePct: Math.round((core / 56) * 100),
      subjectPct: Math.round((subCorrect / 24) * 100),
      totalPct: Math.round(((core + subCorrect) / 80) * 100),
    };
    return { sections: secResults, attempt };
  }, [phase, exam, sheet]);

  useEffect(() => {
    if (results && !savedRef.current) {
      savedRef.current = true;
      saveMockAttempt(results.attempt);
    }
  }, [results, saveMockAttempt]);

  // ============================ INTRO ============================
  if (phase.kind === "intro") {
    const last = state.mockAttempts[state.mockAttempts.length - 1];
    return (
      <div>
        <SectionHeading
          eyebrow="Full simulation"
          title="Mock Exam"
          sub="One complete dMAT run with real question counts and per-subtest timing. Once a subtest ends you cannot return to it — exactly like test day."
        />
        <table className="ref">
          <thead><tr><th>Part</th><th>Items</th><th>Time</th></tr></thead>
          <tbody>
            {SECTIONS.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td className="num">{s.count || "—"}</td>
                <td className="num">{s.minutes} min</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="factstrip">
          <div className="fact"><b>No</b> negative marking — guess freely</div>
          <div className="fact">Skipping allowed, answers editable within a subtest</div>
          <div className="fact"><b>No</b> notes or calculator — honor system</div>
        </div>
        {last && (
          <p style={{ fontSize: "0.88rem", color: "var(--ink-soft)" }}>
            Last attempt: <b className="mono">{last.totalPct}%</b> on{" "}
            {new Date(last.finishedAt).toLocaleString()}
          </p>
        )}
        <button type="button" className="btn primary" style={{ fontSize: "1rem" }} onClick={begin}>
          Begin exam →
        </button>
      </div>
    );
  }

  // =========================== RESULTS ===========================
  if (phase.kind === "results" && results) {
    const a = results.attempt;
    return (
      <div>
        <SectionHeading eyebrow="Mock exam" title="Results" />
        <div className="grid3" style={{ marginBottom: 20 }}>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="eyebrow">Core Module</div>
            <div className="mono" style={{ fontSize: "2rem", fontWeight: 600 }}>{a.corePct}%</div>
          </div>
          <div className="card" style={{ textAlign: "center" }}>
            <div className="eyebrow">Subject Module</div>
            <div className="mono" style={{ fontSize: "2rem", fontWeight: 600 }}>{a.subjectPct}%</div>
          </div>
          <div className="card" style={{ textAlign: "center", borderColor: "var(--accent)" }}>
            <div className="eyebrow">Overall</div>
            <div className="mono" style={{ fontSize: "2rem", fontWeight: 600 }}>{a.totalPct}%</div>
          </div>
        </div>
        <table className="ref">
          <thead><tr><th>Subtest</th><th>Correct</th><th>Answered</th><th>Score</th></tr></thead>
          <tbody>
            {a.sections.map((s) => (
              <tr key={s.id}>
                <td>{s.title}</td>
                <td className="num">{s.correct} / {s.total}</td>
                <td className="num">{s.answered} / {s.total}</td>
                <td className="num">{Math.round((s.correct / s.total) * 100)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="note" style={{ margin: "16px 0" }}>
          Attempt saved to your progress history. Blanks score zero — if you left any, practice
          committing to a guess before the clock runs out.
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button type="button" className="btn primary" onClick={begin}>Retake exam</button>
          <Link className="btn" to="/">Back to dashboard</Link>
        </div>
      </div>
    );
  }

  // =========================== SECTIONS ===========================
  if (phase.kind !== "section") return null;
  const def = SECTIONS[phase.index];

  // ---- break ----
  if (def.id === "break") {
    return (
      <div>
        <div className="exam-top">
          <strong style={{ fontFamily: "Fraunces, serif" }}>{def.title}</strong>
          <Timer deadline={deadline} onExpire={advance} />
        </div>
        <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <h2>30-minute break</h2>
          <p style={{ color: "var(--ink-soft)" }}>
            Core Module done. Stand up, hydrate — the Subject Module (90 min) starts when the timer
            ends, or whenever you're ready.
          </p>
          <button type="button" className="btn primary" onClick={advance}>
            Skip break — start Subject Module →
          </button>
        </div>
      </div>
    );
  }

  const counts: Record<string, number> = { figures: 20, equations: 20, latin: 16, subject: 24 };
  const total = counts[def.id];

  const isAnswered = (i: number): boolean => {
    if (def.id === "figures") return sheet.figures[i][0] !== null && sheet.figures[i][1] !== null;
    if (def.id === "equations") return sheet.equations[i] !== null;
    if (def.id === "latin") return sheet.latin[i] !== null;
    return sheet.subject[i] !== null;
  };
  const answeredCount = Array.from({ length: total }, (_, i) => isAnswered(i)).filter(Boolean).length;

  const confirmAdvance = () => {
    const blanks = total - answeredCount;
    if (
      blanks === 0 ||
      window.confirm(`${blanks} item${blanks > 1 ? "s" : ""} unanswered (they score zero). End this subtest?`)
    ) {
      advance();
    }
  };

  return (
    <div>
      <div className="exam-top">
        <strong style={{ fontFamily: "Fraunces, serif" }}>{def.title}</strong>
        <span className="mono" style={{ fontSize: "0.75rem", color: "var(--ink-soft)" }}>
          {answeredCount}/{total} answered
        </span>
        <span style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          <Timer deadline={deadline} onExpire={advance} />
          <button type="button" className="btn small" onClick={confirmAdvance}>
            End subtest →
          </button>
        </span>
      </div>

      <p style={{ fontSize: "0.85rem", color: "var(--ink-soft)", marginTop: 0 }}>{def.intro}</p>

      <div className="palette">
        {Array.from({ length: total }, (_, i) => (
          <button
            key={i}
            type="button"
            className={`${isAnswered(i) ? "answered" : ""} ${i === qIdx ? "current" : ""}`}
            onClick={() => setQIdx(i)}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {def.id === "figures" && (
        <FigureQuestion
          idx={qIdx}
          answer={sheet.figures[qIdx]}
          onAnswer={(slot, v) =>
            setSheet((s) => {
              const figures = s.figures.map((f, i) =>
                i === qIdx ? ((slot === 0 ? [v, f[1]] : [f[0], v]) as FigAnswer) : f
              );
              return { ...s, figures };
            })
          }
        />
      )}
      {def.id === "equations" && (
        <ChoiceQuestion
          idx={qIdx}
          prompt="Which assignment solves the system? (all unknowns are integers 1–20)"
          block={getExam().equations[qIdx].equations.join("\n")}
          options={getExam().equations[qIdx].options}
          chosen={sheet.equations[qIdx]}
          onChoose={(v) =>
            setSheet((s) => ({ ...s, equations: s.equations.map((x, i) => (i === qIdx ? v : x)) }))
          }
        />
      )}
      {def.id === "latin" && (
        <div className="qcard">
          <div className="qhead"><span>Item {qIdx + 1} / 16</span></div>
          <div className="qprompt">Which letter belongs in the highlighted cell?</div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <LatinGrid item={getExam().latin[qIdx]} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {LATIN_OPTIONS.map((l, i) => (
                <button
                  key={l}
                  type="button"
                  className={`opt${sheet.latin[qIdx] === i ? " picked" : ""}`}
                  style={{ width: 120, marginBottom: 0 }}
                  onClick={() =>
                    setSheet((s) => ({ ...s, latin: s.latin.map((x, j) => (j === qIdx ? i : x)) }))
                  }
                >
                  <span className="key">{l}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {def.id === "subject" && (
        <SubjectQuestion
          idx={qIdx}
          chosen={sheet.subject[qIdx]}
          onChoose={(v) =>
            setSheet((s) => ({ ...s, subject: s.subject.map((x, i) => (i === qIdx ? v : x)) }))
          }
        />
      )}

      <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
        <button type="button" className="btn small" disabled={qIdx === 0} onClick={() => setQIdx(qIdx - 1)}>
          ← Previous
        </button>
        {qIdx < total - 1 ? (
          <button type="button" className="btn small blue" onClick={() => setQIdx(qIdx + 1)}>
            Next →
          </button>
        ) : (
          <button type="button" className="btn small primary" onClick={confirmAdvance}>
            End subtest →
          </button>
        )}
      </div>
    </div>
  );
}

// ---------- per-type question renderers ----------

function FigureQuestion({
  idx,
  answer,
  onAnswer,
}: {
  idx: number;
  answer: [number | null, number | null];
  onAnswer: (slot: 0 | 1, v: number) => void;
}) {
  const item = getExam().figures[idx];
  return (
    <div className="qcard">
      <div className="qhead"><span>Item {idx + 1} / 20</span></div>
      <div className="qprompt">Continue the series: choose matrix 5 and matrix 6.</div>
      <div className="figrow" style={{ marginBottom: 14 }}>
        {item.given.map((m, i) => (
          <MatrixGrid matrix={m} key={i} />
        ))}
        <div className="matrix qmark">?</div>
        <div className="matrix qmark">?</div>
      </div>
      <div className="grid2">
        <FigureOptionPicker
          label="MATRIX 5"
          options={item.opts[0]}
          picked={answer[0]}
          reveal={false}
          answer={-1}
          onPick={(i) => onAnswer(0, i)}
        />
        <FigureOptionPicker
          label="MATRIX 6"
          options={item.opts[1]}
          picked={answer[1]}
          reveal={false}
          answer={-1}
          onPick={(i) => onAnswer(1, i)}
        />
      </div>
    </div>
  );
}

function ChoiceQuestion({
  idx,
  prompt,
  block,
  options,
  chosen,
  onChoose,
}: {
  idx: number;
  prompt: string;
  block?: string;
  options: string[];
  chosen: number | null;
  onChoose: (i: number) => void;
}) {
  return (
    <div className="qcard">
      <div className="qhead"><span>Item {idx + 1} / 20</span></div>
      <div className="qprompt">{prompt}</div>
      {block && <div className="qblock">{block}</div>}
      {options.map((opt, i) => (
        <button
          key={i}
          type="button"
          className={`opt${chosen === i ? " picked" : ""}`}
          onClick={() => onChoose(i)}
        >
          <span className="key">{String.fromCharCode(97 + i)})</span>
          <span>{opt}</span>
        </button>
      ))}
    </div>
  );
}

function SubjectQuestion({
  idx,
  chosen,
  onChoose,
}: {
  idx: number;
  chosen: number | null;
  onChoose: (i: number) => void;
}) {
  const q = getExam().subject[idx];
  return (
    <div className="qcard">
      <div className="qhead"><span>Item {idx + 1} / 24</span><span>{q.passageTitle}</span></div>
      {q.passage && (
        <details open={idx % 5 === 0} style={{ marginBottom: 12 }}>
          <summary
            className="mono"
            style={{ fontSize: "0.72rem", color: "var(--blue)", cursor: "pointer" }}
          >
            Input text — {q.passageTitle}
          </summary>
          <div className="tip" style={{ marginTop: 8, whiteSpace: "pre-wrap" }}>{q.passage}</div>
        </details>
      )}
      <div className="qprompt">{q.prompt}</div>
      {q.block && <div className="qblock">{q.block}</div>}
      {q.options.map((opt, i) => (
        <button
          key={i}
          type="button"
          className={`opt${chosen === i ? " picked" : ""}`}
          onClick={() => onChoose(i)}
        >
          <span className="key">{String.fromCharCode(97 + i)})</span>
          <span>{opt}</span>
        </button>
      ))}
    </div>
  );
}
