import type { TopicVisual } from "./types";

// Full table scan (left lane) vs B-tree index lookup (right lane)
// for the same query on 50M rows — with real cost numbers.
export const SQL_OPTIMIZATION_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "The same query, two plans: scan vs index",
      flow: "vertical",
      caption:
        "SELECT * FROM orders WHERE customer_id = 1234 — on 50 million rows. Left: no index. Right: a B-tree on customer_id. The walkthrough counts the actual reads.",
      legend: [
        { swatch: "danger", text: "full scan — the default without an index" },
        { swatch: "accent", text: "B-tree levels — the sorted side-structure" },
        { swatch: "green", text: "the payoff — O(log n) to the rows" },
      ],
      nodes: [
        {
          id: "scan-table",
          label: "orders table",
          desc: "50,000,000 rows",
          detail:
            "Heap of row pages in no useful order. Without an index on the filter column, the engine has no way to know WHERE the matching rows live — so it must look at all of them.",
          x: 100,
          y: 20,
          kind: "danger",
        },
        {
          id: "scan-read",
          label: "Read EVERY row",
          desc: "check customer_id = 1234",
          detail:
            "A sequential scan touches all 50M rows and applies the predicate to each. I/O is the cost: hundreds of thousands of pages streamed from disk, evicting everything useful from the cache on the way.",
          x: 100,
          y: 190,
          kind: "danger",
        },
        {
          id: "scan-cost",
          label: "~50M row reads",
          desc: "seconds to minutes",
          detail:
            "Cost grows linearly with the table — O(n). Twice the table, twice the pain. This is what 'the query was fast in staging and died in production' almost always means.",
          x: 100,
          y: 360,
          kind: "danger",
        },
        {
          id: "root",
          label: "B-tree root",
          desc: "key ranges → children",
          detail:
            "One page holding sorted separator keys: 'ids < 800k left, 800k–1.6M next, …'. One comparison-guided hop discards almost the whole tree — binary search materialised as a data structure.",
          x: 560,
          y: 20,
          kind: "accent",
        },
        {
          id: "internal",
          label: "Internal node",
          desc: "narrower range",
          detail:
            "Same trick one level down, on a narrower range. B-trees stay shallow because each node has hundreds of children (high fan-out): 50M keys still fit in a tree of height 3–4.",
          x: 560,
          y: 190,
          kind: "accent",
        },
        {
          id: "leaf",
          label: "Leaf: customer_id = 1234",
          desc: "sorted keys + row pointers",
          detail:
            "The bottom level holds the actual indexed values in sorted order, each with a pointer to its table row. All ~80 orders for customer 1234 sit ADJACENT here — one leaf visit collects them all.",
          x: 560,
          y: 360,
          kind: "green",
        },
        {
          id: "fetch",
          label: "Fetch ~80 rows",
          desc: "follow the pointers",
          detail:
            "Follow ~80 pointers to the heap. This hop disappears entirely with a covering index — if the index already contains every column the query needs, the table is never touched.",
          x: 560,
          y: 520,
          kind: "green",
        },
        {
          id: "writetax",
          label: "The write tax",
          desc: "every INSERT maintains every index",
          detail:
            "Each index is a separate sorted structure that every INSERT/UPDATE must also update. Nine indexes = nine extra maintenance operations per write. Index what you query; drop what nothing uses.",
          x: 100,
          y: 520,
          kind: "muted",
        },
      ],
      edges: [
        { id: "sc1", from: "scan-table", to: "scan-read" },
        { id: "sc2", from: "scan-read", to: "scan-cost" },
        { id: "sc3", from: "scan-cost", to: "writetax", dashed: true, label: "but writes stay cheap" },
        { id: "bt1", from: "root", to: "internal", label: "1 read" },
        { id: "bt2", from: "internal", to: "leaf", label: "1–2 reads" },
        { id: "bt3", from: "leaf", to: "fetch", label: "~80 pointer hops" },
      ],
      steps: [
        {
          title: "What the engine faces",
          text: "50 million rows, and the query wants the ~80 belonging to customer 1234 — 0.00016% of the table. The entire topic is about how much work stands between the predicate and those 80 rows. Without help, the answer is 'all of it'.",
          focus: ["scan-table"],
        },
        {
          title: "Plan A: the full scan",
          text: "No index on customer_id means no knowledge of where matches live — the engine reads every row and tests it. O(n): 50M row reads to return 80 rows. It isn't dumb, it's the only option; the optimizer picks a scan whenever no better access path exists.",
          focus: ["scan-table", "scan-read", "scan-cost"],
          edgeFocus: ["sc1", "sc2"],
        },
        {
          title: "Plan B: walk the B-tree",
          text: "An index on customer_id is a separate, SORTED structure. The root's separator keys route the search: one page read discards ~99% of the tree. High fan-out (hundreds of children per node) is why 50M keys need a tree of height only 3–4 — log with a huge base.",
          focus: ["root", "internal"],
          edgeFocus: ["bt1"],
        },
        {
          title: "Leaf → rows: 4 page reads, not 50 million",
          text: "The leaf holds all of customer 1234's entries adjacent in sorted order; ~80 pointers lead to the rows. Total: ~4 index page reads plus the row fetches — milliseconds versus minutes, and the ratio only improves as the table grows, because log n flattens while n climbs.",
          focus: ["leaf", "fetch"],
          edgeFocus: ["bt2", "bt3"],
        },
        {
          title: "Nothing is free: the write tax",
          text: "Every INSERT now also inserts into this B-tree (and any other index on the table) — extra page splits, extra I/O, per write, forever. A write-heavy events table with 9 indexes does 9 sorted-structure maintenances per insert. The read/write trade IS the exam question; 'add an index' is only the right answer for the read side.",
          focus: ["writetax", "scan-cost"],
          edgeFocus: ["sc3"],
        },
        {
          title: "When the index goes blind",
          text: "The optimizer can only use the tree if the query speaks its sort order. WHERE YEAR(order_date) = 2024 hides the column inside a function — the tree is sorted by date, not by YEAR(date) — so it's back to Plan A. Same for LIKE '%son' (no leading prefix) and for low-selectivity filters where most rows match anyway. Rewrite as ranges (date >= '2024-01-01' AND date < '2025-01-01') and the index wakes up.",
          focus: ["root", "scan-read"],
        },
      ],
    },
  },
];
