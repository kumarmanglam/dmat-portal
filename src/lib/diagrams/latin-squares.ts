import type { TopicVisual } from "./types";

// Forced-move deduction as a decision flowchart: check the target's
// own row + column first, otherwise chain through the most crowded
// line anywhere — covering both deduction types (cell elimination
// and single-legal-cell letter placement). Guessing never appears,
// because it never helps.
export const LATIN_SQUARES_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "Forced moves only: the deduction loop",
    caption:
      "Start at the target and leave it only when forced. Green = the forced answer, red = the moment you are tempted to guess — and what to do instead.",
    chart: `flowchart TD
    START["Target cell wanted:\npool its ROW + COLUMN\nletters together"] --> FOUR{"4 distinct letters\nbetween them?"}
    FOUR -- "yes" --> DONE["Target = the 5th letter.\nForced — one step, done"]
    FOUR -- "no — 3 or fewer" --> HUNT["Hunt the most crowded\nrow or column ANYWHERE\non the board"]
    HUNT --> T1{"a cell there seeing\n4 distinct letters?"}
    T1 -- "yes" --> FILL["Fill that forced cell\n(hold it in your head)"]
    T1 -- "no" --> T2{"a letter with only ONE\nlegal cell left in some\nrow or column?"}
    T2 -- "yes — place it" --> FILL
    T2 -- "no" --> RESCAN["Do NOT guess — you missed\na constraint. Re-scan rows,\nthen columns"]
    RESCAN --> HUNT
    FILL --> UNLOCK{"target's row + column\nnow show 4 letters?"}
    UNLOCK -- "yes" --> DONE
    UNLOCK -- "not yet — chain deeper" --> HUNT

    classDef q fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef step fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef ok fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    classDef warn fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    class START,FOUR,T1,T2,UNLOCK q;
    class HUNT,FILL step;
    class DONE ok;
    class RESCAN warn;`,
    notes: [
      {
        label: "Guessing never helps — that's a theorem, not advice",
        text: "Items of this type are constructed so every cell is reachable by forced moves alone; a unique solution derivable by pure elimination is a property of the puzzle, not luck. A guess therefore buys nothing you couldn't derive, and it costs you a forked board state you must now track with no paper. If you feel the urge to guess, the real problem is a constraint you haven't scanned yet — the fix is re-scanning, not gambling.",
      },
      {
        label: "Hard just means a longer forced chain",
        text: "Easy items expose the target's four letters directly; hard items hide one of them behind two or three forced cells you must fill first. The chain is deliberately short — if you are four fills deep and the target still hasn't opened, you have drifted into cells that feed neither the target's row nor its column. Back up and pick forced cells that intersect the target's own lines, because only those convert into eliminations against the target.",
      },
      {
        label: "Hold two placements, never three",
        text: "Every derived placement lives only in your head, and three or more of them is exactly where transposition errors start. Prefer chains whose forced cells sit in the target's own row or column, so each derived letter immediately becomes an elimination instead of a stored fact; if a chain seems to need a third value, refresh the first two mentally — like calling out Sudoku candidates — or re-derive rather than trust a fading memory.",
      },
    ],
  },
];
