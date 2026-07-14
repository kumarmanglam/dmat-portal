import type { TopicContent } from "../types";

export const THEORETICAL_CONTENT: TopicContent[] = [
  {
    id: "automata-basics",
    intro:
      "An automaton's power is exactly the memory it carries. A DFA remembers only its current state — a finite amount — so it can check patterns but never count without limit. Add a stack and you get a PDA that can match nested pairs. Add an unbounded tape and you get a Turing machine — full computation, including problems no machine can decide.",
    bullets: [
      "DFA/NFA recognise regular languages — same power, NFAs are just more compact to write.",
      "Anything that needs unbounded counting (aⁿbⁿ, balanced brackets) breaks a DFA: finitely many states can't track n.",
      "A PDA's stack gives one 'counter with discipline' — push on the way in, pop on the way out.",
      "The halting problem is undecidable: no program can decide, for every program+input, whether it halts.",
    ],
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
    intro:
      "P vs NP is about the gap between solving and checking. P = problems you can solve fast (polynomial time). NP = problems where you can check a proposed answer fast, even if finding one seems to need brute force. NP-complete problems are the hardest of NP: every NP problem can be translated (reduced) into them, so one fast NP-complete algorithm would make all of NP fast.",
    bullets: [
      "Solve fast → P. Verify fast → NP. Every P problem is trivially also in NP.",
      "A reduction A ≤ B means 'A is no harder than B' — solving B lets you solve A.",
      "To show a new problem is NP-complete: it's in NP, and a known NP-complete problem reduces TO it (direction matters).",
      "Classic NP-complete anchors: SAT, Travelling Salesman (decision version), graph colouring, knapsack.",
    ],
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
    intro:
      "Big-O answers one question: when the input doubles, what happens to the work? O(log n) barely notices, O(n) doubles, O(n log n) doubles-and-a-bit, O(n²) quadruples, O(2ⁿ) explodes. Drop constants and keep the dominant term — Big-O compares shapes of growth, not stopwatch times.",
    bullets: [
      "Ordering to burn in: log n < n < n log n < n² < n³ < 2ⁿ.",
      "Nested loop over the same n → n²; loop that halves the range each pass → log n.",
      "Good comparison sorts are O(n log n); simple ones (bubble, insertion) are O(n²).",
      "For small n, a 'worse' algorithm can win — Big-O only rules for large inputs.",
    ],
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
