import type { TopicVisual } from "./types";

// A balanced BST side by side with the degenerate chain the same
// keys produce when inserted in sorted order. The walkthrough
// traces a real search (7) to make "each comparison discards half
// the tree" physical, then contrasts the chain.
export const TREES_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "Binary search tree — bushy vs degenerate",
      caption:
        "Left: a balanced BST (height 3). Right: the SAME keys inserted in sorted order — a chain (height n). Run the walkthrough to search for 7 and count the comparisons.",
      legend: [
        { swatch: "accent", text: "root" },
        { swatch: "blue", text: "internal node" },
        { swatch: "green", text: "leaf" },
        { swatch: "danger", text: "degenerate chain — the failure mode" },
      ],
      nodes: [
        {
          id: "n8",
          label: "8",
          desc: "root",
          detail:
            "Root. Everything in the left subtree is < 8; everything on the right is > 8. A search starts here and discards half the tree at each step.",
          x: 300,
          y: 10,
          kind: "accent",
        },
        {
          id: "n3",
          label: "3",
          desc: "left of 8",
          detail: "3 < 8, so it sits in 8's left subtree. Its own children split around 3.",
          x: 160,
          y: 120,
          kind: "blue",
        },
        {
          id: "n10",
          label: "10",
          desc: "right of 8",
          detail:
            "10 > 8, so it sits in 8's right subtree. Note it has only a right child (14) — a partially full node is perfectly legal.",
          x: 440,
          y: 120,
          kind: "blue",
        },
        {
          id: "n1",
          label: "1",
          desc: "smallest key",
          detail: "Leftmost node = minimum key. In-order traversal visits it first.",
          x: 80,
          y: 230,
          kind: "green",
        },
        {
          id: "n6",
          label: "6",
          desc: "3 < 6 < 8",
          detail:
            "6 is bigger than 3 but smaller than 8, so it lands as 3's right child. Its children (4, 7) both fall between 3 and 8 too — the invariant holds recursively.",
          x: 235,
          y: 230,
          kind: "blue",
        },
        {
          id: "n14",
          label: "14",
          desc: "largest key",
          detail: "Rightmost of the right subtree = maximum key. Has a left child (13) because 13 < 14.",
          x: 505,
          y: 230,
          kind: "blue",
        },
        {
          id: "n4",
          label: "4",
          desc: "leaf",
          detail: "Leaf: 4 > 3 and 4 < 6, so it is 6's left child.",
          x: 165,
          y: 340,
          kind: "green",
        },
        {
          id: "n7",
          label: "7",
          desc: "leaf",
          detail: "Leaf: 7 > 6 and 7 < 8, so it is 6's right child. Found in 4 comparisons from the root.",
          x: 300,
          y: 340,
          kind: "green",
        },
        {
          id: "n13",
          label: "13",
          desc: "leaf",
          detail: "Leaf: 13 < 14, so it is 14's left child.",
          x: 445,
          y: 340,
          kind: "green",
        },
        // ---- degenerate chain: sorted insertion 1,2,3,…,7 ----
        {
          id: "c1",
          label: "1",
          desc: "insert 1st",
          detail:
            "Insert keys in sorted order (1, 2, 3, …) and every new key is the largest so far — it always goes right.",
          x: 700,
          y: 10,
          kind: "danger",
        },
        {
          id: "c2",
          label: "2",
          desc: "always right",
          detail: "2 > 1 → right child. No comparison ever sends a key left.",
          x: 730,
          y: 120,
          kind: "danger",
        },
        {
          id: "c3",
          label: "3",
          desc: "always right",
          detail: "3 > 2 → right again. The 'tree' is now just a linked list wearing a costume.",
          x: 760,
          y: 230,
          kind: "danger",
        },
        {
          id: "c7",
          label: "… 7",
          desc: "height = n",
          detail:
            "After inserting 1–7 in order, finding 7 takes 7 comparisons — O(n). This exact failure is why AVL and Red-Black trees exist: they rotate on insert to keep height ≈ log n no matter the insertion order.",
          x: 790,
          y: 340,
          kind: "danger",
        },
      ],
      edges: [
        { id: "t1", from: "n8", to: "n3" },
        { id: "t2", from: "n8", to: "n10" },
        { id: "t3", from: "n3", to: "n1" },
        { id: "t4", from: "n3", to: "n6" },
        { id: "t5", from: "n10", to: "n14" },
        { id: "t6", from: "n6", to: "n4" },
        { id: "t7", from: "n6", to: "n7" },
        { id: "t8", from: "n14", to: "n13" },
        { id: "c12", from: "c1", to: "c2", dashed: true },
        { id: "c23", from: "c2", to: "c3", dashed: true },
        { id: "c37", from: "c3", to: "c7", dashed: true },
      ],
      steps: [
        {
          title: "Search 7: start at the root",
          text: "Compare 7 with the root, 8. 7 < 8, so the ENTIRE right subtree (10, 13, 14) is discarded without ever being looked at. One comparison just eliminated half the tree — that is binary search, running on pointers instead of array indices.",
          focus: ["n8", "n3"],
          edgeFocus: ["t1"],
        },
        {
          title: "7 > 3 — go right",
          text: "At node 3: 7 > 3, so go right. The left subtree under 3 (just node 1 here) is discarded. Each step narrows the candidate range — after two comparisons only the keys strictly between 3 and 8 remain in play.",
          focus: ["n3", "n6"],
          edgeFocus: ["t4"],
        },
        {
          title: "7 > 6 — go right again",
          text: "At node 6: 7 > 6, right child. Notice the invariant doing the work: everything under 6's right pointer is guaranteed to be in (6, 8), so if 7 exists at all, it MUST be down this path. No backtracking is ever needed.",
          focus: ["n6", "n7"],
          edgeFocus: ["t7"],
        },
        {
          title: "Found in 4 comparisons",
          text: "7 found at depth 3 — four comparisons for n = 9 keys, and a million keys would need only ~20. Cost equals the height of the tree, not its size. That sentence is the whole topic: everything about BSTs is a fight to keep height at log n.",
          focus: ["n7"],
        },
        {
          title: "The same keys, inserted sorted",
          text: "Insert 1, 2, 3, … 7 in order and every key is the biggest yet — it always goes right, building a chain of height n. Searching 7 now costs 7 comparisons: O(n), no better than a linked list. Same data structure, same keys, opposite performance — order of insertion alone did this.",
          focus: ["c1", "c2", "c3", "c7"],
          edgeFocus: ["c12", "c23", "c37"],
        },
        {
          title: "Why self-balancing trees exist",
          text: "AVL and Red-Black trees detect this drift during insertion and fix it with rotations, guaranteeing height stays O(log n) for ANY insertion order. AVL rebalances aggressively (flatter tree, faster lookups); Red-Black tolerates a little slack (fewer rotations, faster inserts). Both exist purely to prevent the chain you just saw.",
          focus: ["n8", "c7"],
        },
      ],
    },
  },
  {
    kind: "mermaid",
    title: "In-order traversal = sorted output",
    caption:
      "Why in-order traversal of ANY valid BST prints sorted order — the recursion visits 'everything smaller, me, everything bigger' at every node.",
    chart: `flowchart TD
    A["visit(node)"] --> B["1 · visit(left subtree)\nall keys < node"]
    A --> C["2 · print node"]
    A --> D["3 · visit(right subtree)\nall keys > node"]
    B --> E["prints 1 3 4 6 7"]
    C --> F["prints 8"]
    D --> G["prints 10 13 14"]
    E --> H["1 3 4 6 7 · 8 · 10 13 14\n= sorted, by construction"]
    F --> H
    G --> H

    classDef step fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef out fill:#e0f3e9,stroke:#1a7f4e,color:#14181f;
    classDef root fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    class A root;
    class B,C,D step;
    class E,F,G,H out;`,
    notes: [
      {
        label: "It's the invariant, not the algorithm",
        text: "In-order traversal is dumb — left, me, right. The sorting comes entirely from the BST invariant: 'left < node < right' at every node means the visit order can't help but be ascending.",
      },
      {
        label: "Favourite exam trap",
        text: "Pre-order (node first) gives the order you'd need to REBUILD the same tree; post-order (node last) is for safely deleting one. Only in-order sorts — if a question shows a traversal that isn't sorted, it isn't in-order.",
      },
    ],
  },
];
