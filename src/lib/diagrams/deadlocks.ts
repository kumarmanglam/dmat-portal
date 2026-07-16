import type { TopicDiagramData } from "./types";

// The classic resource-allocation graph for a two-lock deadlock.
// Solid edges = "held by", dashed = "waiting for". The cycle
// T1 → B → T2 → A → T1 is the deadlock (circular wait).
export const DEADLOCKS_DIAGRAM: TopicDiagramData = {
  title: "A deadlock as a wait-for cycle",
  flow: "free",
  caption:
    "A resource-allocation graph. Solid arrows = 'held by', dashed = 'waiting for'. Follow them: T1 → B → T2 → A → T1 forms a closed loop — that cycle IS the deadlock (circular wait). Impose a global lock order (always acquire A before B) and the loop can never form. Tap a node.",
  nodes: [
    {
      id: "t1",
      label: "Thread 1",
      desc: "holds A · wants B",
      detail: "Holds lock A and is blocked waiting to acquire lock B. It will never release A until it gets B.",
      x: 60,
      y: 40,
      kind: "blue",
    },
    {
      id: "b",
      label: "Lock B",
      desc: "held by Thread 2",
      detail: "Currently owned by Thread 2. Thread 1 is queued waiting for it.",
      x: 360,
      y: 40,
      kind: "accent",
    },
    {
      id: "t2",
      label: "Thread 2",
      desc: "holds B · wants A",
      detail: "Holds lock B and is blocked waiting to acquire lock A. It will never release B until it gets A.",
      x: 360,
      y: 240,
      kind: "blue",
    },
    {
      id: "a",
      label: "Lock A",
      desc: "held by Thread 1",
      detail: "Currently owned by Thread 1. Thread 2 is queued waiting for it — closing the cycle.",
      x: 60,
      y: 240,
      kind: "accent",
    },
  ],
  edges: [
    { id: "d1", from: "a", to: "t1", label: "held by" },
    { id: "d2", from: "t1", to: "b", label: "waits for", dashed: true, animated: true },
    { id: "d3", from: "b", to: "t2", label: "held by" },
    { id: "d4", from: "t2", to: "a", label: "waits for", dashed: true, animated: true },
  ],
};
