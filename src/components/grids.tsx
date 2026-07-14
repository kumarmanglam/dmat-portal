// Visual renderers for Core Module material: figure matrices and
// latin squares, plus the selectable option variants used by both
// the learn-page drills and the mock exam.
import type { FigMatrix, LatinItem } from "../lib/types";
import { COLS, ROWS } from "../lib/gen/figures";

export function MatrixGrid({ matrix }: { matrix: FigMatrix }) {
  const bySpot = new Map(matrix.map((s) => [`${s.r},${s.c}`, s]));
  const cells = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const s = bySpot.get(`${r},${c}`);
      cells.push(
        <div className="cell" key={`${r}-${c}`}>
          {s && (
            <span
              className="sym"
              style={{ color: s.color, transform: s.rot ? `rotate(${s.rot}deg)` : undefined }}
            >
              {s.shape}
            </span>
          )}
        </div>
      );
    }
  }
  return <div className="matrix">{cells}</div>;
}

export function FigureOptionPicker({
  label,
  options,
  picked,
  reveal,
  answer,
  onPick,
}: {
  label: string;
  options: FigMatrix[];
  picked: number | null;
  reveal: boolean;
  answer: number;
  onPick: (i: number) => void;
}) {
  return (
    <div>
      <div className="lab mono" style={{ fontSize: "0.72rem", color: "var(--ink-soft)", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {options.map((m, i) => {
          let cls = "figopt";
          if (reveal) {
            if (i === answer) cls += " correct";
            else if (picked === i) cls += " wrong";
          } else if (picked === i) cls += " picked";
          return (
            <button type="button" key={i} className={cls} onClick={() => !reveal && onPick(i)}>
              <MatrixGrid matrix={m} />
              <span className="lab">{String.fromCharCode(65 + i)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function LatinGrid({ item }: { item: LatinItem }) {
  const [tr, tc] = item.target;
  return (
    <div className="latin">
      {item.grid.map((row, r) =>
        row.map((cell, c) => (
          <div key={`${r}-${c}`} className={`cell${r === tr && c === tc ? " target" : ""}`}>
            {r === tr && c === tc ? "?" : cell ?? ""}
          </div>
        ))
      )}
    </div>
  );
}
