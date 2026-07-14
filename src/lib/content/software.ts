import type { TopicContent } from "../types";

export const SOFTWARE_CONTENT: TopicContent[] = [
  {
    id: "oop-design-patterns",
    intro:
      "Design patterns are named answers to 'what will change?'. Object creation will change → Factory. Only one instance must ever exist → Singleton. Many parts must react when something changes → Observer. The algorithm must be swappable at runtime → Strategy. On the exam you match a scenario to the change it isolates — not recite UML.",
    bullets: [
      "Factory: callers ask for 'a parser' without knowing which concrete class they get.",
      "Singleton: one shared instance + global access point (config, connection pool) — use sparingly.",
      "Observer: publisher keeps a list of subscribers and notifies them; subscribers stay decoupled.",
      "Strategy: family of interchangeable algorithms behind one interface; picked at runtime.",
    ],
    questions: [
      {
        prompt:
          "A stock ticker must update dozens of open dashboard widgets whenever a price changes, without knowing which widgets exist. Which pattern fits?",
        options: ["Observer", "Singleton", "Factory", "Strategy"],
        answer: 0,
        explain:
          "Widgets subscribe; the ticker publishes to whoever is registered. That decoupled notify-many relationship is Observer.",
      },
      {
        prompt:
          "A shipping service must choose between DHL, FedEx and pickup pricing algorithms depending on the customer's selection at checkout. Which pattern isolates this decision?",
        options: ["Strategy", "Observer", "Singleton", "Adapter"],
        answer: 0,
        explain:
          "Interchangeable algorithms behind one interface, selected at runtime — the definition of Strategy.",
      },
      {
        prompt:
          "Your code does `new PdfReport()` in 40 places. Product now also wants HTML and CSV reports chosen by config. What is the cleanest refactoring?",
        options: [
          "Introduce a Factory that returns the right Report implementation",
          "Make PdfReport a Singleton",
          "Subclass PdfReport for HTML and CSV",
          "Add if/else at all 40 call sites",
        ],
        answer: 0,
        explain:
          "Centralising creation in a factory means the 40 call sites just ask for 'a report' — new formats change one place.",
      },
      {
        prompt: "What is the main *risk* of using Singletons liberally?",
        options: [
          "They introduce hidden global state, making code hard to test and reason about",
          "They use too much memory",
          "They can't be implemented in typed languages",
          "They prevent inheritance",
        ],
        answer: 0,
        explain:
          "A singleton is a global in disguise: every user is invisibly coupled to it, and tests can't easily substitute it.",
      },
    ],
  },
  {
    id: "trees",
    intro:
      "A binary search tree is 'binary search as a data structure': everything smaller lives left, everything bigger lives right, so each comparison discards half the tree — O(log n), but only while the tree stays bushy. Insert sorted data naively and it degenerates into a linked list, O(n). Self-balancing trees (AVL, Red-Black) exist purely to keep the height logarithmic.",
    bullets: [
      "BST invariant: left subtree < node < right subtree — recursively, everywhere.",
      "In-order traversal (left, node, right) of a BST outputs sorted order — a favourite exam fact.",
      "Height decides cost: balanced height ≈ log n; degenerate height = n.",
      "AVL rebalances aggressively (faster lookups); Red-Black rebalances lazily (faster inserts) — both guarantee O(log n).",
    ],
    questions: [
      {
        prompt: "You insert 1, 2, 3, 4, 5, 6, 7 in this exact order into an unbalanced BST. What does the tree look like, and what is search cost?",
        options: [
          "A right-leaning chain; search degrades to O(n)",
          "A perfectly balanced tree; search stays O(log n)",
          "A left-leaning chain; search is O(log n)",
          "The BST rejects sorted input",
        ],
        answer: 0,
        explain:
          "Each new key is the largest so far, always going right — a chain of height n. This is exactly why self-balancing trees exist.",
      },
      {
        prompt: "Which traversal of a valid BST prints the keys in ascending sorted order?",
        options: ["In-order (left, node, right)", "Pre-order (node, left, right)", "Post-order (left, right, node)", "Level-order (BFS)"],
        answer: 0,
        explain: "In-order visits all smaller keys, then the node, then all larger keys — sorted by construction.",
      },
      {
        prompt:
          "A lookup table holds 1,000,000 keys in a Red-Black tree. Roughly how many comparisons does a search need in the worst case?",
        options: ["Around 20–40 (a small multiple of log₂ 10⁶ ≈ 20)", "About 1,000,000", "About 1,000", "Exactly 3"],
        answer: 0,
        explain:
          "Red-Black height is at most ~2·log₂(n); log₂(10⁶) ≈ 20, so a few dozen comparisons.",
      },
      {
        prompt: "In a min-heap (not a BST!), what is guaranteed?",
        options: [
          "Every parent is ≤ its children; the minimum sits at the root",
          "Left child < parent < right child",
          "The array behind it is fully sorted",
          "Searching any element takes O(log n)",
        ],
        answer: 0,
        explain:
          "Heaps order only parent vs child. Great for 'give me the min' in O(1) / remove in O(log n); useless for general search (O(n)).",
      },
    ],
  },
  {
    id: "graphs",
    intro:
      "A graph is just 'things + connections', and the two search styles answer different questions. BFS expands in rings, so the first time it reaches a node is via the fewest edges — unweighted shortest paths. DFS dives deep, which is what cycle detection, topological ordering and connectivity checks want. Once edges carry weights, 'shortest' needs Dijkstra; connecting everything cheaply needs an MST.",
    bullets: [
      "Adjacency matrix: O(1) edge test, O(V²) space — dense graphs. Adjacency list: O(V+E) space — sparse graphs (most real ones).",
      "BFS = queue = level by level = fewest-edge paths. DFS = stack/recursion = deep first.",
      "Dijkstra grows the settled set from the source, always taking the cheapest frontier node — correct only with non-negative weights.",
      "MST (Kruskal/Prim) picks V−1 edges of minimum total weight connecting all nodes — think 'cheapest cable plan'.",
    ],
    questions: [
      {
        prompt:
          "In an unweighted social graph you need the minimum number of introductions between person A and person B. Which algorithm answers this directly?",
        options: ["BFS from A", "DFS from A", "Dijkstra with random weights", "Kruskal's MST"],
        answer: 0,
        explain: "BFS reaches nodes in order of hop distance, so B is first found along a fewest-edge path.",
      },
      {
        prompt:
          "A build system must order compilation so every module builds after its dependencies. Which technique produces the order (and what must the graph be)?",
        options: [
          "Topological sort via DFS — requires a directed acyclic graph",
          "BFS — requires an undirected graph",
          "Dijkstra — requires positive weights",
          "Prim's algorithm — requires a spanning tree",
        ],
        answer: 0,
        explain:
          "Topological order exists exactly for DAGs; DFS finish times (reversed) give it. A cycle means no valid build order.",
      },
      {
        prompt: "Why can Dijkstra's algorithm fail when some edge weights are negative?",
        options: [
          "It finalises a node's distance permanently, but a negative edge later could still shorten it",
          "It divides by edge weights",
          "It only works on trees",
          "Negative weights make the graph disconnected",
        ],
        answer: 0,
        explain:
          "Dijkstra's greedy 'settled means done' assumption breaks if a cheaper route can appear afterwards through a negative edge (use Bellman-Ford instead).",
      },
      {
        prompt:
          "A telecom company must connect 50 towns with fibre at minimal total cost, with no requirement about path lengths between specific towns. What is it computing?",
        options: [
          "A minimum spanning tree",
          "All-pairs shortest paths",
          "A topological sort",
          "A maximum flow",
        ],
        answer: 0,
        explain:
          "Connect everything, minimise total edge weight, 49 links — MST, not shortest paths.",
      },
      {
        prompt: "For a sparse graph with 10,000 vertices and 20,000 edges, which representation wastes the least memory?",
        options: [
          "Adjacency list — space grows with V + E",
          "Adjacency matrix — space grows with V²",
          "Both are identical in space",
          "A sorted array of vertex degrees",
        ],
        answer: 0,
        explain: "Matrix would burn 10⁸ cells for 2×10⁴ edges; the list stores ~30k entries.",
      },
    ],
  },
  {
    id: "system-architecture",
    intro:
      "Architecture questions are trade-off questions. A monolith is one deployable — simple to build, test and call across, but everything scales and ships together. Microservices split by business capability — teams deploy independently and scale hot spots only, at the price of network failures, distributed data and operational overhead. Neither is 'better'; the exam wants you to pick per scenario.",
    bullets: [
      "Layering (UI → logic → data) separates concerns; a layer only talks to the one below it.",
      "Scale up = bigger machine (limit: hardware). Scale out = more machines (needs statelessness or shared state moved to a store).",
      "Stateless services scale trivially behind a load balancer — session state goes to a cache/DB, not process memory.",
      "Microservices tax: network latency, partial failure, distributed transactions, deployment tooling. Don't pay it for a small app.",
    ],
    questions: [
      {
        prompt:
          "A startup of 4 engineers is building its first product. Everything fits one codebase and one database. Which architecture is the pragmatic choice, and why?",
        options: [
          "A monolith — one deployable, no distributed-system overhead the team can't afford",
          "Microservices — they will need them eventually",
          "One microservice per database table",
          "Serverless functions for every class",
        ],
        answer: 0,
        explain:
          "Microservices cost operational complexity that a tiny team doesn't have capacity for. Split later along proven seams.",
      },
      {
        prompt:
          "In a webshop, only the checkout service is overloaded on Black Friday; browsing is fine. What does a microservice architecture let you do that a monolith can't do as cheaply?",
        options: [
          "Scale out just the checkout service",
          "Cache HTML pages",
          "Add database indexes",
          "Use a CDN for images",
        ],
        answer: 0,
        explain:
          "Independent scaling per service is the headline benefit — a monolith must replicate everything to scale one hot path.",
      },
      {
        prompt: "Why must a service be (mostly) stateless to scale horizontally behind a load balancer?",
        options: [
          "Any instance must be able to serve any request — per-instance memory state would break requests routed elsewhere",
          "Stateless code compiles faster",
          "Load balancers cannot forward cookies",
          "Databases refuse connections from multiple instances",
        ],
        answer: 0,
        explain:
          "If instance A holds your session in RAM and the next request hits instance B, you're logged out. Externalise state (Redis, DB) and instances become interchangeable.",
      },
      {
        prompt: "In a classic 3-layer architecture, the business-logic layer should:",
        options: [
          "Depend on the data layer beneath it, and know nothing about the UI above it",
          "Call the UI directly to display errors",
          "Contain the SQL for performance",
          "Be merged with the UI to reduce latency",
        ],
        answer: 0,
        explain:
          "Dependencies point downwards only. That's what lets you swap the UI (web → mobile) without touching business rules.",
      },
    ],
  },
];
