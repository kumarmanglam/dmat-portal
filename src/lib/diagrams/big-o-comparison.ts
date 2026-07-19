import type { TopicVisual } from "./types";

// Big-O is rule-based, so the visual is a decision guide: read the
// code's SHAPE, name the complexity. Styled by speed class.
export const BIG_O_COMPARISON_VISUALS: TopicVisual[] = [
  {
    kind: "mermaid",
    title: "Read the pattern → name the complexity",
    caption:
      "dMAT shows you a loop and asks for its class. Don't count operations — match the shape of the code against these six patterns.",
    chart: `flowchart TD
    Q["What does the code do\nwith n elements?"] --> D1{"touch each element\na constant number of times?"}
    Q --> D2{"halve the remaining\nrange every pass?"}
    Q --> D3{"loop INSIDE a loop,\nboth over n?"}
    Q --> D4{"branch per element\n(take it or leave it)?"}
    Q --> D5{"direct index or\nhash lookup?"}
    D1 -- "single pass" --> ON["O(n)\nlinear scan, max-finding"]
    D1 -- "pass + sort-quality split\n(divide, conquer, merge)" --> ONLOGN["O(n log n)\nmerge sort · heap sort"]
    D2 --> OLOGN["O(log n)\nbinary search"]
    D3 --> ON2["O(n²)\nbubble / insertion sort,\nall pairs comparison"]
    D4 --> O2N["O(2ⁿ)\nall subsets, brute force"]
    D5 --> O1["O(1)\narray[i], hash get"]

    classDef q fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef fast fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    classDef mid fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef slow fill:#fbe7e6,stroke:#b3261e,color:#14181f;
    class Q,D1,D2,D3,D4,D5 q;
    class O1,OLOGN fast;
    class ON,ONLOGN mid;
    class ON2,O2N slow;`,
    notes: [
      {
        label: "The doubling test settles everything",
        text: "Go from n = 1,000 to 2,000 and watch the work: O(log n) adds ONE step, O(n) doubles, O(n log n) slightly more than doubles, O(n²) quadruples, O(2ⁿ) squares the total count. If a question gives you two measured runtimes, apply this test and the class falls out.",
      },
      {
        label: "Constants lose — but only eventually",
        text: "100n vs n²: at n = 50 the 'slow' n² (2,500) beats 100n (5,000). They cross at n = 100, and by n = 1,000,000 it's 10⁸ vs 10¹² — a 10,000× gap. Big-O statements are about large n; small-n exceptions are a favourite trap option.",
      },
      {
        label: "Burn in the ladder",
        text: "log n < n < n log n < n² < n³ < 2ⁿ. One dMAT question type is literally ordering these — it should cost you five seconds, not a derivation. Anchor it with examples: binary search < scan < good sort < naive sort < brute force.",
      },
    ],
  },
];
