import type { TopicContent } from "../types";

export const CORE_CONTENT: TopicContent[] = [
  {
    id: "figure-sequences",
    whyItMatters:
      "The clock is brutal here — one symbol tracked correctly kills two options in seconds, while trying to 'see' the whole matrix at once burns the minute you don't have.",
    intro:
      "Every symbol in the matrix is its own little machine running one fixed rule. You never solve the whole picture — you solve one symbol at a time: watch it across the four given matrices, name its rule, then check which options obey it.",
    analogy:
      "Treat each symbol like a windup toy on the grid: it obeys one dumb rule — march diagonally, bounce off a wall, rotate a quarter-turn — no matter what its neighbours do. You're not reading a picture, you're auditing several toys running in parallel.",
    bullets: [
      "Movement is vertical, horizontal, diagonal, or a walk along the outer border — a symbol never switches diagonal movement to another type.",
      "At a wall a symbol either bounces off or slides along the border — the four given matrices tell you which.",
      "Watch for x + 1 acceleration: 1 step, then 2, then 3 — count fields between matrices, don't eyeball.",
      "Colour and rotation cycle independently of movement; check them as a separate pass.",
      "Eliminate: one confirmed symbol rule usually kills 1–2 options immediately.",
    ],
    workedExample: {
      scenario:
        "A grey square sits at top-left in matrix 1. Across matrices 1→4 its position steps one cell down-right each time, and its colour cycles grey → black → grey → black.",
      steps: [
        "Movement pass first: the square moves one cell diagonally down-right every matrix — a fixed diagonal rule, never switching to horizontal or vertical.",
        "Project matrix 5: continue the diagonal one more cell down-right from its matrix-4 position.",
        "Colour pass, done separately: the cycle grey/black/grey/black makes matrix 5 grey again.",
        "Now filter the options — keep only the ones with the square on the next diagonal cell AND coloured grey; that usually leaves exactly one.",
      ],
      result:
        "The square's cell and colour are each pinned by an independent rule, so matrix 5 is forced. Track every symbol this way and the matrix resolves without ever guessing an 'overall pattern'.",
    },
    gotchas: [
      "The matrix is NOT one big pattern to read at once — it's several independent symbols, each with its own rule; solve them one at a time.",
      "A symbol moving diagonally does NOT later switch to horizontal or vertical — movement type is fixed per symbol across all matrices.",
      "Colour and rotation are NOT tied to movement — a symbol can sit still while its colour cycles, so check them in a separate pass.",
    ],
    quickCheck: {
      prompt:
        "A figure-matrix item shows several symbols per cell, all changing at once. What's the reliable way to solve it under time pressure?",
      options: [
        "Track one symbol at a time, name its single rule, and eliminate options that break it",
        "Memorise the whole matrix image and match it against each option",
        "Find the one symbol that never moves and copy only that",
        "Average the positions of all symbols to predict the next cell",
      ],
      answer: 0,
      explain:
        "Each symbol runs its own fixed rule independently. Confirming rules one symbol at a time — and eliminating as you go — is faster and safer than reading the matrix as a single picture.",
    },
    deepDive: [
      {
        title: "The acceleration trap",
        body: "The nastiest movement rule isn't constant speed — it's a symbol that moves 1 cell, then 2, then 3 (x + 1 acceleration). Eyeballing 'it's drifting right' places matrix 5 one cell short every time. Count the exact number of fields between each pair of matrices; if the gaps grow 1, 2, 3, the next gap is 4, not another 3. This is the single most common way careful solvers still lose an item.",
      },
    ],
    recap:
      "Each symbol is an independent machine running one fixed rule — movement, plus separate colour and rotation cycles. Solve symbol by symbol and eliminate; you never need the 'whole picture', and you never guess.",
    related: ["automata-basics", "latin-squares", "mathematical-equations"],
    drill: "figures",
    questions: [],
  },
  {
    id: "mathematical-equations",
    whyItMatters:
      "No notes, no scratch paper, a ticking clock — the exam wants you holding two or three integer values in your head and getting the substitution order right the first time.",
    intro:
      "This is not algebra class — it's mental bookkeeping under time pressure. Every unknown is an integer from 1–20 and there is exactly one solution. The winning move order: grab the most constrained equation first (a direct value or a simple ratio), push it into the longest equation, then back-substitute the rest.",
    analogy:
      "It's untangling a knot, not deriving algebra: find the one loose end — an equation with a single unknown — pull it, and the next loop comes free. Yank the middle of the knot and it only tightens.",
    bullets: [
      "Scan for an anchor: an equation with one unknown (7 + A = 14) or a pure ratio (B = 2 × A).",
      "Substitute the ratio into the equation with the most unknowns and collapse it to one letter.",
      "Back-substitute in order of dependence — each remaining letter falls out in one step.",
      "Sanity check: every value must land in 1–20; a fraction or 0 means you slipped.",
      "Train without paper — the exam allows no notes, so the skill is holding 2–3 values in your head.",
    ],
    workedExample: {
      scenario: "Solve for A and B, given `3 × A = 12` and `A + B = 20`.",
      steps: [
        "Scan for the anchor — the most constrained equation. `3 × A = 12` has one unknown, so A = 4 directly.",
        "Push that value into the other equation: 4 + B = 20.",
        "Back-substitute: B = 16.",
        "Sanity check: both 4 and 16 sit inside the legal 1–20 range, so nothing slipped.",
      ],
      result:
        "A = 4, B = 16. Anchor first, substitute into the longest equation, back-substitute, then range-check — the same four moves every time.",
    },
    gotchas: [
      "This is NOT algebra to be 'derived' elegantly — it's fixed integers 1–20 with exactly one solution, so start from the most constrained equation, not the first one listed.",
      "A value outside 1–20, a fraction, or a 0 is NOT a valid answer — it's a signal you substituted wrong; recheck rather than round.",
      "The equation printed first is NOT necessarily your starting point — the anchor is whichever equation has one unknown or a pure ratio.",
    ],
    quickCheck: {
      prompt: "Given the system below, what's the efficient first move?",
      block: "B = 2 × A\nA + B + C = 18\nC = 3",
      options: [
        "Substitute C = 3 and B = 2A into the middle equation to collapse it to one unknown (A)",
        "Guess A = 1 and check whether the totals work",
        "Add all three equations together first",
        "Solve for C even though it's already given",
      ],
      answer: 0,
      explain:
        "C is known and B is a ratio of A, so pushing both into the sum leaves 3A + 3 = 18 → A = 5, B = 10. Collapsing to a single letter is always the fast path.",
    },
    deepDive: [
      {
        title: "Order your substitutions to spare your memory",
        body: "The exam gives you no paper, so the real bottleneck is working memory, not arithmetic. Solving in dependency order — a known value first, then whatever depends only on it — means you carry at most one or two numbers at a time. Solve out of order and you juggle four half-known letters at once, which is exactly where mental-math errors creep in. Pick the anchor that unlocks the most other letters, not just the first one you can solve.",
      },
    ],
    recap:
      "Every letter is an integer 1–20 with exactly one answer, so treat it as bookkeeping: anchor on the most constrained equation, substitute into the busiest one, back-substitute the rest. Any fraction, 0, or out-of-range value means recheck, not round.",
    related: ["big-o-comparison", "figure-sequences", "latin-squares"],
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
    whyItMatters:
      "Under time pressure the temptation is to guess a letter and see if it fits — but a Latin square is always fully forced, so every second spent guessing is wasted; the discipline is to find the forced cell and touch nothing else.",
    intro:
      "A Latin square is solved with forced moves only — no guessing ever helps. A cell is forced when its row + column already show four of the five letters, or when a letter has only one legal cell left in a row/column. Hard items just chain two or three forced cells before the target opens up.",
    analogy:
      "It's mini-Sudoku with five letters instead of nine digits: each row and column holds A–E exactly once, so a cell whose row and column already reveal four letters can only be the fifth — no choice, no guess.",
    bullets: [
      "First look: does the target's row + column already show 4 distinct letters? Then you're done in one step.",
      "If not, hunt the most crowded row or column anywhere — fill its forced cell, it often unlocks the target's line.",
      "Second deduction type: 'letter X must be here' — a letter missing from a row that has only one cell not blocked by its columns.",
      "Hold at most 1–2 derived placements in your head; refresh them out loud (mentally) like mini-Sudoku.",
    ],
    workedExample: {
      scenario:
        "Letters are A–E. The target cell's row already contains A, C and D; its column already contains B. You need the target.",
      steps: [
        "List what's forbidden: the row rules out A, C, D; the column rules out B.",
        "Four of the five letters are eliminated between the row and the column — only E is left standing.",
        "That's a forced cell: no guessing, the target must be E.",
      ],
      result:
        "Target = E. When a target's row + column together expose four distinct letters, the answer is immediate — this is the one-step case you look for first.",
    },
    gotchas: [
      "A Latin square is NOT solved by guessing — every cell is forced, so if you can't derive it you're missing a constraint, not needing a guess.",
      "'Row and column show four letters' is NOT the same as 'row shows four letters' — you pool the row AND the column together to eliminate; either alone rarely forces a cell.",
      "A blank cell is NOT necessarily solvable right now — sometimes you must fill a more crowded cell elsewhere first to unlock the target's line.",
    ],
    quickCheck: {
      prompt:
        "In a 5×5 Latin square (letters A–E), a target cell's row already shows B, C, E and its column already shows A. What goes in the target?",
      block: "target row:  B  C  E  _  _\ntarget col:  A  _  _  _  _",
      options: ["D", "A", "E", "Can't be determined without guessing"],
      answer: 0,
      explain:
        "The row eliminates B, C, E and the column eliminates A — four distinct letters gone, so D is the only legal letter. It's forced, never guessed.",
    },
    deepDive: [
      {
        title: "Two deduction types, and when to chain",
        body: "There are exactly two forced moves. Cell elimination: a cell whose row + column expose four letters takes the fifth. Letter placement: a letter missing from a row that has only one cell its columns don't already block. Easy items yield to the first type in one step; hard items hide the target behind a crowded neighbour, so you fill that forced cell first and let it cascade. If neither move is available anywhere, re-scan — the constraint you need is always on the board, never in a guess.",
      },
    ],
    recap:
      "A Latin square is pure deduction: A–E once per row and once per column, so pool a cell's row and column — four distinct letters there force the fifth. No cell ever needs a guess; hard items just chain a couple of forced cells first.",
    related: ["deadlocks", "figure-sequences", "mathematical-equations"],
    drill: "latin",
    questions: [],
  },
];
