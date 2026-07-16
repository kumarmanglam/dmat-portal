import type { TopicContent } from "../types";

export const THEORETICAL_CONTENT: TopicContent[] = [
  {
    id: "automata-basics",
    whyItMatters:
      "Half of the theory section is 'what is the weakest machine that recognises this language?' — get the memory model wrong and you either over-engineer a Turing machine or wrongly claim a DFA suffices.",
    intro:
      "An automaton's power is exactly the memory it carries. A DFA remembers only its current state — a finite amount — so it can check patterns but never count without limit. Add a stack and you get a PDA that can match nested pairs. Add an unbounded tape and you get a Turing machine — full computation, including problems no machine can decide.",
    analogy:
      "Memory is the whole game. A DFA is a doorman with no notepad — he can only remember which of a few moods he's in. A PDA gets a single spike to skewer receipts on (a stack). A Turing machine gets an endless notebook it can scribble on and re-read.",
    bullets: [
      "DFA/NFA recognise regular languages — same power, NFAs are just more compact to write.",
      "Anything that needs unbounded counting (aⁿbⁿ, balanced brackets) breaks a DFA: finitely many states can't track n.",
      "A PDA's stack gives one 'counter with discipline' — push on the way in, pop on the way out.",
      "The halting problem is undecidable: no program can decide, for every program+input, whether it halts.",
    ],
    workedExample: {
      scenario:
        "You want a DFA that accepts exactly aⁿbⁿ (n a's then n b's, equal counts) for every n.",
      steps: [
        "A DFA has some fixed number of states, say k. Feed it a's: a, aa, aaa, … past k+1 of them.",
        "By pigeonhole, two different prefixes aⁱ and aʲ (i ≠ j) must land in the SAME state — there aren't enough states to keep them apart.",
        "From that shared state the machine behaves identically forever, so aⁱbⁱ and aʲbⁱ get the same accept/reject verdict.",
        "But aⁱbⁱ should be accepted and aʲbⁱ (i ≠ j) rejected — a contradiction.",
      ],
      result:
        "No finite number of states can track an unbounded count, so aⁿbⁿ is not regular. A PDA's stack fixes it: push on each a, pop on each b, accept iff the stack empties exactly.",
    },
    gotchas: [
      "An NFA is NOT more powerful than a DFA — nondeterminism only makes the machine smaller to write; both recognise exactly the regular languages.",
      "'Finite automaton' does NOT mean it handles only finite inputs — it means finitely many states; a* accepts infinitely many strings.",
      "Undecidable (halting) is NOT the same as 'slow' or 'exponential' — no amount of time or faster hardware makes it solvable.",
    ],
    quickCheck: {
      prompt:
        "You have a DFA and bolt a single stack onto it. Which new capability does that unlock?",
      options: [
        "Matching nested / balanced structure like aⁿbⁿ or well-formed brackets",
        "Deciding whether an arbitrary program halts",
        "Nothing — a stack adds no power over a DFA",
        "Recognising every language a Turing machine can",
      ],
      answer: 0,
      explain:
        "A stack turns a DFA into a PDA, which recognises context-free languages — enough for one level of balanced counting, but still far weaker than a Turing machine's unbounded tape.",
    },
    deepDive: [
      {
        title: "The pumping lemma — the tool behind 'not regular'",
        body: "The worked example is really the pumping lemma in disguise: every regular language has a length p such that any longer string splits as xyz with y non-empty, and xyⁱz stays in the language for all i ≥ 0. For aⁿbⁿ the y lands inside the a's, so pumping it changes the a-count without touching the b's — producing a string that should be rejected. No such p can exist, so the language cannot be regular. This is the standard way to prove a language needs more than finite memory.",
      },
    ],
    recap:
      "An automaton recognises exactly what its memory lets it track: finite states → regular patterns, a stack → nested/balanced structure, an unbounded tape → full computation. Some questions (halting) sit beyond every machine, no matter the resources.",
    related: ["complexity-classes", "figure-sequences", "big-o-comparison"],
    questions: [
      {
        prompt:
          "A validator must accept strings of the form ( ( ( … ) ) ) — n opening brackets followed by exactly n closing brackets, for any n. What is the weakest machine that can do this?",
        options: [
          "A pushdown automaton (stack-based)",
          "A deterministic finite automaton",
          "A nondeterministic finite automaton",
          "No machine can recognise this language",
        ],
        answer: 0,
        explain:
          "Matching counts requires unbounded memory; a stack (push '(' , pop on ')') is exactly enough. DFAs and NFAs only have finite states.",
      },
      {
        prompt:
          "A DFA with 4 states processes an input of 1 million characters. What limits what it can 'remember' about the input read so far?",
        options: [
          "It can distinguish at most 4 different situations — one per state",
          "It remembers the last 4 characters read",
          "It stores the whole input on its tape",
          "It remembers everything, but only for regular inputs",
        ],
        answer: 0,
        explain:
          "A DFA's entire memory is which state it is in. With 4 states it can only tell apart 4 classes of prefixes — that is the whole intuition behind 'finite' automata.",
      },
      {
        prompt:
          "Your teammate claims to have written a tool that takes any program plus its input and always answers correctly whether that program will eventually terminate. Why should you be skeptical?",
        options: [
          "This is the halting problem, which is proven undecidable",
          "Such a tool needs quantum hardware",
          "It would run in exponential time, which is impractical but possible",
          "It works for compiled languages but not interpreted ones",
        ],
        answer: 0,
        explain:
          "No algorithm can decide halting for all program/input pairs — a diagonalization proof, independent of hardware or language.",
      },
      {
        prompt: "A language can be described by a regular expression. Which statement must be true?",
        options: [
          "Some DFA accepts exactly this language",
          "It needs at least a pushdown automaton",
          "It cannot contain infinitely many strings",
          "Only an NFA, never a DFA, can accept it",
        ],
        answer: 0,
        explain:
          "Regular expressions, DFAs and NFAs all describe exactly the regular languages — every regex has an equivalent DFA (and regular languages can be infinite, like a*).",
      },
    ],
  },
  {
    id: "complexity-classes",
    whyItMatters:
      "When a question asks whether a problem is 'in P', 'in NP', or 'NP-complete', it is really testing whether you can tell solving apart from checking — and which way a reduction points.",
    intro:
      "P vs NP is about the gap between solving and checking. P = problems you can solve fast (polynomial time). NP = problems where you can check a proposed answer fast, even if finding one seems to need brute force. NP-complete problems are the hardest of NP: every NP problem can be translated (reduced) into them, so one fast NP-complete algorithm would make all of NP fast.",
    analogy:
      "P vs NP is the gap between composing a symphony and hearing that it's in tune. A completed Sudoku you can check in seconds; producing one from a blank grid may need brute force. NP is the class where checking a handed-to-you answer is cheap.",
    bullets: [
      "Solve fast → P. Verify fast → NP. Every P problem is trivially also in NP.",
      "A reduction A ≤ B means 'A is no harder than B' — solving B lets you solve A.",
      "To show a new problem is NP-complete: it's in NP, and a known NP-complete problem reduces TO it (direction matters).",
      "Classic NP-complete anchors: SAT, Travelling Salesman (decision version), graph colouring, knapsack.",
    ],
    workedExample: {
      scenario:
        "You have a fast solver for Travelling Salesman (TSP) and want to use it to answer Hamiltonian Cycle: does a graph G visit every vertex exactly once in a cycle?",
      steps: [
        "Take G. Build a TSP instance on the same vertices.",
        "Give every edge that exists in G weight 1, and every missing edge weight 2.",
        "Ask the TSP solver for the cheapest tour and whether its cost ≤ the number of vertices.",
        "Cost = (number of vertices) exactly when the tour uses only weight-1 edges — i.e. only real edges of G — which is precisely a Hamiltonian cycle.",
      ],
      result:
        "Hamiltonian Cycle ≤ TSP: a fast TSP solver would solve Hamiltonian Cycle for free. The reduction runs FROM the known-hard problem INTO TSP, which is what proves TSP is at least as hard — not the other way round.",
    },
    gotchas: [
      "NP does NOT mean 'not polynomial' — it stands for Nondeterministic Polynomial, and every P problem is also in NP.",
      "A reduction A ≤ B means A is NO HARDER than B, NOT the reverse — to prove your problem hard you reduce a known-hard problem INTO it, not it into something easy.",
      "NP-complete is NOT the same as NP-hard: NP-complete problems must themselves be in NP (verifiable fast); NP-hard problems may be even harder and need not be in NP.",
    ],
    quickCheck: {
      prompt:
        "A colleague says a problem is in NP because 'we have a fast algorithm that checks whether a given assignment satisfies it.' What makes a problem NP by this reasoning?",
      options: [
        "There is a certificate (candidate answer) that can be verified in polynomial time",
        "There is a polynomial-time algorithm that finds the answer",
        "The problem has no known solution at all",
        "The problem is harder than every problem in P",
      ],
      answer: 0,
      explain:
        "NP is defined by cheap verification of a proposed certificate, not by cheap solving. Whether such a verifier also implies a fast solver is exactly the open P vs NP question.",
    },
    deepDive: [
      {
        title: "Why reduction direction is everything",
        body: "A polynomial-time reduction from A to B transforms any instance of A into an instance of B so the answers match. It proves B is at least as hard as A — solve B fast and you solve A fast for free. To show a NEW problem is NP-complete you therefore reduce a KNOWN NP-complete problem INTO it (hard → new), never the reverse; reducing your problem into an easy one proves nothing about its hardness. Getting the arrow backwards is the single most common mistake on these questions.",
      },
    ],
    recap:
      "P is 'solvable fast', NP is 'checkable fast', and P sits inside NP. NP-complete problems are NP's hardest core — every NP problem reduces into them — so a single polynomial-time NP-complete algorithm would collapse all of NP into P.",
    related: ["big-o-comparison", "automata-basics", "graphs"],
    questions: [
      {
        prompt:
          "For the Sudoku-style puzzle of size n×n, verifying a filled solution takes polynomial time, but nobody knows a polynomial algorithm to find a solution. This puts the problem in which situation?",
        options: [
          "It is in NP; whether it is in P is exactly the P vs NP question",
          "It is in P because verifying is polynomial",
          "It is undecidable",
          "It is outside NP because solving is slow",
        ],
        answer: 0,
        explain: "Fast verification is the definition of NP. Fast solving (membership in P) is the open part.",
      },
      {
        prompt:
          "Problem X is known NP-complete. You build a polynomial-time reduction from X to your new problem Y, and Y's solutions can be verified in polynomial time. What have you shown?",
        options: [
          "Y is NP-complete",
          "Y is in P",
          "X is easier than every problem in NP",
          "Y is undecidable",
        ],
        answer: 0,
        explain:
          "Y is in NP (fast verification) and at least as hard as X (every NP problem reduces via X to Y) — the two halves of NP-completeness.",
      },
      {
        prompt: "If someone found a polynomial-time algorithm for ONE NP-complete problem, what would follow?",
        options: [
          "Every problem in NP would be solvable in polynomial time (P = NP)",
          "Only that single problem becomes easy",
          "The halting problem becomes decidable",
          "Nothing — NP-complete problems are unrelated to each other",
        ],
        answer: 0,
        explain:
          "All NP problems reduce to any NP-complete problem, so one fast algorithm cascades to all of NP.",
      },
      {
        prompt:
          "Sorting a list is in P. Which statement about its relationship to NP is correct?",
        options: [
          "Sorting is also in NP, since P ⊆ NP",
          "Sorting is not in NP because it is too easy",
          "Sorting is NP-complete",
          "P and NP are disjoint sets",
        ],
        answer: 0,
        explain:
          "P is contained in NP — if you can solve fast you can certainly verify fast. 'In NP' does not mean 'hard'.",
      },
    ],
  },
  {
    id: "big-o-comparison",
    whyItMatters:
      "Given two candidate algorithms and a big input, the exam wants the one that survives at scale — which means reading growth rate off the code, not timing a small run.",
    intro:
      "Big-O answers one question: when the input doubles, what happens to the work? O(log n) barely notices, O(n) doubles, O(n log n) doubles-and-a-bit, O(n²) quadruples, O(2ⁿ) explodes. Drop constants and keep the dominant term — Big-O compares shapes of growth, not stopwatch times.",
    analogy:
      "Big-O is the shape of the curve, not the speed off the starting line. A bicycle beats a car for the first ten metres (lower constant), but over a marathon the car's growth wins every time — and Big-O only cares about the marathon.",
    bullets: [
      "Ordering to burn in: log n < n < n log n < n² < n³ < 2ⁿ.",
      "Nested loop over the same n → n²; loop that halves the range each pass → log n.",
      "Good comparison sorts are O(n log n); simple ones (bubble, insertion) are O(n²).",
      "For small n, a 'worse' algorithm can win — Big-O only rules for large inputs.",
    ],
    workedExample: {
      scenario:
        "Algorithm P does 100·n operations; algorithm Q does n² operations. Which should you ship, and does the answer depend on n?",
      steps: [
        "Set the costs equal to find the crossover: 100n = n² → n = 100.",
        "For n < 100, n² < 100n, so Q (the quadratic) is actually faster — its smaller per-step work wins on tiny inputs.",
        "At n = 100 they tie at 10,000 operations each.",
        "For n > 100 the gap explodes: at n = 1,000,000, P does 10⁸ while Q does 10¹² — a 10,000× difference.",
      ],
      result:
        "Q wins only below n = 100; P wins for every larger input and by an ever-widening margin. Big-O keeps just the growth term (P is O(n), Q is O(n²)) because that term decides the winner once n is large.",
    },
    gotchas: [
      "Big-O compares GROWTH RATE, NOT stopwatch time — an O(n) algorithm with a huge constant can lose to an O(n²) one on small inputs.",
      "Big-O drops constants and lower-order terms: 3n² + 500n + 9000 is just O(n²), NOT O(n² + n).",
      "Big-O is an upper bound on how work grows, NOT a promise the algorithm always runs that slowly — it describes the worst-case shape, not every run.",
    ],
    quickCheck: {
      prompt:
        "A function sorts an array (O(n log n)) and then does a single linear scan (O(n)) over it. What is the overall time complexity?",
      options: [
        "O(n log n) — the faster-growing term dominates",
        "O(n log n + n), which must be kept as two terms",
        "O(n²), because the steps combine",
        "O(n), because the scan runs last",
      ],
      answer: 0,
      explain:
        "Add the costs and keep only the fastest-growing term: n log n grows faster than n, so n log n + n collapses to O(n log n).",
    },
    deepDive: [
      {
        title: "O, Θ and Ω — upper, tight, lower",
        body: "Big-O is only the upper bound: 'grows no faster than'. Ω (omega) is the lower bound — 'grows no slower than' — and Θ (theta) is the tight bound, used when upper and lower match. Saying binary search is O(n) is technically true but sloppy; it is Θ(log n). On the exam 'Big-O' almost always means the tight worst-case bound, but knowing the distinction stops you from marking a loose upper bound wrong when it is merely imprecise.",
      },
    ],
    recap:
      "Big-O names how the work grows as the input grows, keeping only the dominant term: log n < n < n log n < n² < n³ < 2ⁿ. It ranks algorithms at scale — constants and small-n quirks are deliberately thrown away.",
    related: ["complexity-classes", "trees", "graphs"],
    questions: [
      {
        prompt: "What is the time complexity of this pattern?",
        block: "for i in 1..n:\n    for j in i..n:\n        work()",
        options: ["O(n²)", "O(n log n)", "O(n)", "O(2ⁿ)"],
        answer: 0,
        explain: "The inner loop runs n + (n−1) + … + 1 = n(n+1)/2 times — the dominant term is n².",
      },
      {
        prompt:
          "A search algorithm cuts the remaining sorted range in half at each step until one element is left. Its complexity is:",
        options: ["O(log n)", "O(n)", "O(n log n)", "O(1)"],
        answer: 0,
        explain: "Halving until 1 element takes log₂ n steps — binary search.",
      },
      {
        prompt:
          "Algorithm P needs 100 · n operations, algorithm Q needs n² operations. For n = 1,000,000, which holds?",
        options: [
          "P is far faster — 10⁸ vs 10¹² operations",
          "Q is faster because it has no constant factor",
          "They are equal at every n",
          "Q is faster for all n above 100",
        ],
        answer: 0,
        explain:
          "100n = 10⁸ while n² = 10¹². Constants lose to growth rate once n is large (Q only wins while n < 100).",
      },
      {
        prompt: "Which list is sorted from slowest-growing to fastest-growing?",
        options: [
          "log n,  n,  n log n,  n²,  2ⁿ",
          "n,  log n,  n²,  n log n,  2ⁿ",
          "log n,  n log n,  n,  n²,  2ⁿ",
          "n,  n log n,  log n,  2ⁿ,  n²",
        ],
        answer: 0,
        explain: "The canonical ordering — worth being able to recall in under five seconds on test day.",
      },
      {
        prompt:
          "You must sort 10 million records with a guaranteed worst-case bound. Which complexity should the chosen algorithm have?",
        options: ["O(n log n) — e.g. merge sort / heap sort", "O(n²) — e.g. insertion sort", "O(2ⁿ)", "O(n³)"],
        answer: 0,
        explain:
          "n log n ≈ 2.3 × 10⁸ steps is fine; n² = 10¹⁴ is not. Merge/heap sort guarantee n log n even in the worst case.",
      },
    ],
  },
];
