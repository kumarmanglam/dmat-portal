// Single-choice question card with instant feedback — used on
// learn pages. Once an option is chosen the card locks and shows
// the explanation; the chosen answer is persisted via callback.
import type { TopicQuestion } from "../lib/types";

export function QuestionCard({
  index,
  q,
  chosen,
  onChoose,
}: {
  index: number;
  q: TopicQuestion;
  chosen: number | undefined;
  onChoose: (i: number) => void;
}) {
  const revealed = chosen !== undefined;
  return (
    <div className="qcard">
      <div className="qhead">
        <span>Q{index + 1}</span>
        {revealed && (
          <span style={{ color: chosen === q.answer ? "var(--green)" : "var(--red)" }}>
            {chosen === q.answer ? "✓ correct" : "✗ incorrect"}
          </span>
        )}
      </div>
      <div className="qprompt">{q.prompt}</div>
      {q.block && <div className="qblock">{q.block}</div>}
      {q.options.map((opt, i) => {
        let cls = "opt";
        if (revealed) {
          if (i === q.answer) cls += " correct";
          else if (i === chosen) cls += " wrong";
        }
        return (
          <button key={i} type="button" className={cls} disabled={revealed} onClick={() => onChoose(i)}>
            <span className="key">{String.fromCharCode(97 + i)})</span>
            <span>{opt}</span>
          </button>
        );
      })}
      {revealed && (
        <div className={`explain${chosen === q.answer ? "" : " bad"}`}>{q.explain}</div>
      )}
    </div>
  );
}
