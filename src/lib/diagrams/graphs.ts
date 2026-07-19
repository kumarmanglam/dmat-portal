import type { TopicVisual } from "./types";

// A small weighted city network where BFS (fewest hops) and
// Dijkstra (cheapest cost) give DIFFERENT answers for A → F:
//   BFS route:      A → C → F        (2 hops, cost 9 + 8 = 17)
//   Dijkstra route: A → B → D → F    (3 hops, cost 2 + 2 + 3 = 7)
export const GRAPHS_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "BFS vs Dijkstra — two different questions",
      flow: "free",
      caption:
        "Edge labels are weights (travel cost). From A to F, the FEWEST-HOP route and the CHEAPEST route are different paths — run the walkthrough to watch each algorithm find its own answer.",
      legend: [
        { swatch: "accent", text: "start (A)" },
        { swatch: "green", text: "goal (F)" },
        { swatch: "blue", text: "city / node" },
        { swatch: "muted", text: "weights = cost, not distance on screen" },
      ],
      nodes: [
        {
          id: "A",
          label: "A",
          desc: "start",
          detail:
            "Both searches start here. BFS puts A's neighbours in a queue; Dijkstra puts them in a priority queue keyed by running cost.",
          x: 60,
          y: 250,
          kind: "accent",
        },
        {
          id: "B",
          label: "B",
          desc: "A→B costs 2",
          detail:
            "The cheap doorway. Dijkstra settles B first (cost 2, the cheapest frontier entry). BFS sees it in ring 1 but has no notion that it's cheaper than C.",
          x: 300,
          y: 60,
          kind: "blue",
        },
        {
          id: "C",
          label: "C",
          desc: "A→C costs 9",
          detail:
            "The expensive doorway — but only one hop from A. BFS treats B and C identically (both ring 1); Dijkstra makes C wait because cost 9 is beaten by whole multi-hop paths through B.",
          x: 300,
          y: 440,
          kind: "blue",
        },
        {
          id: "D",
          label: "D",
          desc: "via B: cost 4",
          detail:
            "Reached cheaply through B (2 + 2 = 4). Dijkstra settles D second — cheaper than even touching C (9). This is the greedy frontier rule doing its work.",
          x: 540,
          y: 60,
          kind: "blue",
        },
        {
          id: "E",
          label: "E",
          desc: "via B: cost 7",
          detail:
            "Also fed by B (2 + 5 = 7). A dead-endish branch that shows Dijkstra exploring by cost, not by direction — it settles E at 7, tied with the best F.",
          x: 540,
          y: 250,
          kind: "blue",
        },
        {
          id: "F",
          label: "F",
          desc: "goal",
          detail:
            "BFS reaches F in 2 hops via C (first found in ring 2). Dijkstra reaches it for total cost 7 via A→B→D→F — one hop more, 10 cost units less. Same graph, different question, different answer.",
          x: 760,
          y: 250,
          kind: "green",
        },
      ],
      edges: [
        { id: "ab", from: "A", to: "B", label: "2" },
        { id: "ac", from: "A", to: "C", label: "9" },
        { id: "bd", from: "B", to: "D", label: "2" },
        { id: "be", from: "B", to: "E", label: "5" },
        { id: "cf", from: "C", to: "F", label: "8" },
        { id: "df", from: "D", to: "F", label: "3" },
        { id: "ef", from: "E", to: "F", label: "6" },
        { id: "cd", from: "C", to: "D", label: "4", dashed: true },
      ],
      steps: [
        {
          title: "One map, two questions",
          text: "'Fewest introductions between two people' and 'cheapest fibre route between two towns' look similar but are different problems. BFS answers the first (count edges, ignore weights); Dijkstra answers the second (sum weights, ignore hop count). The exam decides which algorithm is right by which quantity the story asks you to minimise.",
          focus: ["A", "F"],
        },
        {
          title: "BFS ring 1: all neighbours are equal",
          text: "BFS pulls A from its queue and enqueues every neighbour: B and C. Crucially it records them as 'distance 1' with NO regard for the 2 vs 9 on the edges — a queue is first-in-first-out, so discovery order is by hop count and nothing else.",
          focus: ["A", "B", "C"],
          edgeFocus: ["ab", "ac"],
        },
        {
          title: "BFS ring 2: F found — in 2 hops",
          text: "Processing ring 1 discovers ring 2: from B come D and E; from C comes F. The FIRST time BFS touches a node is provably along a fewest-edge path, so F's answer is 2 hops via C. BFS is done — and never noticed that this route costs 17.",
          focus: ["C", "F"],
          edgeFocus: ["cf"],
        },
        {
          title: "Dijkstra thinks in costs: settle B (2), then D (4)",
          text: "Dijkstra always settles the cheapest unsettled node. Frontier after A: B = 2, C = 9 → settle B. B relaxes its neighbours: D = 2+2 = 4, E = 2+5 = 7. Frontier now D = 4, E = 7, C = 9 → settle D. Note C, one hop from the start, keeps losing to nodes two hops away — cost beats hops.",
          focus: ["A", "B", "D"],
          edgeFocus: ["ab", "bd"],
        },
        {
          title: "F settles at cost 7 — a different route",
          text: "D relaxes F: 4 + 3 = 7. The frontier holds E = 7, F = 7, C = 9; F settles at 7 via A→B→D→F. BFS said 'C-then-F, 2 hops'; Dijkstra says '3 hops but cost 7 vs 17'. Both are correct — for their own question. If an option pairs the wrong algorithm with the quantity being minimised, it's the trap.",
          focus: ["D", "F"],
          edgeFocus: ["df"],
        },
        {
          title: "Why 'settled means done' needs non-negative weights",
          text: "Dijkstra finalised F at 7 and will never revisit it. That's only safe because no future edge can shrink a settled cost — which is exactly what a negative edge could do (imagine C→D at −8: the path via C would suddenly win AFTER D was settled). Negative weights → Bellman-Ford. This 'why does Dijkstra fail' question is a dMAT regular.",
          focus: ["C", "D", "F"],
          edgeFocus: ["cd"],
        },
        {
          title: "Representation footnote",
          text: "This graph has 6 nodes and 8 edges — sparse, like almost every real network. An adjacency list stores ~16 directed entries; a matrix burns 36 cells now and 10¹² cells for a million-node social graph. List for sparse, matrix only when you need O(1) 'is there an edge?' on a dense graph.",
          focus: ["A", "B", "C", "D", "E", "F"],
        },
      ],
    },
  },
];
