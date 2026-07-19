import type { TopicVisual } from "./types";

// 1) The classic resource-allocation graph for a two-lock deadlock,
//    with a guided walkthrough that builds the cycle edge by edge
//    and then breaks it with lock ordering.
// 2) A mermaid decision flowchart of the three handling strategies.
export const DEADLOCKS_VISUALS: TopicVisual[] = [
  {
    kind: "flow",
    data: {
      title: "A deadlock as a wait-for cycle",
      flow: "free",
      caption:
        "A resource-allocation graph. Solid arrows = 'held by', dashed = 'waiting for'. Run the walkthrough to watch the cycle form — then watch lock ordering make it impossible.",
      legend: [
        { swatch: "blue", text: "thread" },
        { swatch: "accent", text: "lock (resource)" },
        { swatch: "green", text: "the fix — a global lock order" },
      ],
      nodes: [
        {
          id: "t1",
          label: "Thread 1",
          desc: "holds A · wants B",
          detail:
            "Holds lock A and is blocked waiting to acquire lock B. It will never release A until it gets B — that's hold-and-wait in action.",
          x: 60,
          y: 40,
          kind: "blue",
        },
        {
          id: "b",
          label: "Lock B",
          desc: "held by Thread 2",
          detail:
            "Currently owned by Thread 2. Thread 1 is queued waiting for it. Locks are exclusive — that's the mutual-exclusion condition.",
          x: 400,
          y: 40,
          kind: "accent",
        },
        {
          id: "t2",
          label: "Thread 2",
          desc: "holds B · wants A",
          detail:
            "Holds lock B and is blocked waiting to acquire lock A. It will never release B until it gets A. Nothing can preempt (forcibly take) B from it.",
          x: 400,
          y: 260,
          kind: "blue",
        },
        {
          id: "a",
          label: "Lock A",
          desc: "held by Thread 1",
          detail:
            "Currently owned by Thread 1. Thread 2 is queued waiting for it — the edge that closes the cycle.",
          x: 60,
          y: 260,
          kind: "accent",
        },
        {
          id: "fix",
          label: "Rule: lock A before B",
          desc: "global lock order",
          detail:
            "The prevention fix: every thread must acquire A before B, always. Then no thread can ever hold B while waiting for A, so the wait edges can only point one way — a cycle is structurally impossible.",
          x: 230,
          y: 460,
          kind: "green",
        },
      ],
      edges: [
        { id: "d1", from: "a", to: "t1", label: "held by" },
        { id: "d2", from: "t1", to: "b", label: "waits for", dashed: true, animated: true },
        { id: "d3", from: "b", to: "t2", label: "held by" },
        { id: "d4", from: "t2", to: "a", label: "waits for", dashed: true, animated: true },
        { id: "d5", from: "fix", to: "t2", label: "forbids B-then-A", dashed: true },
      ],
      steps: [
        {
          title: "Two threads, two locks",
          text: "Thread 1 owns lock A; Thread 2 owns lock B. Locks are exclusive — only one owner at a time. That's condition 1, mutual exclusion, and it's usually non-negotiable: the whole point of a lock is exclusivity.",
          focus: ["t1", "a", "t2", "b"],
          edgeFocus: ["d1", "d3"],
        },
        {
          title: "Thread 1 waits for B…",
          text: "Thread 1, still holding A, requests lock B — and blocks, because Thread 2 owns it. Holding one resource while waiting for another is condition 2, hold-and-wait. Nothing is wrong yet; this happens constantly in healthy systems.",
          focus: ["t1", "b"],
          edgeFocus: ["d2"],
        },
        {
          title: "…and Thread 2 waits for A",
          text: "Thread 2, still holding B, requests lock A — and blocks, because Thread 1 owns it. No one can preempt a lock from its owner (condition 3, no preemption). Both threads are now blocked, each holding what the other needs.",
          focus: ["t2", "a"],
          edgeFocus: ["d4"],
        },
        {
          title: "The cycle closes — deadlock",
          text: "Follow the arrows: T1 → B → T2 → A → T1. A closed loop in the wait-for graph is condition 4, circular wait — and with all four conditions present, this IS a deadlock. Neither thread will ever run again; a detector would find exactly this cycle.",
          focus: ["t1", "b", "t2", "a"],
          edgeFocus: ["d1", "d2", "d3", "d4"],
        },
        {
          title: "Break one condition: impose an order",
          text: "Add one rule: every thread acquires A before B, no exceptions. Thread 2 would have had to take A first — so it could never sit holding B while waiting for A. Wait edges now all point the same way, a cycle can't form, and deadlock is structurally impossible. Removing ANY one of the four conditions works; ordering is just the cheapest.",
          focus: ["fix", "t2"],
          edgeFocus: ["d5"],
        },
      ],
    },
  },
  {
    kind: "mermaid",
    title: "Choosing a deadlock strategy",
    caption:
      "The three families of deadlock handling, as the decision an OS or DB designer actually makes.",
    chart: `flowchart TD
    S["How should the system deal with deadlock?"] --> Q1{"Can you afford a\ndeadlock EVER?"}
    Q1 -- "no — safety-critical" --> P["PREVENTION\nmake one condition impossible"]
    Q1 -- "rarely acceptable" --> A["AVOIDANCE\ngrant requests only in safe states"]
    Q1 -- "yes, if we recover" --> D["DETECTION + RECOVERY\nlet it happen, then fix"]
    P --> P1["lock ordering\n(kills circular wait)"]
    P --> P2["request everything upfront\n(kills hold-and-wait)"]
    A --> A1["Banker's algorithm:\nsimulate before granting"]
    D --> D1["scan wait-for graph for cycles,\nkill / roll back a victim"]
    D1 --> D2["databases choose this:\ndeadlocks are rare, rollback is cheap"]

    classDef head fill:#f4e9d2,stroke:#7a5a0a,color:#14181f;
    classDef opt fill:#e4eefa,stroke:#1d5a95,color:#14181f;
    classDef leaf fill:#ffffff,stroke:#d8dce3,color:#14181f;
    class S,Q1 head;
    class P,A,D opt;
    class P1,P2,A1,D1,D2 leaf;`,
    notes: [
      {
        label: "Prevention pays always, deadlock never",
        text: "Lock ordering or upfront allocation costs discipline (and some utilisation) on every single run — in exchange, a deadlock can never occur. Choose it when a hang is catastrophic.",
      },
      {
        label: "Avoidance needs future knowledge",
        text: "Banker's algorithm must know each process's maximum possible demand in advance — realistic for embedded systems, unrealistic for general-purpose OSes, which is why you rarely see it outside textbooks.",
      },
      {
        label: "Detection is the pragmatic default",
        text: "Databases let deadlocks happen: transactions already know how to roll back, so the cheapest strategy is to scan the wait-for graph, pick a victim, and retry it. That's the 'deadlock found, transaction aborted' error you see in Postgres.",
      },
    ],
  },
];
