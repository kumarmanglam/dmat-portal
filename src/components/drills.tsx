// Interactive drills for the two visual Core task types. Items are
// generated with fixed seeds (different from the mock exam's seeds,
// so learn pages never leak mock content). Answers persist via the
// same topicAnswers store as regular questions:
//   figures → encoded as pick5 * 3 + pick6
//   latin   → option index
import { useMemo, useState } from "react";
import { generateFigureSet } from "../lib/gen/figures";
import { generateLatinSet, LATIN_OPTIONS } from "../lib/gen/latin";
import { useProgress } from "../lib/progress";
import { FigureOptionPicker, LatinGrid, MatrixGrid } from "./grids";

export function FigureDrill({ topicId }: { topicId: string }) {
  const items = useMemo(() => generateFigureSet(777001, 4, [0, 0, 1, 2]), []);
  const { state, recordTopicAnswer } = useProgress();
  const saved = state.topicAnswers[topicId] ?? {};
  const [picks, setPicks] = useState<Record<number, [number | null, number | null]>>({});

  return (
    <div>
      {items.map((item, qi) => {
        const savedCode = saved[qi];
        const revealed = savedCode !== undefined;
        const current: [number | null, number | null] = revealed
          ? [Math.floor(savedCode / 3), savedCode % 3]
          : picks[qi] ?? [null, null];
        const correct = revealed && current[0] === item.answer[0] && current[1] === item.answer[1];

        const setPick = (slot: 0 | 1, v: number) => {
          const next: [number | null, number | null] = [...current] as [number | null, number | null];
          next[slot] = v;
          if (next[0] !== null && next[1] !== null) {
            recordTopicAnswer(topicId, qi, next[0] * 3 + next[1]);
          }
          setPicks((p) => ({ ...p, [qi]: next }));
        };

        return (
          <div className="qcard" key={item.id}>
            <div className="qhead">
              <span>Drill {qi + 1}</span>
              {revealed && (
                <span style={{ color: correct ? "var(--green)" : "var(--red)" }}>
                  {correct ? "✓ both correct" : "✗ not quite"}
                </span>
              )}
            </div>
            <div className="qprompt">
              Matrices 1–4 are given. Choose what matrix 5 and matrix 6 look like.
            </div>
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
                picked={current[0]}
                reveal={revealed}
                answer={item.answer[0]}
                onPick={(i) => setPick(0, i)}
              />
              <FigureOptionPicker
                label="MATRIX 6"
                options={item.opts[1]}
                picked={current[1]}
                reveal={revealed}
                answer={item.answer[1]}
                onPick={(i) => setPick(1, i)}
              />
            </div>
            {revealed && <div className={`explain${correct ? "" : " bad"}`}>{item.rule}</div>}
          </div>
        );
      })}
    </div>
  );
}

export function LatinDrill({ topicId }: { topicId: string }) {
  const items = useMemo(() => generateLatinSet(888001, 4, [0, 1, 1, 2]), []);
  const { state, recordTopicAnswer } = useProgress();
  const saved = state.topicAnswers[topicId] ?? {};

  return (
    <div>
      {items.map((item, qi) => {
        const chosen = saved[qi];
        const revealed = chosen !== undefined;
        const answerIdx = LATIN_OPTIONS.indexOf(item.answer);
        return (
          <div className="qcard" key={item.id}>
            <div className="qhead">
              <span>Drill {qi + 1}</span>
              {revealed && (
                <span style={{ color: chosen === answerIdx ? "var(--green)" : "var(--red)" }}>
                  {chosen === answerIdx ? "✓ correct" : `✗ correct answer: ${item.answer}`}
                </span>
              )}
            </div>
            <div className="qprompt">Which letter belongs in the highlighted cell?</div>
            <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-start" }}>
              <LatinGrid item={item} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {LATIN_OPTIONS.map((l, i) => {
                  let cls = "opt";
                  if (revealed) {
                    if (i === answerIdx) cls += " correct";
                    else if (i === chosen) cls += " wrong";
                  }
                  return (
                    <button
                      key={l}
                      type="button"
                      className={cls}
                      style={{ width: 120, marginBottom: 0 }}
                      disabled={revealed}
                      onClick={() => recordTopicAnswer(topicId, qi, i)}
                    >
                      <span className="key">{l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
