import type { TopicContent } from "../types";

export const SOFTWARE_CONTENT: TopicContent[] = [
  {
    id: "oop-design-patterns",
    whyItMatters:
      "Every code-review and design-round question boils down to 'what changes here, and did they isolate it?' — patterns are the vocabulary you use to name the seam and defend the design out loud.",
    intro:
      "Design patterns are named answers to 'what will change?'. Object creation will change → Factory. Only one instance must ever exist → Singleton. Many parts must react when something changes → Observer. The algorithm must be swappable at runtime → Strategy. On the exam you match a scenario to the change it isolates — not recite UML.",
    analogy:
      "Patterns are like standard chess openings: nobody memorises them to look clever — they're proven responses to a recurring board position, so you don't reinvent the plan from scratch every game.",
    bullets: [
      "Factory: callers ask for 'a parser' without knowing which concrete class they get.",
      "Singleton: one shared instance + global access point (config, connection pool) — use sparingly.",
      "Observer: publisher keeps a list of subscribers and notifies them; subscribers stay decoupled.",
      "Strategy: family of interchangeable algorithms behind one interface; picked at runtime.",
    ],
    workedExample: {
      scenario:
        "A checkout must create a payment-gateway object. Today it's only Stripe, but PayPal and Adyen are coming, chosen by a config string.",
      steps: [
        "Without a pattern, every call site writes `new StripeGateway()` — adding PayPal means editing all of them and risking a miss.",
        "Define one `PaymentGateway` interface that all three implementations satisfy.",
        "Move the `switch (config)` that returns the right implementation into a single `GatewayFactory.create(name)`.",
        "Call sites now ask the factory for 'a gateway' and depend only on the interface, never a concrete class.",
      ],
      result:
        "Adding Adyen touches exactly one file — the factory's switch — instead of scattered `new` calls. The thing that changes ('which class') is isolated behind the factory.",
    },
    gotchas: [
      "A Factory is NOT a Singleton: a factory decides WHICH object to build (and may build many); a singleton guarantees only ONE object ever exists.",
      "Strategy is NOT Observer: Strategy swaps one interchangeable algorithm the caller picks; Observer notifies many subscribers when state changes.",
      "Using a pattern is NOT automatically good design — a Singleton reached for out of convenience is just a global variable wearing a costume.",
    ],
    quickCheck: {
      prompt:
        "A game character's movement can switch between walking, flying and swimming behaviours while the game runs, all behind one `move()` call. Which pattern is this?",
      options: ["Strategy", "Observer", "Singleton", "Factory"],
      answer: 0,
      explain:
        "Interchangeable algorithms behind a single interface, selected at runtime — Strategy. Nobody is being 'notified' of a change, so it is not Observer.",
    },
    deepDive: [
      {
        title: "When a pattern is the wrong answer",
        body: "Every pattern adds indirection, and indirection you don't need is pure cost — extra classes, more files to trace through. A Factory for a type that will only ever have one implementation, or a Singleton chosen because passing an argument felt tedious, makes code harder to test and read, not easier. The discipline is to introduce the pattern when the change it isolates actually shows up, not in anticipation of one that may never arrive.",
      },
    ],
    recap:
      "Patterns name the thing that changes and wrap a seam around it: Factory isolates which object is created, Singleton the one shared instance, Observer the notify-many relationship, Strategy the swappable algorithm. Match the scenario to the change — don't recite UML.",
    related: ["system-architecture", "big-o-comparison"],
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
    whyItMatters:
      "Pick the wrong tree and a 'fast' lookup silently degrades to a linear scan under sorted input — dMAT hands you an insertion order and asks for the resulting shape and cost.",
    intro:
      "A binary search tree is 'binary search as a data structure': everything smaller lives left, everything bigger lives right, so each comparison discards half the tree — O(log n), but only while the tree stays bushy. Insert sorted data naively and it degenerates into a linked list, O(n). Self-balancing trees (AVL, Red-Black) exist purely to keep the height logarithmic.",
    analogy:
      "A balanced BST is a well-seeded tournament bracket: from the final you can reach any player in a handful of steps. Feed it already-sorted players and the bracket collapses into a single-file queue — you're back to checking everyone one by one.",
    bullets: [
      "BST invariant: left subtree < node < right subtree — recursively, everywhere.",
      "In-order traversal (left, node, right) of a BST outputs sorted order — a favourite exam fact.",
      "Height decides cost: balanced height ≈ log n; degenerate height = n.",
      "AVL rebalances aggressively (faster lookups); Red-Black rebalances lazily (faster inserts) — both guarantee O(log n).",
    ],
    diagram: "trees",
    workedExample: {
      scenario:
        "You insert the keys 1, 2, 3 into an empty BST, in that order.",
      steps: [
        "Insert 1 — it becomes the root.",
        "Insert 2 — 2 > 1, so it becomes 1's right child.",
        "Insert 3 — 3 > 1 (go right to 2), 3 > 2 (go right again); 3 becomes 2's right child.",
        "Every key was the largest seen so far, so each went right: the tree is a straight right-leaning chain, not bushy.",
      ],
      result:
        "Height equals the number of nodes (3 here, n in general), so search is O(n) — a linked list in disguise. A self-balancing tree would have rotated to keep height ≈ log n.",
    },
    gotchas: [
      "A heap is NOT a BST: a heap only orders parent vs child (min/max sits at the root) and can't do ordered search in O(log n); a BST orders left < node < right.",
      "A binary tree is NOT necessarily a binary SEARCH tree — 'binary' just means at most two children; the ordering invariant is what makes search fast.",
      "O(log n) height is NOT guaranteed by a plain BST — only self-balancing variants (AVL, Red-Black) enforce it; a naive BST can degenerate to O(n).",
    ],
    quickCheck: {
      prompt:
        "A workload does far more lookups than inserts and you want the fastest possible searches. Between AVL and Red-Black trees, which fits better and why?",
      options: [
        "AVL — it rebalances more strictly, keeping height tighter, so lookups are faster",
        "Red-Black — it rebalances more strictly, so lookups are faster",
        "AVL — it never rebalances, so inserts are instant",
        "Either is identical; the choice never matters",
      ],
      answer: 0,
      explain:
        "AVL keeps a tighter height bound at the cost of more rotations per insert, so it wins for read-heavy workloads; Red-Black rebalances more lazily, favouring write-heavy ones.",
    },
    deepDive: [
      {
        title: "The classic 'is this a valid BST?' trap",
        body: "A tempting check is 'every node ≥ its left child and ≤ its right child', but that's wrong: it passes trees where a deep descendant on the right sits below an ancestor it should exceed. The invariant is about whole subtrees, so each node must fall inside a (min, max) range that tightens as you descend. Equivalently, an in-order traversal must come out strictly increasing — which is why in-order sorting is the go-to validity test.",
      },
    ],
    recap:
      "A BST makes each comparison throw away half the tree — O(log n) — but only while it stays bushy; sorted input degenerates it into an O(n) chain. Self-balancing trees (AVL, Red-Black) exist to keep the height logarithmic.",
    related: ["big-o-comparison", "graphs"],
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
    whyItMatters:
      "Choosing BFS vs Dijkstra vs MST is the difference between a correct answer and a plausible-looking wrong one — dMAT graph questions live entirely in 'which algorithm for this exact question?'.",
    intro:
      "A graph is just 'things + connections', and the two search styles answer different questions. BFS expands in rings, so the first time it reaches a node is via the fewest edges — unweighted shortest paths. DFS dives deep, which is what cycle detection, topological ordering and connectivity checks want. Once edges carry weights, 'shortest' needs Dijkstra; connecting everything cheaply needs an MST.",
    analogy:
      "BFS is ripples from a stone dropped in a pond — they reach everything one ring (one hop) at a time, so the first ripple to touch a point arrived by the shortest way. DFS is exploring a cave by always taking the next passage as far as it goes before backtracking.",
    bullets: [
      "Adjacency matrix: O(1) edge test, O(V²) space — dense graphs. Adjacency list: O(V+E) space — sparse graphs (most real ones).",
      "BFS = queue = level by level = fewest-edge paths. DFS = stack/recursion = deep first.",
      "Dijkstra grows the settled set from the source, always taking the cheapest frontier node — correct only with non-negative weights.",
      "MST (Kruskal/Prim) picks V−1 edges of minimum total weight connecting all nodes — think 'cheapest cable plan'.",
    ],
    workedExample: {
      scenario:
        "Undirected graph with edges A–B, A–C, B–D, C–D. Start at A; neighbours are explored alphabetically. Compare the order nodes are first visited by BFS versus DFS.",
      steps: [
        "BFS: visit A, enqueue its neighbours B and C. Dequeue B → discover D. Dequeue C → D already seen. Visit order: A, B, C, D.",
        "BFS reaches D in 2 hops (A→B→D), the fewest possible.",
        "DFS: visit A, descend to B, from B go deep to D, backtrack (C still unvisited), then visit C. Visit order: A, B, D, C.",
        "DFS plunged A→B→D before ever touching C — depth first, not by distance.",
      ],
      result:
        "BFS's visit order tracks hop-distance, which is why it yields unweighted shortest paths; DFS's does not — it dives, and that dive is exactly what cycle detection and topological sort exploit.",
    },
    gotchas: [
      "Dijkstra does NOT work with negative edge weights — its 'settled means final' greed breaks; use Bellman-Ford instead.",
      "BFS gives shortest paths only on UNWEIGHTED graphs (fewest edges) — add weights and fewest-edges ≠ cheapest, so you need Dijkstra.",
      "An MST is NOT a shortest-path tree: it minimises TOTAL edge weight to connect everything, not the distance between any particular pair of nodes.",
    ],
    quickCheck: {
      prompt:
        "A road network has positive distances and you need the shortest driving route from one city to one other. BFS is the wrong tool here because:",
      options: [
        "BFS counts edges, not distance — with weights the fewest-road route can be longer in kilometres than a multi-road one; use Dijkstra",
        "BFS cannot handle directed graphs",
        "BFS only works on trees",
        "BFS finds the longest path, not the shortest",
      ],
      answer: 0,
      explain:
        "On a weighted graph 'fewest edges' and 'least total weight' diverge. Dijkstra settles nodes by cumulative distance (non-negative weights), which is what 'shortest driving route' actually means.",
    },
    deepDive: [
      {
        title: "Negative edges, and the limit even Bellman-Ford hits",
        body: "Bellman-Ford handles negative edges by relaxing every edge V−1 times instead of greedily settling nodes, so a cheaper route discovered later can still lower a distance. But no algorithm can return a finite shortest path when the graph has a negative-weight cycle — you could loop it forever to drive the cost toward −∞. Bellman-Ford's one extra relaxation pass is exactly how it detects and reports that case.",
      },
    ],
    recap:
      "Graphs are things plus connections; BFS explores by rings (unweighted shortest paths), DFS dives deep (cycles, topological sort). Add weights and 'shortest' means Dijkstra (non-negative only); 'connect everything cheapest' means an MST.",
    related: ["trees", "deadlocks", "routing-basics"],
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
    whyItMatters:
      "The senior-level question is never 'monolith or microservices?' but 'which one for THIS team and load, and what does it cost?' — architecture rounds and dMAT scenarios both grade the trade-off, not the buzzword.",
    intro:
      "Architecture questions are trade-off questions. A monolith is one deployable — simple to build, test and call across, but everything scales and ships together. Microservices split by business capability — teams deploy independently and scale hot spots only, at the price of network failures, distributed data and operational overhead. Neither is 'better'; the exam wants you to pick per scenario.",
    analogy:
      "A monolith is a food truck: one kitchen, one menu, trivially coordinated — but when the burger line is slammed you must clone the whole truck. Microservices are a food court: each stall scales and reopens on its own, at the cost of shared plumbing, more staff, and orders that now cross stalls.",
    bullets: [
      "Layering (UI → logic → data) separates concerns; a layer only talks to the one below it.",
      "Scale up = bigger machine (limit: hardware). Scale out = more machines (needs statelessness or shared state moved to a store).",
      "Stateless services scale trivially behind a load balancer — session state goes to a cache/DB, not process memory.",
      "Microservices tax: network latency, partial failure, distributed transactions, deployment tooling. Don't pay it for a small app.",
    ],
    workedExample: {
      scenario:
        "Black Friday on a webshop: browsing traffic is normal but checkout is pegged at 100% CPU and timing out. The whole app is a single monolith deployable.",
      steps: [
        "To add checkout capacity you must run more copies of the WHOLE monolith — browsing, catalogue, admin and all — because it ships as one unit.",
        "Each extra copy consumes RAM and DB connections for code paths that aren't even the bottleneck.",
        "Split checkout into its own service and it can scale out independently — you add checkout instances only.",
        "But now checkout calls the catalogue over the network: you inherit latency, partial failure and a distributed transaction to reconcile.",
      ],
      result:
        "Microservices let you scale just the hot path, but you only come out ahead once that scaling win outweighs the new network and operational cost — for a low-traffic app, cloning the monolith is cheaper and simpler.",
    },
    gotchas: [
      "Scaling OUT is NOT scaling UP: out = more machines (needs statelessness); up = one bigger machine (capped by hardware).",
      "Microservices are NOT automatically faster — an in-process call becomes a network hop that can time out; you trade simplicity for independent scaling.",
      "A stateless service is NOT a service with no data — it just keeps no per-request session in local memory; shared state lives in a cache/DB every instance can reach.",
    ],
    quickCheck: {
      prompt:
        "A team splits a small app into 12 microservices on day one 'to be scalable'. Six months later every feature spans several services and simple changes need coordinated deploys. What went wrong?",
      options: [
        "They paid the distributed-systems tax before they had the scale or team to need it — premature decomposition",
        "They used too few services",
        "Microservices are always the wrong choice",
        "They should have made each service a Singleton",
      ],
      answer: 0,
      explain:
        "Microservices buy independent scaling and deployment at the cost of network calls, distributed data and ops overhead. With no scale problem to solve, that cost buys nothing and just fragments a small codebase.",
    },
    deepDive: [
      {
        title: "The distributed monolith — worst of both worlds",
        body: "Split a system into services but leave them tightly coupled — sharing one database, deploying in lockstep, calling each other synchronously for every request — and you get microservices' costs (network latency, partial failure, ops overhead) with a monolith's rigidity (you still can't deploy or scale one piece alone). The fix isn't more services; it's cutting along real business seams so each service owns its own data and can ship on its own schedule.",
      },
    ],
    recap:
      "Architecture is trade-offs: a monolith is one simple deployable that scales and ships as a whole; microservices scale and deploy per capability but add network, data and ops cost. Pick per scenario, and keep services stateless so instances stay interchangeable.",
    related: ["process-sync", "sql-optimization", "oop-design-patterns"],
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
