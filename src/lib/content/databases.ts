import type { TopicContent } from "../types";

export const DATABASES_CONTENT: TopicContent[] = [
  {
    id: "relational-algebra",
    whyItMatters:
      "Every SQL query you write is rewritten by the optimizer into relational-algebra operators before it runs — reading the algebra is how you predict which of two equivalent queries the engine will make fast, exactly the swap dMAT questions test.",
    intro:
      "Relational algebra is the assembly language SQL compiles down to: a handful of operators that each take tables in and give a table out, so they compose. σ (select) keeps rows matching a condition, π (project) keeps columns, ⋈ (join) glues tables on matching values, ∪/− combine or subtract row sets. Read any expression inside-out like nested function calls.",
    analogy:
      "The operators are LEGO bricks with the same connector: each one takes a table and hands back a table, so you can snap σ onto π onto ⋈ without adapters. That closure is the whole trick — the output of any operator is legal input to the next.",
    bullets: [
      "σ_condition(R) → filter rows. π_columns(R) → keep columns (duplicates collapse — it's set semantics).",
      "R ⋈ S pairs rows agreeing on the shared attribute(s); a plain × (cross product) pairs everything.",
      "SQL mapping: WHERE ↔ σ, SELECT-list ↔ π, JOIN ↔ ⋈, UNION ↔ ∪, EXCEPT ↔ −.",
      "Order of composition matters for efficiency: filtering early (σ before ⋈) shrinks intermediate results.",
    ],
    workedExample: {
      scenario:
        "A(id, price) has 1,000,000 rows but only 100 with price > 100; B(id, region) has 1,000 rows. Compute the price>100 rows joined to B two ways.",
      steps: [
        "Plan 1 — σ_price>100( A ⋈ B ): join A ⋈ B first, materialising up to ~1,000,000 paired rows, THEN discard all but the ~100 that satisfy price > 100.",
        "Plan 2 — σ_price>100(A) ⋈ B: filter A down to its 100 matching rows FIRST, then join only those to B.",
        "Both plans return the identical result — σ and ⋈ commute when the condition touches only A's own columns.",
      ],
      result:
        "Plan 2 joins ~100 rows instead of ~1,000,000, so its intermediate result is ~10,000× smaller. Pushing σ below the join is the single highest-value rewrite an optimizer makes.",
    },
    gotchas: [
      "σ (select) is NOT the SQL keyword SELECT: σ filters ROWS like WHERE, while it's π (project) that picks columns like the SELECT-list.",
      "A natural join ⋈ is NOT a cross product ×: ⋈ keeps only rows agreeing on the shared attribute(s); × pairs every row of R with every row of S.",
      "π uses set semantics, so projecting DROPS duplicate rows — SQL's SELECT keeps them unless you add DISTINCT.",
    ],
    quickCheck: {
      prompt:
        "π_dept(Employee) is run on a 500-row table, yet it returns only 12 rows. Why?",
      options: [
        "π uses set semantics — duplicate dept values collapse, leaving one row per distinct department",
        "π_dept silently drops rows whose dept is null",
        "A projection can return at most as many rows as it has columns",
        "The other 488 rows failed the projection's condition",
      ],
      answer: 0,
      explain:
        "Relational algebra is set-based, so π removes duplicate rows automatically. (SQL's SELECT would return all 500 unless you wrote SELECT DISTINCT.)",
    },
    deepDive: [
      {
        title: "The algebra IS the optimizer's rulebook",
        body: "Because every operator returns a relation, expressions obey algebraic equivalences: σ pushes below ⋈, joins reorder freely (⋈ is commutative and associative), and π can drop columns early. A cost-based optimizer generates equivalent expressions using exactly these rules, estimates each one's row counts, and executes the cheapest — which is why one SQL statement can run a hundred different ways at identical results.",
      },
    ],
    recap:
      "Relational algebra is a closed set of table-in, table-out operators — σ filters rows, π keeps columns, ⋈ joins on shared values, ∪/− combine or subtract. Because they compose, equivalences like 'push σ below ⋈' let the optimizer rewrite a query for speed without changing its answer.",
    related: ["sql-optimization", "normalization"],
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
    whyItMatters:
      "A dashboard query that ran in 20 ms on 10k rows crawls to 40 s at 50M — and the fix is almost never 'more hardware', it's an index the optimizer can actually use, which is the exact judgement call these questions probe.",
    intro:
      "An index is a sorted side-structure (usually a B-tree) that turns 'scan every row' into 'jump straight to the matching ones'. That's the whole game: reads on indexed columns get O(log n) lookups, while every INSERT/UPDATE now must also maintain the index. The optimizer reads your query, estimates costs, and picks a plan — EXPLAIN shows whether it could actually use your index.",
    analogy:
      "An index is the alphabetical index at the back of a textbook: to find every mention of 'mutex' you jump to the entry instead of reading all 900 pages. Remove it and every lookup is a cover-to-cover scan — but every time you edit the book, you must also update the index.",
    bullets: [
      "Index helps: WHERE col = …, JOIN keys, ORDER BY on the indexed column, range scans.",
      "Index is useless when the query wraps the column in a function (WHERE YEAR(date) = 2024), with leading-wildcard LIKE ('%term'), or when most rows match anyway (low selectivity).",
      "Composite index (a, b) serves filters on a, or on a AND b — not on b alone (leftmost-prefix rule).",
      "Every index slows writes and costs space — index what you query, not everything.",
    ],
    workedExample: {
      scenario:
        "orders(order_date) has a B-tree index, but SELECT … WHERE YEAR(order_date) = 2024 does a full scan of all 50M rows anyway.",
      steps: [
        "The B-tree stores raw order_date values in sorted order — ideal for seeking a date or a date range.",
        "The predicate asks about YEAR(order_date), a value the index does NOT store; the engine can't seek it without first computing YEAR() on each row.",
        "So it computes YEAR() on all 50M rows and compares — a full scan, index untouched.",
        "Rewrite as a range on the bare column: WHERE order_date >= '2024-01-01' AND order_date < '2025-01-01'.",
      ],
      result:
        "The rewrite leaves order_date un-wrapped, so the B-tree seeks straight to the 2024 block in O(log n). Rule: keep the indexed column bare on one side of the comparison — wrap it in a function and you blind the index.",
    },
    gotchas: [
      "An index speeds reads but SLOWS writes: every INSERT/UPDATE/DELETE must also update each index structure.",
      "A composite index (a, b) is NOT two separate indexes on a and b — it serves WHERE a, or WHERE a AND b, but never WHERE b alone (leftmost-prefix rule).",
      "More indexes is NOT always faster: on a low-selectivity column (most rows match) the optimizer ignores the index, because a full scan beats millions of index hops.",
    ],
    quickCheck: {
      prompt:
        "An index exists on customers(last_name). Which lookup can the B-tree NOT accelerate?",
      options: [
        "WHERE last_name LIKE '%son'",
        "WHERE last_name LIKE 'Son%'",
        "WHERE last_name = 'Sonderland'",
        "WHERE last_name >= 'S' AND last_name < 'T'",
      ],
      answer: 0,
      explain:
        "A B-tree is sorted by leading characters, so a leading wildcard ('%son') has no known prefix to seek and forces a scan. Trailing wildcards ('Son%'), equality, and ranges all pin the prefix and use the index.",
    },
    deepDive: [
      {
        title: "Covering indexes — skipping the table entirely",
        body: "If an index already contains every column a query reads, the engine answers from the index alone and never visits the table rows — an 'index-only scan'. Example: an index on (customer_id, status) fully covers SELECT status FROM orders WHERE customer_id = 1234, because both columns it touches live in the index. This is why adding a column to an index can turn a two-step lookup (find row, then fetch it) into one — and why over-wide indexes cost more to store and to maintain on writes.",
      },
    ],
    recap:
      "An index is a sorted B-tree side-structure that turns a full scan into an O(log n) seek — but only when the query leaves the column bare and the filter is selective. Every index you add speeds matching reads and taxes every write, so index what you actually query.",
    related: ["trees", "big-o-comparison", "relational-algebra"],
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
    whyItMatters:
      "When a customer changes address, a well-normalized schema updates one row; a duplicated one leaves stale copies scattered across a million order rows — the classic production bug where two screens show different data for the same person.",
    intro:
      "Normalization is one rule applied repeatedly: store every fact exactly once. Duplicated facts drift apart on update — that's the anomaly the normal forms hunt down. 1NF: atomic values only. 2NF: no column depending on part of a composite key. 3NF: no column depending on another non-key column. Transactions guard the other half: ACID makes a group of statements all-or-nothing and isolated from concurrent readers.",
    analogy:
      "Storing a fact once is keeping a single source of truth: hold each customer's city on one Customers row and let orders point at it. Copy the city into every order and you now own a hundred copies that silently disagree the day the customer moves.",
    bullets: [
      "Smell test for 3NF: 'if I update this value in one row, must I remember to update it elsewhere?' → transitive dependency.",
      "2NF only matters with composite keys: (orderId, productId) → productName depends only on productId → violation.",
      "Denormalization is a deliberate, documented trade: duplicate for read speed, accept update complexity.",
      "ACID: Atomic (all-or-nothing), Consistent (rules hold), Isolated (concurrent txns don't see each other's partial work), Durable (committed survives crashes).",
    ],
    workedExample: {
      scenario:
        "Orders(orderId, customerId, customerCity) stores the city on every order. Customer 7 lives in Berlin across 300 orders, then moves to Munich.",
      steps: [
        "Apply the 3NF smell test: does customerCity depend on the key orderId, or on another non-key column? It depends on customerId — a transitive dependency (orderId → customerId → customerCity).",
        "Updating customer 7's city means rewriting all 300 rows; miss one and the table contradicts itself — the update anomaly.",
        "Decompose: Customers(customerId, customerCity) holds each city once; Orders(orderId, customerId) references it by key.",
        "Now the move is a single UPDATE on one Customers row; any order joins back to it for the current city.",
      ],
      result:
        "The fact 'customer 7 lives in X' is stored exactly once. The transitive dependency is gone, the table is in 3NF, and no two rows can ever disagree.",
    },
    gotchas: [
      "2NF targets a partial dependency on part of a COMPOSITE key; 3NF targets a NON-key column depending on another non-key column — different flaws, different fixes.",
      "A transitive dependency (non-key → non-key, a 3NF issue) is NOT a partial dependency (part-of-key → non-key, a 2NF issue).",
      "Normalization is NOT always the goal — denormalization deliberately duplicates data for read speed, accepting the extra update complexity as a documented trade.",
    ],
    quickCheck: {
      prompt:
        "A table's primary key is a single column, orderId. Can this table violate 2NF?",
      options: [
        "No — 2NF violations require a partial dependency on part of a composite key, and a single-column key has no proper subset",
        "Yes — any table can violate any normal form",
        "No — single-column keys guarantee full ACID compliance",
        "Yes — 2NF only ever applies to single-column keys",
      ],
      answer: 0,
      explain:
        "2NF is only meaningful with composite keys: a lone-column key has no 'part' for a column to depend on, so such a table skips straight from 1NF concerns to 3NF (non-key → non-key) ones.",
    },
    deepDive: [
      {
        title: "One step past 3NF: BCNF",
        body: "Boyce–Codd normal form tightens 3NF to a single rule: every determinant (the left side of a functional dependency) must be a candidate key. It only differs from 3NF in tables with multiple overlapping candidate keys — uncommon in practice, but the standard exam gotcha. Reaching 3NF removes almost every real update anomaly; BCNF is the finishing pass for schemas with tangled composite keys.",
      },
    ],
    recap:
      "Normalization stores each fact once so updates can't leave contradictory copies: 1NF atomic values, 2NF no partial dependency on a composite key, 3NF no non-key-to-non-key dependency. Denormalize only as a deliberate read-speed trade, and lean on ACID to keep grouped statements all-or-nothing.",
    related: ["relational-algebra", "sql-optimization", "system-architecture"],
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
