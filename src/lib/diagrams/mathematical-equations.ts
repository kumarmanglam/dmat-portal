import type { TopicVisual } from "./types";

// The anchor → substitute → back-substitute strategy as a decision
// flowchart, ending in the 1–20 integer sanity gate that catches
// substitution slips for free.
export const MATHEMATICAL_EQUATIONS_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "Anchor, substitute, back-substitute",
    caption:
      "One pass, top to bottom. The anchor decides everything: start at the most constrained equation, and every later step consumes exactly one value you just derived.",
    chart: `flowchart TD
    SCAN["Scan ALL equations for\nan anchor: one unknown\nOR a pure ratio"] --> FOUND{"direct value there?\n(like 3 × A = 12)"}
    FOUND -- "yes — solve it\nin your head" --> SUB
    FOUND -- "no — a ratio\n(B = 2 × A)" --> RATIO["Keep the ratio as a\nrewrite rule, not a value"]
    RATIO --> SUB["Substitute into the equation\nwith the MOST unknowns"]
    SUB --> COLL["Collapse: everything now\nreads in ONE letter"]
    COLL --> SOLVE["Solve that single letter"]
    SOLVE --> BACK["Back-substitute in\ndependence order —\none letter per step"]
    BACK --> GATE{"every value a whole\nnumber from 1–20?"}
    GATE -- "yes" --> DONE["Match the option set —\ndone, no re-derivation"]
    GATE -- "fraction, 0, or\nout of range" --> ERR["You slipped a substitution.\nRecheck — NEVER round"]
    ERR --> SCAN

    classDef q fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef step fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef ok fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    classDef warn fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    class SCAN,FOUND,GATE q;
    class RATIO,SUB,COLL,SOLVE,BACK step;
    class DONE ok;
    class ERR warn;`,
    notes: [
      {
        label: "Anchor order is a working-memory trick, not a maths trick",
        text: "No paper is allowed, so the real constraint is how many half-known letters you can juggle, not the arithmetic itself. Starting at the single-unknown anchor and following the dependence chain means each step consumes the number you just derived and hands you exactly one new one — you never hold more than two values at once. Start mid-knot instead and you're juggling four half-knowns, which is precisely where mental-math errors breed.",
      },
      {
        label: "The 1–20 rule is a free error detector",
        text: "Every unknown is a whole number from 1–20 with exactly one solution — so the moment a fraction, a 0, or a 23 appears, the exam has just TOLD you that you slipped, at zero cost to you. Run the range check after every back-substitution, not only at the end: catching the slip one step in costs seconds, catching it at the option list costs the whole item. Never round — rounding converts a loud alarm into a silent wrong answer.",
      },
      {
        label: "The options are equations too",
        text: "Four options are four candidate value-sets, and plugging a candidate into the shortest equation takes about two seconds per option. When no anchor exists — every equation carries two or more unknowns — testing options backwards is genuinely the fastest route; and even mid-solve, a derived A = 7 usually kills two or three options before you have touched B, sometimes leaving only one and ending the item early.",
      },
    ],
  },
];
