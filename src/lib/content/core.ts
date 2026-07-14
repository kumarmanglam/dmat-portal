import type { TopicContent } from "../types";

export const CORE_CONTENT: TopicContent[] = [
  {
    id: "figure-sequences",
    intro:
      "Every symbol in the matrix is its own little machine running one fixed rule. You never solve the whole picture — you solve one symbol at a time: watch it across the four given matrices, name its rule, then check which options obey it.",
    bullets: [
      "Movement is vertical, horizontal, diagonal, or a walk along the outer border — a symbol never switches diagonal movement to another type.",
      "At a wall a symbol either bounces off or slides along the border — the four given matrices tell you which.",
      "Watch for x + 1 acceleration: 1 step, then 2, then 3 — count fields between matrices, don't eyeball.",
      "Colour and rotation cycle independently of movement; check them as a separate pass.",
      "Eliminate: one confirmed symbol rule usually kills 1–2 options immediately.",
    ],
    drill: "figures",
    questions: [],
  },
  {
    id: "mathematical-equations",
    intro:
      "This is not algebra class — it's mental bookkeeping under time pressure. Every unknown is an integer from 1–20 and there is exactly one solution. The winning move order: grab the most constrained equation first (a direct value or a simple ratio), push it into the longest equation, then back-substitute the rest.",
    bullets: [
      "Scan for an anchor: an equation with one unknown (7 + A = 14) or a pure ratio (B = 2 × A).",
      "Substitute the ratio into the equation with the most unknowns and collapse it to one letter.",
      "Back-substitute in order of dependence — each remaining letter falls out in one step.",
      "Sanity check: every value must land in 1–20; a fraction or 0 means you slipped.",
      "Train without paper — the exam allows no notes, so the skill is holding 2–3 values in your head.",
    ],
    questions: [
      {
        prompt: "Solve the system. What are A and B?",
        block: "A + 5 = 12\nB − A = 3",
        options: ["A = 7,  B = 10", "A = 7,  B = 4", "A = 5,  B = 8", "A = 8,  B = 11"],
        answer: 0,
        explain: "First equation gives A = 7 directly; then B = 7 + 3 = 10.",
      },
      {
        prompt: "Solve the system. What are A and B?",
        block: "B ÷ 3 = A\nB − A = 8",
        options: ["A = 3,  B = 9", "A = 4,  B = 12", "A = 6,  B = 18", "A = 4,  B = 8"],
        answer: 1,
        explain: "B = 3A, so 3A − A = 8 → 2A = 8 → A = 4, B = 12.",
      },
      {
        prompt: "Solve the system. What are A, B and C?",
        block: "2 × C = A\nA + C = 9\nA + B = 2 × C + 5",
        options: [
          "A = 6,  B = 5,  C = 3",
          "A = 6,  B = 11, C = 3",
          "A = 4,  B = 5,  C = 2",
          "A = 3,  B = 8,  C = 6",
        ],
        answer: 0,
        explain: "A = 2C into equation 2: 3C = 9 → C = 3, A = 6. Equation 3: 6 + B = 11 → B = 5.",
      },
      {
        prompt: "Solve the system. What are A, B, C and D?",
        block: "A − B + C − D = 3\n2 × B = C\nA = 4 × B\nD = B + 5",
        options: [
          "A = 8,  B = 2,  C = 4,  D = 7",
          "A = 4,  B = 1,  C = 2,  D = 6",
          "A = 8,  B = 2,  C = 4,  D = 9",
          "A = 12, B = 3,  C = 6,  D = 8",
        ],
        answer: 0,
        explain:
          "Everything in terms of B: 4B − B + 2B − (B + 5) = 3 → 4B = 8 → B = 2. So A = 8, C = 4, D = 7.",
      },
    ],
  },
  {
    id: "latin-squares",
    intro:
      "A Latin square is solved with forced moves only — no guessing ever helps. A cell is forced when its row + column already show four of the five letters, or when a letter has only one legal cell left in a row/column. Hard items just chain two or three forced cells before the target opens up.",
    bullets: [
      "First look: does the target's row + column already show 4 distinct letters? Then you're done in one step.",
      "If not, hunt the most crowded row or column anywhere — fill its forced cell, it often unlocks the target's line.",
      "Second deduction type: 'letter X must be here' — a letter missing from a row that has only one cell not blocked by its columns.",
      "Hold at most 1–2 derived placements in your head; refresh them out loud (mentally) like mini-Sudoku.",
    ],
    drill: "latin",
    questions: [],
  },
];
