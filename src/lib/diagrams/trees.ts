import type { TopicDiagramData } from "./types";

// A balanced binary search tree. In-order traversal prints
// 1 3 4 6 7 8 10 13 14 — sorted. Used to make the BST invariant
// and "height decides cost" concrete.
export const TREES_DIAGRAM: TopicDiagramData = {
  title: "A binary search tree",
  caption:
    "Every node obeys one rule: the whole left subtree is smaller, the whole right subtree is larger. In-order traversal (left → node → right) prints the keys sorted: 1, 3, 4, 6, 7, 8, 10, 13, 14. Height ≈ log n keeps search fast — insert already-sorted data and the tree degenerates into a chain of height n. Tap a node.",
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
      y: 110,
      kind: "blue",
    },
    {
      id: "n10",
      label: "10",
      desc: "right of 8",
      detail: "10 > 8, so it sits in 8's right subtree. Note it has only a right child (14) — a partially full node.",
      x: 440,
      y: 110,
      kind: "blue",
    },
    {
      id: "n1",
      label: "1",
      desc: "smallest key",
      detail: "Leftmost node = minimum key. In-order traversal visits it first.",
      x: 90,
      y: 210,
      kind: "green",
    },
    {
      id: "n6",
      label: "6",
      desc: "3 < 6 < 8",
      detail: "6 is bigger than 3 but smaller than 8, so it lands as 3's right child. Its children (4, 7) both fall between 3 and 8.",
      x: 235,
      y: 210,
      kind: "blue",
    },
    {
      id: "n14",
      label: "14",
      desc: "largest key",
      detail: "Rightmost of the right subtree = maximum key. Has a left child (13) because 13 < 14.",
      x: 500,
      y: 210,
      kind: "blue",
    },
    {
      id: "n4",
      label: "4",
      desc: "leaf",
      detail: "Leaf: 4 > 3 and 4 < 6, so it is 6's left child.",
      x: 175,
      y: 310,
      kind: "green",
    },
    {
      id: "n7",
      label: "7",
      desc: "leaf",
      detail: "Leaf: 7 > 6 and 7 < 8, so it is 6's right child.",
      x: 295,
      y: 310,
      kind: "green",
    },
    {
      id: "n13",
      label: "13",
      desc: "leaf",
      detail: "Leaf: 13 < 14, so it is 14's left child.",
      x: 455,
      y: 310,
      kind: "green",
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
  ],
};
