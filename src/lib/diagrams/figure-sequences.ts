import type { TopicVisual } from "./types";

// The per-symbol solving loop as a decision flowchart: classify one
// symbol's movement, check walls and x+1 acceleration, run the
// separate colour/rotation pass, eliminate — and only take a second
// symbol if the first one didn't already decide the item.
export const FIGURE_SEQUENCES_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "The per-symbol solving loop",
    caption:
      "Follow ONE symbol through this loop, then eliminate. The loop exits the moment a single option survives — most items never need the third symbol.",
    chart: `flowchart TD
    START["New matrix item:\npick ONE symbol —\nignore all the others"] --> CLASS["Classify its movement:\nvertical · horizontal ·\ndiagonal · border walk"]
    CLASS --> WALL["Wall behaviour: bounce back\nor slide along the border?\nMatrices 1–4 show which"]
    WALL --> CNT["COUNT fields moved\nbetween 1→2, 2→3, 3→4"]
    CNT --> ACC{"gaps growing\n1, 2, 3?"}
    ACC -- "yes — x+1 rule" --> XP["Acceleration! next gap is\none field LONGER —\nnever eyeball this"]
    ACC -- "no — constant step" --> PROJ["Project the symbol\ninto matrix 5"]
    XP --> PROJ
    PROJ --> COL["SEPARATE pass:\ncolour + rotation cycles\n(they ignore movement)"]
    COL --> ELIM["Cross out every option\nthat breaks this\nsymbol's rules"]
    ELIM --> LEFT{"did that rule kill 2+\noptions — one survivor?"}
    LEFT -- "yes" --> DONE["Answer it. Do NOT verify\nthe remaining symbols"]
    LEFT -- "no — 2+ alive" --> NEXT["Move to the NEXT symbol\n(only because you must)"]
    NEXT --> CLASS

    classDef q fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef step fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef ok fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    classDef warn fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    class START,ACC,LEFT q;
    class CLASS,WALL,CNT,PROJ,COL,ELIM,NEXT step;
    class DONE ok;
    class XP warn;`,
    notes: [
      {
        label: "One symbol at a time is not a beginner crutch",
        text: "The matrix has no 'overall pattern' — it's three or four independent machines each running one dumb rule, so a rule confirmed for one symbol is a hard fact no other symbol can invalidate. Reading the whole picture forces you to hold a dozen cell states in working memory and invites false gestalt patterns; tracking one symbol needs only four positions and pays out an elimination immediately.",
      },
      {
        label: "The acceleration trap: count, never eyeball",
        text: "A symbol stepping 1, then 2, then 3 cells looks like smooth drift, and eyeballing places it exactly one cell short in matrix 5 — and the test writers put that wrong cell among the options on purpose. Counting fields between each pair of matrices costs five seconds and is the only way to tell constant speed from x + 1: if the gaps grow 1, 2, 3, the next gap is 4, not another 3.",
      },
      {
        label: "75 seconds: budget like a trader, not a perfectionist",
        text: "At roughly 75 seconds per item you get 15–20 seconds per symbol plus a final check — so if one symbol's rule refuses to resolve after two viewings, switch symbols instead of staring: ANY confirmed rule eliminates options, and the survivor check may end the item before you ever return to the stubborn one. Past the one-minute mark with two options still alive, pick between the survivors and move on — a 50% shot beats a timeout worth zero.",
      },
    ],
  },
];
