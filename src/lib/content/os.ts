import type { TopicContent } from "../types";

export const OS_CONTENT: TopicContent[] = [
  {
    id: "process-sync",
    intro:
      "A race condition is two threads interleaving on shared data, where the result depends on who runs when: both read balance=100, both add 50, one write overwrites the other. The fix is making the read-modify-write step indivisible — a critical section only one thread enters at a time. A mutex is one key to one door; a semaphore is a stack of n permits; producer–consumer needs both counting (how full?) and mutual exclusion (who touches the buffer?).",
    bullets: [
      "Race = unsynchronised access to shared state where at least one access writes.",
      "Mutex: lock/unlock by the same owner — exactly one thread inside the critical section.",
      "Counting semaphore: n permits — up to n threads proceed (connection pools, bounded buffers).",
      "Producer–consumer: semaphore 'empty slots' + semaphore 'filled slots' + mutex on the buffer itself.",
      "Locking too much serialises your program — keep critical sections minimal.",
    ],
    questions: [
      {
        prompt:
          "Two threads run `counter = counter + 1` concurrently 1000 times each without synchronisation. The final counter is often LESS than 2000. Why?",
        options: [
          "Both threads can read the same old value, increment it, and one write overwrites the other — a lost update",
          "The CPU caches drop increments randomly",
          "Integer overflow wraps the value",
          "Threads are only allowed 1000 operations in total",
        ],
        answer: 0,
        explain:
          "The load-increment-store is three steps; interleavings lose updates. This is the canonical race condition.",
      },
      {
        prompt:
          "A database connection pool allows at most 10 simultaneous connections; the 11th requester must wait until one is released. Which primitive models this directly?",
        options: [
          "A counting semaphore initialised to 10",
          "A single mutex",
          "A spinlock per connection",
          "An atomic boolean",
        ],
        answer: 0,
        explain:
          "n permits, acquire on take, release on return — a counting semaphore is exactly this pattern. A mutex only handles n = 1.",
      },
      {
        prompt:
          "In the producer–consumer problem with a bounded buffer, why is a mutex alone not enough?",
        options: [
          "The mutex protects the buffer, but you also need counting: producers must block when full, consumers when empty",
          "Mutexes can't be shared between two threads",
          "Producers are faster than consumers by definition",
          "A mutex would make the buffer unbounded",
        ],
        answer: 0,
        explain:
          "Mutual exclusion says who may touch the buffer; the empty/full semaphores say when a thread may proceed at all.",
      },
      {
        prompt:
          "A critical section wraps an entire request handler 'to be safe'. The service now handles one request at a time. What principle was violated?",
        options: [
          "Keep critical sections as small as possible — lock only the shared-state access",
          "Never use locks in servers",
          "Handlers must be lock-free by law",
          "Semaphores should replace all mutexes",
        ],
        answer: 0,
        explain:
          "Oversized critical sections destroy concurrency. Lock around the shared data touch, not the whole workflow.",
      },
    ],
  },
  {
    id: "memory-management",
    intro:
      "Virtual memory gives every process the same comfortable lie: a private address space starting at zero. The OS slices it into fixed-size pages and maps them to physical frames on demand — touch an unmapped page and a page fault pulls it in (from disk if needed). Because pages are fixed-size, any free frame fits any page: no external fragmentation, just a little waste inside the last page (internal fragmentation).",
    bullets: [
      "Page = fixed-size chunk of virtual space; frame = same-size slot of RAM; the page table maps one to the other.",
      "TLB = cache of recent translations — without it every memory access would need extra lookups.",
      "Paging: internal fragmentation (unused tail of a page). Segmentation (variable sizes): external fragmentation (unusable holes).",
      "Thrashing: too little RAM for the working sets → the system pages constantly and does almost no real work.",
      "LRU eviction: kick out the page unused the longest — a bet that recent past predicts near future.",
    ],
    questions: [
      {
        prompt: "A process reads an address whose page is currently not in RAM. What happens?",
        options: [
          "A page fault traps to the OS, which loads the page into a free frame and resumes the process",
          "The process is killed with a segmentation fault",
          "The CPU returns zero for that address",
          "The read silently waits until the page happens to load",
        ],
        answer: 0,
        explain:
          "Page faults are the normal mechanism of demand paging, invisible to the process (except in latency) — not an error.",
      },
      {
        prompt:
          "Why can paging hand out physical memory with no external fragmentation, while segmentation cannot?",
        options: [
          "All pages/frames are the same size, so any free frame fits any page; variable-size segments leave unusable holes",
          "Pages are compressed in RAM",
          "Segmentation stores data on disk only",
          "Paging allocates contiguous physical memory per process",
        ],
        answer: 0,
        explain:
          "Uniform block size means free memory is always usable. The cost is internal fragmentation — the unused tail of a process's last page.",
      },
      {
        prompt:
          "A machine's CPU utilisation drops while disk activity is constant; adding MORE processes makes throughput worse. What is happening?",
        options: [
          "Thrashing — combined working sets exceed RAM, so the system spends its time swapping pages",
          "A deadlock on the disk driver",
          "The scheduler favours I/O-bound processes",
          "The TLB is too large",
        ],
        answer: 0,
        explain:
          "Classic thrashing signature. The cure is fewer simultaneous processes or more RAM — not more load.",
      },
      {
        prompt:
          "With page-replacement policy LRU and frame capacity 3, pages are referenced in order 1, 2, 3, 1, 4. Which page is evicted when 4 arrives?",
        options: ["Page 2 — least recently used", "Page 1 — first in", "Page 3 — most recent", "None — 4 is rejected"],
        answer: 0,
        explain:
          "At the moment 4 arrives, recency order is 1 (just used), 3, then 2 — page 2 has waited longest. (FIFO would have evicted 1.)",
      },
    ],
  },
  {
    id: "deadlocks",
    intro:
      "A deadlock needs FOUR conditions at once: mutual exclusion (resources can't be shared), hold-and-wait (grab one, wait for another), no preemption (can't be taken away), and circular wait (A waits for B waits for A). That list is also the toolbox — break any single condition and deadlock becomes impossible. The cheapest break in practice: give resources a global order and always acquire in that order (kills circular wait).",
    bullets: [
      "All four conditions necessary — remove one, no deadlock. Exam questions usually ask which one a fix removes.",
      "Prevention: design so a condition can't occur (e.g. lock ordering, request everything upfront).",
      "Avoidance: allow requests only if the system stays in a 'safe state' — Banker's algorithm.",
      "Detection + recovery: let deadlocks happen, find cycles in the wait-for graph, kill/rollback a victim.",
      "Deadlock (nobody moves) ≠ starvation (someone never gets a turn while others do).",
    ],
    questions: [
      {
        prompt:
          "Thread 1 locks A then waits for B; thread 2 locks B then waits for A. The team fixes it by requiring every thread to lock A before B, always. Which deadlock condition does this eliminate?",
        options: ["Circular wait", "Mutual exclusion", "No preemption", "Hold and wait"],
        answer: 0,
        explain:
          "With a global lock order, a cycle 'A→B and B→A' can't form — waits only ever point one way.",
      },
      {
        prompt:
          "A system grants a resource request only after checking that some execution order still lets every process finish (a 'safe state'). This approach is:",
        options: [
          "Deadlock avoidance — Banker's algorithm",
          "Deadlock detection",
          "Deadlock prevention by preemption",
          "Priority inheritance",
        ],
        answer: 0,
        explain:
          "Avoidance reasons about future need before granting — the defining idea of Banker's algorithm.",
      },
      {
        prompt:
          "A policy forces every process to request ALL resources it will ever need at startup, or get nothing. Which condition does this break, and what is the cost?",
        options: [
          "Hold-and-wait; cost is poor utilisation — resources sit idle from start to finish",
          "Mutual exclusion; cost is data corruption",
          "Circular wait; no cost",
          "No preemption; cost is starvation of short jobs",
        ],
        answer: 0,
        explain:
          "Nobody holds some resources while waiting for more — but everything is hogged for the full runtime even if needed briefly.",
      },
      {
        prompt:
          "Low-priority process L never runs because a stream of higher-priority processes always jumps the queue. L is experiencing:",
        options: [
          "Starvation — not a deadlock; the system as a whole makes progress",
          "Deadlock — all four conditions hold",
          "Thrashing",
          "A race condition",
        ],
        answer: 0,
        explain:
          "Others keep finishing, so there is no cycle of waiting — L is just perpetually unlucky. Aging (boosting waiting processes) fixes it.",
      },
    ],
  },
];
