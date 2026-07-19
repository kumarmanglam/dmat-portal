import type { TopicVisual } from "./types";

// A containment map of P, NP and the NP-complete core: P's easy
// residents on the left, NP's verify-fast world in the middle, and
// the inter-reducible NP-complete ring on the right — ending at the
// P = NP cascade. The walkthrough builds the picture in the order
// the definitions depend on each other.
export const COMPLEXITY_CLASSES_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "P, NP and the NP-complete core",
      flow: "free",
      caption:
        "Left = P (solve fast), middle = NP (verify fast), right = the NP-complete ring, each member reducible to the others. Solid arrows are containment; dashed arrows between problems mean 'reduces to'. Run the walkthrough — step 5 is the reduction-direction exam trap.",
      legend: [
        { swatch: "green", text: "P — solvable in polynomial time" },
        { swatch: "blue", text: "NP — verifiable in polynomial time" },
        { swatch: "accent", text: "NP-complete — NP's hardest core" },
        { swatch: "danger", text: "the P = NP cascade" },
      ],
      nodes: [
        {
          id: "p",
          label: "P — solve fast",
          desc: "polynomial-time solving",
          detail:
            "Problems with an algorithm that finds the answer in polynomial time — n, n log n, n², any fixed power of n. 'Fast' here means the work grows tamely as inputs grow, not that it is instant. Everything in P is automatically in NP too.",
          x: 60,
          y: 40,
          kind: "green",
        },
        {
          id: "ex-sort",
          label: "Sorting",
          desc: "O(n log n) — solved",
          detail:
            "A canonical P resident: merge sort finds the answer, not just checks one, in O(n log n). On the exam, 'we have an efficient algorithm that produces the solution' is the phrase that pins a problem inside P.",
          x: 40,
          y: 180,
          kind: "green",
        },
        {
          id: "ex-path",
          label: "Shortest path",
          desc: "Dijkstra — polynomial",
          detail:
            "Dijkstra's algorithm solves single-source shortest path in polynomial time. Contrast with TSP on the right: asking for the best TOUR through all cities looks superficially similar but jumps straight out of known-P territory.",
          x: 40,
          y: 320,
          kind: "green",
        },
        {
          id: "np",
          label: "NP — verify fast",
          desc: "check a certificate quickly",
          detail:
            "Problems where a proposed answer — a 'certificate' — can be CHECKED in polynomial time, even if finding one seems to need brute force. NP stands for Nondeterministic Polynomial, NOT 'not polynomial'; that misreading is a standing exam trap.",
          x: 330,
          y: 40,
          kind: "blue",
        },
        {
          id: "sudoku",
          label: "Sudoku (n×n)",
          desc: "checking is easy, solving isn't",
          detail:
            "Generalised n×n Sudoku: verifying a filled grid means scanning rows, columns and boxes — polynomial. Producing a solution from a blank grid has no known fast method. That solve/verify gap is NP's defining picture.",
          x: 330,
          y: 180,
          kind: "blue",
        },
        {
          id: "npc",
          label: "NP-complete",
          desc: "hardest problems in NP",
          detail:
            "The problems that are (1) in NP themselves — solutions verify fast — and (2) NP-hard: EVERY problem in NP reduces to them in polynomial time. Miss either half and it isn't NP-complete; NP-hard alone allows problems even harder than NP.",
          x: 600,
          y: 40,
          kind: "accent",
        },
        {
          id: "sat",
          label: "SAT",
          desc: "the first NP-complete problem",
          detail:
            "Boolean satisfiability: is there a true/false assignment making a formula true? Cook and Levin proved every NP problem reduces to SAT — the anchor from which all other NP-completeness proofs hang, by reducing SAT (or a descendant) onward.",
          x: 600,
          y: 180,
          kind: "accent",
        },
        {
          id: "tsp",
          label: "TSP (decision)",
          desc: "tour shorter than k?",
          detail:
            "The decision version — 'is there a tour of length at most k?' — is NP-complete. A proposed tour verifies in O(n) by adding up its edges; finding one appears to need exploring an exponential space of orderings.",
          x: 600,
          y: 320,
          kind: "accent",
        },
        {
          id: "col",
          label: "Graph colouring",
          desc: "k colours, no clashing neighbours",
          detail:
            "Can a graph's vertices take k colours with no edge joining two of the same colour? Checking a colouring is one pass over the edges; finding one is NP-complete for k ≥ 3. Like SAT and TSP, it reduces to and from every other NP-complete problem.",
          x: 600,
          y: 460,
          kind: "accent",
        },
        {
          id: "collapse",
          label: "P = NP",
          desc: "the cascade nobody has triggered",
          detail:
            "If any single NP-complete problem gets a polynomial-time algorithm, every NP problem inherits it: reduce to the fast one, solve, translate back. All of NP collapses into P. No one has done it, and no one has proven it impossible — the biggest open question in computer science.",
          x: 300,
          y: 470,
          kind: "danger",
        },
      ],
      edges: [
        { id: "e-psort", from: "p", to: "ex-sort", label: "e.g.", dashed: true },
        { id: "e-ppath", from: "p", to: "ex-path", label: "e.g.", dashed: true },
        { id: "e-pnp", from: "p", to: "np", label: "P ⊆ NP" },
        { id: "e-npsud", from: "np", to: "sudoku", label: "e.g.", dashed: true },
        { id: "e-npnpc", from: "np", to: "npc", label: "hardest core" },
        { id: "e-sattsp", from: "sat", to: "tsp", label: "reduces to", dashed: true },
        { id: "e-tspcol", from: "tsp", to: "col", label: "reduces to", dashed: true },
        { id: "e-colsat", from: "col", to: "sat", label: "reduces to", dashed: true },
        { id: "e-cascade", from: "npc", to: "collapse", label: "if ONE is fast", animated: true },
        {
          id: "e-collapse",
          from: "collapse",
          to: "p",
          label: "all of NP falls into P",
          dashed: true,
          animated: true,
        },
      ],
      steps: [
        {
          title: "P — what 'solve fast' means",
          text: "P holds every problem some algorithm SOLVES in polynomial time — sorting in O(n log n), shortest path with Dijkstra. Polynomial is the theorist's line for 'scales': double the input and the work multiplies by a fixed factor, it doesn't explode. The key verb is solve — the algorithm produces the answer from scratch, no hints needed.",
          focus: ["p", "ex-sort", "ex-path"],
          edgeFocus: ["e-psort", "e-ppath"],
        },
        {
          title: "NP — verify fast, the certificate idea",
          text: "NP asks a weaker question: if someone HANDS you a proposed answer — a certificate — can you check it in polynomial time? A filled n×n Sudoku verifies with a simple scan even though solving from blank may need brute force. Beware the name: NP means Nondeterministic Polynomial, not 'not polynomial' — that misreading loses easy marks.",
          focus: ["np", "sudoku"],
          edgeFocus: ["e-npsud"],
        },
        {
          title: "P sits inside NP — trivially",
          text: "Every P problem is also in NP: if you can solve from scratch in polynomial time, you can 'verify' any certificate by ignoring it, solving, and comparing. Sorting is in NP. So 'in NP' never means 'hard' — it only means 'checkable'. The open question is whether the containment is strict, not whether it holds.",
          focus: ["p", "np"],
          edgeFocus: ["e-pnp"],
        },
        {
          title: "NP-complete — the hardest of NP, two requirements",
          text: "SAT, TSP (decision) and graph colouring form NP's hardest core. NP-complete means BOTH: (1) the problem is itself in NP — certificates verify fast — and (2) every NP problem reduces to it in polynomial time. Drop requirement 1 and you only have NP-hard, which can be harder than NP itself; conflating the two is a favourite distractor.",
          focus: ["npc", "sat", "tsp", "col"],
          edgeFocus: ["e-npnpc"],
        },
        {
          title: "Reductions — the direction IS the exam trap",
          text: "A polynomial-time reduction from A to B rewrites any A-instance as a B-instance with the same answer, proving B is AT LEAST as hard as A. So to show a new problem Y is NP-complete you reduce a KNOWN NP-complete problem INTO Y — hard into new. Reducing Y into SAT proves nothing about Y's hardness (everything in NP reduces to SAT). The dashed ring here shows SAT, TSP and colouring all inter-reducible: one family, equally hard.",
          focus: ["sat", "tsp", "col"],
          edgeFocus: ["e-sattsp", "e-tspcol", "e-colsat"],
        },
        {
          title: "The P = NP cascade",
          text: "Now the payoff of completeness: find a polynomial-time algorithm for ANY one NP-complete problem and every NP problem becomes fast — reduce it to your solved problem, run the fast algorithm, map the answer back. Sudoku, scheduling, SAT, TSP: all of NP collapses into P in one stroke. That single-domino structure is why the ring matters, and why 'what follows if one NP-complete problem is in P?' has exactly one right answer: P = NP.",
          focus: ["npc", "collapse", "p"],
          edgeFocus: ["e-cascade", "e-collapse"],
        },
      ],
    },
  },
];
