import type { TopicContent } from "../types";

export const DATABASES_CONTENT: TopicContent[] = [
  {
    id: "relational-algebra",
    intro:
      "Relational algebra is the assembly language SQL compiles down to: a handful of operators that each take tables in and give a table out, so they compose. σ (select) keeps rows matching a condition, π (project) keeps columns, ⋈ (join) glues tables on matching values, ∪/− combine or subtract row sets. Read any expression inside-out like nested function calls.",
    bullets: [
      "σ_condition(R) → filter rows. π_columns(R) → keep columns (duplicates collapse — it's set semantics).",
      "R ⋈ S pairs rows agreeing on the shared attribute(s); a plain × (cross product) pairs everything.",
      "SQL mapping: WHERE ↔ σ, SELECT-list ↔ π, JOIN ↔ ⋈, UNION ↔ ∪, EXCEPT ↔ −.",
      "Order of composition matters for efficiency: filtering early (σ before ⋈) shrinks intermediate results.",
    ],
    questions: [
      {
        prompt: "Which relational-algebra expression returns the names of employees in department 42?",
        block: "Employee(id, name, dept, salary)",
        options: [
          "π_name( σ_dept=42( Employee ) )",
          "σ_name( π_dept=42( Employee ) )",
          "π_dept( σ_name=42( Employee ) )",
          "Employee ⋈ 42",
        ],
        answer: 0,
        explain: "Filter rows first (σ dept=42), then keep the name column (π). σ takes conditions, π takes columns.",
      },
      {
        prompt: "What does R ⋈ S (natural join) produce for tables R(a, b) and S(b, c)?",
        options: [
          "Rows combining R and S wherever their b values are equal, with columns a, b, c",
          "All combinations of R rows and S rows",
          "Rows of R that have no partner in S",
          "Only the shared column b",
        ],
        answer: 0,
        explain:
          "Natural join = cross product filtered to matching shared attributes, with the duplicate column collapsed.",
      },
      {
        prompt:
          "Customers(id, name) and Orders(custId, item). Which expression finds customers who have placed NO order?",
        options: [
          "π_name( Customers ) − π_name( Customers ⋈_{id=custId} Orders )",
          "π_name( Customers ⋈_{id=custId} Orders )",
          "σ_orders=0( Customers )",
          "Customers ∪ Orders",
        ],
        answer: 0,
        explain:
          "'All customers' minus 'customers that join to at least one order' — set difference expresses NOT EXISTS.",
      },
      {
        prompt:
          "Two query plans compute the same result: Plan 1 = σ_price>100( A ⋈ B ), Plan 2 = σ_price>100(A) ⋈ B (price is a column of A). Why is Plan 2 usually faster?",
        options: [
          "It filters A before the join, so the join processes far fewer rows",
          "σ is always slower than ⋈",
          "Plan 1 returns more rows",
          "Plan 2 skips the join entirely",
        ],
        answer: 0,
        explain:
          "Pushing selections below joins shrinks intermediate results — the core idea query optimizers apply automatically.",
      },
    ],
  },
  {
    id: "sql-optimization",
    intro:
      "An index is a sorted side-structure (usually a B-tree) that turns 'scan every row' into 'jump straight to the matching ones'. That's the whole game: reads on indexed columns get O(log n) lookups, while every INSERT/UPDATE now must also maintain the index. The optimizer reads your query, estimates costs, and picks a plan — EXPLAIN shows whether it could actually use your index.",
    bullets: [
      "Index helps: WHERE col = …, JOIN keys, ORDER BY on the indexed column, range scans.",
      "Index is useless when the query wraps the column in a function (WHERE YEAR(date) = 2024), with leading-wildcard LIKE ('%term'), or when most rows match anyway (low selectivity).",
      "Composite index (a, b) serves filters on a, or on a AND b — not on b alone (leftmost-prefix rule).",
      "Every index slows writes and costs space — index what you query, not everything.",
    ],
    questions: [
      {
        prompt:
          "A table has 50 million rows and this query is slow: SELECT * FROM orders WHERE customer_id = 1234. There is no index on customer_id. What is the database doing, and what fixes it?",
        options: [
          "Full table scan; add an index on customer_id for O(log n) lookups",
          "Binary search; nothing can be improved",
          "Using the primary key; add more RAM",
          "Caching the table; run the query twice",
        ],
        answer: 0,
        explain:
          "Without an index on the filter column the engine must read every row. A B-tree index makes the lookup logarithmic.",
      },
      {
        prompt: "An index exists on orders(order_date). Which query CANNOT use it effectively?",
        options: [
          "SELECT … WHERE YEAR(order_date) = 2024",
          "SELECT … WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'",
          "SELECT … WHERE order_date = '2024-06-01'",
          "SELECT … ORDER BY order_date LIMIT 10",
        ],
        answer: 0,
        explain:
          "Applying a function to the column hides it from the index. Rewrite as the equivalent range predicate (option b) and the index works.",
      },
      {
        prompt:
          "A composite index exists on (last_name, first_name). Which WHERE clause can it NOT serve?",
        options: [
          "WHERE first_name = 'Ada'",
          "WHERE last_name = 'Lovelace'",
          "WHERE last_name = 'Lovelace' AND first_name = 'Ada'",
          "WHERE last_name LIKE 'Love%'",
        ],
        answer: 0,
        explain:
          "The index is sorted by last_name first — filtering only on first_name skips the leading column, so the sort order doesn't help.",
      },
      {
        prompt: "Your write-heavy events table has 9 indexes and inserts are slow. Why?",
        options: [
          "Every insert must update all 9 index structures in addition to the row",
          "Indexes make the table rows physically larger",
          "SELECT statements block inserts",
          "The optimizer refuses tables with many indexes",
        ],
        answer: 0,
        explain:
          "Indexes are the classic read/write trade: each one is an extra sorted structure to maintain per write. Drop the ones no query uses.",
      },
    ],
  },
  {
    id: "normalization",
    intro:
      "Normalization is one rule applied repeatedly: store every fact exactly once. Duplicated facts drift apart on update — that's the anomaly the normal forms hunt down. 1NF: atomic values only. 2NF: no column depending on part of a composite key. 3NF: no column depending on another non-key column. Transactions guard the other half: ACID makes a group of statements all-or-nothing and isolated from concurrent readers.",
    bullets: [
      "Smell test for 3NF: 'if I update this value in one row, must I remember to update it elsewhere?' → transitive dependency.",
      "2NF only matters with composite keys: (orderId, productId) → productName depends only on productId → violation.",
      "Denormalization is a deliberate, documented trade: duplicate for read speed, accept update complexity.",
      "ACID: Atomic (all-or-nothing), Consistent (rules hold), Isolated (concurrent txns don't see each other's partial work), Durable (committed survives crashes).",
    ],
    questions: [
      {
        prompt:
          "A table Orders(orderId, customerId, customerCity) repeats the city in every order row. A customer moves. What problem does this design cause, and which normal form fixes it?",
        options: [
          "Update anomaly — city must change in many rows; 3NF (city depends on customerId, not the key)",
          "Deadlock — 1NF fixes it",
          "Slow SELECTs — 2NF fixes it",
          "No problem; SQL handles it",
        ],
        answer: 0,
        explain:
          "customerCity depends on customerId, a non-key attribute → transitive dependency. Move city to the Customers table (3NF).",
      },
      {
        prompt:
          "OrderLines(orderId, productId, quantity, productName) has key (orderId, productId). Which normal form does productName violate?",
        options: [
          "2NF — it depends only on productId, part of the composite key",
          "1NF — it is not atomic",
          "3NF — it depends on quantity",
          "None — the design is fine",
        ],
        answer: 0,
        explain:
          "Partial dependency on a composite key = 2NF violation. productName belongs in Products.",
      },
      {
        prompt:
          "A phone column stores '017-111, 017-222' (two numbers in one field). Which rule is broken?",
        options: [
          "1NF — values must be atomic",
          "2NF — partial dependency",
          "3NF — transitive dependency",
          "BCNF — overlapping candidate keys",
        ],
        answer: 0,
        explain:
          "Multiple values in one cell violate first normal form; you can't query or index them properly.",
      },
      {
        prompt:
          "A bank transfer runs 'debit account A' then 'credit account B'. The server crashes between the two statements, and after restart A is debited but B never credited — money vanished. Which ACID property was missing?",
        options: ["Atomicity", "Isolation", "Durability", "Consistency of reads"],
        answer: 0,
        explain:
          "Atomicity means both statements commit or neither does — wrapping both in one transaction makes the crash roll A's debit back.",
      },
      {
        prompt:
          "An analytics dashboard reads a pre-joined, duplicated reporting table instead of the normalized source tables. This is:",
        options: [
          "Deliberate denormalization — trading update simplicity for read speed",
          "A 1NF violation that must be fixed",
          "Proof the source design was wrong",
          "Only possible in NoSQL databases",
        ],
        answer: 0,
        explain:
          "Denormalizing read-heavy paths is a legitimate, conscious trade-off — the normalized truth still lives upstream.",
      },
    ],
  },
];
