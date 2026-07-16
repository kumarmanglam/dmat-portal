import type { TopicContent } from "../types";

export const OS_CONTENT: TopicContent[] = [
  {
    id: "process-sync",
    whyItMatters:
      "The instant two threads touch the same variable, 'it worked on my machine' becomes a coin flip — dMAT scenarios hand you exactly these interleavings and ask which primitive fixes them.",
    intro:
      "A race condition is two threads interleaving on shared data, where the result depends on who runs when: both read balance=100, both add 50, one write overwrites the other. The fix is making the read-modify-write step indivisible — a critical section only one thread enters at a time. A mutex is one key to one door; a semaphore is a stack of n permits; producer–consumer needs both counting (how full?) and mutual exclusion (who touches the buffer?).",
    analogy:
      "A mutex is the single key to a one-person bathroom — you can't enter until whoever's inside comes out and hands it over. A counting semaphore is a rack of n keys to a locker room: n people in at once, the (n+1)th waits for a key to come back.",
    bullets: [
      "Race = unsynchronised access to shared state where at least one access writes.",
      "Mutex: lock/unlock by the same owner — exactly one thread inside the critical section.",
      "Counting semaphore: n permits — up to n threads proceed (connection pools, bounded buffers).",
      "Producer–consumer: semaphore 'empty slots' + semaphore 'filled slots' + mutex on the buffer itself.",
      "Locking too much serialises your program — keep critical sections minimal.",
    ],
    workedExample: {
      scenario:
        "Two threads each run `balance = balance + 50` once, starting from balance = 100, with no lock.",
      steps: [
        "Thread A reads balance → 100.",
        "Thread B reads balance → 100 (A hasn't written back yet).",
        "Thread A computes 150 and writes balance = 150.",
        "Thread B computes 150 from its stale read and writes balance = 150 — A's update is gone.",
      ],
      result:
        "Final balance is 150, not 200 — a lost update. Wrap the read-modify-write in a mutex and B must wait for A's write, so B reads 150 and ends at 200.",
    },
    gotchas: [
      "A mutex is NOT a counting semaphore: a mutex admits exactly one thread; a semaphore admits n.",
      "Atomic/volatile visibility is NOT mutual exclusion — seeing the freshest value doesn't stop two threads interleaving a read-modify-write.",
      "A race (wrong result from bad interleaving) is NOT a deadlock (everyone blocked forever) — adding locks fixes races but can create deadlocks.",
    ],
    quickCheck: {
      prompt:
        "A web server wraps its entire request handler in one global lock 'to be safe'. Throughput collapses to one request at a time. The core mistake is:",
      options: [
        "The critical section is far too large — lock only the shared-state access, not the whole workflow",
        "Mutexes are simply too slow for servers",
        "It should use a semaphore initialised to 1 instead",
        "Locks can't legally be used inside request handlers",
      ],
      answer: 0,
      explain:
        "Correctness only needs the shared data protected. Locking the whole handler serialises everything and throws away all concurrency.",
    },
    deepDive: [
      {
        title: "Why 'lock-free' isn't magic",
        body: "Lock-free algorithms swap locks for atomic compare-and-swap retry loops, so a stalled thread never blocks the others — no deadlock, no priority inversion. The catch: they are hard to write correctly and can livelock (threads retry forever without progress). Reach for them only on proven hot paths, not by default.",
      },
    ],
    recap:
      "A race is unsynchronised shared access where someone writes; a critical section entered by one thread at a time fixes it. Mutex = one-at-a-time, counting semaphore = n-at-a-time — and keep the locked region as small as possible.",
    related: ["deadlocks", "memory-management", "system-architecture"],
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
    whyItMatters:
      "Every program you run trusts a lie the OS tells — that it owns a private, zero-based memory. Knowing how paging keeps that lie cheap is what lets you reason about page faults, TLBs and the dreaded thrashing on the exam.",
    intro:
      "Virtual memory gives every process the same comfortable lie: a private address space starting at zero. The OS slices it into fixed-size pages and maps them to physical frames on demand — touch an unmapped page and a page fault pulls it in (from disk if needed). Because pages are fixed-size, any free frame fits any page: no external fragmentation, just a little waste inside the last page (internal fragmentation).",
    analogy:
      "Think of RAM as identical parking spaces and your program's memory as identically sized cars. Any car fits any space, so the lot never ends up with useless gaps between oddly sized vehicles — the only waste is the empty bit of the space around the last car you parked.",
    bullets: [
      "Page = fixed-size chunk of virtual space; frame = same-size slot of RAM; the page table maps one to the other.",
      "TLB = cache of recent translations — without it every memory access would need extra lookups.",
      "Paging: internal fragmentation (unused tail of a page). Segmentation (variable sizes): external fragmentation (unusable holes).",
      "Thrashing: too little RAM for the working sets → the system pages constantly and does almost no real work.",
      "LRU eviction: kick out the page unused the longest — a bet that recent past predicts near future.",
    ],
    workedExample: {
      scenario:
        "3 frames, LRU replacement. Pages are referenced in the order 1, 2, 3, 1, 4.",
      steps: [
        "1, 2, 3 fill the three empty frames. Recency order (oldest → newest): 1, 2, 3.",
        "Reference 1 again — already resident, so no fault; recency becomes 2, 3, 1.",
        "Reference 4 — no free frame, so evict the least-recently-used page, which is now 2.",
      ],
      result:
        "The frame holding page 2 is evicted; frames end up holding 3, 1, 4. (Plain FIFO would instead have evicted page 1, the first one in.)",
    },
    gotchas: [
      "Paging causes INTERNAL fragmentation (the wasted tail of the last page), NOT external — variable-size segmentation is what leaves external holes.",
      "A page fault is NOT a crash: it's the normal demand-paging mechanism. A segmentation fault (an illegal address) is the crash.",
      "The TLB caches address TRANSLATIONS, not page data — a TLB miss still finds the page in RAM, it just costs one extra table walk.",
    ],
    quickCheck: {
      prompt:
        "CPU utilisation is falling, the disk is pegged at 100%, and adding more processes makes throughput worse. What is happening?",
      options: [
        "Thrashing — the combined working sets exceed RAM, so the OS spends its time swapping pages instead of running code",
        "A deadlock in the disk driver",
        "The page table has become corrupt",
        "The TLB has been disabled",
      ],
      answer: 0,
      explain:
        "Falling CPU + saturated disk + throughput dropping as load rises is the textbook thrashing signature. The cure is fewer processes or more RAM.",
    },
    deepDive: [
      {
        title: "Working sets — why only more RAM helps",
        body: "A process's working set is the set of pages it actively uses in a recent time window. If every running process's working set fits in RAM together, faults stay rare. Thrashing begins the moment the sum of working sets exceeds physical memory — which is exactly why adding RAM or reducing the number of processes is the only real fix, not tuning the scheduler.",
      },
    ],
    recap:
      "Virtual memory hands each process a private, zero-based space split into fixed-size pages mapped to frames on demand. Fixed size kills external fragmentation; the price is internal fragmentation and, when RAM runs short, thrashing.",
    related: ["process-sync", "deadlocks"],
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
    whyItMatters:
      "Two services each holding a lock the other needs will hang your whole system with zero error message — recognising the four conditions is how you spot it in a design review before it ships.",
    intro:
      "A deadlock needs FOUR conditions at once: mutual exclusion (resources can't be shared), hold-and-wait (grab one, wait for another), no preemption (can't be taken away), and circular wait (A waits for B waits for A). That list is also the toolbox — break any single condition and deadlock becomes impossible. The cheapest break in practice: give resources a global order and always acquire in that order (kills circular wait).",
    analogy:
      "Two cars meet on a one-lane bridge, each already halfway on, neither willing to back up. Both are stuck forever. Add a rule 'northbound always yields' — impose an order — and the standoff can never form.",
    bullets: [
      "All four conditions necessary — remove one, no deadlock. Exam questions usually ask which one a fix removes.",
      "Prevention: design so a condition can't occur (e.g. lock ordering, request everything upfront).",
      "Avoidance: allow requests only if the system stays in a 'safe state' — Banker's algorithm.",
      "Detection + recovery: let deadlocks happen, find cycles in the wait-for graph, kill/rollback a victim.",
      "Deadlock (nobody moves) ≠ starvation (someone never gets a turn while others do).",
    ],
    diagram: "deadlocks",
    workedExample: {
      scenario:
        "Thread 1 holds lock A and requests B. Thread 2 holds lock B and requests A. Both wait forever.",
      steps: [
        "Mutual exclusion — A and B can each be held by only one thread. Present.",
        "Hold-and-wait — each thread keeps its lock while waiting for the other. Present.",
        "No preemption — neither lock can be forcibly taken away. Present.",
        "Circular wait — 1 waits for B (held by 2), 2 waits for A (held by 1): a cycle. Present — all four hold, so it is a deadlock.",
      ],
      result:
        "Impose a global lock order (always acquire A before B). Now no thread can hold B while requesting A, so the cycle can't form — circular wait is broken and the deadlock is impossible.",
    },
    gotchas: [
      "Deadlock (nobody progresses, a cycle of waits) is NOT starvation (the system does progress, but one unlucky process never gets its turn).",
      "You need ALL FOUR conditions at once — breaking any single one prevents deadlock. Exam questions ask which one a given fix removes.",
      "Avoidance (Banker's algorithm) is NOT prevention: prevention makes a condition structurally impossible; avoidance just refuses any request that would leave no safe finishing order.",
    ],
    quickCheck: {
      prompt:
        "A policy forces every process to request ALL the resources it will ever need at startup, or get nothing. Which condition does this break — and what does it cost?",
      options: [
        "Hold-and-wait; cost is poor utilisation — resources sit reserved from start to finish even if used only briefly",
        "Circular wait; there is no real cost",
        "Mutual exclusion; cost is data races",
        "No preemption; cost is detection overhead",
      ],
      answer: 0,
      explain:
        "If you must grab everything up front, you never hold some resources while waiting for others — hold-and-wait is gone. But resources are hogged for the whole run, wasting them.",
    },
    deepDive: [
      {
        title: "Detection vs. prevention — picking one",
        body: "Prevention and avoidance pay a constant tax (ordering rules, upfront requests, safe-state checks) to guarantee deadlock never happens — worth it in safety-critical systems. Detection instead lets deadlocks occur, periodically scans the wait-for graph for a cycle, and recovers by killing or rolling back a victim — cheaper when deadlocks are rare, which is why most databases choose it.",
      },
    ],
    recap:
      "A deadlock needs four conditions together — mutual exclusion, hold-and-wait, no preemption, circular wait — so removing any one makes it impossible. The cheapest break in practice is a global lock order, which kills circular wait.",
    related: ["process-sync", "graphs", "memory-management"],
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
