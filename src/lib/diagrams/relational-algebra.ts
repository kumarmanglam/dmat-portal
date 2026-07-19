import type { TopicVisual } from "./types";

// Two query plans, side by side, computing the identical result —
// the σ-pushdown story with concrete row counts. Left: join first
// (huge intermediate). Right: filter first (tiny intermediate).
// The walkthrough builds the cost argument the exam asks for.
export const RELATIONAL_ALGEBRA_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Same answer, 200× less work: pushing σ below ⋈",
      flow: "vertical",
      caption:
        "Two relational-algebra plans for the same query. Left joins first and filters a million-row intermediate; right filters first and joins 5,000 rows. Edge labels show the row counts flowing between operators — follow them downward.",
      legend: [
        { swatch: "blue", text: "base table" },
        { swatch: "danger", text: "the expensive mistake — huge intermediate result" },
        { swatch: "green", text: "the optimizer's rewrite — σ pushed below the join" },
        { swatch: "muted", text: "final result (identical on both sides)" },
      ],
      nodes: [
        // ---- LEFT plan: join first (bad) ----
        {
          id: "la",
          label: "A",
          desc: "1,000,000 rows",
          detail:
            "The large base table — one million rows, of which only 5,000 satisfy price > 100. Everything the bad plan does wrong stems from dragging all million rows into the join before asking the price question.",
          x: 20,
          y: 20,
          kind: "blue",
        },
        {
          id: "lb",
          label: "B",
          desc: "10,000 rows",
          detail:
            "The smaller lookup table. Its size is harmless on its own — the damage comes from pairing it against an unfiltered million-row A.",
          x: 230,
          y: 20,
          kind: "blue",
        },
        {
          id: "ljoin",
          label: "⋈ join FIRST",
          desc: "pairs the unfiltered tables",
          detail:
            "The join runs before any filtering, so it matches all 1,000,000 A-rows against B and materialises roughly a million joined rows as an intermediate result. That intermediate is pure wasted work: 99.95% of it is about to be discarded by the filter above.",
          x: 120,
          y: 150,
          kind: "danger",
        },
        {
          id: "lsigma",
          label: "σ price > 100",
          desc: "filters 1M-row join output",
          detail:
            "The selection finally runs — but on the huge join output instead of on A itself. It scans ~1,000,000 joined rows and keeps 500. The answer is correct; only the cost is wrong.",
          x: 120,
          y: 290,
          kind: "accent",
        },
        {
          id: "lresult",
          label: "result",
          desc: "500 rows",
          detail:
            "The exact same 500 rows the right-hand plan produces. Correctness never distinguished the two plans — only the size of what they built along the way.",
          x: 120,
          y: 430,
          kind: "muted",
        },
        // ---- RIGHT plan: filter first (good) ----
        {
          id: "ra",
          label: "A",
          desc: "1,000,000 rows",
          detail:
            "The same million-row table — but this plan asks the price question immediately, before any pairing happens. The source data is identical; only the operator order differs.",
          x: 440,
          y: 20,
          kind: "blue",
        },
        {
          id: "rb",
          label: "B",
          desc: "10,000 rows",
          detail:
            "The same lookup table as on the left. Here it only ever meets the 5,000 A-rows that survived the filter — never the whole million.",
          x: 650,
          y: 20,
          kind: "blue",
        },
        {
          id: "rsigma",
          label: "σ price > 100 FIRST",
          desc: "1,000,000 → 5,000 rows",
          detail:
            "The selection is pushed below the join: one scan of A keeps just the 5,000 rows with price > 100. This rewrite is legal because the condition touches only A's own columns — σ and ⋈ commute here. One algebraic swap, 200× less data flowing upward.",
          x: 440,
          y: 150,
          kind: "green",
        },
        {
          id: "rjoin",
          label: "⋈ join",
          desc: "5,000 × 10,000",
          detail:
            "The join now matches 5,000 filtered rows against B's 10,000 instead of a million. Smaller inputs mean smaller hash tables, fewer comparisons, and an intermediate result that fits comfortably in memory.",
          x: 545,
          y: 290,
          kind: "accent",
        },
        {
          id: "rresult",
          label: "result",
          desc: "500 rows — identical",
          detail:
            "Bit-for-bit the same relation as the left plan's output. Algebraic equivalence guarantees it — which is exactly what licenses the optimizer to pick whichever plan is cheaper.",
          x: 545,
          y: 430,
          kind: "muted",
        },
      ],
      edges: [
        // left plan
        { id: "le1", from: "la", to: "ljoin", label: "1,000,000 rows" },
        { id: "le2", from: "lb", to: "ljoin", label: "10,000 rows" },
        {
          id: "le3",
          from: "ljoin",
          to: "lsigma",
          label: "~1,000,000 joined rows",
          animated: true,
        },
        { id: "le4", from: "lsigma", to: "lresult", label: "500 rows" },
        // right plan
        { id: "re1", from: "ra", to: "rsigma", label: "1,000,000 rows (one scan)" },
        { id: "re2", from: "rsigma", to: "rjoin", label: "5,000 rows", animated: true },
        { id: "re3", from: "rb", to: "rjoin", label: "10,000 rows" },
        { id: "re4", from: "rjoin", to: "rresult", label: "500 rows — identical" },
      ],
      steps: [
        {
          title: "One algebra: table in, table out",
          text: "Every relational-algebra operator — σ (filter rows), π (keep columns), ⋈ (join on shared values) — takes tables in and hands a table back. That closure is what makes plans composable: the output of any operator is legal input to the next, so the same query can be assembled in many different orders. Both plans below are built from the same two base tables and the same two operators.",
          focus: ["la", "lb", "ra", "rb"],
        },
        {
          title: "Bad plan: join first, ask questions later",
          text: "The left plan computes σ_price>100(A ⋈ B). The join must pair all 1,000,000 A-rows with their B partners before anyone looks at price — materialising roughly a million joined rows. Count what flows on the edges: a million rows enter the filter just so 500 can leave it. The intermediate result IS the cost; the final answer was never in question.",
          focus: ["ljoin", "lsigma"],
          edgeFocus: ["le1", "le2", "le3"],
        },
        {
          title: "The rewrite: push σ below ⋈",
          text: "The right plan computes σ_price>100(A) ⋈ B — the filter slides underneath the join. One scan of A keeps the 5,000 matching rows, and only those ever reach the join. The move is legal precisely because price is a column of A alone: a filter that only reads one input's columns commutes with the join. That's an equivalence rule, not a heuristic.",
          focus: ["rsigma"],
          edgeFocus: ["re1", "re2"],
        },
        {
          title: "Identical answer, ~200× less work",
          text: "Both plans end at the same 500 rows — set-theoretically indistinguishable results. But the left join consumed 1,000,000 rows where the right consumed 5,000: a 200× difference in intermediate size, which dominates real query cost (memory, comparisons, I/O). This is why optimizers rewrite freely: equivalence rules guarantee the answer, so only cost needs comparing.",
          focus: ["lresult", "rresult"],
          edgeFocus: ["le4", "re4"],
        },
        {
          title: "This is your SQL query",
          text: "Map it back: WHERE price > 100 is the σ, the JOIN clause is the ⋈, and the SELECT-list you'd add on top is a π. You write ONE declarative SQL statement; the optimizer generates both of these algebra trees (and dozens more), estimates the row counts you see on the edges, and executes the cheapest. Reading the algebra is reading the optimizer's mind.",
          focus: ["lsigma", "ljoin", "rsigma", "rjoin"],
        },
        {
          title: "The exam tell",
          text: "When a question shows two equivalent plans and asks 'which is faster and why', the expected answer is always the same two-part argument: name the rewrite (selection pushed below the join) and size the intermediates (5,000 rows joined instead of 1,000,000). Never argue from the final result — it's identical by construction. Argue from what each plan had to build to get there.",
          focus: ["rsigma", "rjoin"],
          edgeFocus: ["re2", "re3"],
        },
      ],
    },
  },
];
