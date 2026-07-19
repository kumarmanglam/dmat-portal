import type { TopicVisual } from "./types";

// 1) A real, runnable DFA — the machine that accepts every string
//    ending in "ab" — drawn as states and transitions, with a
//    walkthrough that traces the input "aab" character by character
//    and ends on WHY no DFA can ever accept aⁿbⁿ.
// 2) A mermaid power hierarchy: DFA/NFA ⊂ PDA ⊂ Turing machine,
//    with the undecidability ceiling (halting) sitting above it all.
export const AUTOMATA_BASICS_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "A DFA that accepts strings ending in “ab”",
      flow: "free",
      caption:
        "Each state IS the machine's entire memory: 'how much of a final ab have I just seen?'. Follow an edge per input character. Two self-loops (q0 on b, q1 on a) are described in the note node — the renderer doesn't draw loops. Run the walkthrough to trace the input aab.",
      legend: [
        { swatch: "muted", text: "q0 — start: no useful suffix seen" },
        { swatch: "blue", text: "q1 — last character was 'a'" },
        { swatch: "green", text: "q2 — accepting: input ends in 'ab'" },
        { swatch: "accent", text: "note — the two undrawn self-loops" },
      ],
      nodes: [
        {
          id: "q0",
          label: "q0 · start",
          desc: "seen nothing useful",
          detail:
            "The start state, meaning 'the string so far does not end in a, and does not end in ab'. On input b it STAYS in q0 (a self-loop, not drawn): a trailing b that doesn't follow an a is useless progress. On input a it moves to q1.",
          x: 60,
          y: 60,
          kind: "muted",
        },
        {
          id: "q1",
          label: "q1 · seen “a”",
          desc: "one letter from accepting",
          detail:
            "Means 'the string so far ends in a'. On input b the pattern ab completes — go to q2. On input a it STAYS in q1 (self-loop, not drawn): aa still ends in a, so the memory doesn't change. Note the machine never counts the a's — it only remembers the last one.",
          x: 350,
          y: 230,
          kind: "blue",
        },
        {
          id: "q2",
          label: "q2 · seen “ab”",
          desc: "ACCEPTING state",
          detail:
            "The accepting state: 'the string so far ends in ab'. If the input stops here, the machine accepts. It is NOT a dead end — on another a it returns to q1 (a fresh ab could still complete), and on b it falls all the way back to q0 (abb ends in bb, all progress lost).",
          x: 640,
          y: 60,
          kind: "green",
        },
        {
          id: "note",
          label: "Self-loops (not drawn)",
          desc: "q0 ─b→ q0 · q1 ─a→ q1",
          detail:
            "The full DFA has six transitions — one per state per input symbol, no exceptions, that is what 'deterministic' means. Two of them are self-loops this renderer can't draw: q0 on b stays in q0 (a stray b is no progress), and q1 on a stays in q1 (another a still just means 'ends in a').",
          x: 60,
          y: 420,
          kind: "accent",
        },
      ],
      edges: [
        { id: "e-q0a", from: "q0", to: "q1", label: "a", animated: true },
        { id: "e-q1b", from: "q1", to: "q2", label: "b", animated: true },
        { id: "e-q2a", from: "q2", to: "q1", label: "a" },
        { id: "e-q2b", from: "q2", to: "q0", label: "b" },
        { id: "e-note", from: "note", to: "q1", label: "a loops here", dashed: true },
      ],
      steps: [
        {
          title: "The state IS the memory",
          text: "Before reading anything, the machine sits in q0. A DFA has no tape, no stack, no variables — its entire memory is which state it occupies. Three states means it can distinguish exactly three situations about everything it has read so far: 'no progress', 'ends in a', 'ends in ab'. That compression is the whole idea of FINITE automata.",
          focus: ["q0"],
        },
        {
          title: "Trace “aab” — read the first a",
          text: "Input character 1 is a, so q0 takes its a-edge to q1. The machine has now forgotten the string entirely except for one fact: it ends in a. Note this move is forced — a DFA has exactly one outgoing edge per symbol, so there is never a choice and never any backtracking.",
          focus: ["q0", "q1"],
          edgeFocus: ["e-q0a"],
        },
        {
          title: "Read the second a — the undrawn self-loop",
          text: "Character 2 is another a. From q1 the a-transition goes back to q1 itself (a self-loop, described in the note node): 'aa' still ends in a, so the machine's one remembered fact hasn't changed. This is why the machine can never count — reading a thousand a's leaves it in exactly the same state as reading one.",
          focus: ["q1", "note"],
          edgeFocus: ["e-note"],
        },
        {
          title: "Read b — the pattern completes",
          text: "Character 3 is b. From q1 the b-edge fires and the machine lands in q2: the last two characters were ab. The input is now exhausted, and where the machine STOPS is the only thing that matters — every intermediate state along the way is irrelevant to the verdict.",
          focus: ["q1", "q2"],
          edgeFocus: ["e-q1b"],
        },
        {
          title: "What accepting actually means",
          text: "The machine halts in q2, an accepting state, so aab is in the language — and by the same run, ab, bab, aaab all are too. Accepting is a property of the FINAL state only. And q2 isn't sticky: another a drops back to q1 (a new ab could still form), a b crashes to q0 (abb ends in bb). One machine, finitely many states, infinitely many accepted strings.",
          focus: ["q2"],
          edgeFocus: ["e-q2a", "e-q2b"],
        },
        {
          title: "Why NO DFA can accept aⁿbⁿ",
          text: "Now the exam punchline. Accepting aⁿbⁿ requires remembering the exact count of a's — an unbounded number. Any DFA has some fixed k states, so by pigeonhole, among the prefixes a, aa, aaa, … two different counts aⁱ and aʲ must land in the SAME state; from there the machine treats aⁱbⁱ and aʲbⁱ identically, yet one must be accepted and the other rejected. Contradiction — finite states cannot count. That is why aⁿbⁿ needs a PDA's stack.",
          focus: ["q0", "q1", "q2", "note"],
        },
      ],
    },
  },
  {
    kind: "mermaid",
    title: "The machine power hierarchy — memory is the whole game",
    caption:
      "Top = the undecidable ceiling, then machines in decreasing power. Each step down removes memory, and with it a whole class of languages. Read the middle line of each machine: its memory model IS its power.",
    chart: `flowchart TD
    U["THE CEILING - undecidable\nhalting problem: does program P halt on input x?\nNO machine decides this, ever"]
    TM["Turing machine\nmemory: unbounded read/write tape\nrecognises: anything computable at all"]
    PDA["Pushdown automaton (PDA)\nmemory: one stack\ncontext-free: aⁿbⁿ, balanced brackets"]
    FA["DFA = NFA (equal power)\nmemory: current state only\nregular: a*b*, 'ends in ab'"]
    U -. "sits strictly above:\nmore tape or time never helps" .-> TM
    TM -- "take away the tape,\nleave a single stack" --> PDA
    PDA -- "take away the stack,\nleave only finite states" --> FA

    classDef ceiling fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    classDef tm fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef pda fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef fa fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    class U ceiling;
    class TM tm;
    class PDA pda;
    class FA fa;`,
    notes: [
      {
        label: "Memory = power, exactly",
        text: "Each level is defined purely by what it can remember: finite states check patterns (a*b*), one stack matches one level of nesting (aⁿbⁿ — push each a, pop each b, accept iff the stack empties), an unbounded tape computes anything computable. Exam questions asking 'what is the weakest machine for language L?' are really asking 'what must be remembered, and for how long?'.",
      },
      {
        label: "Why NFA = DFA in power",
        text: "Nondeterminism looks like a superpower but adds nothing: the subset construction converts any NFA into a DFA whose states are SETS of NFA states, tracking every branch simultaneously. The cost is size — up to 2ⁿ DFA states for an n-state NFA — never capability. Both recognise exactly the regular languages; NFAs are just shorter to write.",
      },
      {
        label: "The halting problem is a ceiling, not a slope",
        text: "Undecidable is a different KIND of impossible from exponential. O(2ⁿ) is slow but a bigger machine eventually answers; halting has a diagonalization proof that no algorithm — on any hardware, in any language, with any amount of time — answers correctly for every program/input pair. If an exam option says a halting checker is merely 'impractical', that option is the trap.",
      },
    ],
  },
];
