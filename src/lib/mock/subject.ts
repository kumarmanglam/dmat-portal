// ============================================================
// Mock exam — Subject Module (Computer Science), 24 questions.
// dMAT style: short application passage (input) + single-choice
// questions with 4 options. Content deliberately does not repeat
// the learn-page questions.
// ============================================================
import type { SubjectItem } from "../types";

interface SubjectSet {
  title: string;
  passage: string;
  questions: Omit<SubjectItem, "passage" | "passageTitle">[];
}

const SETS: SubjectSet[] = [
  {
    title: "Rate Limiting with Hash Tables",
    passage:
      "An API gateway limits each client to 100 requests per minute. For every incoming request it looks up the client's counter in a hash table keyed by client ID, increments it, and rejects the request if the limit is exceeded. The table uses chaining for collisions. Counters for one million clients are held in memory; a background job resets all counters every 60 seconds.",
    questions: [
      {
        prompt: "What is the expected time complexity of one counter lookup in a well-dimensioned hash table with chaining?",
        options: ["O(1) on average", "O(log n)", "O(n)", "O(n log n)"],
        answer: 0,
        explain: "With a good hash function and sensible load factor, the expected chain length is constant.",
      },
      {
        prompt:
          "If the hash function mapped ALL client IDs to the same bucket, a lookup would degrade to:",
        options: ["O(n) — one long chain, effectively a linked list", "O(1) — hashing is always constant", "O(log n) — chains are trees", "O(n²)"],
        answer: 0,
        explain: "All entries land in one chain that must be scanned linearly — the classic hash worst case.",
      },
      {
        prompt: "The reset job iterates over all one million entries. Its complexity per run is:",
        options: ["O(n)", "O(1)", "O(n²)", "O(log n)"],
        answer: 0,
        explain: "Touching each of n entries once is linear.",
      },
      {
        prompt:
          "The team considers replacing the hash table with a balanced search tree keyed by client ID. What changes for a single lookup?",
        options: [
          "Expected O(1) becomes guaranteed O(log n)",
          "Nothing — both are O(1)",
          "Lookups become O(n)",
          "Lookups become impossible without sorting requests",
        ],
        answer: 0,
        explain:
          "Balanced trees trade the average-case constant lookup for a worst-case logarithmic guarantee.",
      },
      {
        prompt:
          "Two gateway threads increment the SAME client's counter concurrently without synchronisation. The risk is:",
        options: [
          "A lost update — the counter may increase by 1 instead of 2, letting clients exceed the limit",
          "A deadlock between the two threads",
          "A page fault",
          "An SQL injection",
        ],
        answer: 0,
        explain:
          "Read-increment-write interleaving can lose one increment — a race condition on shared state.",
      },
    ],
  },
  {
    title: "Notification Service Design",
    passage:
      "A monolithic e-commerce application is being split. A new notification service must send an email whenever an order is placed, a shipment is dispatched, or a payment fails. The order, shipping and payment components should not know how notifications work. The service keeps a single, shared SMTP connection object that is expensive to create. Which classes create which message formatter (plain-text vs HTML) should be decided by configuration.",
    questions: [
      {
        prompt:
          "Order, shipping and payment components should trigger notifications without knowing about the notification logic. Which pattern decouples them best?",
        options: [
          "Observer — components publish events, the notification service subscribes",
          "Singleton — one component owns all others",
          "Strategy — components inherit from the notifier",
          "Adapter — wrap SMTP in HTTP",
        ],
        answer: 0,
        explain:
          "Publish/subscribe (Observer) lets emitters fire events while remaining ignorant of listeners.",
      },
      {
        prompt: "The single expensive SMTP connection object shared across the service matches which pattern?",
        options: ["Singleton", "Factory", "Observer", "Composite"],
        answer: 0,
        explain: "One instance, shared access point — Singleton (with its usual testing caveats).",
      },
      {
        prompt: "Choosing the formatter implementation (plain-text vs HTML) from configuration at creation time calls for:",
        options: ["A Factory", "A second Singleton", "Deep inheritance", "A global variable per format"],
        answer: 0,
        explain: "Encapsulating 'which concrete class to instantiate' is exactly the Factory pattern's job.",
      },
      {
        prompt:
          "After the split, the notification service is down for an hour while orders continue. Orders succeed but no emails are sent, and the emails are simply lost. Which architectural mechanism prevents this loss without coupling the services back together?",
        options: [
          "A message queue between the services — events persist until consumed",
          "Merging both services again",
          "Retrying the HTTP call once",
          "A shared in-memory list",
        ],
        answer: 0,
        explain:
          "Queues buffer events durably, letting the consumer catch up after downtime — the standard async decoupling tool.",
      },
      {
        prompt:
          "The notification service keeps no per-request state in memory between requests. What operational benefit follows directly?",
        options: [
          "It can be scaled horizontally behind a load balancer — any instance can serve any request",
          "It no longer needs a database",
          "It becomes immune to crashes",
          "SMTP becomes faster",
        ],
        answer: 0,
        explain: "Statelessness makes instances interchangeable — the prerequisite for horizontal scaling.",
      },
    ],
  },
  {
    title: "Library Database",
    passage:
      "A library system uses these tables:\n\nBook(bookId, title, authorId)\nAuthor(authorId, name, country)\nLoan(loanId, bookId, memberId, loanDate, returnDate)\nMember(memberId, name, city)\n\nLoans of unreturned books have returnDate = NULL. The system runs a nightly report and several interactive search screens. The Loan table has 20 million rows; searches by memberId are frequent and slow.",
    questions: [
      {
        prompt: "Which relational-algebra expression returns the titles of all books written by authors from 'Chile'?",
        options: [
          "π_title( Book ⋈ σ_country='Chile'( Author ) )",
          "σ_title( π_country='Chile'( Author ) )",
          "π_country( Book ⋈ Author )",
          "Book ∪ Author",
        ],
        answer: 0,
        explain:
          "Filter authors by country, join to their books on authorId, project the title.",
      },
      {
        prompt: "The slow member searches on the huge Loan table are best fixed by:",
        options: [
          "Creating an index on Loan(memberId)",
          "Normalising Loan into 3NF",
          "Removing the returnDate column",
          "Rewriting SELECT * as SELECT loanId",
        ],
        answer: 0,
        explain:
          "The filter column needs an index; 20M-row scans per search are the bottleneck, not the schema shape.",
      },
      {
        prompt:
          "Someone proposes adding authorName directly into Book 'to save a join'. Which problem does this introduce?",
        options: [
          "An update anomaly — renaming an author must touch every one of their book rows",
          "A deadlock risk",
          "Loss of the primary key",
          "The table would violate 1NF",
        ],
        answer: 0,
        explain:
          "authorName would depend on authorId, not on bookId — a transitive dependency (3NF violation) causing update anomalies.",
      },
      {
        prompt:
          "A checkout does: (1) INSERT a Loan row, (2) UPDATE the book's availability flag. To guarantee the database never shows a loaned book as available, the two statements must:",
        options: [
          "Run inside one transaction that commits atomically",
          "Run on two different connections",
          "Be separated by a one-second delay",
          "Be executed as a stored procedure without COMMIT",
        ],
        answer: 0,
        explain: "Atomicity of a single transaction guarantees both effects appear together or not at all.",
      },
      {
        prompt: "Which SQL predicate correctly finds currently unreturned loans?",
        options: [
          "WHERE returnDate IS NULL",
          "WHERE returnDate = NULL",
          "WHERE returnDate == 'NULL'",
          "WHERE NOT returnDate",
        ],
        answer: 0,
        explain:
          "NULL is not a value you can compare with '=' (that yields UNKNOWN) — SQL requires IS NULL.",
      },
    ],
  },
  {
    title: "Remote Office Connectivity",
    passage:
      "A company connects a branch office to headquarters. Employees use a web ERP over HTTPS, IP telephony for calls, and large nightly file syncs. The branch router learns routes from headquarters via a link-state routing protocol. One morning, users report that the ERP is unreachable, while phone calls between offices still work.",
    questions: [
      {
        prompt: "The nightly file sync must guarantee complete, uncorrupted, ordered delivery. Which transport-layer protocol is required?",
        options: ["TCP", "UDP", "ICMP", "ARP"],
        answer: 0,
        explain: "Reliability, ordering and retransmission are TCP's guarantees; UDP offers none of them.",
      },
      {
        prompt: "IP telephony prefers UDP because:",
        options: [
          "Low latency matters more than retransmitting lost packets — a re-sent voice packet arrives too late to be useful",
          "UDP encrypts audio automatically",
          "TCP cannot carry audio bytes",
          "UDP guarantees ordering",
        ],
        answer: 0,
        explain: "Real-time media tolerates loss but not delay; TCP's retransmissions add exactly the wrong kind of latency.",
      },
      {
        prompt:
          "Since calls (voice, UDP) between offices work but the ERP website (HTTPS, TCP port 443) fails, the network path is evidently up. At which layer(s) should you look FIRST for the fault?",
        options: [
          "Transport/application — e.g. a firewall rule or the ERP server, not the physical link",
          "Physical layer — a broken cable",
          "Data-link layer — MAC addressing",
          "Layer 1 and 2 only",
        ],
        answer: 0,
        explain:
          "Working cross-office calls prove layers 1–3 function; a service-specific failure points above them (port blocked, service down).",
      },
      {
        prompt: "In the link-state protocol the branch router runs, each router:",
        options: [
          "Floods its link information and computes shortest paths on the full topology with Dijkstra",
          "Sends its whole routing table to neighbours every 30 seconds and trusts their claims",
          "Asks a central server for each packet's route",
          "Uses only static routes",
        ],
        answer: 0,
        explain:
          "That is the link-state model (OSPF-style); periodic table gossip describes distance-vector protocols.",
      },
      {
        prompt:
          "HTTPS protects the ERP traffic between branch and HQ. Which combination does TLS provide here?",
        options: [
          "Confidentiality (encryption), integrity (MACs), and server authenticity (certificate)",
          "Only confidentiality",
          "Only availability",
          "Anonymity of the client's IP address",
        ],
        answer: 0,
        explain:
          "TLS encrypts, detects tampering, and authenticates the server via its certificate. It does not hide IP addresses.",
      },
    ],
  },
  {
    title: "Print Server Under Load",
    passage:
      "A university print server accepts jobs from hundreds of clients. Worker threads take jobs from a shared queue. Each job needs two resources: the printer lock and the accounting-database lock. Some workers acquire printer-then-database, others database-then-printer. The server machine has 8 GB RAM; during exam week, dozens of large PDF jobs are processed simultaneously and the machine slows to a crawl with constant disk activity.",
    questions: [
      {
        prompt:
          "Occasionally the server freezes: worker W1 holds the printer lock and waits for the database lock, while W2 holds the database lock and waits for the printer lock. This is:",
        options: [
          "A deadlock — circular wait between W1 and W2",
          "Starvation of W1",
          "A page fault storm",
          "Priority inversion",
        ],
        answer: 0,
        explain: "Two holders each waiting for the other closes the wait cycle — with mutual exclusion, hold-and-wait and no preemption all present.",
      },
      {
        prompt: "The simplest code change that makes this freeze impossible is:",
        options: [
          "Impose a global acquisition order: every worker locks printer before database (or vice versa) — always",
          "Add more worker threads",
          "Use a faster database",
          "Increase the thread priority of stuck workers",
        ],
        answer: 0,
        explain: "A fixed lock order eliminates circular wait — one of the four necessary conditions.",
      },
      {
        prompt:
          "The exam-week slowdown (little CPU work, constant disk I/O, worse with more concurrent jobs) is best explained by:",
        options: [
          "Thrashing — the combined working set of all jobs exceeds RAM, so the OS pages continuously",
          "A deadlock on the printer lock",
          "TLB corruption",
          "The scheduler using round-robin",
        ],
        answer: 0,
        explain:
          "Overcommitted memory turns runtime into page-swapping. Limiting concurrent jobs or adding RAM fixes it.",
      },
      {
        prompt:
          "The shared job queue is a bounded buffer. Which synchronisation setup is the textbook solution for its producers (clients) and consumers (workers)?",
        options: [
          "Two counting semaphores (free slots, filled slots) plus a mutex for the queue operations",
          "One boolean flag checked in a busy loop",
          "A single counting semaphore only",
          "No synchronisation — queues are thread-safe by nature",
        ],
        answer: 0,
        explain:
          "Semaphores handle blocking when full/empty; the mutex protects the queue's internal state during push/pop.",
      },
    ],
  },
];

export const SUBJECT_QUESTIONS: SubjectItem[] = SETS.flatMap((set) =>
  set.questions.map((q) => ({
    ...q,
    passageTitle: set.title,
    passage: set.passage, // renderer shows the input text with every question of the set
  }))
);

export const SUBJECT_SETS = SETS;
